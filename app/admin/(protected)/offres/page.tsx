import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdmin } from "../../actions";
import { createClient } from "@/lib/supabase/server";
import { JobStatusActions } from "./job-status-actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const jobStatuses = [
  "draft",
  "published",
  "rejected",
  "archived",
] as const;

type JobStatus = (typeof jobStatuses)[number];
type StatusFilter = JobStatus | "all";
type SortOrder = "newest" | "oldest";

type SearchParameters = {
  q?: string | string[];
  status?: string | string[];
  specialty?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type AdminJobsPageProps = {
  searchParams: Promise<SearchParameters>;
};

type Job = {
  id: string;
  source_job_id: string;
  title: string;
  specialty: string | null;
  status: JobStatus;
  location_label: string | null;
  city: string | null;
  contract_type: string | null;
  france_travail_published_at: string | null;
  created_at: string;
};

type ImportKeyword = {
  id: number;
  keyword: string;
  enabled: boolean;
};

const statusLabels: Record<JobStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  rejected: "Refusée",
  archived: "Archivée",
};

const statusClasses: Record<JobStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

function getParameter(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function isJobStatus(value: string): value is JobStatus {
  return jobStatuses.includes(value as JobStatus);
}

function getPositiveInteger(value: string, fallback = 1) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    return fallback;
  }

  return numberValue;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date non précisée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function createJobsUrl(options: {
  page?: number;
  q: string;
  status: StatusFilter;
  specialty: string;
  sort: SortOrder;
}) {
  const parameters = new URLSearchParams();

  if (options.q) {
    parameters.set("q", options.q);
  }

  if (options.status !== "all") {
    parameters.set("status", options.status);
  }

  if (options.specialty) {
    parameters.set("specialty", options.specialty);
  }

  if (options.sort !== "newest") {
    parameters.set("sort", options.sort);
  }

  if (options.page && options.page > 1) {
    parameters.set("page", String(options.page));
  }

  const queryString = parameters.toString();

  return queryString
    ? `/admin/offres?${queryString}`
    : "/admin/offres";
}

