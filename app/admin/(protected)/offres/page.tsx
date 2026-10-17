import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobStatusActions } from "./job-status-actions";
import { OfferVerification } from "./offer-verification";
import { BulkOffersSelection, BulkOfferCheckbox } from "./bulk-offers-selections";

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
  category?: string | string[];
  page?: string | string[];
  specialty?: string | string[];
  department?: string | string[];
  city?: string | string[];
  contract?: string | string[];
  period?: string | string[];
  old?: string | string[];
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
  professional_category: string | null;
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
  category?: string;
  q?: string;
  page?: number;
  specialty?: string;
  department?: string;
  city?: string;
  contract?: string;
  period?: string;
  old?: string;
}) {
  const parameters =
    new URLSearchParams();
  if (options.status !== "draft") {
    parameters.set(
      "status",
      options.status,
    );
  }
  for (const key of ["category", "q", "specialty", "department", "city", "contract", "period", "old"] as const) {
    const value = options[key];
    if (value) parameters.set(key, value);
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
  const requestedCategory = getParameter(parameters.category);
  const category = ["all", "medecins", "dentistes", "pharmaciens", "infirmiers"].includes(requestedCategory)
    ? requestedCategory
    : "all";
  const q = cleanSearchValue(
    getParameter(parameters.q),
  );
  const specialty = cleanSearchValue(getParameter(parameters.specialty));
  const department = getParameter(parameters.department).replace(/[^0-9A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const city = cleanSearchValue(getParameter(parameters.city));
  const contract = cleanSearchValue(getParameter(parameters.contract));
  const rawPeriod = getParameter(parameters.period);
  const period = ["7", "30", "90"].includes(rawPeriod) ? rawPeriod : "";
  const old = getParameter(parameters.old) === "1" ? "1" : "";
  const activeFilters = { category, specialty, department, city, contract, period, old };
  const filterUrl = (page?: number, nextStatus: StatusFilter = status, nextQ = q) =>
    createAdminOffersUrl({ status: nextStatus, q: nextQ, page, ...activeFilters });
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
  // RPC Supabase : recherche insensible aux accents, filtres et pagination côté serveur.
  // Cette fonction SQL est limitée au rôle service_role, après requireAdmin().
  const { data, count, error } = await supabase
    .rpc("search_admin_jobs", {
      p_q: q,
      p_category: category,
      p_status: status,
      p_specialty: specialty,
      p_department: department,
      p_city: city,
      p_contract: contract,
      p_period: period ? Number(period) : null,
      p_old: old === "1",
    }, { count: "exact" })
    .select(
      "id,source_job_id,title,specialty,professional_category,company_name,location_label,city,postal_code,contract_type,status,france_travail_published_at,created_at",
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  const jobs =
    (data ?? []) as Job[];
  // Statut des contrôles uniquement pour les offres affichées sur cette page.
  // La pagination globale reste gérée par la recherche Supabase.
  const currentIds = jobs.map((job) => job.id);
  const service = createAdminClient();
  const [verificationResponse, reviewResponse] = currentIds.length
    ? await Promise.all([
        service.from("job_ft_verifications").select("job_id,state,checked_at").in("job_id", currentIds),
        service.from("job_admin_reviews").select("job_id,reviewed_at,content_signature").in("job_id", currentIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  const verifications = new Map((verificationResponse.data ?? []).map((row) => [row.job_id, row]));
  const reviews = new Map((reviewResponse.data ?? []).map((row) => [row.job_id, row]));
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const verifiedRecently = (id: string) => {
    const v = verifications.get(id);
    return Boolean(v && v.state === "active" && Date.parse(v.checked_at) >= cutoff);
  };
  // Le contrôle manuel est visible dans le détail de l'offre, avec empreinte.
  const pagePriority = [...jobs].sort((a, b) => {
    const score = (id: string) => verifiedRecently(id) ? 0 : verifications.get(id)?.state === "unavailable" ? 2 : 1;
    return score(a.id) - score(b.id);
  });
  const availableOnPage = currentIds.filter(verifiedRecently).length;
  const needsCheckOnPage = currentIds.filter((id) => !verifiedRecently(id) && verifications.get(id)?.state !== "unavailable").length;
  const unavailableOnPage = currentIds.filter((id) => verifications.get(id)?.state === "unavailable").length;
  const totalJobs =
    count ?? 0;
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalJobs / PAGE_SIZE,
      ),
    );
  // Dacă pagina solicitată depășește ultima pagină, revenim la ultima.
  if (!error && currentPage > totalPages) {
    redirect(filterUrl(totalPages));
  }
  // Primele 10 pagini sunt mereu accesibile; pentru paginile îndepărtate
  // afișăm și pagina curentă împreună cu cele vecine.
  const visiblePageNumbers = Array.from(
    new Set([
      ...Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1),
      ...(currentPage > 10
        ? [currentPage - 1, currentPage, currentPage + 1]
        : []),
      totalPages,
    ].filter((page) => page >= 1 && page <= totalPages)),
  ).sort((a, b) => a - b);
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
                    href={filterUrl(undefined, tab.value)}
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
            <div className="flex flex-col flex-wrap gap-3 md:flex-row">
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Rechercher par titre, spécialité, ville, établissement ou référence France Travail..."
                className="min-h-[48px] flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
              />
              <input type="hidden" name="old" value={old} />
              <div className="grid w-full gap-3 md:grid-cols-2 lg:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Catégorie professionnelle
                  <select name="category" defaultValue={category} className="rounded-xl border border-slate-300 bg-white p-3 font-normal">
                    <option value="all">Toutes les professions</option>
                    <option value="medecins">Médecins</option>
                    <option value="dentistes">Chirurgiens-dentistes</option>
                    <option value="pharmaciens">Pharmaciens</option>
                    <option value="infirmiers">Infirmiers / Infirmières</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Spécialité ou métier
                  <input name="specialty" defaultValue={specialty} placeholder="Ex. cardiologue" className="rounded-xl border border-slate-300 bg-white p-3 font-normal" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Département (code postal)
                  <input name="department" defaultValue={department} placeholder="Ex. 34" maxLength={3} className="rounded-xl border border-slate-300 bg-white p-3 font-normal" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Ville
                  <input name="city" defaultValue={city} placeholder="Ex. Montpellier" className="rounded-xl border border-slate-300 bg-white p-3 font-normal" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Contrat
                  <select name="contract" defaultValue={contract} className="rounded-xl border border-slate-300 bg-white p-3 font-normal">
                    <option value="">Tous les contrats</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Intérim">Intérim</option>
                    <option value="Libéral">Libéral</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-[#082a43]">
                  Date d'importation
                  <select name="period" defaultValue={period} className="rounded-xl border border-slate-300 bg-white p-3 font-normal">
                    <option value="">Toutes les dates</option>
                    <option value="7">7 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                    <option value="90">90 derniers jours</option>
                  </select>
                </label>
              </div>
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
              {(q || category !== "all" || specialty || department || city || contract || period || old) ? (
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
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="text-sm font-semibold text-amber-900">Vérification de validité : les offres importées depuis plus de 30 jours sont à contrôler, pas automatiquement expirées.</span>
            <Link href={createAdminOffersUrl({ status, q, ...activeFilters, old: old ? "" : "1", page: 1 })}
              className="rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100">
              {old ? "Afficher toutes les dates" : "Offres à vérifier (+30 jours)"}
            </Link>
          </div>
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
          {!error && jobs.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <p className="font-black text-[#082a43]">Priorités de contrôle — uniquement sur cette page ({jobs.length} offres)</p>
              <p className="mt-2">{availableOnPage} accessibles (contrôle FT &lt; 24 h) · {needsCheckOnPage} à vérifier · {unavailableOnPage} introuvables / à confirmer</p>
              <p className="mt-1 text-xs text-slate-500">Les offres restent paginées globalement par date. L’ordre ci-dessous est priorisé sur cette page seulement.</p>
            </div>
          ) : null}
          {!error && jobs.length > 0 ? (
            <OfferVerification
              offers={jobs.map((job) => ({
                id: job.id,
                title: job.title,
                reference: job.source_job_id,
                status: job.status,
              }))}
            />
          ) : null}

          {!error && jobs.length > 0 ? (
            <BulkOffersSelection ids={jobs.map((job) => job.id)}>
          {/* LISTA BROUILLONS / OFFRES */}
          {!error &&
          jobs.length > 0 ? (
            <div className="mt-7 space-y-4">
              {pagePriority.map((job) => {
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
                    <BulkOfferCheckbox id={job.id} />
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
                          {job.professional_category ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                      {({ medecins: "Médecins", dentistes: "Dentistes", pharmaciens: "Pharmaciens", infirmiers: "Infirmiers" } as Record<string, string>)[job.professional_category] ?? job.professional_category}
                    </span>
                  ) : null}
                          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${verifiedRecently(job.id) ? "bg-emerald-100 text-emerald-800" : verifications.get(job.id)?.state === "unavailable" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}>
                            {verifiedRecently(job.id) ? "FT accessible · 24 h" : verifications.get(job.id)?.state === "unavailable" ? "FT introuvable · à confirmer" : "Vérification nécessaire"}
                          </span>
                          {reviews.has(job.id) ? <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">Examen enregistré — validité à contrôler</span> : null}
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
            </BulkOffersSelection>
          ) : null}
          {/* PAGINATION */}
          {!error && totalPages > 1 ? (
            <nav
              aria-label="Pagination des offres"
              className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-center text-sm font-bold text-slate-600">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={filterUrl(currentPage - 1)}
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-[#082a43] hover:bg-slate-50"
                  >
                    ← Précédente
                  </Link>
                ) : null}
                {visiblePageNumbers.map((pageNumber, index) => (
                  <span key={pageNumber} className="inline-flex items-center gap-2">
                    {index > 0 && pageNumber > visiblePageNumbers[index - 1] + 1 ? (
                      <span className="px-1 text-slate-400" aria-hidden="true">…</span>
                    ) : null}
                    <Link
                      href={filterUrl(pageNumber)}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                      aria-label={`Aller à la page ${pageNumber}`}
                      style={pageNumber === currentPage ? { color: "#ffffff" } : undefined}
                      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-black transition ${
                        pageNumber === currentPage
                          ? "border-[#082a43] bg-[#082a43] text-white"
                          : "border-slate-200 bg-white text-[#082a43] hover:border-[#118c87] hover:bg-teal-50"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  </span>
                ))}
                {currentPage < totalPages ? (
                  <Link
                    href={filterUrl(currentPage + 1)}
                    style={{ color: "#ffffff" }}
                    className="rounded-full bg-[#082a43] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0b3a59]"
                  >
                    Suivante →
                  </Link>
                ) : null}
              </div>
              <form
                action="/admin/offres"
                method="get"
                className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-5"
              >
                <input type="hidden" name="status" value={status} />
                {q ? <input type="hidden" name="q" value={q} /> : null}
              {Object.entries(activeFilters).map(([key, value]) =>
                value ? <input key={key} type="hidden" name={key} value={value} /> : null
              )}
                <label htmlFor="target-offers-page" className="text-sm font-bold text-slate-700">
                  Aller à la page :
                </label>
                <input
                  id="target-offers-page"
                  type="number"
                  name="page"
                  min={1}
                  max={totalPages}
                  defaultValue={currentPage}
                  required
                  className="w-24 rounded-xl border border-slate-300 px-3 py-2.5 text-center text-sm font-bold text-[#082a43] focus:border-[#118c87] focus:outline-none"
                />
                <button
                  type="submit"
                  style={{ color: "#ffffff" }}
                  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-black text-white hover:bg-[#0d7773]"
                >
                  Aller →
                </button>
              </form>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
