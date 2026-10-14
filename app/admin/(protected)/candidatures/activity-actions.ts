"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const types = ["note", "email", "call", "establishment", "interview", "follow_up"] as const;
type ActivityType = (typeof types)[number];

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function addApplicationActivity(formData: FormData) {
  // Autentificarea trebuie făcută ÎNAINTE de folosirea clientului cu cheie secretă.
  await requireAdmin();

  const applicationId = field(formData, "applicationId");
  const activityType = field(formData, "activityType");
  const note = field(formData, "note");
  const establishmentName = field(formData, "establishmentName");
  const followUpAt = field(formData, "followUpAt");

  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(applicationId)) {
    throw new Error("Identifiant de candidature invalide.");
  }
  if (!types.includes(activityType as ActivityType)) {
    throw new Error("Type d'activité invalide.");
  }
  if (note.length < 2 || note.length > 3000 || establishmentName.length > 200) {
    throw new Error("La note doit contenir 2 à 3000 caractères (établissement : 200 maximum).");
  }
  if (followUpAt && (!/^\d{4}-\d{2}-\d{2}$/.test(followUpAt) || Number.isNaN(Date.parse(`${followUpAt}T12:00:00Z`)))) {
    throw new Error("La date de relance est invalide.");
  }

  const admin = createAdminClient();
  const { data: application, error: lookupError } = await admin
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .maybeSingle();

  if (lookupError || !application) {
    throw new Error("Candidature introuvable.");
  }

  const { error } = await admin.from("application_activities").insert({
    application_id: applicationId,
    activity_type: activityType,
    note,
    establishment_name: establishmentName || null,
    follow_up_at: followUpAt || null,
  });
  if (error) throw new Error(`Suivi non enregistré : ${error.message}`);

  revalidatePath(`/admin/candidatures/${applicationId}`);
  revalidatePath("/admin/candidatures");
}
