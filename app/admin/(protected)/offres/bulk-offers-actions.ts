"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REVIEW_FIELDS, jobSignature, type ReviewableJob } from "./review-helper";

type BulkStatus = "published" | "rejected" | "archived" | "draft";
type BulkResult = { ok: boolean; message: string; updated?: number };
const statuses: BulkStatus[] = ["published", "rejected", "archived", "draft"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateJobsStatusesBulk(ids: string[], status: BulkStatus): Promise<BulkResult> {
  if (!statuses.includes(status)) return { ok: false, message: "Statut non valide." };
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20 ||
      ids.some((id) => typeof id !== "string" || !UUID.test(id)) ||
      new Set(ids).size !== ids.length) {
    return { ok: false, message: "Sélection non valide (maximum 20 offres)." };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) {
    return { ok: false, message: "Session expirée. Veuillez vous reconnecter." };
  }
  const { data: admin, error: adminError } = await supabase.from("admin_users")
    .select("user_id").eq("user_id", userId).maybeSingle();
  if (adminError || !admin) {
    return { ok: false, message: "Vous n'avez pas les droits d'administration." };
  }

  if (status === "published") {
    // The browser's checkbox is not proof. Enforce a server-side API check.
    const service = createAdminClient();
    const { data: jobs, error: jobsError } = await service.from("jobs")
      .select("id,source,source_job_id").in("id", ids);
    if (jobsError || jobs?.length !== ids.length) {
      return { ok: false, message: "Impossible de vérifier les offres sélectionnées." };
    }
    if (jobs.some((job) => job.source !== "france_travail" || !job.source_job_id)) {
      return { ok: false, message: "Publication en lot réservée aux offres France Travail. Examinez les autres offres séparément." };
    }
    const { data: checks, error: checksError } = await service.from("job_ft_verifications")
      .select("job_id,state,checked_at").in("job_id", ids);
    if (checksError) return { ok: false, message: checksError.message };
    const byId = new Map((checks ?? []).map((check) => [check.job_id, check]));
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const unverified = ids.filter((id) => {
      const check = byId.get(id);
      return !check || check.state !== "active" || !Number.isFinite(Date.parse(check.checked_at)) ||
        Date.parse(check.checked_at) < cutoff;
    });
    if (unverified.length > 0) {
      return { ok: false, message: `${unverified.length} offre(s) ne disposent pas d'une vérification France Travail active datant de moins de 24 h. Vérifiez la page avant de publier.` };
    }
    const { data: reviewed, error: reviewError } = await service.from("job_admin_reviews")
      .select("job_id,content_signature").in("job_id", ids);
    if (reviewError) return { ok: false, message: reviewError.message };
    const reviewMap = new Map((reviewed ?? []).map((entry) => [entry.job_id, entry.content_signature]));
    const { data: currentJobs, error: currentError } = await service.from("jobs")
      .select(`id,${REVIEW_FIELDS}`).in("id", ids);
    if (currentError || currentJobs?.length !== ids.length) return { ok: false, message: "Contrôle du contenu impossible." };
    const missingReview = currentJobs.filter((job) => reviewMap.get(job.id) !== jobSignature(job as ReviewableJob));
    if (missingReview.length) return { ok: false, message: `${missingReview.length} offre(s) n'ont pas de confirmation d'examen valide pour leur version actuelle. Ouvrez chaque fiche et confirmez l'examen du contenu.` };
  }

  const { data, error } = await supabase.from("jobs").update({ status })
    .in("id", ids).select("id");
  if (error) return { ok: false, message: `Mise à jour impossible : ${error.message}` };
  const updated = data?.length ?? 0;
  revalidatePath("/admin/offres");
  revalidatePath("/admin");
  revalidatePath("/fr/offres");
  revalidatePath("/ro/offres");
  for (const id of ids) {
    revalidatePath(`/admin/offres/${id}`);
    revalidatePath(`/fr/offres/${id}`);
    revalidatePath(`/ro/offres/${id}`);
  }
  return {
    ok: updated === ids.length,
    updated,
    message: updated === ids.length
      ? `${updated} offre(s) mises à jour.`
      : `${updated} offre(s) mises à jour sur ${ids.length}. Vérifiez les autres offres.`,
  };
}
