"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_RECIPIENTS = 20;
const FROM = "CSTMed <contact@cstmed.fr>";
function read(form: FormData, key: string, max: number) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function personalize(text: string, p: { establishment_name: string; contact_name: string | null }) {
  return text.replace(/\{\{etablissement\}\}/g, p.establishment_name)
    .replace(/\{\{contact\}\}/g, p.contact_name || "Madame, Monsieur");
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendProspectionCampaign(form: FormData) {
  await requireAdmin();
  const name = read(form, "name", 180);
  const subjectTemplate = read(form, "subject", 300);
  const bodyTemplate = read(form, "body", 10000);
  const selected = [...new Set(form.getAll("partner_ids").filter((x): x is string => typeof x === "string"))];
  const confirmed = read(form, "confirmed", 10) === "yes";
  if (!confirmed) throw new Error("Confirmez explicitement l'envoi avant de continuer.");
  if (name.length < 2 || subjectTemplate.length < 2 || bodyTemplate.length < 10) throw new Error("Campagne, objet ou message incomplet.");
  if (!selected.length || selected.length > MAX_RECIPIENTS) throw new Error(`Sélectionnez entre 1 et ${MAX_RECIPIENTS} établissements.`);
  if (selected.some(id => !/^[a-f0-9-]{36}$/i.test(id))) throw new Error("Identifiant d'établissement invalide.");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY n'est pas configurée sur le serveur.");
  const db = createAdminClient();
  const { data: partners, error } = await db.from("partner_establishments")
    .select("id,establishment_name,contact_name,contact_email,relationship_status")
    .in("id", selected);
  if (error) throw new Error(error.message);
  if (!partners || partners.length !== selected.length) throw new Error("Certains établissements n'existent plus.");
  if (partners.some(p => !p.contact_email || !validEmail(p.contact_email))) throw new Error("Certains établissements n'ont pas d'adresse e-mail valide.");
  if (partners.some(p => ["rejected", "archived"].includes(p.relationship_status))) throw new Error("Un établissement refusé ou archivé figure dans la sélection.");
  const emails = partners.map(p => p.contact_email!.trim().toLowerCase());
  if (new Set(emails).size !== emails.length) throw new Error("Deux établissements utilisent la même adresse. Corrigez les doublons avant l'envoi.");

  // Blocages côté serveur avant toute création de campagne ou tout envoi.
  // On normalise les adresses pour une comparaison insensible à la casse.
  const optOutEmails = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const { data: excluded, error: exclusionsError } = await db
      .from("prospection_opt_outs")
      .select("email")
      .order("id", { ascending: true })
      .range(offset, offset + 999);
    if (exclusionsError) throw new Error(`Liste d'opposition inaccessible : ${exclusionsError.message}`);
    const batch = excluded ?? [];
    for (const item of batch) optOutEmails.add(item.email.trim().toLowerCase());
    if (batch.length < 1000) break;
  }
  const excludedAddresses = emails.filter(email => optOutEmails.has(email));
  if (excludedAddresses.length) {
    throw new Error(`Envoi bloqué : opposition à la prospection pour ${excludedAddresses.join(", ")}.`);
  }

  // Limite de 20 messages par jour UTC (toutes campagnes confondues).
  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);
  const { count: todayCount, error: todayError } = await db
    .from("prospection_emails")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfUtcDay.toISOString())
    .in("status", ["pending", "sending", "sent"]);
  if (todayError || todayCount === null) {
    throw new Error(`Impossible de vérifier la limite quotidienne : ${todayError?.message ?? "nombre indisponible"}`);
  }
  if (todayCount + partners.length > MAX_RECIPIENTS) {
    throw new Error(`Limite quotidienne : ${todayCount}/${MAX_RECIPIENTS} messages déjà réservés ou envoyés aujourd'hui (UTC). Essayez demain.`);
  }

  // Une même adresse ne reçoit pas de nouveau message pendant sept jours.
  // Les envois en cours sont aussi pris en compte pour éviter les doublons.
  const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentMessages, error: recentError } = await db
    .from("prospection_emails")
    .select("to_email,status")
    .gte("created_at", recentThreshold)
    .in("status", ["sending", "sent"])
    .limit(1000);
  if (recentError) throw new Error(`Impossible de vérifier les envois récents : ${recentError.message}`);
  if ((recentMessages ?? []).length === 1000) {
    throw new Error("Historique récent trop volumineux pour une vérification fiable. Envoi suspendu.");
  }
  const recentAddresses = new Set((recentMessages ?? []).map(row => row.to_email.trim().toLowerCase()));
  const recentlyContacted = emails.filter(email => recentAddresses.has(email));
  if (recentlyContacted.length) {
    throw new Error(`Envoi bloqué : adresse(s) déjà contactée(s) dans les 7 derniers jours : ${recentlyContacted.join(", ")}.`);
  }

  const { data: campaign, error: campaignError } = await db.from("prospection_campaigns")
    .insert({ name, subject: subjectTemplate, body: bodyTemplate }).select("id").single();
  if (campaignError || !campaign) throw new Error(campaignError?.message || "Création de campagne impossible.");
  const records = partners.map(p => ({
    campaign_id: campaign.id, partner_id: p.id, to_email: p.contact_email!,
    subject: personalize(subjectTemplate, p), body: personalize(bodyTemplate, p), status: "pending"
  }));
  const { error: insertError } = await db.from("prospection_emails").insert(records);
  if (insertError) throw new Error(`Campagne enregistrée, mais préparation des messages échouée: ${insertError.message}`);

  // Each email is sent independently, never as a visible multi-recipient message.
  // A database row is created before the send attempt for audit/reconciliation.
  for (const record of records) {
    const { data: rows } = await db.from("prospection_emails").select("id")
      .eq("campaign_id", campaign.id).eq("partner_id", record.partner_id).limit(1);
    const rowId = rows?.[0]?.id;
    if (!rowId) continue;
    await db.from("prospection_emails").update({ status: "sending" }).eq("id", rowId);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": rowId },
        body: JSON.stringify({ from: FROM, to: [record.to_email], reply_to: "contact@cstmed.fr", subject: record.subject, text: record.body }),
        cache: "no-store",
      });
      const result = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok || !result.id) {
        await db.from("prospection_emails").update({ status: "failed", error_message: (result.message || `HTTP ${response.status}`).slice(0, 500) }).eq("id", rowId);
      } else {
        await db.from("prospection_emails").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: result.id, error_message: null }).eq("id", rowId);
      }
    } catch (err) {
      await db.from("prospection_emails").update({ status: "failed", error_message: (err instanceof Error ? err.message : "Erreur réseau").slice(0, 500) }).eq("id", rowId);
    }
  }
  revalidatePath("/admin/prospection");
  redirect(`/admin/prospection?campaign=${campaign.id}`);
}
