"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobSignature, REVIEW_FIELDS, type ReviewableJob } from "./review-helper";

export async function confirmJobContentReview(formData: FormData): Promise<void> {
  const id = formData.get("jobId");
  const confirmed = formData.get("confirmed");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || confirmed !== "yes") {
    throw new Error("Confirmez l'examen de l'offre.");
  }
  const auth = await createClient();
  const { data: claim, error: claimError } = await auth.auth.getClaims();
  const userId = claim?.claims?.sub;
  if (claimError || !userId) redirect("/admin/login");
  const { data: membership, error: adminError } = await auth.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (adminError || !membership) throw new Error("Accès administrateur refusé.");
  const service = createAdminClient();
  const { data: job, error: jobError } = await service.from("jobs").select(REVIEW_FIELDS).eq("id", id).maybeSingle();
  if (jobError || !job) throw new Error("Offre introuvable.");
  const { error } = await service.from("job_admin_reviews").upsert({
    job_id: id,
    reviewed_by: userId,
    reviewed_at: new Date().toISOString(),
    content_signature: jobSignature(job as ReviewableJob),
  }, { onConflict: "job_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/offres/${id}`);
  revalidatePath("/admin/offres");
  redirect(`/admin/offres/${id}?reviewed=1`);
}
