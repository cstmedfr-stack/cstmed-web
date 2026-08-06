import Image from "next/image";
import Link from "next/link";

import { logoutAdmin } from "../actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ApplicationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "interview"
  | "accepted"
  | "rejected"
  | "archived";

type JobStatus =
  | "draft"
  | "published"
  | "rejected"
  | "archived";

type RecentApplication = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  status: ApplicationStatus;
  locale: "ro" | "fr";
  created_at: string;

  jobs:
    | {
        title: string;
      }
    | null;
};

type RecentJob = {
  id: string;
  title: string;
  specialty: string | null;
  location_label: string | null;
  status: JobStatus;
  created_at: string;
};

type ImportRun = {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  imported_count: number;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
};

const applicationStatusLabels: Record<
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

const applicationStatusClasses: Record<
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

const jobStatusLabels: Record<JobStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  rejected: "Refusée",
  archived: "Archivée",
};

const jobStatusClasses: Record<JobStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

const importStatusLabels: Record<string, string> = {
  running: "En cours",
  completed: "Terminée",
  failed: "Échec",
};

const importStatusClasses: Record<string, string> = {
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Non terminée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  /*
   * Verificăm mai întâi că utilizatorul conectat
   * este administrator.
   */
  await requireAdmin();

  /*
   * Clientul secret este folosit numai după verificarea
   * administratorului și numai în această componentă server.
   */
  const supabase = createAdminClient();

  const [
    totalJobsResult,
    draftJobsResult,
    publishedJobsResult,
    totalApplicationsResult,
    newApplicationsResult,
    reviewingApplicationsResult,
    publishedTranslationsResult,
    recentApplicationsResult,
    recentJobsResult,
    recentImportsResult,
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "draft"),

    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),

    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "new"),

    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "reviewing"),

    supabase
      .from("job_translations")
      .select("job_id", {
        count: "exact",
        head: true,
      })
      .eq("locale", "ro")
      .eq("status", "published"),

    supabase
      .from("applications")
      .select(
        `
          id,
          first_name,
          last_name,
          specialty,
          status,
          locale,
          created_at,
          jobs (
            title
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from("jobs")
      .select(
        `
          id,
          title,
          specialty,
          location_label,
          status,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from("import_runs")
      .select(
        `
          id,
          status,
          started_at,
          completed_at,
          imported_count,
          duplicate_count,
          error_count,
          error_message
        `,
      )
      .order("started_at", {
        ascending: false,
      })
      .limit(1),
  ]);

  const databaseError =
    totalJobsResult.error?.message ??
    draftJobsResult.error?.message ??
    publishedJobsResult.error?.message ??
    totalApplicationsResult.error?.message ??
    newApplicationsResult.error?.message ??
    reviewingApplicationsResult.error?.message ??
    publishedTranslationsResult.error?.message ??
    recentApplicationsResult.error?.message ??
    recentJobsResult.error?.message ??
    recentImportsResult.error?.message ??
    null;

  const totalJobs = totalJobsResult.count ?? 0;
  const draftJobs = draftJobsResult.count ?? 0;
  const publishedJobs =
    publishedJobsResult.count ?? 0;

  const totalApplications =
    totalApplicationsResult.count ?? 0;

  const newApplications =
    newApplicationsResult.count ?? 0;

  const reviewingApplications =
    reviewingApplicationsResult.count ?? 0;

  const publishedTranslations =
    publishedTranslationsResult.count ?? 0;

  const recentApplications =
    (recentApplicationsResult.data ??
      []) as unknown as RecentApplication[];

  const recentJobs =
    (recentJobsResult.data ??
      []) as RecentJob[];

  const latestImport =
    (recentImportsResult.data?.[0] ??
      null) as ImportRun | null;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/ro">
            <Image
              src="/images/cstmed-logo.jpg"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ro"
              target="_blank"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Site RO ↗
            </Link>

            <Link
              href="/fr"
              target="_blank"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Site FR ↗
            </Link>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Tableau de bord
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Consultez les offres, les candidatures,
            les traductions et les dernières
            importations depuis un seul espace.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {databaseError ? (
            <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-bold">
                Une partie du tableau de bord n’a pas
                pu être chargée.
              </p>

              <p className="mt-2">{databaseError}</p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/admin/offres"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-500">
                Toutes les offres
              </p>

              <p className="mt-3 text-4xl font-bold text-[#082a43]">
                {totalJobs}
              </p>

              <div className="mt-4 flex gap-4 text-xs font-semibold">
                <span className="text-amber-700">
                  {draftJobs} brouillons
                </span>

                <span className="text-emerald-700">
                  {publishedJobs} publiées
                </span>
              </div>
            </Link>

            <Link
              href="/admin/candidatures"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-500">
                Candidatures
              </p>

              <p className="mt-3 text-4xl font-bold text-[#082a43]">
                {totalApplications}
              </p>

              <div className="mt-4 flex gap-4 text-xs font-semibold">
                <span className="text-blue-700">
                  {newApplications} nouvelles
                </span>

                <span className="text-amber-700">
                  {reviewingApplications} à étudier
                </span>
              </div>
            </Link>

            <Link
              href="/admin/offres?status=published"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-500">
                Offres publiées
              </p>

              <p className="mt-3 text-4xl font-bold text-[#118c87]">
                {publishedJobs}
              </p>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Visibles sur la version française
              </p>
            </Link>

            <Link
              href="/ro/offres"
              target="_blank"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-500">
                Traductions roumaines
              </p>

              <p className="mt-3 text-4xl font-bold text-[#118c87]">
                {publishedTranslations}
              </p>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Traductions actuellement publiées
              </p>
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Link
              href="/admin/offres"
              className="rounded-3xl bg-[#082a43] p-6 text-white shadow-lg transition hover:-translate-y-1"
            >
              <span className="text-2xl">📋</span>

              <h2 className="mt-4 font-bold">
                Gérer les offres
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Vérifier, modifier et publier.
              </p>
            </Link>

            <Link
              href="/admin/candidatures"
              className="rounded-3xl bg-[#118c87] p-6 text-white shadow-lg transition hover:-translate-y-1"
            >
              <span className="text-2xl">👩‍⚕️</span>

              <h2 className="mt-4 font-bold">
                Candidatures
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/80">
                Consulter les profils et les CV.
              </p>
            </Link>

            <Link
              href="/admin/import"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-2xl">⬇️</span>

              <h2 className="mt-4 font-bold text-[#082a43]">
                Import France Travail
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Importer de nouvelles offres.
              </p>
            </Link>

            <Link
              href="/admin/mots-cles"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-2xl">🔎</span>

              <h2 className="mt-4 font-bold text-[#082a43]">
                Mots-clés
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Configurer les spécialités.
              </p>
            </Link>

            <Link
              href="/ro/offres"
              target="_blank"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-2xl">🇷🇴</span>

              <h2 className="mt-4 font-bold text-[#082a43]">
                Offres roumaines
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Vérifier la version publique RO.
              </p>
            </Link>

            <Link
              href="/fr/offres"
              target="_blank"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-2xl">🇫🇷</span>

              <h2 className="mt-4 font-bold text-[#082a43]">
                Offres françaises
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Vérifier la liste complète.
              </p>
            </Link>
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-2">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#118c87]">
                    Candidatures
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#082a43]">
                    Derniers profils reçus
                  </h2>
                </div>

                <Link
                  href="/admin/candidatures"
                  className="text-sm font-bold text-[#118c87]"
                >
                  Tout voir →
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aucune candidature reçue.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map(
                    (application) => (
                      <Link
                        key={application.id}
                        href={`/admin/candidatures/${application.id}`}
                        className="block px-6 py-5 transition hover:bg-[#f8fbfc] sm:px-8"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  applicationStatusClasses[
                                    application.status
                                  ]
                                }`}
                              >
                                {
                                  applicationStatusLabels[
                                    application.status
                                  ]
                                }
                              </span>

                              <span className="text-xs font-bold uppercase text-slate-400">
                                {application.locale}
                              </span>
                            </div>

                            <h3 className="mt-3 font-bold text-[#082a43]">
                              {application.first_name}{" "}
                              {application.last_name}
                            </h3>

                            <p className="mt-1 text-sm text-[#118c87]">
                              {application.specialty}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                              {application.jobs?.title ??
                                "Candidature spontanée"}
                            </p>
                          </div>

                          <span className="text-xs text-slate-400">
                            {formatDate(
                              application.created_at,
                            )}
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#118c87]">
                    Offres
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#082a43]">
                    Dernières offres importées
                  </h2>
                </div>

                <Link
                  href="/admin/offres"
                  className="text-sm font-bold text-[#118c87]"
                >
                  Tout voir →
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aucune offre importée.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/admin/offres/${job.id}`}
                      className="block px-6 py-5 transition hover:bg-[#f8fbfc] sm:px-8"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              jobStatusClasses[
                                job.status
                              ]
                            }`}
                          >
                            {
                              jobStatusLabels[
                                job.status
                              ]
                            }
                          </span>

                          <h3 className="mt-3 font-bold text-[#082a43]">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-sm text-[#118c87]">
                            {job.specialty ??
                              "Spécialité non précisée"}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {job.location_label ??
                              "Localisation non précisée"}
                          </p>
                        </div>

                        <span className="text-xs text-slate-400">
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#118c87]">
                  France Travail
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#082a43]">
                  Dernière importation
                </h2>
              </div>

              <Link
                href="/admin/import"
                className="rounded-full bg-[#118c87] px-6 py-3 text-center text-sm font-bold text-white"
              >
                Lancer une importation
              </Link>
            </div>

            {!latestImport ? (
              <p className="mt-7 text-slate-500">
                Aucune importation enregistrée.
              </p>
            ) : (
              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Statut
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      importStatusClasses[
                        latestImport.status
                      ] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {importStatusLabels[
                      latestImport.status
                    ] ?? latestImport.status}
                  </span>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Nouvelles
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#118c87]">
                    {latestImport.imported_count}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Doublons
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {latestImport.duplicate_count}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Erreurs
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {latestImport.error_count}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Date
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#082a43]">
                    {formatDate(
                      latestImport.completed_at ??
                        latestImport.started_at,
                    )}
                  </p>
                </div>
              </div>
            )}

            {latestImport?.error_message ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {latestImport.error_message}
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}