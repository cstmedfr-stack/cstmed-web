import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRecruitmentFee, updateRecruitmentInvoice, addRecruitmentPayment } from "./actions";

export const dynamic = "force-dynamic";

type Presentation = { id: string; partner_id: string; application_id: string; stage: string };
type Partner = { id: string; establishment_name: string };
type Candidate = { id: string; first_name: string; last_name: string };
type Contract = { id: string; partner_id: string; contract_name: string };
type Fee = { id: string; presentation_id: string; contract_id: string | null; agreed_fee_eur: number | null; fee_due_date: string | null; invoice_number: string | null; invoice_issued_at: string | null; invoice_due_date: string | null; amount_invoiced_eur: number | null; amount_received_eur: number; notes: string | null };
type Payment = { id: string; recruitment_fee_id: string; amount_eur: number; paid_at: string; payment_method: string; reference: string | null };
const euro = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
const n = (v: unknown) => Number(v ?? 0);
const isoToday = () => new Date().toISOString().slice(0, 10);
const input = "mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm text-slate-900";

export default async function FinancesPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [pRes, partnersRes, candidatesRes, contractsRes, feesRes, paymentsRes] = await Promise.all([
    db.from("candidate_presentations").select("id,partner_id,application_id,stage").order("created_at", { ascending: false }).limit(1000),
    db.from("partner_establishments").select("id,establishment_name").limit(1000),
    db.from("applications").select("id,first_name,last_name").limit(1000),
    db.from("partner_contracts").select("id,partner_id,contract_name").limit(1000),
    db.from("recruitment_fees").select("id,presentation_id,contract_id,agreed_fee_eur,fee_due_date,invoice_number,invoice_issued_at,invoice_due_date,amount_invoiced_eur,amount_received_eur,notes").order("created_at", { ascending: false }).limit(1000),
    db.from("recruitment_payments").select("id,recruitment_fee_id,amount_eur,paid_at,payment_method,reference").order("paid_at", { ascending: false }).limit(2000),
  ]);
  const problem = [pRes, partnersRes, candidatesRes, contractsRes, feesRes, paymentsRes].map(r => r.error?.message).find(Boolean);
  const presentations = (pRes.data ?? []) as Presentation[];
  const partners = (partnersRes.data ?? []) as Partner[];
  const candidates = (candidatesRes.data ?? []) as Candidate[];
  const contracts = (contractsRes.data ?? []) as Contract[];
  const fees = (feesRes.data ?? []) as Fee[];
  const payments = (paymentsRes.data ?? []) as Payment[];
  const partnerById = new Map(partners.map(p => [p.id, p]));
  const candidateById = new Map(candidates.map(c => [c.id, c]));
  const presentationById = new Map(presentations.map(p => [p.id, p]));
  const feeByPresentation = new Set(fees.map(f => f.presentation_id));
  const paymentsByFee = new Map<string, Payment[]>();
  for (const payment of payments) paymentsByFee.set(payment.recruitment_fee_id, [...(paymentsByFee.get(payment.recruitment_fee_id) ?? []), payment]);
  const presentationTitle = (p: Presentation) => {
    const partner = partnerById.get(p.partner_id)?.establishment_name ?? "Établissement inconnu";
    const c = candidateById.get(p.application_id);
    return `${c ? `${c.first_name} ${c.last_name}` : "Candidat"} — ${partner}`;
  };
  const invoiced = fees.reduce((s, f) => s + n(f.amount_invoiced_eur), 0);
  const received = fees.reduce((s, f) => s + n(f.amount_received_eur) + (paymentsByFee.get(f.id) ?? []).reduce((sum, p) => sum + n(p.amount_eur), 0), 0);
  const overdue = fees.filter(f => f.invoice_due_date && f.invoice_due_date < isoToday() && n(f.amount_invoiced_eur) > n(f.amount_received_eur) + (paymentsByFee.get(f.id) ?? []).reduce((s, p) => s + n(p.amount_eur), 0)).length;
  return <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
    <header className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-10 text-white"><div className="mx-auto max-w-6xl"><Link href="/admin" className="text-sm text-[#8ce2da]">← Tableau de bord</Link><h1 className="mt-3 text-3xl font-black">Factures & Paiements</h1><p className="mt-2 text-slate-200">Suivi interne des honoraires CSTMed — aucune facture fiscale n'est émise depuis cette page.</p></div></header>
    <div className="mx-auto max-w-6xl space-y-7 px-5 py-8">
      {problem && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Erreur Supabase : {problem}</div>}
      <div className="grid gap-4 sm:grid-cols-3">{[{ t: "Montant facturé", v: euro(invoiced) }, { t: "Total encaissé", v: euro(received) }, { t: `Solde à encaisser · ${overdue} en retard`, v: euro(Math.max(0, invoiced - received)) }].map(x => <div key={x.t} className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">{x.t}</p><p className="mt-2 text-2xl font-black">{x.v}</p></div>)}</div>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Ouvrir un dossier d'honoraires</h2><p className="mt-2 text-sm text-slate-500">Un dossier financier par présentation médecin–établissement.</p>
        <form action={createRecruitmentFee} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Recrutement<select required name="presentation_id" className={input}><option value="">Choisir un recrutement</option>{presentations.filter(p => !feeByPresentation.has(p.id)).map(p => <option key={p.id} value={p.id}>{presentationTitle(p)}</option>)}</select></label>
          <label className="text-sm font-semibold">Contrat (facultatif)<select name="contract_id" className={input}><option value="">Sans contrat associé</option>{contracts.map(c => <option key={c.id} value={c.id}>{c.contract_name} — {partnerById.get(c.partner_id)?.establishment_name}</option>)}</select></label>
          <label className="text-sm font-semibold">Honoraires négociés (€)<input className={input} name="agreed_fee_eur" type="number" step="0.01" min="0" /></label>
          <label className="text-sm font-semibold">Date d'exigibilité<input className={input} name="fee_due_date" type="date" /></label>
          <label className="md:col-span-2 text-sm font-semibold">Notes<input className={input} name="notes" maxLength={3000}/></label>
          <button className="rounded-full bg-[#118c87] px-5 py-3 font-bold text-white md:col-span-2" type="submit">Créer le dossier financier</button>
        </form>
      </section>
      <section className="space-y-5"><h2 className="text-xl font-black">Dossiers financiers ({fees.length})</h2>{fees.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-500">Aucun dossier financier créé.</p>}
        {fees.map(f => { const p = presentationById.get(f.presentation_id); const entries = paymentsByFee.get(f.id) ?? []; const baseline = n(f.amount_received_eur); const newPayments = entries.reduce((s, x) => s + n(x.amount_eur), 0); const paid = baseline + newPayments; const rest = Math.max(0, n(f.amount_invoiced_eur) - paid); return <article key={f.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-black">{p ? presentationTitle(p) : "Recrutement non identifié"}</h3>{p && <Link href={`/admin/partenaires/${p.partner_id}`} className="text-sm font-semibold text-[#118c87] underline">Consulter l'établissement</Link>}</div><p className="text-sm font-bold text-[#118c87]">Solde : {euro(rest)}</p></div>
          <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-4"><div>Honoraires<br/><strong>{euro(n(f.agreed_fee_eur))}</strong></div><div>Facturé<br/><strong>{euro(n(f.amount_invoiced_eur))}</strong></div><div>Encaissé<br/><strong>{euro(paid)}</strong></div><div>Échéance<br/><strong>{f.invoice_due_date || "—"}</strong></div></div>
          <form action={updateRecruitmentInvoice} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="fee_id" value={f.id}/><label className="text-sm">N° facture<input className={input} name="invoice_number" defaultValue={f.invoice_number ?? ""}/></label><label className="text-sm">Date d'émission<input className={input} type="date" name="invoice_issued_at" defaultValue={f.invoice_issued_at ?? ""}/></label><label className="text-sm">Échéance<input className={input} type="date" name="invoice_due_date" defaultValue={f.invoice_due_date ?? ""}/></label><label className="text-sm">Montant facturé (€)<input className={input} type="number" min="0" step="0.01" name="amount_invoiced_eur" defaultValue={f.amount_invoiced_eur ?? ""}/></label><button className="rounded-full bg-[#082a43] px-5 py-2.5 font-semibold text-white sm:col-span-2 lg:col-span-4">Enregistrer la facture</button></form>
          <div className="mt-6 border-t pt-5"><h4 className="font-black">Paiements reçus</h4>{baseline > 0 && <p className="mt-2 text-sm text-amber-800">Montant historique dans recruitment_fees : {euro(baseline)} (non dupliqué dans les paiements détaillés).</p>}{entries.length > 0 && <div className="mt-3 space-y-1">{entries.map(x => <div key={x.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span>{x.paid_at} · {x.payment_method}{x.reference ? ` · ${x.reference}` : ""}</span><strong>{euro(n(x.amount_eur))}</strong></div>)}</div>}
          <form action={addRecruitmentPayment} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="fee_id" value={f.id}/><label className="text-sm">Montant reçu (€)<input className={input} type="number" name="amount_eur" step="0.01" min="0.01" required/></label><label className="text-sm">Date<input className={input} type="date" name="paid_at" defaultValue={isoToday()} required/></label><label className="text-sm">Méthode<select className={input} name="payment_method"><option value="bank_transfer">Virement bancaire</option><option value="card">Carte</option><option value="cheque">Chèque</option><option value="cash">Espèces</option><option value="other">Autre</option></select></label><label className="text-sm">Référence<input className={input} name="reference" maxLength={200}/></label><label className="text-sm sm:col-span-2 lg:col-span-4">Notes<input className={input} name="notes" maxLength={3000}/></label><button className="rounded-full bg-[#118c87] px-5 py-2.5 font-semibold text-white sm:col-span-2 lg:col-span-4">Enregistrer le paiement</button></form>
          </div>
        </article>; })}
      </section>
      <p className="text-xs text-slate-500">Affichage limité aux 1 000 dossiers les plus récents et 2 000 paiements. Les montants historiques sont conservés séparément des nouveaux paiements. Les écritures ici servent uniquement au suivi interne.</p>
    </div>
  </main>;
}
