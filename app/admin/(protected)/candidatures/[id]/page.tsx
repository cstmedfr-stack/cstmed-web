import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { addApplicationActivity } from "../activity-actions";
import { withdrawTalentPoolConsent } from "../rgpd-actions";
import { deleteApplicationAndCv } from "../delete-actions";
import {
  downloadApplicationCv,
} from "../actions";
import {
  ApplicationStatusActions,
  type ApplicationStatus,
} from "../application-status-actions";
export const dynamic = "force-dynamic";
type ApplicationDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};
type ApplicationDetails = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string;
  country: string | null;
  city: string | null;
  french_level: string | null;
  locale: "ro" | "fr";
  message: string | null;
  cv_original_name: string;
  cv_mime_type: string;
  cv_size_bytes: number;
  status: ApplicationStatus;
  consent_at: string;
  talent_pool_consent_at: string | null;
  created_at: string;
  updated_at: string;
  jobs:
    | {
        id: string;
        title: string;
        location_label: string | null;
        city: string | null;
      }
    | null;
};
const statusLabels: Record<
  ApplicationStatus,
  string
> = {
  new: "Nouvelle",
  reviewing: "À étudier",
  contacted: "Contactée",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  archived: "Archivée",
};
const statusClasses: Record<
  ApplicationStatus,
  string
> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-800",
  contacted: "bg-cyan-100 text-cyan-800",
  interview: "bg-violet-100 text-violet-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};
const frenchLevelLabels: Record<
  string,
  string
