"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeLimit(value: string) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 30;
  }

  return Math.min(Math.max(Math.trunc(parsedValue), 1), 100);
}

async function getAdminClient() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/admin/login?error=Votre session a expiré.");
  }

  const { data: adminMembership, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminMembership) {
    redirect(
      "/admin/login?error=Accès administrateur refusé.",
    );
  }

  return supabase;
}

export async function addImportKeyword(formData: FormData) {
  const keyword = getString(formData, "keyword");
  const jobsPerKeyword = getSafeLimit(
    getString(formData, "jobsPerKeyword"),
  );

  const cdiOnly = formData.get("cdiOnly") === "on";

  if (!keyword) {
    redirect(
      "/admin/mots-cles?error=Le mot-clé est obligatoire.",
    );
  }

  const supabase = await getAdminClient();

  const { error } = await supabase
    .from("import_keywords")
    .insert({
      keyword,
      enabled: true,
      jobs_per_keyword: jobsPerKeyword,
      cdi_only: cdiOnly,
    });

  if (error) {
    const message =
      error.code === "23505"
        ? "Ce mot-clé existe déjà."
        : error.message;

    redirect(
      `/admin/mots-cles?error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/admin/mots-cles");
  revalidatePath("/admin/import");

  redirect("/admin/mots-cles?added=1");
}

export async function updateImportKeyword(
  formData: FormData,
) {
  const id = Number(getString(formData, "id"));
  const keyword = getString(formData, "keyword");

  const jobsPerKeyword = getSafeLimit(
    getString(formData, "jobsPerKeyword"),
  );

  const enabled = formData.get("enabled") === "on";
  const cdiOnly = formData.get("cdiOnly") === "on";

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Identifiant du mot-clé invalide.");
  }

  if (!keyword) {
    throw new Error("Le mot-clé ne peut pas être vide.");
  }

  const supabase = await getAdminClient();

  const { data, error } = await supabase
    .from("import_keywords")
    .update({
      keyword,
      enabled,
      jobs_per_keyword: jobsPerKeyword,
      cdi_only: cdiOnly,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      error?.code === "23505"
        ? "Un autre mot-clé identique existe déjà."
        : `Modification impossible : ${
            error?.message ?? "Mot-clé introuvable."
          }`,
    );
  }

  revalidatePath("/admin/mots-cles");
  revalidatePath("/admin/import");
}