export default async function AdminJobsPage({
  searchParams,
}: AdminJobsPageProps) {
  const parameters = await searchParams;

  const q = getParameter(parameters.q).slice(0, 100);

  const requestedStatus = getParameter(parameters.status);

  const status: StatusFilter = isJobStatus(requestedStatus)
    ? requestedStatus
    : "all";

  const specialty = getParameter(parameters.specialty).slice(
    0,
    150,
  );

  const sort: SortOrder =
    getParameter(parameters.sort) === "oldest"
      ? "oldest"
      : "newest";

  const requestedPage = getPositiveInteger(
    getParameter(parameters.page),
  );

  const from = (requestedPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  async function countJobs(jobStatus?: JobStatus) {
    let countQuery = supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (jobStatus) {
      countQuery = countQuery.eq("status", jobStatus);
    }

    return countQuery;
  }

  const [
    totalResult,
    draftResult,
    publishedResult,
    rejectedResult,
    archivedResult,
    keywordsResult,
  ] = await Promise.all([
    countJobs(),
    countJobs("draft"),
    countJobs("published"),
    countJobs("rejected"),
    countJobs("archived"),
    supabase
      .from("import_keywords")
      .select("id, keyword, enabled")
      .order("keyword", {
        ascending: true,
      }),
  ]);

  let jobsQuery = supabase
    .from("jobs")
    .select(
      `
        id,
        source_job_id,
        title,
        specialty,
        status,
        location_label,
        city,
        contract_type,
        france_travail_published_at,
        created_at
      `,
      {
        count: "exact",
      },
    );

  if (status !== "all") {
    jobsQuery = jobsQuery.eq("status", status);
  }

  if (specialty) {
    jobsQuery = jobsQuery.eq("specialty", specialty);
  }

  /*
   * Eliminăm caracterele care ar putea modifica sintaxa
   * filtrului PostgREST.
   */
  const safeSearch = q
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (safeSearch) {
    const pattern = `%${safeSearch}%`;

    jobsQuery = jobsQuery.or(
      [
        `title.ilike.${pattern}`,
        `specialty.ilike.${pattern}`,
        `location_label.ilike.${pattern}`,
        `city.ilike.${pattern}`,
        `source_job_id.ilike.${pattern}`,
      ].join(","),
    );
  }

  const {
    data: jobsData,
    count: filteredCount,
    error: jobsError,
  } = await jobsQuery
    .order("created_at", {
      ascending: sort === "oldest",
    })
    .range(from, to);

  const totalFilteredJobs = filteredCount ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredJobs / PAGE_SIZE),
  );

  if (
    totalFilteredJobs > 0 &&
    requestedPage > totalPages
  ) {
    redirect(
      createJobsUrl({
        page: totalPages,
        q,
        status,
        specialty,
        sort,
      }),
    );
  }

  const jobs = (jobsData ?? []) as Job[];

  const keywords =
    (keywordsResult.data ?? []) as ImportKeyword[];

  const databaseError =
    jobsError?.message ??
    totalResult.error?.message ??
    draftResult.error?.message ??
    publishedResult.error?.message ??
    rejectedResult.error?.message ??
    archivedResult.error?.message ??
    keywordsResult.error?.message ??
    null;

  const totalJobs = totalResult.count ?? 0;
  const draftJobs = draftResult.count ?? 0;
  const publishedJobs = publishedResult.count ?? 0;
  const rejectedJobs = rejectedResult.count ?? 0;
  const archivedJobs = archivedResult.count ?? 0;

  const firstDisplayed =
    totalFilteredJobs === 0 ? 0 : from + 1;

  const lastDisplayed = Math.min(
    from + jobs.length,
    totalFilteredJobs,
  );

  const previousUrl = createJobsUrl({
    page: requestedPage - 1,
    q,
    status,
    specialty,
    sort,
  });

  const nextUrl = createJobsUrl({
    page: requestedPage + 1,
    q,
    status,
    specialty,
    sort,
  });

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/">
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
              href="/admin/import"
              className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c7773]"
            >
              Import France Travail
            </Link>

            <Link
              href="/admin/mots-cles"
              className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-semibold text-[#118c87] transition hover:bg-[#e5f7f5]"
            >
              Mots-clés
            </Link>

            <Link
              href="/offres"
              target="_blank"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Site public ↗
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

      <section className="bg-[#082a43] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Gestion des offres
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Recherchez, filtrez, vérifiez et publiez les offres
            importées depuis France Travail.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Link
              href="/admin/offres"
              className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-500">
                Toutes
              </p>
              <p className="mt-2 text-3xl font-bold text-[#082a43]">
                {totalJobs}
              </p>
            </Link>

            <Link
              href="/admin/offres?status=draft"
              className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-500">
                Brouillons
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {draftJobs}
              </p>
            </Link>

            <Link
              href="/admin/offres?status=published"
              className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-500">
                Publiées
              </p>
              <p className="mt-2 text-3xl font-bold text-[#118c87]">
                {publishedJobs}
              </p>
            </Link>

            <Link
              href="/admin/offres?status=rejected"
              className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-500">
                Refusées
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {rejectedJobs}
              </p>
            </Link>

            <Link
              href="/admin/offres?status=archived"
              className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-500">
                Archivées
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-500">
                {archivedJobs}
              </p>
            </Link>
          </div>

          <form
            method="get"
            className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 lg:grid-cols-[1.4fr_190px_240px_180px_auto] lg:items-end">
              <div>
                <label
                  htmlFor="q"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Rechercher
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Titre, ville, spécialité ou référence"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Statut
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={status}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillons</option>
                  <option value="published">Publiées</option>
                  <option value="rejected">Refusées</option>
                  <option value="archived">Archivées</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Spécialité
                </label>

                <select
                  id="specialty"
                  name="specialty"
                  defaultValue={specialty}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="">
                    Toutes les spécialités
                  </option>

                  {keywords.map((keyword) => (
                    <option
                      key={keyword.id}
                      value={keyword.keyword}
                    >
                      {keyword.keyword}
                      {keyword.enabled ? "" : " — désactivé"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Classement
                </label>

                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="newest">
                    Plus récentes
                  </option>
                  <option value="oldest">
                    Plus anciennes
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white transition hover:bg-[#0c7773]"
              >
                Filtrer
              </button>
            </div>

            {(q ||
              status !== "all" ||
              specialty ||
              sort !== "newest") && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <Link
                  href="/admin/offres"
                  className="text-sm font-bold text-[#118c87] hover:text-[#0c7773]"
                >
                  Effacer tous les filtres
                </Link>
              </div>
            )}
          </form>

          {databaseError ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-bold">
                Une erreur est survenue.
              </p>
              <p className="mt-2">{databaseError}</p>
            </div>
          ) : null}

          {!databaseError ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#082a43]">
                  {totalFilteredJobs} offre
                  {totalFilteredJobs > 1 ? "s" : ""}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Résultats {firstDisplayed}–{lastDisplayed} sur{" "}
                  {totalFilteredJobs}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                Page {requestedPage} sur {totalPages}
              </p>
            </div>
          ) : null}

          {!databaseError && jobs.length === 0 ? (
            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f7f5] text-2xl">
                🔎
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#082a43]">
                Aucune offre ne correspond aux filtres
              </h2>

              <p className="mt-3 text-slate-600">
                Modifiez votre recherche ou effacez les filtres.
              </p>

              <Link
                href="/admin/offres"
                className="mt-6 inline-flex rounded-full bg-[#118c87] px-6 py-3 font-bold text-white"
              >
                Voir toutes les offres
              </Link>
            </div>
          ) : null}

          {!databaseError && jobs.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="grid gap-5 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            statusClasses[job.status]
                          }`}
                        >
                          {statusLabels[job.status]}
                        </span>

                        {job.specialty ? (
                          <span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-xs font-bold text-[#0c7773]">
                            {job.specialty}
                          </span>
                        ) : null}

                        {job.contract_type ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {job.contract_type}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-[#082a43]">
                        {job.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span>
                          📍{" "}
                          {job.location_label ||
                            job.city ||
                            "Localisation non précisée"}
                        </span>

                        <span>
                          Importée le {formatDate(job.created_at)}
                        </span>

                        <span>
                          Réf. {job.source_job_id}
                        </span>
                      </div>
                    </div>

                    <JobStatusActions
                      jobId={job.id}
                      status={job.status}
                    />
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {!databaseError && totalPages > 1 ? (
            <nav
              aria-label="Pagination des offres"
              className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:flex-row"
            >
              {requestedPage > 1 ? (
                <Link
                  href={previousUrl}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← Page précédente
                </Link>
              ) : (
                <span className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-300">
                  ← Page précédente
                </span>
              )}

              <span className="text-sm font-semibold text-slate-600">
                Page {requestedPage} sur {totalPages}
              </span>

              {requestedPage < totalPages ? (
                <Link
                  href={nextUrl}
                  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c7773]"
                >
                  Page suivante →
                </Link>
              ) : (
                <span className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-300">
                  Page suivante →
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}