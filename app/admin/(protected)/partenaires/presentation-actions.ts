"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const stages = ["identified", "profile_proposed", "cv_sent", "interview", "offer", "recruited", "rejected"] as const;
function get(formData: FormData, key: string, max=2000) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function saveCandidatePresentation(formData: FormData) {
  await requireAdmin();
  const partnerId = get(formData,"partner_id",100);
  const applicationId = get(formData,"application_id",100);
  const id = get(formData,"presentation_id",100);
  const stage = get(formData,"stage",50) || "identified";
  const permission = get(formData,"candidate_permission",30) || "not_confirmed";
  const permissionDetails = get(formData,"permission_details",2000);
  const notes = get(formData,"notes",3000);
  if (!UUID.test(partnerId) || !UUID.test(applicationId) || (id && !UUID.test(id))) throw new Error("Identifiant invalide.");
  if (!stages.includes(stage as typeof stages[number])) throw new Error("Étape invalide.");
  if (!(["not_confirmed","confirmed"] as string[]).includes(permission)) throw new Error("Autorisation invalide.");
  if (permission === "confirmed" && permissionDetails.length < 5) {
    throw new Error("Précisez la date, le canal et la portée de l’accord du médecin.");
  }
  const db = createAdminClient();
  const [partnerResult, applicationResult] = await Promise.all([
    db.from("partner_establishments").select("id,relationship_status").eq("id", partnerId).maybeSingle(),
    db.from("applications").select("id").eq("id", applicationId).maybeSingle(),
  ]);
  if (partnerResult.error || !partnerResult.data || applicationResult.error || !applicationResult.data) throw new Error("Établissement ou candidature introuvable.");

  // Nu se permite marcarea CV transmis fara acord specific, nici fara acord comercial semnat.
  if (["cv_sent","interview","offer","recruited"].includes(stage)) {
    if (permission !== "confirmed") throw new Error("Accord du médecin obligatoire avant transmission de données nominatives.");
    if (partnerResult.data.relationship_status !== "signed") throw new Error("Accord commercial signé requis avant de marquer un CV comme transmis.");
  }
  const payload = {
    partner_id: partnerId,
    application_id: applicationId,
    stage,
    candidate_permission: permission,
    permission_confirmed_at: permission === "confirmed" ? new Date().toISOString() : null,
    permission_details: permissionDetails || null,
    notes: notes || null,
    updated_at: new Date().toISOString(),
  };
  if (id) {
    const { data: existing, error: existingError } = await db.from("candidate_presentations")
      .select("id,application_id").eq("id",id).eq("partner_id",partnerId).maybeSingle();
    if (existingError || !existing || existing.application_id !== applicationId) throw new Error("Présentation introuvable.");
    const {error} = await db.from("candidate_presentations").update(payload).eq("id",id).eq("partner_id",partnerId);
    if (error) throw new Error(error.message);
  } else {
    const {error} = await db.from("candidate_presentations").insert(payload);
    if (error) throw new Error(error.code === "23505" ? "Ce médecin est déjà associé à cet établissement." : error.message);
  }
  revalidatePath(`/admin/partenaires/${partnerId}`);
}
