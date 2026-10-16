"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const statuses = ["interested", "follow_up", "not_interested", "other"] as const;

function str(form: FormData, key: string, limit: number) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function saveProspectionReply(formData: FormData) {
  await requireAdmin();
  const partnerId = str(formData, "partner_id", 40);
  const email = str(formData, "sender_email", 250);
  const status = str(formData, "reply_status", 40);
  const message = str(formData, "message_text", 10000);
  const receivedAt = str(formData, "received_at", 32);
  const followUpAt = str(formData, "follow_up_at", 10);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partnerId)) throw new Error("Établissement invalide.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Adresse e-mail invalide.");
  if (!statuses.includes(status as typeof statuses[number])) throw new Error("Statut de réponse invalide.");
  if (message.length < 2) throw new Error("Le contenu du message est obligatoire.");
  const date = new Date(receivedAt);
  if (!receivedAt || Number.isNaN(date.getTime())) throw new Error("Date de réception invalide.");
  if (date.getTime() > Date.now() + 5 * 60 * 1000) throw new Error("La date de réception ne peut pas être future.");
  if (followUpAt && (!/^\d{4}-\d{2}-\d{2}$/.test(followUpAt) || Number.isNaN(Date.parse(followUpAt)))) throw new Error("Date de relance invalide.");

  const db = createAdminClient();
  const { data: partner, error: partnerError } = await db.from("partner_establishments").select("id").eq("id", partnerId).maybeSingle();
  if (partnerError || !partner) throw new Error("Établissement introuvable.");

  const { error } = await db.from("prospection_replies").insert({
    partner_id: partnerId,
    sender_email: email,
    received_at: date.toISOString(),
    reply_status: status,
    message_text: message,
    follow_up_at: followUpAt || null,
  });
  if (error) throw new Error(`Impossible d’enregistrer la réponse : ${error.message}`);
  revalidatePath("/admin/prospection");
  revalidatePath(`/admin/partenaires/${partnerId}`);
  redirect("/admin/prospection?reply_saved=1#reponses");
}
