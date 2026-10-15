import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerForm, type Partner } from "../partner-form";
import { addPartnerActivity } from "../activity-actions";
import { saveCandidatePresentation } from "../presentation-actions";

export const dynamic = "force-dynamic";

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
  if (id !== "nouveau") {
    const db = createAdminClient();
    const [{ data, error }, activityResult, presentationResult, candidateResult] = await Promise.all([
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
    ]);
    if (error) throw new Error(error.message);
    if (!data) notFound();
    if (activityResult.error) throw new Error(activityResult.error.message);
    partner = data as Partner;
    activities = (activityResult.data ?? []) as Activity[];
    if (presentationResult.error) throw new Error(presentationResult.error.message);
    if (candidateResult.error) throw new Error(candidateResult.error.message);
    presentations = (presentationResult.data ?? []) as Presentation[];
    candidates = (candidateResult.data ?? []) as Candidate[];
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="min-h-screen bg-[#f5f9fb] px-5 py-10 text-[#082a43]">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/admin/partenaires" className="text-sm font-bold text-[#118c87]">← Retour aux établissements</Link>
        <h1 className="text-3xl font-black">{partner ? "Modifier l’établissement" : "Nouvel établissement"}</h1>
        <PartnerForm partner={partner} />
        {partner ? (
          <>
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
