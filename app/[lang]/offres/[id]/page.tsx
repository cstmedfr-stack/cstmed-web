import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { publicLinks } from "@/lib/site/public-links";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createGoogleMapsSearchUrl } from "@/lib/maps/google-maps";

import {
  absoluteUrl,
  createSeoDescription,
  defaultSocialImage,
  getOpenGraphLocale,
  seoContent,
  siteName,
} from "@/lib/seo/site";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JobDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

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

function JobDescription({
  text,
}: {
  text: string;
}) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-[16px] leading-7 text-slate-700">
      {lines.map((line, index) => {
        const isBullet =
          /^(?:[•●▪◦]|o|-|–|—)\s+/.test(line);

        const cleanedLine = isBullet
          ? line.replace(
              /^(?:[•●▪◦]|o|-|–|—)\s+/,
              "",
            )
          : line;

        const isHeading =
          !isBullet &&
          line.length < 100 &&
          line.endsWith(":");

        if (isHeading) {
          return (
            <h3
              key={`${line}-${index}`}
              className="pt-4 text-lg font-black text-[#082a43] first:pt-0"
            >
              {line}
            </h3>
          );
        }

        if (isBullet) {
          return (
            <div
              key={`${line}-${index}`}
              className="flex gap-3 pl-1"
            >
              <span
                className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#118c87]"
                aria-hidden="true"
              />

              <p>
                {cleanedLine}
              </p>
            </div>
          );
        }

        return (
          <p
            key={`${line}-${index}`}
            className="max-w-4xl"
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}
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
  let pageDescription =
    job.description;

  let hasRomanianTranslation =
    false;

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

  const description =
    createSeoDescription(
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
      languages:
        languageAlternates,
    },

    openGraph: {
      type: "article",
      siteName,
      title: pageTitle,
      description,
      url: canonicalPath,
      locale:
        getOpenGraphLocale(locale),

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

  const lang: Locale =
    requestedLang;

  const dictionary =
    getDictionary(lang);

  const labels =
    dictionary.job;

  const supabase =
    await createClient();

  const {
    data: job,
    error,
  } = await supabase
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
    throw new Error(
      error.message,
    );
  }

  if (!job) {
    notFound();
  }

  let translatedTitle:
    string | null = null;

  let translatedDescription:
    string | null = null;

  if (lang === "ro") {
    const {
      data: translation,
    } = await supabase
      .from("job_translations")
      .select(
        "title, description",
      )
      .eq("job_id", id)
      .eq("locale", "ro")
      .eq("status", "published")
      .maybeSingle();

    if (!translation) {
      return (
        <main className="min-h-screen bg-[#f5f9fb]">
          <SiteHeader
            locale={lang}
            labels={
              dictionary.common
            }
          />

          <section className="px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f7f5] text-2xl">
                FR
              </div>

              <h1 className="mt-6 text-3xl font-black text-[#082a43]">
                {
                  labels.frenchOnlyTitle
                }
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                {
                  labels.frenchOnlyText
                }
              </p>

              <Link
                href={`/fr/offres/${id}`}
                className="mt-8 inline-flex rounded-full bg-[#0D6EFD] px-7 py-3.5 font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
              >
                {
                  labels.viewFrench
                }
              </Link>
            </div>
          </section>

          <SiteFooter
            locale={lang}
            labels={
              dictionary.common
            }
          />
        </main>
      );
    }

    translatedTitle =
      translation.title;

    translatedDescription =
      translation.description;
  }

  const title =
    translatedTitle ||
    job.title;

  const description =
    translatedDescription ||
    job.description;

  const location =
    job.location_label ||
    [
      job.postal_code,
      job.city,
    ]
      .filter(Boolean)
      .join(" ") ||
    "France";

  const mapsQuery =
    location === "France"
      ? "France"
      : `${location}, France`;

  const googleMapsUrl =
    createGoogleMapsSearchUrl(
      mapsQuery,
    );

  const publishedDate =
    formatDate(
      job.france_travail_published_at ??
        job.created_at,
      lang,
    );

  const hasJobLocation =
    Boolean(
      job.city ||
        job.postal_code ||
        job.location_label,
    );

  const canRenderJobPosting =
    Boolean(
      description?.trim() &&
        hasJobLocation,
    );

  const jobPostingJsonLd = {
    "@context":
      "https://schema.org",

    "@type": "JobPosting",

    title,

    description,

    datePosted:
      job.france_travail_published_at ??
      job.created_at,

    directApply: true,

    identifier: {
      "@type":
        "PropertyValue",

      name:
        job.company_name?.trim() ||
        "France Travail",

      value:
        job.source_job_id ||
        job.id,
    },

    hiringOrganization: {
      "@type":
        "Organization",

      name:
        job.company_name?.trim() ||
        "CSTMed",
    },

    jobLocation: {
      "@type": "Place",

      address: {
        "@type":
          "PostalAddress",

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

  const content =
    lang === "ro"
      ? {
          back:
            "Înapoi la toate ofertele",

          location:
            "Localizare",

          maps:
            "Vezi zona pe Google Maps",

          published:
            "Publicată la",

          selected:
            "Oportunitate selectată de CSTMed",

          response:
            "Răspuns rapid",

          responseValue:
            "în maximum 24 h",

          support:
            "Sprijin CSTMed",

          supportValue:
            "de la candidatură la instalare",

          details:
            "Informații despre post",

          why:
            "CSTMed te însoțește pe tot parcursul proiectului",

          whyText:
            "Nu rămâi singur după trimiterea candidaturii. Te însoțim în etapele proiectului profesional și în pregătirea instalării în Franța.",

          applyNote:
            "Candidatura ta va fi asociată automat acestei oferte.",

          confidentiality:
            "Datele tale sunt transmise în mod confidențial.",

          allOffers:
            "Vezi toate ofertele",
        }
      : {
          back:
            "Retour à toutes les offres",

          location:
            "Localisation",

          maps:
            "Voir la zone sur Google Maps",

          published:
            "Publiée le",

          selected:
            "Opportunité sélectionnée par CSTMed",

          response:
            "Réponse rapide",

          responseValue:
            "sous 24 h maximum",

          support:
            "Accompagnement CSTMed",

          supportValue:
            "de la candidature à l’installation",

          details:
            "Informations sur le poste",

          why:
            "CSTMed vous accompagne tout au long de votre projet",

          whyText:
            "Votre accompagnement ne s’arrête pas à l’envoi de votre candidature. Nous restons à vos côtés dans les différentes étapes du projet professionnel et de l’installation en France.",

          applyNote:
            "Votre candidature sera automatiquement associée à cette offre.",

          confidentiality:
            "Vos informations sont transmises de manière confidentielle.",

          allOffers:
            "Voir toutes les offres",
        };

  const informationCards = [
    {
      label:
        labels.location,
      value:
        location,
      icon: "📍",
    },

    {
      label:
        labels.contract,
      value:
        job.contract_type ||
        labels.unspecified,
      icon: "📄",
    },

    {
      label:
        labels.workingTime,
      value:
        job.working_time ||
        labels.unspecified,
      icon: "⏱",
    },

    {
      label:
        labels.experience,
      value:
        job.experience_text ||
        labels.unspecified,
      icon: "🩺",
    },

    {
  label:
    labels.salary,
  value:
    job.salary_text ||
    labels.unspecified,
  icon: "€",
  highlight: true,
},
  ];

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      {canRenderJobPosting ? (
        <JsonLd
          data={
            jobPostingJsonLd
          }
        />
      ) : null}

      <SiteHeader
        locale={lang}
        labels={
          dictionary.common
        }
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#65d9ce]/10 blur-3xl" />

        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#0D6EFD]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
          <Link
            href={`/${lang}/offres`}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-200 transition hover:text-white"
          >
            <span aria-hidden="true">
              ←
            </span>

            {content.back}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                {job.specialty ? (
                  <span className="rounded-full bg-[#65d9ce] px-4 py-2 text-xs font-black text-[#082a43]">
                    {job.specialty}
                  </span>
                ) : null}

                {job.contract_type ? (
                  <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur-sm">
                    {
                      job.contract_type
                    }
                  </span>
                ) : null}

                {job.working_time ? (
                  <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur-sm">
                    {
                      job.working_time
                    }
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#8eeae1]">
                {content.selected}
              </p>

              <h1 className="mt-4 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                {title}
              </h1>

              {publishedDate ? (
                <p className="mt-5 text-sm font-semibold text-slate-300">
                  {content.published}{" "}
                  {publishedDate}
                </p>
              ) : null}
            </div>

            {/* LOCALISATION */}
            <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8eeae1]">
                {content.location}
              </p>

              <p className="mt-3 text-xl font-black text-white">
                {location}
              </p>

              <a
                href={
                  googleMapsUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-5 py-3 text-sm font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
              >
                <span aria-hidden="true">
                  📍
                </span>

                {content.maps}

                <span aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>

          {/* BLOC RAPID */}
          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                {content.response}
              </p>

              <p className="mt-1 font-black">
                {
                  content.responseValue
                }
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                {content.support}
              </p>

              <p className="mt-1 font-black">
                {
                  content.supportValue
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-8">
            {/* DESCRIPTION */}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#118c87]">
                {
                  labels.description
                }
              </p>

             <div className="mt-7">
  <JobDescription text={description} />
</div>
            </article>

            {/* INFORMATIONS */}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#118c87]">
                {content.details}
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#082a43]">
                {
                  labels.information
                }
              </h2>

              <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              {informationCards.map(
                  ({
                    label,
                    value,
                    icon,
                    highlight,
                  }) => (
                    <div
                          key={label}
                          className={`rounded-[1.5rem] border p-5 ${
                            highlight
                              ? "border-[#9fded8] bg-[#e5f7f5] sm:col-span-2"
                              : "border-slate-100 bg-[#f5f9fb]"
                          }`}
                        >
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                          {icon}
                        </span>

                        <div>
                          <dt className="text-sm font-semibold text-slate-500">
                            {label}
                          </dt>

                         <dd
                          className={`mt-1 font-black leading-6 text-[#082a43] ${
                            highlight ? "text-lg" : ""                          }`}
                        >
                          {value}
                        </dd>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </dl>

              <a
                href={
                  googleMapsUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#0D6EFD]/30 bg-[#e8efff] px-5 py-3 text-sm font-black text-[#0965d8] transition hover:bg-[#dce7ff]"
              >
                <span aria-hidden="true">
                  📍
                </span>

                {content.maps}

                <span aria-hidden="true">
                  ↗
                </span>
              </a>
            </article>

            {/* ACCOMPAGNEMENT */}
            <article className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#e5f7f5] to-[#eef4ff] p-7 sm:p-9">
              <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#118c87] text-2xl text-white shadow-lg">
                  ✓
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[#082a43]">
                    {content.why}
                  </h2>

                  <p className="mt-4 max-w-3xl leading-7 text-slate-700">
                    {
                      content.whyText
                    }
                  </p>
                </div>
              </div>
            </article>

            <div>
              <Link
                href={`/${lang}/offres`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-black text-[#082a43] transition hover:border-[#118c87] hover:text-[#118c87]"
              >
                <span aria-hidden="true">
                  ←
                </span>

                {content.allOffers}
              </Link>
            </div>
          </div>

          {/* CANDIDATURE */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[2rem] bg-[#082a43] text-white shadow-2xl shadow-slate-900/20">
              <div className="p-7 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                  {
                    labels.applyEyebrow
                  }
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight">
                  {
                    labels.applyTitle
                  }
                </h2>

                <p className="mt-4 leading-7 text-slate-300">
                  {
                    labels.applyText
                  }
                </p>

                <Link
                  href={`/${lang}/candidature?jobId=${job.id}`}
                  className="mt-7 flex min-h-[52px] items-center justify-center rounded-full bg-[#0D6EFD] px-6 py-3.5 text-center font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
                >
                  {
                    labels.applyButton
                  }

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  {
                    content.applyNote
                  }
                </p>

                <div className="my-6 border-t border-white/10" />

                <a
             href={`tel:${publicLinks.phoneRomaniaHref}`}
                  className="flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-center font-black transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
                >
                  <span aria-hidden="true">
                    ☎
                  </span>

                  <span>
                  {labels.callButton}
                  <span className="ml-2 text-xs font-semibold opacity-80">
                    {publicLinks.phoneRomaniaDisplay}
                  </span>
                </span>
                </a>
              </div>

              <div className="border-t border-white/10 bg-white/5 px-7 py-5">
                <div className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="text-[#65d9ce]"
                  >
                    ✓
                  </span>

                  <p className="text-xs leading-5 text-slate-300">
                    {
                      content.confidentiality
                    }
                  </p>
                </div>

                <div className="mt-3 flex gap-3">
                  <span
                    aria-hidden="true"
                    className="text-[#65d9ce]"
                  >
                    ✓
                  </span>

                  <p className="text-xs leading-5 text-slate-300">
                    {
                      content.response
                    }
                    :{" "}
                    {
                      content.responseValue
                    }.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter
        locale={lang}
        labels={
          dictionary.common
        }
      />
    </main>
  );
}