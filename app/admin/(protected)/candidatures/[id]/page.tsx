import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

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

  const location = [
    application.city,
    application.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href="/">
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

      <section className="bg-[#082a43] px-5 py-12 text-white sm:px-8">
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
                    className="mt-5 inline-flex text-sm font-bold text-[#118c87]"
                  >
                    Consulter l’offre →
                  </Link>
                </div>
              ) : (
                <p className="mt-5 font-semibold text-[#118c87]">
                  Candidature spontanée
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
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
                  className="w-full rounded-full bg-[#118c87] px-6 py-3 font-bold text-white hover:bg-[#0c7773]"
                >
                  Télécharger le CV
                </button>
              </form>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Le lien de téléchargement est temporaire
                et réservé à l’administrateur connecté.
              </p>
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