import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import {  isLocale,  type Locale,} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import {  absoluteUrl,  createSeoDescription,  defaultSocialImage,  getOpenGraphLocale,  seoContent,
  siteName,} from "@/lib/seo/site";

export const dynamic = "force-dynamic";

type JobDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const {
    lang: requestedLang,
    id,
  } = await params;

  if (!isLocale(requestedLang)) {
    return {};
  }

  const locale: Locale = requestedLang;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        description,
        specialty,
        location_label,
        city,
        status
      `,
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!job) {
    return {
      title:
        locale === "ro"
          ? "Ofertă indisponibilă"
          : "Offre indisponible",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const frenchPath =
    `/fr/offres/${job.id}`;

  const romanianPath =
    `/ro/offres/${job.id}`;

  let pageTitle = job.title;
  let pageDescription = job.description;
  let hasRomanianTranslation = false;

  const { data: translation } =
    await supabase
      .from("job_translations")
      .select(
        `
          title,
          summary,
          description,
          status
        `,
      )
      .eq("job_id", id)
      .eq("locale", "ro")
      .eq("status", "published")
      .maybeSingle();

  if (translation) {
    hasRomanianTranslation = true;
  }

  if (locale === "ro") {
    if (!translation) {
      return {
        title:
          "Ofertă disponibilă numai în limba franceză",

        description:
          "Această ofertă medicală poate fi consultată momentan numai în limba franceză.",

        alternates: {
          canonical: frenchPath,

          languages: {
            fr: frenchPath,
          },
        },

        robots: {
          index: false,
          follow: true,
        },
      };
    }

    pageTitle =
      translation.title?.trim() ||
      job.title;

    pageDescription =
      translation.summary?.trim() ||
      translation.description?.trim() ||
      job.description;
  }

  const description = createSeoDescription(
    pageDescription,
    seoContent[locale]
      .jobFallbackDescription,
  );

  const canonicalPath =
    locale === "ro"
      ? romanianPath
      : frenchPath;

  const languageAlternates =
    hasRomanianTranslation
      ? {
          ro: romanianPath,
          fr: frenchPath,
          "x-default": romanianPath,
        }
      : {
          fr: frenchPath,
          "x-default": frenchPath,
        };

  return {
    title: pageTitle,
    description,

    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },

    openGraph: {
      type: "article",
      siteName,
      title: pageTitle,
      description,
      url: canonicalPath,
      locale: getOpenGraphLocale(locale),

      images: [
        {
          url: defaultSocialImage,
          alt: "CSTMed",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [defaultSocialImage],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}
export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const {
    lang: requestedLang,
    id,
  } = await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale = requestedLang;
  const dictionary = getDictionary(lang);
  const labels = dictionary.job;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
.select(
  `
    id,
    source_job_id,
    title,
    description,
    company_name,
    specialty,
    location_label,
    city,
    postal_code,
    contract_type,
    working_time,
    salary_text,
    experience_text,
    france_travail_published_at,
    created_at
  `,
  
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!job) {
    notFound();
  }

  let translatedTitle: string | null = null;
  let translatedDescription: string | null = null;

  if (lang === "ro") {
    const { data: translation } = await supabase
      .from("job_translations")
      .select("title, description")
      .eq("job_id", id)
      .eq("locale", "ro")
      .eq("status", "published")
      .maybeSingle();

    if (!translation) {
      return (
        <main className="min-h-screen bg-[#f5f9fb]">
          <SiteHeader
            locale={lang}
            labels={dictionary.common}
          />

          <section className="px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-lg">
              <h1 className="text-3xl font-bold text-[#082a43]">
                {labels.frenchOnlyTitle}
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                {labels.frenchOnlyText}
              </p>

              <Link
                href={`/fr/offres/${id}`}
                className="mt-8 inline-flex rounded-full bg-[#118c87] px-7 py-3.5 font-bold text-white"
              >
                {labels.viewFrench}
              </Link>
            </div>
          </section>

          <SiteFooter
            locale={lang}
            labels={dictionary.common}
          />
        </main>
      );
    }

    translatedTitle = translation.title;
    translatedDescription = translation.description;
  }

  const title = translatedTitle || job.title;

  const description =
    translatedDescription || job.description;

  const location =
    job.location_label ||
    [job.postal_code, job.city]
      .filter(Boolean)
      .join(" ") ||
    "France";
const hasJobLocation = Boolean(
  job.city ||
    job.postal_code ||
    job.location_label,
);

const canRenderJobPosting = Boolean(
  description?.trim() &&
    hasJobLocation,
);

const jobPostingJsonLd = {
  "@context": "https://schema.org",
  "@type": "JobPosting",

  title,
  description,

  datePosted:
    job.france_travail_published_at ??
    job.created_at,

  directApply: true,

  identifier: {
    "@type": "PropertyValue",

    name:
      job.company_name?.trim() ||
      "France Travail",

    value: job.source_job_id,
  },

  hiringOrganization: {
    "@type": "Organization",

    name:
      job.company_name?.trim() ||
      "confidential",
  },

  jobLocation: {
    "@type": "Place",

    address: {
      "@type": "PostalAddress",

      addressLocality:
        job.city ||
        job.location_label ||
        undefined,

      addressRegion:
        job.location_label ||
        undefined,

      postalCode:
        job.postal_code ||
        undefined,

      addressCountry: "FR",
    },
  },

  url: absoluteUrl(
    `/${lang}/offres/${job.id}`,
  ),
};
  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      {canRenderJobPosting ? (
  <JsonLd data={jobPostingJsonLd} />
) : null}
      <SiteHeader
        locale={lang}
        labels={dictionary.common}
      />

      <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {job.specialty ? (
              <span className="rounded-full bg-[#65d9ce] px-4 py-2 text-xs font-bold text-[#082a43]">
                {job.specialty}
              </span>
            ) : null}

            {job.contract_type ? (
              <span className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold">
                {job.contract_type}
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold sm:text-5xl">
            {title}
          </h1>

          <p className="mt-5 text-lg text-slate-200">
            📍 {location}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
              {labels.description}
            </p>

            <div className="mt-6 whitespace-pre-line leading-8 text-slate-700">
              {description}
            </div>

            <h2 className="mt-10 border-t border-slate-100 pt-8 text-2xl font-bold text-[#082a43]">
              {labels.information}
            </h2>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [labels.location, location],
                [
                  labels.contract,
                  job.contract_type || labels.unspecified,
                ],
                [
                  labels.workingTime,
                  job.working_time || labels.unspecified,
                ],
                [
                  labels.experience,
                  job.experience_text || labels.unspecified,
                ],
                [
                  labels.salary,
                  job.salary_text || labels.unspecified,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#f5f9fb] p-5"
                >
                  <dt className="text-sm font-semibold text-slate-500">
                    {label}
                  </dt>

                  <dd className="mt-2 font-bold text-[#082a43]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <aside className="h-fit rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
              {labels.applyEyebrow}
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              {labels.applyTitle}
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              {labels.applyText}
            </p>

            <Link
                href={`/${lang}/candidature?jobId=${job.id}`}
                className="mt-7 flex justify-center rounded-full bg-[#65d9ce] px-6 py-3.5 text-center font-bold text-[#082a43]"
                >
                {labels.applyButton}
                </Link>

            <a
              href="tel:+33628262576"
              className="mt-3 flex justify-center rounded-full border border-white/25 px-6 py-3.5 text-center font-bold"
            >
              {labels.callButton}
            </a>
          </aside>
        </div>
      </section>

      <SiteFooter
        locale={lang}
        labels={dictionary.common}
      />
    </main>
  );
}