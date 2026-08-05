"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function getRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, name: string) {
  const value = getRequiredString(formData, name);

  return value || null;
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
  const jobId = getRequiredString(formData, "jobId");
  const status = getRequiredString(formData, "status");

  if (!jobId) {
    throw new Error("Identificatorul ofertei lipsește.");
  }

  if (!isJobStatus(status)) {
    throw new Error("Statutul solicitat nu este valid.");
  }

  const supabase = await getAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status,
    })
    .eq("id", jobId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Oferta nu a putut fi actualizată: ${
        error?.message ?? "Oferta nu a fost găsită."
      }`,
    );
  }

  revalidatePath("/admin/offres");
  revalidatePath(`/admin/offres/${jobId}`);
  revalidatePath("/offres");
  revalidatePath(`/offres/${jobId}`);
}

export async function updateJobDetails(formData: FormData) {
  const jobId = getRequiredString(formData, "jobId");
  const title = getRequiredString(formData, "title");

  if (!jobId) {
    throw new Error("Identificatorul ofertei lipsește.");
  }

  if (!title) {
    throw new Error("Titlul ofertei este obligatoriu.");
  }

  const supabase = await getAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({
      title,
      specialty: getNullableString(formData, "specialty"),
      description: getNullableString(formData, "description"),
      company_name: getNullableString(formData, "company_name"),
      location_label: getNullableString(formData, "location_label"),
      city: getNullableString(formData, "city"),
      postal_code: getNullableString(formData, "postal_code"),
      contract_type: getNullableString(formData, "contract_type"),
      working_time: getNullableString(formData, "working_time"),
      salary_text: getNullableString(formData, "salary_text"),
      experience_text: getNullableString(formData, "experience_text"),
      application_url: getNullableString(formData, "application_url"),
      source_url: getNullableString(formData, "source_url"),
    })
    .eq("id", jobId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Oferta nu a putut fi salvată: ${
        error?.message ?? "Oferta nu a fost găsită."
      }`,
    );
  }

  revalidatePath("/admin/offres");
  revalidatePath(`/admin/offres/${jobId}`);
  revalidatePath("/offres");
  revalidatePath(`/offres/${jobId}`);

  redirect(`/admin/offres/${jobId}?saved=1`);
}