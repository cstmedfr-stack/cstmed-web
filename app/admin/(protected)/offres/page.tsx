import Image from "next/image";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

import { JobStatusActions } from "./job-status-actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type JobStatus =
  | "draft"
  | "published"
  | "rejected"
  | "archived";

type StatusFilter =
  | JobStatus
  | "all";

type SearchParameters = {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type AdminOffersPageProps = {
  searchParams: Promise<SearchParameters>;
};

type Job = {
  id: string;
  source_job_id: string;
  title: string;
  specialty: string | null;
  company_name: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  status: JobStatus;
  france_travail_published_at: string | null;
  created_at: string;
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

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function getPositiveInteger(
  value: string,
  fallback = 1,
) {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function cleanSearchValue(
  value: string,
) {
  return value
    .slice(0, 120)
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Date non précisée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function createAdminOffersUrl(options: {
  status: StatusFilter;
  q?: string;
  page?: number;
}) {
  const parameters =
    new URLSearchParams();

  if (options.status !== "draft") {
    parameters.set(
      "status",
      options.status,
    );
  }

  if (options.q) {
    parameters.set("q", options.q);
  }

  if (
    options.page &&
    options.page > 1
  ) {
    parameters.set(
      "page",
      String(options.page),
    );
  }

  const query =
    parameters.toString();

  return query
    ? `/admin/offres?${query}`
    : "/admin/offres";
}

export default async function AdminOffersPage({
  searchParams,
}: AdminOffersPageProps) {
  await requireAdmin();

  const parameters =
    await searchParams;

  const requestedStatus =
    getParameter(
      parameters.status,
    );

  const allowedStatuses: StatusFilter[] = [
    "all",
    "draft",
    "published",
    "rejected",
    "archived",
  ];

  const status: StatusFilter =
    allowedStatuses.includes(
      requestedStatus as StatusFilter,
    )
      ? (requestedStatus as StatusFilter)
      : "draft";

  const q = cleanSearchValue(
    getParameter(parameters.q),
  );

  const currentPage =
    getPositiveInteger(
      getParameter(parameters.page),
    );

  const from =
    (currentPage - 1) *
    PAGE_SIZE;

  const to =
    from + PAGE_SIZE - 1;

  const supabase =
    createAdminClient();

  const [
    totalResult,
    draftResult,
    publishedResult,
    rejectedResult,
    archivedResult,
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
      .eq(
        "status",
        "published",
      ),

    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "rejected",
      ),

    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "archived",
      ),
  ]);

  let jobsQuery = supabase
    .from("jobs")
    .select(
      `
        id,
        source_job_id,
        title,
        specialty,
        company_name,
        location_label,
        city,
        postal_code,
        contract_type,
        status,
        france_travail_published_at,
        created_at
      `,
      {
        count: "exact",
      },
    );

  if (status !== "all") {
    jobsQuery =
      jobsQuery.eq(
        "status",
        status,
      );
  }

  if (q) {
    const searchPattern =
      `%${q}%`;

    jobsQuery = jobsQuery.or(
      [
        `title.ilike.${searchPattern}`,
        `specialty.ilike.${searchPattern}`,
        `company_name.ilike.${searchPattern}`,
        `location_label.ilike.${searchPattern}`,
        `city.ilike.${searchPattern}`,
        `source_job_id.ilike.${searchPattern}`,
      ].join(","),
    );
  }

  const {
    data,
    count,
    error,
  } = await jobsQuery
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const jobs =
    (data ?? []) as Job[];

  const totalJobs =
    count ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalJobs / PAGE_SIZE,
      ),
    );

  const counts = {
    all: totalResult.count ?? 0,
    draft: draftResult.count ?? 0,
    published:
      publishedResult.count ?? 0,
    rejected:
      rejectedResult.count ?? 0,
    archived:
      archivedResult.count ?? 0,
  };

  const statusTabs: Array<{
    value: StatusFilter;
    label: string;
    count: number;
  }> = [
    {
      value: "draft",
      label: "Brouillons",
      count: counts.draft,
    },
    {
      value: "published",
      label: "Publiées",
      count: counts.published,
    },
    {
      value: "rejected",
      label: "Refusées",
      count: counts.rejected,
    },
    {
      value: "archived",
      label: "Archivées",
      count: counts.archived,
    },
    {
      value: "all",
      label: "Toutes",
      count: counts.all,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      {/* HEADER ADMIN */}
     <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-bold"
            >
              <span
                style={{
                  color: "#ffffff",
                }}
              >
                Tableau de bord
              </span>
            </Link>

            <Link
              href="/admin/import"
              className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-bold"
            >
              <span
                style={{
                  color: "#ffffff",
                }}
              >
                Import France Travail
              </span>
            </Link>

            <Link
              href="/admin/candidatures"
              className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-bold"
            >
              <span
                style={{
                  color: "#ffffff",
                }}
              >
                Candidatures
              </span>
            </Link>

            <Link
              href="/fr/offres"
              target="_blank"
              className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-bold text-[#082a43]"
            >
              Voir le site public ↗
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Gestion des offres
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-200">
            Vérifiez les offres importées depuis France Travail,
            modifiez-les puis publiez uniquement les opportunités
            sélectionnées par CSTMed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              {counts.draft} brouillons
            </span>

            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              {counts.published} publiées
            </span>

            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              {counts.all} offres au total
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {/* FILTRE STATUT */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map(
              (tab) => {
                const active =
                  tab.value ===
                  status;

                return (
                  <Link
                    key={
                      tab.value
                    }
                    href={createAdminOffersUrl({
                      status:
                        tab.value,
                      q,
                    })}
                    className={
                      active
                        ? "rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-black shadow-sm"
                        : "rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    }
                  >
                    <span
                      style={{
                        color:
                          active
                            ? "#ffffff"
                            : undefined,
                      }}
                    >
                      {tab.label}{" "}
                      ({tab.count})
                    </span>
                  </Link>
                );
              },
            )}
          </div>

          {/* RECHERCHE */}
          <form
            method="get"
            className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <input
              type="hidden"
              name="status"
              value={status}
            />

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Rechercher par titre, spécialité, ville, établissement ou référence France Travail..."
                className="min-h-[48px] flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
              />

              <button
                type="submit"
                className="min-h-[48px] rounded-full bg-[#118c87] px-7 py-3 font-black"
              >
                <span
                  style={{
                    color: "#ffffff",
                  }}
                >
                  Rechercher
                </span>
              </button>

              {q ? (
                <Link
                  href={createAdminOffersUrl({
                    status,
                  })}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700"
                >
                  Effacer
                </Link>
              ) : null}
            </div>
          </form>

          {/* TITRE LISTE */}
          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#118c87]">
                Offres à gérer
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#082a43]">
                {totalJobs} offre
                {totalJobs > 1
                  ? "s"
                  : ""}
              </h2>
            </div>

            {totalJobs > 0 ? (
              <p className="text-sm font-semibold text-slate-500">
                Page {currentPage} sur{" "}
                {totalPages}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-7 text-red-700">
              <p className="font-black">
                Les offres ne peuvent pas être chargées.
              </p>

              <p className="mt-2">
                {error.message}
              </p>
            </div>
          ) : null}

          {!error &&
          jobs.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-3xl">
                ✓
              </p>

              <h2 className="mt-4 text-2xl font-black text-[#082a43]">
                Aucune offre dans cette catégorie
              </h2>
            </div>
          ) : null}

          {/* LISTA BROUILLONS / OFFRES */}
          {!error &&
          jobs.length > 0 ? (
            <div className="mt-7 space-y-4">
              {jobs.map((job) => {
                const location =
                  job.location_label ||
                  [
                    job.postal_code,
                    job.city,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "France";

                return (
                  <article
  key={job.id}
  className={`rounded-[1.75rem] border bg-white p-6 shadow-sm transition hover:shadow-lg ${
    job.status === "draft"
      ? "border-amber-200 border-l-4 border-l-amber-400"
      : "border-slate-200"
  }`}
>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${
                              statusClasses[
                                job.status
                              ]
                            }`}
                          >
                            {
                              statusLabels[
                                job.status
                              ]
                            }
                          </span>

                          {job.specialty ? (
                            <span className="rounded-full bg-[#e5f7f5] px-3 py-1.5 text-xs font-bold text-[#0c7773]">
                              {
                                job.specialty
                              }
                            </span>
                          ) : null}

                          {job.contract_type ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                              {
                                job.contract_type
                              }
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-xl font-black leading-snug text-[#082a43] sm:text-2xl">
                          {job.title}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          <span>
                            📍 {location}
                          </span>

                          {job.company_name ? (
                            <span>
                              🏥{" "}
                              {
                                job.company_name
                              }
                            </span>
                          ) : null}

                          <span>
                            Réf.{" "}
                            {
                              job.source_job_id
                            }
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Importée le{" "}
                          {formatDate(
                            job.created_at,
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 lg:max-w-[390px]">
                        <JobStatusActions
                          jobId={
                            job.id
                          }
                          status={
                            job.status
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {/* PAGINATION */}
          {!error &&
          totalPages > 1 ? (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:flex-row">
              <div>
                {currentPage >
                1 ? (
                  <Link
                    href={createAdminOffersUrl({
                      status,
                      q,
                      page:
                        currentPage -
                        1,
                    })}
                    className="inline-flex rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
                  >
                    ← Précédente
                  </Link>
                ) : null}
              </div>

              <p className="text-sm font-bold text-slate-500">
                Page {currentPage} /{" "}
                {totalPages}
              </p>

              <div>
                {currentPage <
                totalPages ? (
                  <Link
                    href={createAdminOffersUrl({
                      status,
                      q,
                      page:
                        currentPage +
                        1,
                    })}
                    className="inline-flex rounded-full bg-[#082a43] px-5 py-2.5 font-bold"
                  >
                    <span
                      style={{
                        color:
                          "#ffffff",
                      }}
                    >
                      Suivante →
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}