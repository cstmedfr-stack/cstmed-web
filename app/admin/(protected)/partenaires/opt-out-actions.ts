"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getPartner(partnerId: string) {
  if (!UUID.test(partnerId)) throw new Error("Identifiant de l’établissement invalide.");
  const db = createAdminClient();
  const { data, error } = await db.from("partner_establishments")
    .select("id,contact_email")
    .eq("id", partnerId)
    .maybeSingle();
  if (error || !data) throw new Error("Établissement introuvable.");
  if (!data.contact_email?.trim()) throw new Error("Aucune adresse e-mail associée à cet établissement.");
  const email = data.contact_email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Adresse e-mail invalide.");
  return { db, email };
}

async function getCurrentOptOut(db: ReturnType<typeof createAdminClient>, email: string) {
  const { data, error } = await db.from("prospection_opt_outs")
    .select("id,email")
    .ilike("email", email.replace(/[\%_]/g, "\\$&"))
    .maybeSingle();
  if (error) throw new Error("Vérification des oppositions impossible : " + error.message);
  return data;
}

export async function blockPartnerProspection(form: FormData) {
  await requireAdmin();
  if (text(form, "confirmed") !== "yes") throw new Error("Confirmation obligatoire.");
  const partnerId = text(form, "partner_id");
  const reason = text(form, "reason");
  if (reason.length > 1000) throw new Error("Motif trop long.");
  const { db, email } = await getPartner(partnerId);
  const existing = await getCurrentOptOut(db, email);
  if (!existing) {
    const { error } = await db.from("prospection_opt_outs").insert({
      email, reason: reason || "Opposition enregistrée par l’administrateur CSTMed",
    });
    if (error && error.code !== "23505") throw new Error("Blocage impossible : " + error.message);
  }
  revalidatePath(`/admin/partenaires/${partnerId}`);
  revalidatePath("/admin/prospection");
}

export async function unblockPartnerProspection(form: FormData) {
  await requireAdmin();
  if (text(form, "confirmed") !== "yes") throw new Error("Confirmation obligatoire du retrait de l’opposition.");
  const partnerId = text(form, "partner_id");
  const evidence = text(form, "evidence");
  if (evidence.length < 10 || evidence.length > 1000) throw new Error("Justificatif de retrait requis (10 à 1000 caractères).");
  const { db, email } = await getPartner(partnerId);
  const existing = await getCurrentOptOut(db, email);
  if (!existing) throw new Error("Cette adresse n’est pas sur la liste d’opposition.");

  // Keep an internal dated trace of the explicit withdrawal before removing the block.
  const { error: traceError } = await db.from("partner_activities").insert({
    partner_id: partnerId,
    activity_type: "note",
    activity_date: new Date().toISOString().slice(0, 10),
    details: `Retrait explicite de l’opposition à la prospection pour ${email}. Justificatif : ${evidence}`,
  });
  if (traceError) throw new Error("Impossible de conserver le justificatif : " + traceError.message);

  const { data: removed, error } = await db.from("prospection_opt_outs")
    .delete().eq("id", existing.id).select("id").maybeSingle();
  if (error || !removed) throw new Error("Réactivation impossible : " + (error?.message ?? "adresse introuvable"));
  revalidatePath(`/admin/partenaires/${partnerId}`);
  revalidatePath("/admin/prospection");
}
