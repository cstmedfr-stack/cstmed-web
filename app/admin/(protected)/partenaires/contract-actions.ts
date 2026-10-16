"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "cstmed-partner-contracts";
const MAX_PDF = 10 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const contractStatuses = ["draft", "negotiating", "signed", "expired", "terminated"];
const feeTypes = ["negotiable", "fixed", "percentage"];
const triggers = ["to_negotiate", "contract_signature", "doctor_start", "probation_end", "other"];

function str(form: FormData, name: string) { return String(form.get(name) ?? "").trim(); }
function optionalDate(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T12:00:00Z`))) throw new Error("Date invalide.");
  return value;
}
function optionalMoney(raw: string, max: number): number | null {
  if (!raw) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error("Montant ou pourcentage invalide (2 décimales maximum).");
  const number = Number(raw);
  if (!Number.isFinite(number) || number > max) throw new Error("Valeur hors limites.");
  return number;
}
function checkUuid(value: string) { if (!UUID.test(value)) throw new Error("Identifiant invalide."); }

export async function savePartnerContract(form: FormData) {
  await requireAdmin();
  const partnerId = str(form, "partner_id");
  const contractId = str(form, "contract_id");
  checkUuid(partnerId);
  if (contractId) checkUuid(contractId);
  const contractName = str(form, "contract_name");
  const status = str(form, "contract_status");
  const feeType = str(form, "fee_type");
  const trigger = str(form, "fee_trigger");
  if (!contractName || contractName.length > 200) throw new Error("Intitulé invalide.");
  if (!contractStatuses.includes(status) || !feeTypes.includes(feeType) || !triggers.includes(trigger)) throw new Error("Option non reconnue.");
  const fixed = feeType === "fixed" ? optionalMoney(str(form, "fixed_fee_eur"), 9999999999) : null;
  const percent = feeType === "percentage" ? optionalMoney(str(form, "percentage_rate"), 100) : null;
  if (feeType === "fixed" && fixed === null) throw new Error("Renseigner le montant fixe.");
  if (feeType === "percentage" && percent === null) throw new Error("Renseigner le taux.");
  const signedAt = optionalDate(str(form, "signed_at"));
  const validFrom = optionalDate(str(form, "valid_from"));
  const validUntil = optionalDate(str(form, "valid_until"));
  if (status === "signed" && !signedAt) throw new Error("Date de signature obligatoire.");
  if (validFrom && validUntil && validUntil < validFrom) throw new Error("Dates de validité incohérentes.");
  const paymentTerms = str(form, "payment_terms");
  const notes = str(form, "notes");
  if (paymentTerms.length > 4000 || notes.length > 4000) throw new Error("Texte trop long.");
  const db = createAdminClient();
  const { data: partner, error: partnerError } = await db.from("partner_establishments").select("id").eq("id", partnerId).maybeSingle();
  if (partnerError || !partner) throw new Error("Établissement introuvable.");
  const data = {
    partner_id: partnerId, contract_name: contractName, contract_status: status,
    fee_type: feeType, fixed_fee_eur: fixed, percentage_rate: percent,
    fee_trigger: trigger, payment_terms: paymentTerms || null,
    signed_at: signedAt, valid_from: validFrom, valid_until: validUntil,
    notes: notes || null, updated_at: new Date().toISOString(),
  };
  if (contractId) {
    const { data: updated, error } = await db.from("partner_contracts").update(data).eq("id", contractId).eq("partner_id", partnerId).select("id").maybeSingle();
    if (error || !updated) throw new Error(error?.message ?? "Contrat introuvable.");
  } else {
    const { error } = await db.from("partner_contracts").insert(data);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/admin/partenaires/${partnerId}`);
}

export async function uploadContractPdf(form: FormData) {
  await requireAdmin();
  const partnerId = str(form, "partner_id");
  const contractId = str(form, "contract_id");
  checkUuid(partnerId); checkUuid(contractId);
  const uploaded = form.get("pdf");
  if (!(uploaded instanceof File) || uploaded.size === 0 || uploaded.size > MAX_PDF) throw new Error("PDF manquant ou supérieur à 10 Mo.");
  if (uploaded.type !== "application/pdf" || !uploaded.name.toLowerCase().endsWith(".pdf")) throw new Error("Seuls les PDF sont acceptés.");
  const bytes = new Uint8Array(await uploaded.arrayBuffer());
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (header !== "%PDF-") throw new Error("Fichier PDF invalide.");
  const db = createAdminClient();
  const {data: contract, error: contractError} = await db.from("partner_contracts").select("id").eq("id", contractId).eq("partner_id", partnerId).maybeSingle();
  if (contractError || !contract) throw new Error("Contrat introuvable.");
  const cleanFilename = uploaded.name.slice(0, 180).replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${partnerId}/${contractId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { error: insertError } = await db.from("partner_contract_documents").insert({
    contract_id: contractId, storage_path: path, original_filename: cleanFilename,
    mime_type: "application/pdf", size_bytes: uploaded.size,
  });
  if (insertError) {
    await db.storage.from(BUCKET).remove([path]);
    throw new Error(insertError.message);
  }
  revalidatePath(`/admin/partenaires/${partnerId}`);
}

export async function downloadContractPdf(form: FormData) {
  await requireAdmin();
  const partnerId = str(form, "partner_id");
  const documentId = str(form, "document_id");
  checkUuid(partnerId); checkUuid(documentId);
  const db = createAdminClient();
  const { data: document, error } = await db.from("partner_contract_documents")
    .select("storage_path,contract_id").eq("id",documentId).maybeSingle();
  if (error || !document) throw new Error("Document introuvable.");
  const { data: contract } = await db.from("partner_contracts").select("id").eq("id",document.contract_id).eq("partner_id",partnerId).maybeSingle();
  if (!contract || !document.storage_path.startsWith(`${partnerId}/${contract.id}/`)) throw new Error("Accès refusé.");
  const { data, error: urlError } = await db.storage.from(BUCKET).createSignedUrl(document.storage_path, 60);
  if (urlError || !data?.signedUrl) throw new Error("Téléchargement indisponible.");
  redirect(data.signedUrl);
}
