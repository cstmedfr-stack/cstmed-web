"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const activityTypes = ["note", "email", "phone", "meeting", "follow_up", "other"] as const;
function stringField(formData: FormData, key: string, maxLength: number) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, maxLength) : "";
}
function parseDate(value: string, label: string): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} : date invalide.`);
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} : date invalide.`);
  }
  return value;
}
export async function addPartnerActivity(formData: FormData) {
  await requireAdmin();
  const partnerId = stringField(formData, "partner_id", 100);
  const activityType = stringField(formData, "activity_type", 30);
  const details = stringField(formData, "details", 5000);
  const contactPerson = stringField(formData, "contact_person", 200);
  const activityDate = parseDate(stringField(formData, "activity_date", 10), "Date de l'activité");
  const followUpAt = parseDate(stringField(formData, "follow_up_at", 10), "Date de relance");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partnerId)) {
    throw new Error("Identifiant de l’établissement invalide.");
  }
  if (!activityTypes.includes(activityType as typeof activityTypes[number])) {
    throw new Error("Type d’activité invalide.");
  }
  if (details.length < 2) throw new Error("Veuillez saisir une note d’au moins 2 caractères.");
  if (!activityDate) throw new Error("Veuillez renseigner la date de l’activité.");

  const db = createAdminClient();
  const { data: partner, error: partnerError } = await db.from("partner_establishments")
    .select("id").eq("id", partnerId).maybeSingle();
  if (partnerError || !partner) throw new Error(partnerError?.message ?? "Établissement introuvable.");
  const { error } = await db.from("partner_activities").insert({
    partner_id: partnerId, activity_type: activityType,
    details, contact_person: contactPerson || null,
    activity_date: activityDate, follow_up_at: followUpAt,
  });
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
  revalidatePath(`/admin/partenaires/${partnerId}`);
}
