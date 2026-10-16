"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function str(form: FormData, name: string, max = 3000) {
  const value = form.get(name);
  if (typeof value !== "string") throw new Error(`Champ invalide: ${name}`);
  return value.trim().slice(0, max);
}
function id(form: FormData, name: string) {
  const value = str(form, name, 100);
  if (!UUID.test(value)) throw new Error(`Identifiant invalide: ${name}`);
  return value;
}
function dateOrNull(form: FormData, name: string) {
  const v = str(form, name, 20);
  if (!v) return null;
  if (!DATE.test(v) || Number.isNaN(Date.parse(`${v}T12:00:00Z`))) throw new Error(`Date invalide: ${name}`);
  return v;
}
function money(form: FormData, name: string, required = false) {
  const raw = str(form, name, 30).replace(",", ".");
  if (!raw) {
    if (required) throw new Error(`Montant requis: ${name}`);
    return null;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new Error(`Montant invalide: ${name}`);
  const value = Number(raw);
  if (!Number.isFinite(value) || value > 100000000) throw new Error("Montant trop élevé");
  if (required && value <= 0) throw new Error("Le paiement doit être positif");
  return value;
}
function refresh() {
  revalidatePath("/admin/finances");
  revalidatePath("/admin");
}

export async function createRecruitmentFee(form: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const presentationId = id(form, "presentation_id");
  const contractRaw = str(form, "contract_id", 100);
  if (contractRaw && !UUID.test(contractRaw)) throw new Error("Contrat invalide");
  const { data: presentation, error: presError } = await db.from("candidate_presentations")
    .select("id,partner_id").eq("id", presentationId).single();
  if (presError || !presentation) throw new Error("Dossier de recrutement introuvable");
  if (contractRaw) {
    const { data: contract } = await db.from("partner_contracts")
      .select("id,partner_id").eq("id", contractRaw).single();
    if (!contract || contract.partner_id !== presentation.partner_id) throw new Error("Le contrat n'appartient pas à cet établissement");
  }
  const { error } = await db.from("recruitment_fees").insert({
    presentation_id: presentationId,
    contract_id: contractRaw || null,
    agreed_fee_eur: money(form, "agreed_fee_eur"),
    fee_due_date: dateOrNull(form, "fee_due_date"),
    notes: str(form, "notes"),
  });
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
  refresh();
}

export async function updateRecruitmentInvoice(form: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const feeId = id(form, "fee_id");
  const invoiceNumber = str(form, "invoice_number", 120);
  const issuedAt = dateOrNull(form, "invoice_issued_at");
  const dueAt = dateOrNull(form, "invoice_due_date");
  const amount = money(form, "amount_invoiced_eur");
  if (invoiceNumber && !issuedAt) throw new Error("La date d'émission est obligatoire avec un numéro de facture");
  if (dueAt && issuedAt && dueAt < issuedAt) throw new Error("L'échéance précède l'émission");
  const { error } = await db.from("recruitment_fees").update({
    invoice_number: invoiceNumber || null,
    invoice_issued_at: issuedAt,
    invoice_due_date: dueAt,
    amount_invoiced_eur: amount,
    updated_at: new Date().toISOString(),
  }).eq("id", feeId);
  if (error) throw new Error(`Facture non enregistrée : ${error.message}`);
  refresh();
}

export async function addRecruitmentPayment(form: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const feeId = id(form, "fee_id");
  const amount = money(form, "amount_eur", true)!;
  const paidAt = dateOrNull(form, "paid_at");
  if (!paidAt) throw new Error("Date de paiement obligatoire");
  const method = str(form, "payment_method", 30);
  if (!["bank_transfer", "card", "cash", "cheque", "other"].includes(method)) throw new Error("Mode de paiement invalide");
  const { data: fee, error: feeError } = await db.from("recruitment_fees")
    .select("id,amount_invoiced_eur,amount_received_eur").eq("id", feeId).single();
  if (feeError || !fee) throw new Error("Dossier financier introuvable");
  const { data: existing, error: payError } = await db.from("recruitment_payments")
    .select("amount_eur").eq("recruitment_fee_id", feeId);
  if (payError) throw new Error(payError.message);
  const prior = Number(fee.amount_received_eur ?? 0) + (existing ?? []).reduce((s, row) => s + Number(row.amount_eur ?? 0), 0);
  const invoice = fee.amount_invoiced_eur == null ? null : Number(fee.amount_invoiced_eur);
  if (invoice == null) throw new Error("Enregistrez d'abord le montant facturé");
  if (Math.round((prior + amount) * 100) > Math.round(invoice * 100)) throw new Error("Le paiement dépasse le solde restant");
  const { error } = await db.from("recruitment_payments").insert({
    recruitment_fee_id: feeId,
    amount_eur: amount,
    paid_at: paidAt,
    payment_method: method,
    reference: str(form, "reference", 200) || null,
    notes: str(form, "notes", 3000) || null,
  });
  if (error) throw new Error(`Paiement non enregistré : ${error.message}`);
  // Ne pas modifier amount_received_eur: ancienne valeur conservée comme solde historique.
  refresh();
}
