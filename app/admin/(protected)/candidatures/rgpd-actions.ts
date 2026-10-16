"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function withdrawTalentPoolConsent(formData: FormData): Promise<void> {
  // Security check is required inside every server action, not only in the page.
  await requireAdmin();

  const rawId = formData.get("applicationId");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Identifiant de candidature invalide.");
  }
  if (formData.get("confirmWithdrawal") !== "yes") {
    throw new Error("Confirmez la demande du candidat avant de continuer.");
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("applications")
    .update({ talent_pool_consent_at: null })
    .eq("id", id)
    .not("talent_pool_consent_at", "is", null)
    .select("id");

  if (error) {
    throw new Error(`Retrait du vivier impossible : ${error.message}`);
  }
  // The consent might already have been withdrawn in a parallel request.
  if (!data?.length) {
    const { data: application, error: lookupError } = await db
      .from("applications")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError || !application) {
      throw new Error("La candidature est introuvable.");
    }
  }

  revalidatePath(`/admin/candidatures/${id}`);
  revalidatePath("/admin/candidatures");
}
