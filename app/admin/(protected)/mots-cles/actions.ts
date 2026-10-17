"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfessionalCategory = "medecins" | "dentistes" | "pharmaciens" | "infirmiers";
const categories: ProfessionalCategory[] = ["medecins", "dentistes", "pharmaciens", "infirmiers"];

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
function getCategory(formData: FormData): ProfessionalCategory | null {
  const category = getString(formData, "professionalCategory");
  return categories.includes(category as ProfessionalCategory)
    ? (category as ProfessionalCategory)
    : null;
}
function getSafeLimit(value: string): number {
  const parsed = Number(value);
  if (!value || !Number.isFinite(parsed)) return 10;
  return Math.min(100, Math.max(1, Math.trunc(parsed)));
}
function errorUrl(message: string): string {
  return `/admin/mots-cles?error=${encodeURIComponent(message.slice(0, 400))}`;
}
async function getAdminClient() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/admin/login?error=Session%20expir%C3%A9e.");
  const { data: membership, error } = await supabase
    .from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (error || !membership) redirect("/admin/login?error=Acc%C3%A8s%20refus%C3%A9.");
  return supabase;
}
export async function addImportKeyword(formData: FormData) {
  const supabase = await getAdminClient();
  const keyword = getString(formData, "keyword").slice(0, 150);
  const category = getCategory(formData);
  if (!keyword) redirect(errorUrl("Le mot-clé est obligatoire."));
  if (!category) redirect(errorUrl("Sélectionnez une catégorie professionnelle."));
  const { error } = await supabase.from("import_keywords").insert({
    keyword,
    professional_category: category,
    enabled: formData.get("enabled") === "on",
    jobs_per_keyword: getSafeLimit(getString(formData, "jobsPerKeyword")),
    cdi_only: formData.get("cdiOnly") === "on",
  });
  if (error) redirect(errorUrl(error.code === "23505" ? "Ce mot-clé existe déjà dans une autre catégorie ou dans celle-ci." : error.message));
  revalidatePath("/admin/mots-cles");
  revalidatePath("/admin/import");
  redirect(`/admin/mots-cles?category=${category}&added=1`);
}
export async function updateImportKeyword(formData: FormData) {
  const supabase = await getAdminClient();
  const id = Number(getString(formData, "id"));
  const keyword = getString(formData, "keyword").slice(0, 150);
  const category = getCategory(formData);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Identifiant invalide.");
  if (!keyword) throw new Error("Le mot-clé ne peut pas être vide.");
  if (!category) throw new Error("Catégorie professionnelle invalide.");
  const { data, error } = await supabase.from("import_keywords").update({
    keyword,
    professional_category: category,
    enabled: formData.get("enabled") === "on",
    jobs_per_keyword: getSafeLimit(getString(formData, "jobsPerKeyword")),
    cdi_only: formData.get("cdiOnly") === "on",
  }).eq("id", id).select("id").single();
  if (error || !data) throw new Error(error?.code === "23505"
    ? "Ce mot-clé existe déjà."
    : `Modification impossible : ${error?.message ?? "Mot-clé introuvable."}`);
  revalidatePath("/admin/mots-cles");
  revalidatePath("/admin/import");
}
