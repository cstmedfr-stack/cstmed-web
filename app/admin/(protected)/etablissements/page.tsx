import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdmin } from "../../actions";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const requestStatuses = [
  "new",
  "reviewing",
  "contacted",
  "proposal",
  "signed",
  "rejected",
  "archived",
] as const;

const urgencyLevels = [
  "normal",
  "urgent",
  "very_urgent",
] as const;

type RequestStatus = (typeof requestStatuses)[number];
type UrgencyLevel = (typeof urgencyLevels)[number];

type StatusFilter = RequestStatus | "all";
type UrgencyFilter = UrgencyLevel | "all";

type EstablishmentRequestsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    urgency?: string | string[];
    page?: string | string[];
  }>;
};

type EstablishmentRequest = {
  id: string;
  locale: "ro" | "fr";

  establishment_name: string;
  establishment_type: string | null;

  contact_name: string;
  contact_role: string | null;

  email: string;
  phone: string;

  city: string | null;
  department: string | null;

  specialty_needed: string;
  positions_count: number;

  contract_type: string | null;
  urgency: UrgencyLevel;

  status: RequestStatus;
  created_at: string;
};

const statusLabels: Record<RequestStatus, string> = {
  new: "Nouvelle",
  reviewing: "À étudier",
  contacted: "Contactée",
  proposal: "Proposition",
  signed: "Signée",
  rejected: "Refusée",
  archived: "Archivée",
};

const statusClasses: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-800",
  contacted: "bg-cyan-100 text-cyan-800",
  proposal: "bg-violet-100 text-violet-800",
  signed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  normal: "Moyen terme",
  urgent: "Urgent",
  very_urgent: "Très urgent",
};

const urgencyClasses: Record<UrgencyLevel, string> = {
  normal: "bg-slate-100 text-slate-700",
  urgent: "bg-orange-100 text-orange-800",
  very_urgent: "bg-red-100 text-red-800",
};

const establishmentTypeLabels: Record<string, string> = {
  hospital: "Hôpital",
  clinic: "Clinique",
  health_center: "Centre de santé",
  ehpad: "EHPAD",
  medical_practice: "Cabinet médical",
  other: "Autre structure",
};

const contractTypeLabels: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  replacement: "Remplacement",
  liberal: "Libéral",
  mixed: "Mixte",
  other: "Autre",
};

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function isRequestStatus(value: string): value is RequestStatus {
  return requestStatuses.includes(value as RequestStatus);
}

function isUrgencyLevel(value: string): value is UrgencyLevel {
  return urgencyLevels.includes(value as UrgencyLevel);
}

function getPage(value: string) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
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

function createRequestsUrl(options: {
  q: string;
  status: StatusFilter;
  urgency: UrgencyFilter;
  page?: number;
}) {
  const parameters = new URLSearchParams();

  if (options.q) {
    parameters.set("q", options.q);
  }

  if (options.status !== "all") {
    parameters.set("status", options.status);
  }

  if (options.urgency !== "all") {
    parameters.set("urgency", options.urgency);
  }

  if (options.page && options.page > 1) {
    parameters.set("page", String(options.page));
  }

  const queryString = parameters.toString();

  return queryString
    ? `/admin/etablissements?${queryString}`
    : "/admin/etablissements";
}