> = {
  none: "Débutant / aucun niveau",
  a1: "A1 – Débutant",
  a2: "A2 – Élémentaire",
  b1: "B1 – Intermédiaire",
  b2: "B2 – Indépendant",
  c1: "C1 – Avancé",
  c2: "C2 – Maîtrise",
  native: "Langue maternelle",
};
function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} octets`;
  }
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} Ko`;
  }
  return `${(kilobytes / 1024).toFixed(2)} Mo`;
}
export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        first_name,
        last_name,
        email,
        phone,
        specialty,
        country,
        city,
        french_level,
        locale,
        message,
        cv_original_name,
        cv_mime_type,
        cv_size_bytes,
        status,
        consent_at,
        talent_pool_consent_at,
        created_at,
        updated_at,
        jobs (
          id,
          title,
          location_label,
          city
        )
      `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    notFound();
  }
  const application =
    data as unknown as ApplicationDetails;
  const { data: activitiesData, error: activitiesError } = await createAdminClient()
    .from("application_activities")
    .select("id, activity_type, note, establishment_name, follow_up_at, created_at")
    .eq("application_id", id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (activitiesError) {
    throw new Error(`Impossible de charger le suivi : ${activitiesError.message}`);
  }
  const activities = (activitiesData ?? []) as Array<{
    id: string;
    activity_type: string;
    note: string;
    establishment_name: string | null;
    follow_up_at: string | null;
    created_at: string;
  }>;
  // Une presentation a un etablissement bloque la suppression automatique.
  const { count: presentationCount, error: presentationError } =
    await createAdminClient()
      .from("candidate_presentations")
      .select("id", { count: "exact", head: true })
      .eq("application_id", id);
  if (presentationError) {
    throw new Error(`Controle des presentations impossible : ${presentationError.message}`);
  }
  const hasPresentations = (presentationCount ?? 0) > 0;

  const location = [
    application.city,
    application.country,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
         <Link href="/admin">
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>
          <Link
            href="/admin/candidatures"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Retour aux candidatures
          </Link>
        </div>
      </header>
<section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                statusClasses[application.status]
              }`}
            >
              {statusLabels[application.status]}
            </span>
            <span className="text-sm uppercase text-slate-300">
              Formulaire {application.locale}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            {application.first_name}{" "}
            {application.last_name}
          </h1>
          <p className="mt-3 text-slate-300">
            {application.specialty} • Candidature
            reçue le{" "}
            {formatDate(application.created_at)}
          </p>
        </div>
      </section>
      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Coordonnées
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#0D6EFD] px-5 py-2.5 text-sm font-black shadow-sm transition hover:bg-[#0B63E5]"
                >
                  <span style={{ color: "#ffffff" }}>
                    ✉️ Envoyer un e-mail
                  </span>
                </a>
                <a
                  href={`tel:${application.phone}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-black shadow-sm transition hover:bg-[#0c7773]"
                >
                  <span style={{ color: "#ffffff" }}>
                    ☎️ Appeler
                  </span>
                </a>
              </div>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    E-mail
                  </dt>
                  <dd className="mt-2 break-all font-bold text-[#082a43]">
                    <a
                      href={`mailto:${application.email}`}
                      className="hover:text-[#118c87]"
                    >
                      {application.email}
                    </a>
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Téléphone
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    <a
                      href={`tel:${application.phone}`}
                      className="hover:text-[#118c87]"
                    >
                      {application.phone}
                    </a>
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Spécialité
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {application.specialty}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Localisation
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {location ||
                      "Non précisée"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5 sm:col-span-2">
                  <dt className="text-sm font-semibold text-slate-500">
                    Niveau de français
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {application.french_level
                      ? frenchLevelLabels[
                          application.french_level
                        ] ??
                        application.french_level
                      : "Non précisé"}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Projet du candidat
              </h2>
              {application.message ? (
                <div className="mt-6 whitespace-pre-line rounded-2xl bg-[#f5f9fb] p-6 leading-8 text-slate-700">
                  {application.message}
                </div>
              ) : (
                <p className="mt-5 text-slate-500">
                  Aucun message n’a été ajouté.
                </p>
              )}
            </section>
              {/* Suivi privé du recrutement */}
              <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#118c87]">Espace interne CSTMed</p>
                <h2 className="mt-2 text-2xl font-bold text-[#082a43]">Suivi du recrutement</h2>
                <p className="mt-2 text-sm text-slate-600">Notes et échanges réservés à l’administration. Les actions sont enregistrées avec leur date.</p>
                <form action={addApplicationActivity} className="mt-6 grid gap-4">
                  <input type="hidden" name="applicationId" value={application.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-bold text-[#082a43]">
                      Type d’activité
                      <select name="activityType" defaultValue="note" className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" required>
                        <option value="note">Note interne</option>
                        <option value="email">E-mail</option>
                        <option value="call">Appel téléphonique</option>
                        <option value="establishment">Établissement contacté</option>
                        <option value="interview">Entretien</option>
                        <option value="follow_up">Relance programmée</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-bold text-[#082a43]">
                      Établissement (facultatif)
                      <input name="establishmentName" maxLength={200} placeholder="Nom de l'hôpital ou de la clinique" className="rounded-xl border border-slate-300 px-3 py-3 font-normal" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-bold text-[#082a43]">
                    Note interne
                    <textarea name="note" required minLength={2} maxLength={3000} rows={4} placeholder="Décrivez le contact, les attentes du médecin ou la prochaine étape…" className="rounded-xl border border-slate-300 p-3 font-normal" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-bold text-[#082a43] sm:max-w-xs">
                    Date de relance (facultative)
                    <input type="date" name="followUpAt" className="rounded-xl border border-slate-300 px-3 py-3 font-normal" />
                  </label>
                  <div><button type="submit" className="rounded-full bg-[#118c87] px-6 py-3 text-sm font-black text-white hover:bg-[#0c7773]" style={{ color: "#ffffff" }}>Enregistrer dans le suivi</button></div>
                </form>
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-bold text-[#082a43]">Historique des échanges ({activities.length})</h3>
                  {activities.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">Aucune note enregistrée pour ce dossier.</p>
                  ) : (
                    <ol className="mt-5 space-y-3">
                      {activities.map((item) => (
                        <li key={item.id} className="rounded-2xl border border-slate-200 bg-[#f5f9fb] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-[#082a43]">{({note:"Note interne",email:"E-mail",call:"Appel téléphonique",establishment:"Établissement contacté",interview:"Entretien",follow_up:"Relance"} as Record<string,string>)[item.activity_type] ?? item.activity_type}</span>
                            <time className="text-xs text-slate-500">{formatDate(item.created_at)}</time>
                          </div>
                          {item.establishment_name ? <p className="mt-2 text-sm font-semibold text-[#118c87]">🏥 {item.establishment_name}</p> : null}
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.note}</p>
                          {item.follow_up_at ? <p className="mt-3 text-sm font-bold text-amber-800">📅 Relance prévue : {new Intl.DateTimeFormat("fr-FR", {dateStyle:"long",timeZone:"UTC"}).format(new Date(`${item.follow_up_at}T12:00:00Z`))}</p> : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Offre concernée
              </h2>
              {application.jobs ? (
                <div className="mt-6 rounded-2xl bg-[#f5f9fb] p-6">
                  <p className="font-bold text-[#082a43]">
                    {application.jobs.title}
                  </p>
                  {application.jobs.location_label ||
                  application.jobs.city ? (
                    <p className="mt-2 text-slate-600">
                      📍{" "}
                      {application.jobs
                        .location_label ||
                        application.jobs.city}
                    </p>
                  ) : null}
                 <Link
                href={`/admin/offres/${application.jobs.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-full border border-[#118c87] bg-white px-5 py-2.5 text-sm font-black transition hover:bg-[#e5f7f5]"
              >
                <span style={{ color: "#0c7773" }}>
                  Consulter l’offre →
                </span>
              </Link>
                </div>
              ) : (
                <p className="mt-5 font-semibold text-[#118c87]">
                  Candidature spontanée
                </p>
              )}
            </section>
          </div>
<aside className="h-fit space-y-6 lg:sticky lg:top-28">
            <section className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#65d9ce]">
                Suivi de la candidature
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                {statusLabels[application.status]}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Sélectionnez le statut correspondant
                à l’étape actuelle du dossier.
              </p>
              <div className="mt-6">
                <ApplicationStatusActions
                  applicationId={application.id}
                  status={application.status}
                />
              </div>
            </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#118c87]">
                Curriculum vitae
              </p>
              <h2 className="mt-3 break-words text-lg font-bold text-[#082a43]">
                {application.cv_original_name}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {formatFileSize(
                  application.cv_size_bytes,
                )}
              </p>
              <form
                action={downloadApplicationCv}
                className="mt-6"
              >
                <input
                  type="hidden"
                  name="applicationId"
                  value={application.id}
                />
                <button
            type="submit"
            className="w-full rounded-full bg-[#118c87] px-6 py-3 font-black shadow-sm transition hover:bg-[#0c7773]"
          >
            <span style={{ color: "#ffffff" }}>
              📄 Télécharger le CV
            </span>
            </button>
              </form>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Le lien de téléchargement est temporaire
                et réservé à l’administrateur connecté.
              </p>
            </section>
            <section className="rounded-[2rem] border border-teal-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#118c87]">
                Protection des données – RGPD
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#082a43]">
                Vivier de candidats
              </h2>
              {application.talent_pool_consent_at ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Accord enregistré le {formatDate(application.talent_pool_consent_at)}.
                    Le profil peut être pris en compte pour de futures opportunités.
                  </p>
                  <form action={withdrawTalentPoolConsent} className="mt-5 space-y-3">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input name="confirmWithdrawal" type="checkbox" value="yes" required className="mt-1" />
                      Je confirme que le candidat a demandé le retrait de son accord
                      pour les opportunités futures.
                    </label>
                    <button
                      type="submit"
                      className="rounded-full border border-amber-500 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100"
                    >
                      Retirer du vivier
                    </button>
                  </form>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Cette action n’efface ni la candidature actuelle, ni le CV, ni les notes de suivi.
                  </p>
                </>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
                  Aucun accord actif pour le vivier de candidats.
                  Le profil ne doit pas être utilisé pour de nouvelles opportunités.
                </p>
              )}
            </section>
            <section className="rounded-[2rem] border border-red-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">
                Protection des données – Suppression
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#082a43]">
                Supprimer la candidature et le CV
              </h2>
              {hasPresentations ? (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Suppression automatique indisponible : ce médecin a été associé à
                  au moins un établissement. Examinez le dossier et les obligations
                  de conservation avant de traiter sa demande RGPD.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Cette opération supprime définitivement la candidature, ses
                    notes de suivi internes et son CV privé. Elle est irréversible.
                    Réservée aux demandes vérifiées et aux données pouvant être effacées.
                  </p>
                  <form action={deleteApplicationAndCv} className="mt-5 space-y-4">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <label className="block text-sm font-bold text-slate-800">
                      Pour confirmer, saisir SUPPRIMER
                      <input name="confirmation" required pattern="SUPPRIMER"
                        autoComplete="off" placeholder="SUPPRIMER"
                        className="mt-2 w-full rounded-xl border border-red-300 px-3 py-2.5 font-normal" />
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input type="checkbox" name="verifiedRequest" value="yes" required className="mt-1" />
                      J’ai vérifié la demande et l’absence d’obligation de conservation.
                    </label>
                    <button type="submit"
                      className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white hover:bg-red-800"
                      style={{ color: "#ffffff" }}>
                      Supprimer définitivement le dossier et le CV
                    </button>
                  </form>
                </>
              )}
            </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="font-bold text-[#082a43]">
                Informations techniques
              </h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">
                    Consentement
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {formatDate(
                      application.consent_at,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">
                    Dernière modification
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {formatDate(
                      application.updated_at,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">
                    Référence
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                    {application.id}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
