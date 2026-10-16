"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "cstmed-partner-contracts";

function getId(form: FormData, name: string) {
  const value = form.get(name);
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new Error("Identifiant invalide.");
  }
  return value;
}

// Les établissements ayant une activité commerciale ne sont jamais supprimés.
export async function deletePartner(form: FormData) {
  await requireAdmin();
  const partnerId = getId(form, "partner_id");
  const db = createAdminClient();

  const { data: partner, error: partnerError } = await db
    .from("partner_establishments")
    .select("id,establishment_name")
    .eq("id", partnerId)
    .maybeSingle();
  if (partnerError || !partner) throw new Error("Établissement introuvable.");

  const references = [
    ["partner_activities", "Historique des contacts"],
    ["candidate_presentations", "Médecins associés"],
    ["partner_contracts", "Contrats"],
    ["prospection_emails", "E-mails de prospection"],
    ["prospection_replies", "Réponses reçues"],
  ] as const;

  const checks = await Promise.all(
    references.map(async ([table, label]) => {
      const result = await db
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partnerId);
      if (result.error) {
        throw new Error(`Vérification impossible (${label}) : ${result.error.message}`);
      }
      return { label, count: result.count ?? 0 };
    }),
  );

  const protectedRecords = checks.filter((item) => item.count > 0);
  if (protectedRecords.length) {
    throw new Error(
      `Suppression refusée : cet établissement contient ${protectedRecords
        .map((item) => `${item.label} (${item.count})`)
        .join(", ")}. Conservez ce dossier ou archivez-le.`,
    );
  }

  const { data: deleted, error } = await db
    .from("partner_establishments")
    .delete()
    .eq("id", partnerId)
    .select("id")
    .maybeSingle();
  if (error || !deleted) {
    throw new Error(error?.message ?? "Suppression impossible.");
  }

  revalidatePath("/admin/partenaires");
  revalidatePath("/admin");
  redirect("/admin/partenaires?deleted=1");
}

// Ne jamais effacer les contrats signés ou liés à des honoraires.
// La base est supprimée en premier : en cas d'échec SQL, les PDF restent intacts.
// Si le nettoyage Storage échoue ensuite, les PDF restent privés et l'erreur est signalée.
export async function deletePartnerContract(form: FormData) {
  await requireAdmin();
  const partnerId = getId(form, "partner_id");
  const contractId = getId(form, "contract_id");
  const db = createAdminClient();

  const { data: contract, error: contractError } = await db
    .from("partner_contracts")
    .select("id,contract_status")
    .eq("id", contractId)
    .eq("partner_id", partnerId)
    .maybeSingle();
  if (contractError || !contract) throw new Error("Contrat introuvable.");
  if (!["draft", "negotiating"].includes(contract.contract_status)) {
    throw new Error(
      "Seuls les contrats brouillons ou en négociation peuvent être supprimés. Les contrats signés/archivés doivent être conservés.",
    );
  }

  const fees = await db
    .from("recruitment_fees")
    .select("id", { count: "exact", head: true })
    .eq("contract_id", contractId);
  if (fees.error) {
    throw new Error(`Vérification des honoraires impossible : ${fees.error.message}`);
  }
  if ((fees.count ?? 0) > 0) {
    throw new Error("Suppression refusée : des honoraires sont liés à ce contrat.");
  }

  const docs = await db
    .from("partner_contract_documents")
    .select("id,storage_path")
    .eq("contract_id", contractId);
  if (docs.error) {
    throw new Error(`Vérification des PDF impossible : ${docs.error.message}`);
  }
  const paths = (docs.data ?? []).map((item) => item.storage_path);
  if (paths.some((path) => !path.startsWith(`${partnerId}/${contractId}/`))) {
    throw new Error("Chemin PDF inattendu : suppression annulée.");
  }

  // Selon le schéma existant, les lignes documents doivent avoir une FK
  // ON DELETE CASCADE. Si elles bloquent la suppression, le contrat et ses PDF
  // restent inchangés et Supabase retourne une erreur.
  const { data: deleted, error } = await db
    .from("partner_contracts")
    .delete()
    .eq("id", contractId)
    .eq("partner_id", partnerId)
    .in("contract_status", ["draft", "negotiating"])
    .select("id")
    .maybeSingle();
  if (error || !deleted) {
    throw new Error(error?.message ?? "Suppression impossible. Rechargez la page.");
  }

  revalidatePath(`/admin/partenaires/${partnerId}`);
  revalidatePath("/admin/partenaires");
  revalidatePath("/admin");

  if (paths.length) {
    const { error: storageError } = await db.storage.from(BUCKET).remove(paths);
    if (storageError) {
      // Ne pas masquer la suppression DB déjà effectuée.
      console.error("CSTMed: PDF orphelins après suppression du contrat", {
        contractId,
        partnerId,
        paths,
        error: storageError.message,
      });
      throw new Error(
        "Le contrat a été supprimé, mais le nettoyage des PDF privés a échoué. Contactez l'administrateur technique pour supprimer les fichiers orphelins.",
      );
    }
  }
}
