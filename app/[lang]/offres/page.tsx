import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPublicJobs } from "@/lib/jobs/get-public-jobs";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type JobsPageProps = {
  params: Promise<{
    lang: string;
  }>;

  searchParams: Promise<{
    q?: string;
    specialty?: string;
    location?: string;
    contract?: string;
    sort?: string;
    page?: string;
  }>;
};

function clean(value: string | undefined, length = 100) {
  return (value ?? "")
    .slice(0, length)
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPage(value: string | undefined) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1;
}

function shorten(value: string | null) {
  if (!value) {
    return "";
  }

  const cleanValue = value.replace(/\s+/g, " ").trim();

  return cleanValue.length > 230
    ? `${cleanValue.slice(0, 230).trim()}…`
    : cleanValue;
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    locale === "ro" ? "ro-RO" : "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default async function JobsPage({
  params,
  searchParams,
}: JobsPageProps) {
  const { lang: requestedLang } = await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale = requestedLang;
  const dictionary = getDictionary(lang);
  const labels = dictionary.jobs;
  const query = await searchParams;

  const filters = {
    q: clean(query.q),
    specialty: clean(query.specialty, 150),
    location: clean(query.location, 120),
    contract: clean(query.contract, 100),

    sort:
      query.sort === "oldest"
        ? ("oldest" as const)
        : ("newest" as const),

    page: getPage(query.page),
    pageSize: PAGE_SIZE,
  };

  const result = await getPublicJobs(lang, filters);

  const totalPages = Math.max(
    1,
    Math.ceil(result.total / PAGE_SIZE),
  );

  if (result.total > 0 && filters.page > totalPages) {
    redirect(`/${lang}/offres`);
  }

  function createPageUrl(page: number) {
    const parameters = new URLSearchParams();

    if (filters.q) parameters.set("q", filters.q);
    if (filters.specialty) {
      parameters.set("specialty", filters.specialty);
    }
    if (filters.location) {
      parameters.set("location", filters.location);
    }
    if (filters.contract) {
      parameters.set("contract", filters.contract);
    }
    if (filters.sort === "oldest") {
      parameters.set("sort", "oldest");
    }
    if (page > 1) {
      parameters.set("page", String(page));
    }

    const queryString = parameters.toString();

    return queryString
      ? `/${lang}/offres?${queryString}`
      : `/${lang}/offres`;
  }

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={lang}
        labels={dictionary.common}
      />

      <section className="bg-gradient-to-br from-[#082a43] to-[#11696d] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#76e0d5]">
            {labels.eyebrow}
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-5xl">
            {labels.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            {labels.intro}
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {lang === "ro" ? (
            <div className="mb-8 rounded-3xl border border-[#9fded8] bg-[#e5f7f5] p-6">
              <p className="font-bold text-[#082a43]">
                Nu toate ofertele disponibile în Franța sunt traduse
                în limba română.
              </p>

              <p className="mt-2 text-slate-700">
                Pentru lista completă, consultă versiunea franceză.
              </p>

              <Link
                href="/fr/offres"
                className="mt-4 inline-flex rounded-full bg-[#118c87] px-5 py-2.5 font-bold text-white"
              >
                Vezi toate ofertele în franceză
              </Link>
            </div>
          ) : null}

          <form
            method="get"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg"
          >
            <div className="grid gap-5 lg:grid-cols-4">
              <div>
                <label className="text-sm font-bold">
                  {labels.searchLabel}
                </label>

                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder={labels.searchPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  {labels.specialtyLabel}
                </label>

                <select
                  name="specialty"
                  defaultValue={filters.specialty}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">
                    {labels.allSpecialties}
                  </option>

                  {result.specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  {labels.locationLabel}
                </label>

                <input
                  name="location"
                  defaultValue={filters.location}
                  placeholder={labels.locationPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  {labels.contractLabel}
                </label>

                <select
                  name="contract"
                  defaultValue={filters.contract}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">
                    {labels.allContracts}
                  </option>

                  {result.contractTypes.map((contract) => (
                    <option key={contract} value={contract}>
                      {contract}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="text-sm font-bold">
                  {labels.sortLabel}
                </label>

                <select
                  name="sort"
                  defaultValue={filters.sort}
                  className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="newest">{labels.newest}</option>
                  <option value="oldest">{labels.oldest}</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/${lang}/offres`}
                  className="rounded-full border border-slate-300 px-6 py-3 font-bold"
                >
                  {labels.clearFilters}
                </Link>

                <button
                  type="submit"
                  className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white"
                >
                  {labels.searchButton}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
              {labels.results}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#082a43]">
              {result.total}{" "}
              {result.total === 1
                ? labels.opportunity
                : labels.opportunities}
            </h2>
          </div>

          {result.jobs.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold">
                {labels.noResultsTitle}
              </h2>

              <p className="mt-4 text-slate-600">
                {labels.noResultsText}
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {result.jobs.map((job) => {
                const location =
                  job.locationLabel ||
                  [job.postalCode, job.city]
                    .filter(Boolean)
                    .join(" ") ||
                  "France";

                return (
                  <article
                    key={job.id}
                    className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
                  >
                    <div className="flex flex-wrap gap-2">
                      {job.specialty ? (
                        <span className="rounded-full bg-[#e5f7f5] px-3 py-1.5 text-xs font-bold text-[#0c7773]">
                          {job.specialty}
                        </span>
                      ) : null}

                      {job.contractType ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold">
                          {job.contractType}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-5 text-2xl font-bold text-[#082a43]">
                      {job.title}
                    </h3>

                    <p className="mt-3 font-semibold text-[#118c87]">
                      📍 {location}
                    </p>

                    <p className="mt-5 flex-1 leading-7 text-slate-600">
                      {shorten(job.description)}
                    </p>

                    <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                      <span className="text-sm text-slate-500">
                        {job.publishedAt
                          ? `${labels.publishedOn} ${formatDate(
                              job.publishedAt,
                              lang,
                            )}`
                          : labels.selectedByCstmed}
                      </span>

                      <Link
                        href={`/${lang}/offres/${job.id}`}
                        className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white"
                      >
                        {labels.viewOffer}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between rounded-3xl bg-white p-5">
              {filters.page > 1 ? (
                <Link href={createPageUrl(filters.page - 1)}>
                  ← {labels.previousPage}
                </Link>
              ) : (
                <span />
              )}

              <span>
                {labels.page} {filters.page} {labels.on}{" "}
                {totalPages}
              </span>

              {filters.page < totalPages ? (
                <Link href={createPageUrl(filters.page + 1)}>
                  {labels.nextPage} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </section>

      <SiteFooter
        locale={lang}
        labels={dictionary.common}
      />
    </main>
  );
}