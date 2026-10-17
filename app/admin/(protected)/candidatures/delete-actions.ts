"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function deleteApplicationAndCv(formData: FormData): Promise<void> {
  await requireAdmin();

  const rawId = formData.get("applicationId");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Identifiant de candidature invalide.");
  }
  if (formData.get("confirmation") !== "SUPPRIMER" ||
      formData.get("verifiedRequest") !== "yes") {
    throw new Error("Confirmation explicite et vérification de la demande obligatoires.");
  }

  const db = createAdminClient();
  const { data: application, error: applicationError } = await db
    .from("applications")
    .select("id, cv_path")
    .eq("id", id)
    .maybeSingle();
  if (applicationError || !application) {
    throw new Error(applicationError?.message ?? "Candidature introuvable.");
  }

  // Le chemin a ete genere a l'envoi sous la forme AAAA/MM/UUID.ext.
  const expectedPath = new RegExp(`^\\d{4}/\\d{2}/${id}\\.(pdf|doc|docx)$`, "i");
  if (typeof application.cv_path !== "string" ||
      !expectedPath.test(application.cv_path)) {
    throw new Error("Chemin du CV inattendu : suppression bloquée, vérification manuelle nécessaire.");
  }

  const { count, error: countError } = await db
    .from("candidate_presentations")
    .select("id", { count: "exact", head: true })
    .eq("application_id", id);
  if (countError) {
    throw new Error(`Impossible de vérifier les présentations : ${countError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new Error("Suppression bloquée : des présentations à des établissements existent.");
  }

  // RESTRICT sur les relations financieres est conserve en base.
  // CASCADE efface application_activities. Supprimer d'abord la ligne
  // puis le fichier évite une candidature active sans CV si SQL échoue.
  // Ces deux opérations ne sont PAS atomiques : un échec Storage exige
  // une reprise manuelle avec le chemin conservé dans les logs serveur.
  const cvPath = application.cv_path;
  const { data: deleted, error: deleteError } = await db
    .from("applications")
    .delete()
    .eq("id", id)
    .select("id");
  if (deleteError || !deleted?.length) {
    throw new Error(deleteError?.message ?? "Suppression de la candidature non confirmée.");
  }

  const { error: storageError } = await db.storage
    .from("candidate-cvs")
    .remove([cvPath]);
  if (storageError) {
    console.error("RGPD: CV orphaned after application deletion", {
      applicationId: id,
      cvPath,
      message: storageError.message,
    });
    throw new Error(
      "La candidature a été supprimée, mais le CV n'a pas pu être effacé du stockage. " +
      "Contactez l'administrateur technique pour supprimer le fichier orphelin."
    );
  }

  revalidatePath("/admin/candidatures");
  redirect("/admin/candidatures");
}