export default async function EstablishmentRequestsPage({
  searchParams,
}: EstablishmentRequestsPageProps) {
  const parameters = await searchParams;

  const q = getParameter(parameters.q)
    .slice(0, 100)
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const requestedStatus = getParameter(parameters.status);

  const status: StatusFilter = isRequestStatus(requestedStatus)
    ? requestedStatus
    : "all";

  const requestedUrgency = getParameter(parameters.urgency);

  const urgency: UrgencyFilter = isUrgencyLevel(requestedUrgency)
    ? requestedUrgency
    : "all";

  const requestedPage = getPage(
    getParameter(parameters.page),
  );

  const from = (requestedPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin();

  async function countRequests(requestStatus?: RequestStatus) {
    let query = supabase
      .from("establishment_requests")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (requestStatus) {
      query = query.eq("status", requestStatus);
    }

    return query;
  }

  const [
    totalResult,
    newResult,
    reviewingResult,
    proposalResult,
    signedResult,
  ] = await Promise.all([
    countRequests(),
    countRequests("new"),
    countRequests("reviewing"),
    countRequests("proposal"),
    countRequests("signed"),
  ]);

  let requestsQuery = supabase
    .from("establishment_requests")
    .select(
      `
        id,
        locale,
        establishment_name,
        establishment_type,
        contact_name,
        contact_role,
        email,
        phone,
        city,
        department,
        specialty_needed,
        positions_count,
        contract_type,
        urgency,
        status,
        created_at
      `,
      {
        count: "exact",
      },
    );

  if (status !== "all") {
    requestsQuery = requestsQuery.eq("status", status);
  }

  if (urgency !== "all") {
    requestsQuery = requestsQuery.eq("urgency", urgency);
  }

  if (q) {
    const pattern = `%${q}%`;

    requestsQuery = requestsQuery.or(
      [
        `establishment_name.ilike.${pattern}`,
        `contact_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
        `specialty_needed.ilike.${pattern}`,
        `city.ilike.${pattern}`,
        `department.ilike.${pattern}`,
      ].join(","),
    );
  }

  const {
    data,
    count,
    error,
  } = await requestsQuery
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const requests = (data ?? []) as EstablishmentRequest[];
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
      createRequestsUrl({
        q,
        status,
        urgency,
        page: totalPages,
      }),
    );
  }

  const previousUrl = createRequestsUrl({
    q,
    status,
    urgency,
    page: requestedPage - 1,
  });

  const nextUrl = createRequestsUrl({
    q,
    status,
    urgency,
    page: requestedPage + 1,
  });

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
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
              className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b3a59]"
            >
             <span style={{ color: "#ffffff" }}>
  Tableau de bord
</span>
            </Link>

            <Link
              href="/admin/candidatures"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Candidatures
            </Link>

            <Link
              href="/admin/offres"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Offres
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

    <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Demandes des établissements
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Consultez les besoins de recrutement transmis par les
            hôpitaux, cliniques et centres médicaux.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Link
              href="/admin/etablissements"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-[#082a43]">
                {totalResult.count ?? 0}
              </p>
            </Link>

           <Link
  href="/admin/etablissements?status=new"
  className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
>
              <p className="text-sm font-semibold text-slate-500">
                Nouvelles
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {newResult.count ?? 0}
              </p>
            </Link>

            <Link
              href="/admin/etablissements?status=reviewing"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                À étudier
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {reviewingResult.count ?? 0}
              </p>
            </Link>

            <Link
              href="/admin/etablissements?status=proposal"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Propositions
              </p>

              <p className="mt-2 text-3xl font-bold text-violet-600">
                {proposalResult.count ?? 0}
              </p>
            </Link>

            <Link
              href="/admin/etablissements?status=signed"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                Signées
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {signedResult.count ?? 0}
              </p>
            </Link>
          </div>

          <form
            method="get"
            className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
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
                  placeholder="Établissement, contact, spécialité ou ville"
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
                  <option value="all">Tous les statuts</option>

                  {requestStatuses.map((statusOption) => (
                    <option
                      key={statusOption}
                      value={statusOption}
                    >
                      {statusLabels[statusOption]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="urgency"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Urgence
                </label>

                <select
                  id="urgency"
                  name="urgency"
                  defaultValue={urgency}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="all">Tous les niveaux</option>

                  {urgencyLevels.map((urgencyOption) => (
                    <option
                      key={urgencyOption}
                      value={urgencyOption}
                    >
                      {urgencyLabels[urgencyOption]}
                    </option>
                  ))}
                </select>
              </div>

              <button
  type="submit"
  className="rounded-full bg-[#118c87] px-7 py-3 font-black transition hover:bg-[#0c7773]"
>
  <span style={{ color: "#ffffff" }}>
    Filtrer
  </span>
</button>
            </div>

            {q || status !== "all" || urgency !== "all" ? (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <Link
                  href="/admin/etablissements"
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

          {!error && requests.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Aucune demande trouvée
              </h2>

              <p className="mt-3 text-slate-600">
                Aucune demande ne correspond aux critères sélectionnés.
              </p>
            </div>
          ) : null}

          {!error && requests.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {requests.map((request) => {
                  const location = [
                    request.city,
                    request.department,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                   <article
  key={request.id}
  className={`grid gap-5 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center ${
    request.status === "new"
      ? "border-l-4 border-l-blue-500 bg-blue-50/30"
      : request.urgency === "very_urgent"
        ? "border-l-4 border-l-red-500 bg-red-50/20"
        : request.urgency === "urgent"
          ? "border-l-4 border-l-orange-400"
          : ""
  }`}
>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              statusClasses[request.status]
                            }`}
                          >
                            {statusLabels[request.status]}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              urgencyClasses[request.urgency]
                            }`}
                          >
                            {urgencyLabels[request.urgency]}
                          </span>

                          <span className="text-xs font-bold uppercase text-slate-400">
                            {request.locale}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-[#082a43]">
                          {request.establishment_name}
                        </h2>

                        <p className="mt-2 font-semibold text-[#118c87]">
                          {request.specialty_needed} —{" "}
                          {request.positions_count} poste
                          {request.positions_count > 1 ? "s" : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span>
                            {request.establishment_type
                              ? establishmentTypeLabels[
                                  request.establishment_type
                                ] ?? request.establishment_type
                              : "Type non précisé"}
                          </span>

                          <span>{location || "Localisation non précisée"}</span>

                          {request.contract_type ? (
                            <span>
                              {contractTypeLabels[
                                request.contract_type
                              ] ?? request.contract_type}
                            </span>
                          ) : null}

                          <span>
                            Reçue le {formatDate(request.created_at)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
  <span className="font-semibold text-slate-700">
    👤 {request.contact_name}
    {request.contact_role
      ? ` — ${request.contact_role}`
      : ""}
  </span>

  <a
    href={`mailto:${request.email}`}
    className="font-semibold text-[#0c7773] hover:underline"
  >
    ✉️ {request.email}
  </a>

  <a
    href={`tel:${request.phone}`}
    className="font-semibold text-[#0c7773] hover:underline"
  >
    ☎️ {request.phone}
  </a>
</div>
                      </div>

                      <Link
  href={`/admin/etablissements/${request.id}`}
  className="rounded-full bg-[#118c87] px-6 py-3 text-center text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0c7773]"
>
  <span style={{ color: "#ffffff" }}>
    Consulter la demande →
  </span>
</Link>
                    </article>
                  );
                })}
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
                Page {requestedPage} sur {totalPages}
              </span>

              {requestedPage < totalPages ? (
                <Link
  href={nextUrl}
  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold"
>
  <span style={{ color: "#ffffff" }}>
    Page suivante →
  </span>
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