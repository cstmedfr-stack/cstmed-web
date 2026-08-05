"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "draft",
  "published",
  "rejected",
  "archived",
] as const;

type JobStatus = (typeof allowedStatuses)[number];

function isJobStatus(value: string): value is JobStatus {
  return allowedStatuses.includes(value as JobStatus);
}

async function getAdminClient() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    throw new Error(
      "Sesiunea a expirat. Reconectați-vă în spațiul de administrare.",
    );
  }

  const { data: adminMembership, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminMembership) {
    throw new Error(
      "Contul conectat nu are drepturi de administrator CSTMed.",
    );
  }

  return supabase;
}

export async function updateJobStatus(formData: FormData) {
  const jobIdValue = formData.get("jobId");
  const statusValue = formData.get("status");

  const jobId =
    typeof jobIdValue === "string" ? jobIdValue.trim() : "";

  const status =
    typeof statusValue === "string" ? statusValue.trim() : "";

  if (!jobId) {
    throw new Error("Identificatorul ofertei lipsește.");
  }

  if (!isJobStatus(status)) {
    throw new Error("Statutul solicitat nu este valid.");
  }

  const supabase = await getAdminClient();

  const { error } = await supabase
    .from("jobs")
    .update({
      status,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(
      `Oferta nu a putut fi actualizată: ${error.message}`,
    );
  }

  revalidatePath("/admin/offres");
  revalidatePath("/offres");
  revalidatePath(`/offres/${jobId}`);
}