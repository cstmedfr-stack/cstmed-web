"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type BulkStatus = "published" | "rejected" | "archived" | "draft";
type BulkResult = { ok: boolean; message: string; updated?: number };

const statuses: BulkStatus[] = ["published", "rejected", "archived", "draft"];

export async function updateJobsStatusesBulk(
  ids: string[],
  status: BulkStatus,
): Promise<BulkResult> {
  if (!statuses.includes(status)) {
    return { ok: false, message: "Statut non valide." };
  }

  // Limite volontaire : uniquement les offres affichées sur une page.
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20 ||
      ids.some((id) => typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) ||
      new Set(ids).size !== ids.length) {
    return { ok: false, message: "Sélection non valide (maximum 20 offres)." };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return { ok: false, message: "Session expirée. Veuillez vous reconnecter." };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !admin) {
    return { ok: false, message: "Vous n'avez pas les droits d'administration." };
  }

  // Actualiser uniquement les lignes identifiées. Ne jamais faire une mise à jour sans .in("id", ...).
  const { data, error } = await supabase
    .from("jobs")
    .update({ status })
    .in("id", ids)
    .select("id");

  if (error) {
    return { ok: false, message: `Mise à jour impossible : ${error.message}` };
  }

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
