import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdmin } from "../../actions";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const applicationStatuses = [
  "new",
  "reviewing",
  "contacted",
  "interview",
  "accepted",
  "rejected",
  "archived",
] as const;

type ApplicationStatus =
  (typeof applicationStatuses)[number];

type StatusFilter =
  | ApplicationStatus
  | "all";

type ApplicationsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
};

type ApplicationRow = {
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
  status: ApplicationStatus;
  created_at: string;

  jobs:
    | {
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

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function isApplicationStatus(
  value: string,
): value is ApplicationStatus {
  return applicationStatuses.includes(
    value as ApplicationStatus,
  );
}

function getPage(value: string) {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return 1;
  }

  return parsedValue;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function createApplicationsUrl(options: {
  q: string;
  status: StatusFilter;
  page?: number;
}) {
  const parameters = new URLSearchParams();

  if (options.q) {
    parameters.set("q", options.q);
  }

  if (options.status !== "all") {
    parameters.set(
      "status",
      options.status,
    );
  }

  if (options.page && options.page > 1) {
    parameters.set(
      "page",
      String(options.page),
    );
  }

  const queryString = parameters.toString();

  return queryString
    ? `/admin/candidatures?${queryString}`
    : "/admin/candidatures";
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const parameters = await searchParams;

  const q = getParameter(parameters.q)
    .slice(0, 100)
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const requestedStatus = getParameter(
    parameters.status,
  );

  const status: StatusFilter =
    isApplicationStatus(requestedStatus)
      ? requestedStatus
      : "all";

  const requestedPage = getPage(
    getParameter(parameters.page),
  );

  const from =
    (requestedPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin();

  async function countApplications(
    applicationStatus?: ApplicationStatus,
  ) {
    let query = supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (applicationStatus) {
      query = query.eq(
        "status",
        applicationStatus,
      );
    }

    return query;
  }

  const [
    totalResult,
    newResult,
    reviewingResult,
    contactedResult,
    acceptedResult,
  ] = await Promise.all([
    countApplications(),
    countApplications("new"),
    countApplications("reviewing"),
    countApplications("contacted"),
    countApplications("accepted"),
  ]);

  let applicationsQuery = supabase
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
        status,
        created_at,
        jobs (
          title,
          location_label,
          city
        )
      `,
      {
        count: "exact",
      },
    );

  if (status !== "all") {
    applicationsQuery =
      applicationsQuery.eq(
        "status",
        status,
      );
  }

  if (q) {
    const pattern = `%${q}%`;

    applicationsQuery =
      applicationsQuery.or(
        [
          `first_name.ilike.${pattern}`,
          `last_name.ilike.${pattern}`,
          `email.ilike.${pattern}`,
          `phone.ilike.${pattern}`,
          `specialty.ilike.${pattern}`,
          `city.ilike.${pattern}`,
        ].join(","),
      );
  }

  const {
    data,
    count,
    error,
  } = await applicationsQuery
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const applications =
    (data ?? []) as unknown as ApplicationRow[];

  const totalFiltered = count ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalFiltered / PAGE_SIZE),
  );

  if (
    totalFiltered > 0 &&
    requestedPage > totalPages
  ) {
    redirect(
      createApplicationsUrl({
        q,
        status,
        page: totalPages,
      }),
    );
  }

  const totalApplications =
    totalResult.count ?? 0;

  const newApplications =
    newResult.count ?? 0;

  const reviewingApplications =
    reviewingResult.count ?? 0;

  const contactedApplications =
    contactedResult.count ?? 0;

  const acceptedApplications =
    acceptedResult.count ?? 0;

  const previousUrl =
    createApplicationsUrl({
      q,
      status,
      page: requestedPage - 1,
    });

  const nextUrl =
    createApplicationsUrl({
      q,
      status,
      page: requestedPage + 1,
    });

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a59]"
            >
              Tableau de bord
            </Link>
            <Link
              href="/admin/offres"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Offres
            </Link>

            <Link
              href="/admin/import"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Import
            </Link>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
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
            Candidatures médicales
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Consultez les profils reçus, téléchargez
            les CV et suivez l’avancement de chaque
            candidature.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Link
              href="/admin/candidatures"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-[#082a43]">
                {totalApplications}
              </p>
            </Link>

            <Link
              href="/admin/candidatures?status=new"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Nouvelles
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {newApplications}
              </p>
            </Link>

            <Link
              href="/admin/candidatures?status=reviewing"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                À étudier
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {reviewingApplications}
              </p>
            </Link>

            <Link
              href="/admin/candidatures?status=contacted"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Contactées
              </p>

              <p className="mt-2 text-3xl font-bold text-cyan-600">
                {contactedApplications}
              </p>
            </Link>

            <Link
              href="/admin/candidatures?status=accepted"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Acceptées
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {acceptedApplications}
              </p>
            </Link>
          </div>

          <form
            method="get"
            className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_240px_auto] lg:items-end">
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
                  placeholder="Nom, e-mail, téléphone ou spécialité"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
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
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="all">
                    Tous les statuts
                  </option>

                  {applicationStatuses.map(
                    (statusOption) => (
                      <option
                        key={statusOption}
                        value={statusOption}
                      >
                        {statusLabels[statusOption]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white hover:bg-[#0c7773]"
              >
                Filtrer
              </button>
            </div>

            {(q || status !== "all") ? (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <Link
                  href="/admin/candidatures"
                  className="text-sm font-bold text-[#118c87]"
                >
                  Effacer les filtres
                </Link>
              </div>
            ) : null}
          </form>

          {error ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error.message}
            </div>
          ) : null}

          {!error && applications.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Aucune candidature trouvée
              </h2>

              <p className="mt-3 text-slate-600">
                Aucune candidature ne correspond aux
                critères sélectionnés.
              </p>
            </div>
          ) : null}

          {!error && applications.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {applications.map(
                  (application) => {
                    const jobLocation =
                      application.jobs?.location_label ||
                      application.jobs?.city;

                    return (
                      <article
                        key={application.id}
                        className="grid gap-5 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                statusClasses[
                                  application.status
                                ]
                              }`}
                            >
                              {
                                statusLabels[
                                  application.status
                                ]
                              }
                            </span>

                            <span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-xs font-bold text-[#0c7773]">
                              {application.specialty}
                            </span>

                            <span className="text-xs font-bold uppercase text-slate-400">
                              {application.locale}
                            </span>
                          </div>

                          <h2 className="mt-3 text-xl font-bold text-[#082a43]">
                            {application.first_name}{" "}
                            {application.last_name}
                          </h2>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                            <span>
                              {application.email}
                            </span>

                            <span>
                              {application.phone}
                            </span>

                            <span>
                              {application.city ||
                                application.country ||
                                "Localisation non précisée"}
                            </span>

                            <span>
                              Reçue le{" "}
                              {formatDate(
                                application.created_at,
                              )}
                            </span>
                          </div>

                          {application.jobs ? (
                            <div className="mt-4 rounded-2xl bg-[#f5f9fb] px-4 py-3 text-sm">
                              <strong>
                                Offre :
                              </strong>{" "}
                              {application.jobs.title}

                              {jobLocation
                                ? ` — ${jobLocation}`
                                : ""}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm font-semibold text-[#118c87]">
                              Candidature spontanée
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/admin/candidatures/${application.id}`}
                          className="rounded-full bg-[#118c87] px-6 py-3 text-center text-sm font-bold text-white hover:bg-[#0c7773]"
                        >
                          Consulter le profil
                        </Link>
                      </article>
                    );
                  },
                )}
              </div>
            </div>
          ) : null}

          {!error && totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm">
              {requestedPage > 1 ? (
                <Link
                  href={previousUrl}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold"
                >
                  ← Page précédente
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm font-semibold text-slate-600">
                Page {requestedPage} sur{" "}
                {totalPages}
              </span>

              {requestedPage < totalPages ? (
                <Link
                  href={nextUrl}
                  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Page suivante →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}