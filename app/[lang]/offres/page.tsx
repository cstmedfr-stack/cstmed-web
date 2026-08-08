import type { Metadata } from "next";

import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { OffersHero } from "@/components/public/offers-hero";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPublicJobs } from "@/lib/jobs/get-public-jobs";
import { createGoogleMapsSearchUrl } from "@/lib/maps/google-maps";

import {
  defaultSocialImage,
  getOpenGraphLocale,
  seoContent,
  siteName,
} from "@/lib/seo/site";

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

export async function generateMetadata({
  params,
}: JobsPageProps): Promise<Metadata> {
  const { lang: requestedLang } = await params;

  if (!isLocale(requestedLang)) {
    return {};
  }

  const locale: Locale = requestedLang;
  const content = seoContent[locale].jobs;
  const canonicalPath = `/${locale}/offres`;

  return {
    title: content.title,
    description: content.description,

    alternates: {
      canonical: canonicalPath,

      languages: {
        ro: "/ro/offres",
        fr: "/fr/offres",
        "x-default": "/ro/offres",
      },
    },

    openGraph: {
      type: "website",
      siteName,
      title: content.title,
      description: content.description,
      url: canonicalPath,
      locale: getOpenGraphLocale(locale),

      alternateLocale: [
        locale === "ro"
          ? "fr_FR"
          : "ro_RO",
      ],

      images: [
        {
          url: defaultSocialImage,
          alt: "CSTMed",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [defaultSocialImage],
    },
  };
}

function clean(
  value: string | undefined,
  length = 100,
) {
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

  const cleanValue = value
    .replace(/\s+/g, " ")
    .trim();

  return cleanValue.length > 230
    ? `${cleanValue.slice(0, 230).trim()}…`
    : cleanValue;
}

function formatDate(
  value: string | null,
  locale: Locale,
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    locale === "ro"
      ? "ro-RO"
      : "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

const fieldClassName =
  "mt-2 min-h-[52px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

export default async function JobsPage({
  params,
  searchParams,
}: JobsPageProps) {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale = requestedLang;

  const dictionary = getDictionary(lang);
  const labels = dictionary.jobs;

  const query = await searchParams;

  const filters = {
    q: clean(query.q),

    specialty: clean(
      query.specialty,
      150,
    ),

    location: clean(
      query.location,
      120,
    ),

    contract: clean(
      query.contract,
      100,
    ),

    sort:
      query.sort === "oldest"
        ? ("oldest" as const)
        : ("newest" as const),

    page: getPage(query.page),

    pageSize: PAGE_SIZE,
  };

  const result = await getPublicJobs(
    lang,
    filters,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      result.total / PAGE_SIZE,
    ),
  );

  if (
    result.total > 0 &&
    filters.page > totalPages
  ) {
    redirect(`/${lang}/offres`);
  }

  function createPageUrl(page: number) {
    const parameters =
      new URLSearchParams();

    if (filters.q) {
      parameters.set("q", filters.q);
    }

    if (filters.specialty) {
      parameters.set(
        "specialty",
        filters.specialty,
      );
    }

    if (filters.location) {
      parameters.set(
        "location",
        filters.location,
      );
    }

    if (filters.contract) {
      parameters.set(
        "contract",
        filters.contract,
      );
    }

    if (filters.sort === "oldest") {
      parameters.set(
        "sort",
        "oldest",
      );
    }

    if (page > 1) {
      parameters.set(
        "page",
        String(page),
      );
    }

    const queryString =
      parameters.toString();

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

      <OffersHero
        locale={lang}
        offersCount={result.total}
      />

      {/* FILTRE */}
      <section className="relative z-20 -mt-14 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <form
            method="get"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label
                  htmlFor="q"
                  className="block text-sm font-black text-[#082a43]"
                >
                  {labels.searchLabel}
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={filters.q}
                  placeholder={
                    labels.searchPlaceholder
                  }
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="block text-sm font-black text-[#082a43]"
                >
                  {labels.specialtyLabel}
                </label>

                <select
                  id="specialty"
                  name="specialty"
                  defaultValue={
                    filters.specialty
                  }
                  className={
                    fieldClassName
                  }
                >
                  <option value="">
                    {labels.allSpecialties}
                  </option>

                  {result.specialties.map(
                    (specialty) => (
                      <option
                        key={specialty}
                        value={specialty}
                      >
                        {specialty}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-black text-[#082a43]"
                >
                  {labels.locationLabel}
                </label>

                <input
                  id="location"
                  name="location"
                  type="search"
                  defaultValue={
                    filters.location
                  }
                  placeholder={
                    labels.locationPlaceholder
                  }
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="contract"
                  className="block text-sm font-black text-[#082a43]"
                >
                  {labels.contractLabel}
                </label>

                <select
                  id="contract"
                  name="contract"
                  defaultValue={
                    filters.contract
                  }
                  className={
                    fieldClassName
                  }
                >
                  <option value="">
                    {labels.allContracts}
                  </option>

                  {result.contractTypes.map(
                    (contract) => (
                      <option
                        key={contract}
                        value={contract}
                      >
                        {contract}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5 border-t border-slate-200 pt-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-black text-[#082a43]"
                >
                  {labels.sortLabel}
                </label>

                <select
                  id="sort"
                  name="sort"
                  defaultValue={
                    filters.sort
                  }
                  className="mt-2 min-h-[48px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="newest">
                    {labels.newest}
                  </option>

                  <option value="oldest">
                    {labels.oldest}
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${lang}/offres`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-[#118c87] hover:text-[#118c87]"
                >
                  {labels.clearFilters}
                </Link>

                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-7 py-3 text-sm font-black uppercase tracking-[0.03em] text-[#082A43] shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
                >
                  <span
                    aria-hidden="true"
                    className="text-lg"
                  >
                    ⌕
                  </span>

                  {labels.searchButton}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* MESAJ SPECIAL PENTRU VERSIUNEA ROMÂNĂ */}
      {lang === "ro" ? (
        <section className="px-5 pt-8 sm:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-[#9fded8] bg-[#e5f7f5] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="font-black text-[#082a43]">
                Nu toate ofertele
                disponibile în Franța
                sunt traduse în limba
                română.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Pentru lista completă,
                consultă versiunea
                franceză a site-ului.
              </p>
            </div>

            <Link
              href="/fr/offres"
              className="mt-5 inline-flex shrink-0 rounded-full bg-[#118c87] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0c7773] sm:mt-0"
            >
              Vezi toate ofertele în
              franceză
            </Link>
          </div>
        </section>
      ) : null}

      {/* REZULTATE */}
      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
                {labels.results}
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#082a43] sm:text-4xl">
                {result.total}{" "}
                {result.total === 1
                  ? labels.opportunity
                  : labels.opportunities}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-500">
              {lang === "ro"
                ? "Apasă pe localitate pentru a vedea direct zona postului în Google Maps."
                : "Cliquez sur la localisation pour visualiser directement la zone du poste dans Google Maps."}
            </p>
          </div>

          {result.jobs.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f7f5] text-2xl">
                🔎
              </div>

              <h2 className="mt-5 text-2xl font-black text-[#082a43]">
                {labels.noResultsTitle}
              </h2>

              <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
                {labels.noResultsText}
              </p>

              <Link
                href={`/${lang}/offres`}
                className="mt-6 inline-flex rounded-full bg-[#0D6EFD] px-6 py-3 font-black text-[#082A43]"
              >
                {labels.clearFilters}
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {result.jobs.map((job) => {
                const location =
                  job.locationLabel ||
                  [
                    job.postalCode,
                    job.city,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "France";

                const mapsQuery =
                  location === "France"
                    ? "France"
                    : `${location}, France`;

                const mapsUrl =
                  createGoogleMapsSearchUrl(
                    mapsQuery,
                  );

                return (
                  <article
                    key={job.id}
                    className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#118c87]/40 hover:shadow-xl sm:p-8"
                  >
                    <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.specialty ? (
                            <span className="inline-flex rounded-full bg-[#e5f7f5] px-3 py-1.5 text-xs font-black text-[#0c7773]">
                              {job.specialty}
                            </span>
                          ) : null}

                          {job.contractType ? (
                            <span className="inline-flex rounded-full bg-[#e8efff] px-3 py-1.5 text-xs font-black text-[#0965d8]">
                              {job.contractType}
                            </span>
                          ) : null}

                          {job.publishedAt ? (
                            <span className="text-xs font-semibold text-slate-400">
                              {labels.publishedOn}{" "}
                              {formatDate(
                                job.publishedAt,
                                lang,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 max-w-4xl text-2xl font-black leading-tight text-[#082a43] transition group-hover:text-[#0965d8] sm:text-[1.75rem]">
                          {job.title}
                        </h3>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f5f9fb] px-4 py-2 text-sm font-bold text-[#0965d8] transition hover:bg-[#e8efff]"
                          title={
                            lang === "ro"
                              ? "Deschide în Google Maps"
                              : "Ouvrir dans Google Maps"
                          }
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D6EFD] text-white"
                          >
                            📍
                          </span>

                          <span>
                            {location}
                          </span>

                          <span
                            aria-hidden="true"
                            className="text-xs"
                          >
                            ↗
                          </span>
                        </a>

                        {job.description ? (
                          <p className="mt-5 max-w-4xl leading-7 text-slate-600">
                            {shorten(
                              job.description,
                            )}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <Link
                          href={`/${lang}/offres/${job.id}`}
                          className="inline-flex min-h-[48px] min-w-[175px] items-center justify-center rounded-full bg-[#118c87] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0c7773]"
                        >
                          {labels.viewOffer}

                          <span
                            className="ml-2"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>

                        {!job.publishedAt ? (
                          <span className="text-xs font-semibold text-slate-400">
                            {
                              labels.selectedByCstmed
                            }
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINARE */}
          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              {filters.page > 1 ? (
                <Link
                  href={createPageUrl(
                    filters.page - 1,
                  )}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#118c87] hover:text-[#118c87]"
                >
                  ←{" "}
                  {labels.previousPage}
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm font-semibold text-slate-500">
                {labels.page}{" "}
                {filters.page}{" "}
                {labels.on}{" "}
                {totalPages}
              </span>

              {filters.page <
              totalPages ? (
                <Link
                  href={createPageUrl(
                    filters.page + 1,
                  )}
                  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c7773]"
                >
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