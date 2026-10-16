import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerForm, type Partner } from "../partner-form";
import { addPartnerActivity } from "../activity-actions";
import { saveCandidatePresentation } from "../presentation-actions";
import { savePartnerContract, uploadContractPdf, downloadContractPdf } from "../contract-actions";
import { deletePartner, deletePartnerContract } from "../delete-actions";
import { ConfirmDeleteButton } from "../confirm-delete-button";
import { blockPartnerProspection, unblockPartnerProspection } from "../opt-out-actions";

export const dynamic = "force-dynamic";

type Contract = {
  id: string; contract_name: string; contract_status: string; fee_type: string;
  fixed_fee_eur: number | null; percentage_rate: number | null; fee_trigger: string;
  payment_terms: string | null; signed_at: string | null; valid_from: string | null;
  valid_until: string | null; notes: string | null; created_at: string;
};
type ContractDocument = { id: string; contract_id: string; original_filename: string; size_bytes: number; uploaded_at: string };

type Activity = {
  id: string;
  activity_type: string;
  contact_person: string | null;
  details: string;
  activity_date: string;
  follow_up_at: string | null;
  created_at: string;
};
type Candidate = { id: string; first_name: string; last_name: string; specialty: string | null };
type Presentation = {
  id: string; application_id: string; stage: string; candidate_permission: string;
  permission_details: string | null; notes: string | null; created_at: string;
};
const stageLabels: Record<string, string> = {
  identified: "Identifié (aucune transmission)", profile_proposed: "Profil proposé (sans CV)",
  cv_sent: "CV transmis", interview: "Entretien", offer: "Proposition", recruited: "Recrutement confirmé", rejected: "Refusé",
};
const activityLabels: Record<string, string> = {
  note: "Note interne", email: "E-mail", phone: "Appel téléphonique",
  meeting: "Rendez-vous", follow_up: "Relance", other: "Autre",
};
const fieldStyle = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[#082a43] focus:border-[#118c87] focus:outline-none";
function formatDate(value: string) {
  // YYYY-MM-DD is a SQL date and must not shift days due to browser timezone.
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let partner: Partner | undefined;
  let activities: Activity[] = [];
  let presentations: Presentation[] = [];
  let candidates: Candidate[] = [];
  let contracts: Contract[] = [];
  let documents: ContractDocument[] = [];
  let optOut: { id: string; email: string; reason: string | null; created_at: string } | null = null;
  if (id !== "nouveau") {
    const db = createAdminClient();
    const [{ data, error }, activityResult, presentationResult, candidateResult, contractResult] = await Promise.all([
      db.from("partner_establishments").select("*").eq("id", id).maybeSingle(),
      db.from("partner_activities")
        .select("id,activity_type,contact_person,details,activity_date,follow_up_at,created_at")
        .eq("partner_id", id)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
      db.from("candidate_presentations")
        .select("id,application_id,stage,candidate_permission,permission_details,notes,created_at")
        .eq("partner_id",id).order("created_at",{ascending:false}).limit(100),
      db.from("applications").select("id,first_name,last_name,specialty")
        .order("created_at",{ascending:false}).limit(500),
      db.from("partner_contracts").select("id,contract_name,contract_status,fee_type,fixed_fee_eur,percentage_rate,fee_trigger,payment_terms,signed_at,valid_from,valid_until,notes,created_at")
        .eq("partner_id", id).order("created_at",{ascending:false}).limit(100),
    ]);
    if (error) throw new Error(error.message);
    if (!data) notFound();
    if (activityResult.error) throw new Error(activityResult.error.message);
    partner = data as Partner;
    if (partner.contact_email?.trim()) {
      const email = partner.contact_email.trim().toLowerCase();
      // Use the unique normalized e-mail key. No access from the browser.
      const optResult = await db.from("prospection_opt_outs")
        .select("id,email,reason,created_at")
        .ilike("email", email.replace(/[\%_]/g, "\\$&"))
        .maybeSingle();
      if (optResult.error) throw new Error(optResult.error.message);
      optOut = optResult.data;
    }
    activities = (activityResult.data ?? []) as Activity[];
    if (presentationResult.error) throw new Error(presentationResult.error.message);
    if (candidateResult.error) throw new Error(candidateResult.error.message);
    presentations = (presentationResult.data ?? []) as Presentation[];
    candidates = (candidateResult.data ?? []) as Candidate[];
    if (contractResult.error) throw new Error(contractResult.error.message);
    contracts = (contractResult.data ?? []) as Contract[];
    if (contracts.length) {
      const docResult = await db.from("partner_contract_documents")
        .select("id,contract_id,original_filename,size_bytes,uploaded_at")
        .in("contract_id", contracts.map(c => c.id)).order("uploaded_at", {ascending:false}).limit(200);
      if (docResult.error) throw new Error(docResult.error.message);
      documents = (docResult.data ?? []) as ContractDocument[];
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="min-h-screen bg-[#f5f9fb] px-5 py-10 text-[#082a43]">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/admin/partenaires" className="text-sm font-bold text-[#118c87]">← Retour aux établissements</Link>
        <h1 className="text-3xl font-black">{partner ? "Modifier l’établissement" : "Nouvel établissement"}</h1>
        <PartnerForm partner={partner} />
        {partner ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black">Opposition à la prospection</h2>
            <p className="mt-2 text-sm text-slate-600">Cette option concerne les campagnes commerciales envoyées depuis CSTMed. Elle ne supprime ni les échanges antérieurs ni le dossier de l’établissement.</p>
            {!partner.contact_email?.trim() ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Ajoutez d’abord une adresse e-mail de contact à cet établissement.</p>
            ) : optOut ? (
              <div className="mt-5 space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-black text-red-800">⛔ Ne plus contacter — {optOut.email}</p>
                <p className="text-sm text-red-800">Cette adresse est exclue des campagnes de prospection.</p>
                {optOut.reason ? <p className="whitespace-pre-wrap text-sm text-slate-700">Motif : {optOut.reason}</p> : null}
                <form action={unblockPartnerProspection} className="space-y-3 border-t border-red-200 pt-4">
                  <input type="hidden" name="partner_id" value={partner.id} />
                  <label className="block text-sm font-bold">Justificatif du retrait de l’opposition (obligatoire)
                    <textarea name="evidence" required minLength={10} maxLength={1000} rows={2} className={fieldStyle} placeholder="Date et message explicite du contact autorisant de nouveaux e-mails commerciaux" />
                  </label>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="confirmed" value="yes" required className="mt-1" />
                    Le contact a explicitement retiré son opposition à la prospection.
                  </label>
                  <button type="submit" className="rounded-full border border-red-700 bg-white px-5 py-2.5 text-sm font-bold text-red-800">Autoriser à nouveau (avec justificatif)</button>
                </form>
              </div>
            ) : (
              <div className="mt-5 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-950">Prospection non bloquée pour {partner.contact_email}</p>
                <form action={blockPartnerProspection} className="space-y-3">
                  <input type="hidden" name="partner_id" value={partner.id} />
                  <label className="block text-sm font-bold">Motif (facultatif)
                    <textarea name="reason" maxLength={1000} rows={2} className={fieldStyle} placeholder="Ex. Opposition reçue par e-mail le ..." />
                  </label>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="confirmed" value="yes" required className="mt-1" />
                    Je confirme le blocage de cette adresse pour les campagnes CSTMed.
                  </label>
                  <button type="submit" className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-black" style={{ color: "#ffffff" }}>Ne plus contacter</button>
                </form>
              </div>
            )}
          </section>
        ) : null}
        {partner ? <section className="rounded-2xl border border-red-200 bg-white p-5">
          <h2 className="font-black text-red-700">Zone de suppression</h2>
          <p className="my-3 text-sm text-slate-600">Supprime seulement les établissements sans contacts, contrats, médecins associés ni e-mails de prospection. Pour les dossiers actifs, utilisez « Archivé ».</p>
          <form action={deletePartner}>
            <input type="hidden" name="partner_id" value={partner.id}/>
            <ConfirmDeleteButton label="Supprimer cet établissement" message={`Supprimer définitivement « ${partner.establishment_name} » ? Cette action est irréversible.`}/>
          </form>
        </section> : null}
        {partner ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">Contrats & Honoraires</h2>
              <p className="mt-2 text-sm text-slate-600">Accords commerciaux et documents PDF privés. Un contrat marqué « Signé » nécessite une date de signature. Aucun document n’est envoyé automatiquement.</p>
              <form action={savePartnerContract} className="mt-6 space-y-4 rounded-2xl border border-teal-200 bg-teal-50/40 p-5">
                <input type="hidden" name="partner_id" value={partner.id}/>
                <h3 className="font-black">Ajouter un contrat</h3>
                <label className="block text-sm font-bold">Intitulé
                  <input name="contract_name" required maxLength={200} defaultValue="Convention de recrutement" className={fieldStyle}/>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-bold">Statut
                    <select name="contract_status" defaultValue="draft" className={fieldStyle}>
                      <option value="draft">Brouillon</option><option value="negotiating">En négociation</option>
                      <option value="signed">Signé</option><option value="expired">Expiré</option><option value="terminated">Résilié</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold">Type d'honoraires
                    <select name="fee_type" defaultValue="negotiable" className={fieldStyle}>
                      <option value="negotiable">À négocier</option><option value="fixed">Montant fixe (€)</option>
                      <option value="percentage">Pourcentage du salaire annuel brut</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold">Montant fixe (€) — seulement si fixe
                    <input name="fixed_fee_eur" type="number" min="0" max="9999999999" step="0.01" className={fieldStyle}/>
                  </label>
                  <label className="block text-sm font-bold">Pourcentage (%) — seulement si pourcentage
                    <input name="percentage_rate" type="number" min="0" max="100" step="0.01" className={fieldStyle}/>
                  </label>
                  <label className="block text-sm font-bold">Date de signature
                    <input name="signed_at" type="date" className={fieldStyle}/>
                  </label>
                  <label className="block text-sm font-bold">Honoraires exigibles
                    <select name="fee_trigger" defaultValue="to_negotiate" className={fieldStyle}>
                      <option value="to_negotiate">À négocier</option><option value="contract_signature">À la signature du contrat médecin</option>
                      <option value="doctor_start">À la prise de poste</option><option value="probation_end">À la fin de la période d'essai</option>
                      <option value="other">Autre (préciser)</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold">Début de validité
                    <input name="valid_from" type="date" className={fieldStyle}/>
                  </label>
                  <label className="block text-sm font-bold">Fin de validité
                    <input name="valid_until" type="date" className={fieldStyle}/>
                  </label>
                </div>
                <label className="block text-sm font-bold">Conditions de paiement
                  <textarea name="payment_terms" maxLength={4000} rows={2} className={fieldStyle}/>
                </label>
                <label className="block text-sm font-bold">Notes internes
                  <textarea name="notes" maxLength={4000} rows={2} className={fieldStyle}/>
                </label>
                <p className="text-xs text-slate-500">Remplir uniquement le montant adapté au type choisi. Pour « Signé », la date de signature est obligatoire.</p>
                <button className="rounded-full bg-[#118c87] px-6 py-3 text-sm font-black text-white" style={{color:"#fff"}} type="submit">Enregistrer le contrat</button>
              </form>
              <div className="mt-7 space-y-5">
                <h3 className="text-lg font-black">Contrats enregistrés ({contracts.length})</h3>
                {contracts.length === 0 && <p className="text-sm text-slate-500">Aucun contrat pour cet établissement.</p>}
                {contracts.map(contract => (
                  <div key={contract.id} className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div><h4 className="font-black">{contract.contract_name}</h4><p className="text-sm text-slate-600">{contract.contract_status === "signed" ? "Signé" : contract.contract_status === "negotiating" ? "En négociation" : contract.contract_status === "draft" ? "Brouillon" : contract.contract_status === "expired" ? "Expiré" : "Résilié"}</p></div>
                      <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">{contract.fee_type === "fixed" ? `${contract.fixed_fee_eur ?? 0} €` : contract.fee_type === "percentage" ? `${contract.percentage_rate ?? 0} % du salaire annuel brut` : "À négocier"}</span>
                    </div>
                    <p className="text-xs text-slate-500">{contract.signed_at ? `Signé le ${formatDate(contract.signed_at)} · ` : ""}{contract.valid_until ? `Valide jusqu’au ${formatDate(contract.valid_until)}` : "Sans date de fin précisée"}</p>
                    <form action={savePartnerContract} className="grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="partner_id" value={partner.id}/><input type="hidden" name="contract_id" value={contract.id}/>
                      <label className="block text-xs font-bold">Intitulé<input name="contract_name" required maxLength={200} defaultValue={contract.contract_name} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold">Statut<select name="contract_status" defaultValue={contract.contract_status} className={fieldStyle}><option value="draft">Brouillon</option><option value="negotiating">En négociation</option><option value="signed">Signé</option><option value="expired">Expiré</option><option value="terminated">Résilié</option></select></label>
                      <label className="block text-xs font-bold">Type<select name="fee_type" defaultValue={contract.fee_type} className={fieldStyle}><option value="negotiable">À négocier</option><option value="fixed">Fixe (€)</option><option value="percentage">Pourcentage (%)</option></select></label>
                      <label className="block text-xs font-bold">Montant fixe (€)<input name="fixed_fee_eur" type="number" min="0" step="0.01" defaultValue={contract.fixed_fee_eur ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold">Taux (%)<input name="percentage_rate" type="number" min="0" max="100" step="0.01" defaultValue={contract.percentage_rate ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold">Date de signature<input name="signed_at" type="date" defaultValue={contract.signed_at ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold">Honoraires exigibles<select name="fee_trigger" defaultValue={contract.fee_trigger} className={fieldStyle}><option value="to_negotiate">À négocier</option><option value="contract_signature">À la signature du contrat médecin</option><option value="doctor_start">À la prise de poste</option><option value="probation_end">À la fin de la période d'essai</option><option value="other">Autre</option></select></label>
                      <label className="block text-xs font-bold">Début de validité<input name="valid_from" type="date" defaultValue={contract.valid_from ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold">Fin de validité<input name="valid_until" type="date" defaultValue={contract.valid_until ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold sm:col-span-2">Conditions de paiement<textarea name="payment_terms" maxLength={4000} rows={2} defaultValue={contract.payment_terms ?? ""} className={fieldStyle}/></label>
                      <label className="block text-xs font-bold sm:col-span-2">Notes<textarea name="notes" maxLength={4000} rows={2} defaultValue={contract.notes ?? ""} className={fieldStyle}/></label>
                      <button type="submit" className="sm:col-span-2 rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-bold text-white" style={{color:"#fff"}}>Mettre à jour le contrat</button>
                    </form>
                    <form action={deletePartnerContract} className="border-t border-red-100 pt-4">
                      <input type="hidden" name="partner_id" value={partner.id}/>
                      <input type="hidden" name="contract_id" value={contract.id}/>
                      {(["draft", "negotiating"].includes(contract.contract_status)) ? (
                        <ConfirmDeleteButton message={`Supprimer définitivement le contrat « ${contract.contract_name} » et ses fichiers PDF ? Cette action est irréversible.`} label="Supprimer ce contrat"/>
                      ) : <p className="text-xs text-slate-500">Contrat signé ou clôturé : suppression désactivée.</p>}
                    </form>
                    <div className="border-t border-slate-200 pt-4">
                      <h5 className="text-sm font-black">Documents PDF privés</h5>
                      <form action={uploadContractPdf} className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <input type="hidden" name="partner_id" value={partner.id}/><input type="hidden" name="contract_id" value={contract.id}/>
                        <input name="pdf" type="file" accept="application/pdf,.pdf" required className="min-w-0 max-w-full text-sm"/>
                        <button type="submit" className="rounded-full border border-teal-600 px-5 py-2 text-sm font-bold text-teal-800">Ajouter le PDF (max 10 Mo)</button>
                      </form>
                      <ul className="mt-3 space-y-2">
                        {documents.filter(d => d.contract_id === contract.id).map(doc => (
                          <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
                            <span className="break-all text-sm">{doc.original_filename} · {(doc.size_bytes / 1024 / 1024).toFixed(2)} Mo</span>
                            <form action={downloadContractPdf}><input type="hidden" name="partner_id" value={partner.id}/><input type="hidden" name="document_id" value={doc.id}/><button type="submit" className="text-sm font-bold text-[#118c87]">Télécharger →</button></form>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">Médecins présentés / suivis</h2>
              <p className="mt-2 text-sm text-slate-600">Association interne des candidatures. Aucun e-mail ni CV n’est envoyé automatiquement.</p>
              <p className="mt-2 text-sm font-semibold text-amber-800">La case « Accord confirmé » est réservée aux autorisations explicites et documentées du médecin pour cet établissement. Le consentement général au formulaire ne suffit pas.</p>
              <form action={saveCandidatePresentation} className="mt-5 space-y-4">
                <input type="hidden" name="partner_id" value={partner.id} />
                <label className="block text-sm font-bold">Sélectionner un médecin
                  <select name="application_id" required defaultValue="" className={fieldStyle}>
                    <option value="" disabled>Choisir une candidature</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.last_name} {c.first_name} — {c.specialty || "Spécialité non renseignée"}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-bold">Étape du recrutement
                  <select name="stage" defaultValue="identified" className={fieldStyle}>
                    {Object.entries(stageLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-bold">Autorisation spécifique du médecin
                  <select name="candidate_permission" defaultValue="not_confirmed" className={fieldStyle}>
                    <option value="not_confirmed">Non confirmée</option>
                    <option value="confirmed">Accord confirmé et documenté</option>
                  </select>
                </label>
                <label className="block text-sm font-bold">Preuve de l’accord (date, canal, établissement, portée)
                  <textarea name="permission_details" rows={2} className={fieldStyle} maxLength={2000} placeholder="Ex. 15/10/2026, courriel du médecin autorisant l'envoi de son CV au CH X" />
                </label>
                <label className="block text-sm font-bold">Notes internes
                  <textarea name="notes" rows={2} className={fieldStyle} maxLength={3000} />
                </label>
                <button type="submit" className="rounded-full bg-[#118c87] px-6 py-3 text-sm font-bold text-white" style={{color:"#fff"}}>Associer le médecin</button>
              </form>
              <div className="mt-7 space-y-4">
                <h3 className="text-lg font-black">Dossiers associés ({presentations.length}{presentations.length === 100 ? "+" : ""})</h3>
                {presentations.length === 0 ? <p className="text-sm text-slate-500">Aucun médecin associé.</p> : null}
                {presentations.map(p => {
                  const candidate = candidates.find(c => c.id === p.application_id);
                  return <form key={p.id} action={saveCandidatePresentation} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <input type="hidden" name="partner_id" value={partner.id} />
                    <input type="hidden" name="presentation_id" value={p.id} />
                    <input type="hidden" name="application_id" value={p.application_id} />
                    <div className="font-bold">{candidate ? `${candidate.last_name} ${candidate.first_name}` : "Candidature " + p.application_id.slice(0,8)}</div>
                    <Link href={`/admin/candidatures/${p.application_id}`} className="text-xs font-bold text-[#118c87]">Voir le dossier du médecin →</Link>
                    <label className="block text-sm font-semibold">Étape
                      <select name="stage" defaultValue={p.stage} className={fieldStyle}>
                        {Object.entries(stageLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">Autorisation
                      <select name="candidate_permission" defaultValue={p.candidate_permission} className={fieldStyle}>
                        <option value="not_confirmed">Non confirmée</option>
                        <option value="confirmed">Accord confirmé et documenté</option>
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">Justificatif de l’accord
                      <textarea name="permission_details" defaultValue={p.permission_details || ""} rows={2} maxLength={2000} className={fieldStyle} />
                    </label>
                    <label className="block text-sm font-semibold">Notes
                      <textarea name="notes" defaultValue={p.notes || ""} rows={2} maxLength={3000} className={fieldStyle} />
                    </label>
                    <button className="rounded-full bg-[#082a43] px-5 py-2 text-sm font-bold text-white" style={{color:"#fff"}} type="submit">Mettre à jour</button>
                  </form>;
                })}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black text-[#082a43]">Historique des contacts</h2>
              <p className="mt-2 text-sm text-slate-600">Notes et échanges internes CSTMed, réservés aux administrateurs.</p>
              <form action={addPartnerActivity} className="mt-6 space-y-4">
                <input type="hidden" name="partner_id" value={partner.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold">Type d’activité
                    <select name="activity_type" defaultValue="note" required className={fieldStyle}>
                      {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold">Personne contactée
                    <input name="contact_person" maxLength={200} placeholder="Responsable RH, direction..." className={fieldStyle} />
                  </label>
                  <label className="text-sm font-bold">Date de l’activité
                    <input name="activity_date" type="date" required defaultValue={today} className={fieldStyle} />
                  </label>
                  <label className="text-sm font-bold">Prochaine relance (facultatif)
                    <input name="follow_up_at" type="date" className={fieldStyle} />
                  </label>
                </div>
                <label className="block text-sm font-bold">Compte rendu / note interne
                  <textarea name="details" required minLength={2} maxLength={5000} rows={4}
                    placeholder="Ex. Appel avec la direction, souhaite recevoir une présentation des services CSTMed..."
                    className={fieldStyle} />
                </label>
                <button type="submit" style={{ color: "#ffffff" }}
                  className="rounded-full bg-[#118c87] px-6 py-3 text-sm font-black hover:bg-[#0c7773]">
                  Enregistrer dans l’historique
                </button>
              </form>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">Échanges enregistrés ({activities.length}{activities.length === 100 ? "+" : ""})</h2>
              {activities.length === 0 ? (
                <p className="mt-4 text-slate-500">Aucun contact enregistré pour cet établissement.</p>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {activities.map((item) => (
                    <article key={item.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-xs font-bold text-[#0c7773]">{activityLabels[item.activity_type] ?? item.activity_type}</span>
                        <span className="text-xs font-semibold text-slate-500">{formatDate(item.activity_date)}</span>
                        {item.follow_up_at ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Relance : {formatDate(item.follow_up_at)}</span> : null}
                      </div>
                      {item.contact_person ? <p className="mt-2 text-sm font-semibold">Contact : {item.contact_person}</p> : null}
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.details}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
