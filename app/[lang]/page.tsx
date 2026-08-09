import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";

import { HomeAdministrativeSection } from "@/components/public/home-administrative-section";
import { HomeContactSection } from "@/components/public/home-contact-section";
import { HomeEstablishmentsSection } from "@/components/public/home-establishments-section";
import { HomeHero } from "@/components/public/home-hero";
import { HomeVisualSections } from "@/components/public/home-visual-sections";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";

import {
  absoluteUrl,
  defaultSocialImage,
  getOpenGraphLocale,
  seoContent,
  siteName,
  siteUrl,
} from "@/lib/seo/site";

import { publicLinks } from "@/lib/site/public-links";

type HomePageProps = {
  params: Promise<{
    lang: string;
  }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    return {};
  }

  const locale: Locale =
    requestedLang;

  const content =
    seoContent[locale].home;

  const canonicalPath =
    `/${locale}`;

  return {
    title: content.title,
    description: content.description,

    alternates: {
      canonical:
        canonicalPath,

      languages: {
        ro: "/ro",
        fr: "/fr",
        "x-default": "/ro",
      },
    },

    openGraph: {
      type: "website",
      siteName,
      title: content.title,
      description:
        content.description,
      url: canonicalPath,

      locale:
        getOpenGraphLocale(
          locale,
        ),

      alternateLocale: [
        locale === "ro"
          ? "fr_FR"
          : "ro_RO",
      ],

      images: [
        {
          url:
            defaultSocialImage,
          alt: "CSTMed",
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",
      title: content.title,
      description:
        content.description,
      images: [
        defaultSocialImage,
      ],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#118c87] text-xs font-black text-white">
      ✓
    </span>
  );
}

export default async function HomePage({
  params,
}: HomePageProps) {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale =
    requestedLang;

  const dictionary =
    getDictionary(lang);

  const home =
    dictionary.home;

  const content =
    lang === "ro"
      ? {
        
          doctorsEyebrow:
            "Pentru medici",

          doctorsTitle:
            "Pregătește-ți proiectul medical în Franța",

          doctorsIntro:
            "De la alegerea unui post până la instalarea în Franța, găsești aici informațiile și sprijinul de care ai nevoie.",

          infoEyebrow:
            "Informații pentru medici",

          infoTitle:
            "Construiește-ți proiectul profesional pas cu pas",

          infoText:
            "CSTMed îți oferă informații clare și sprijin personalizat în etapele importante ale proiectului.",

          freeReminder:
            "Toate serviciile CSTMed destinate medicilor sunt 100% gratuite.",

          aboutEyebrow:
            "Cine suntem?",

          aboutTitle:
            "CSTMed, un partener pentru medici și unități medicale",

          aboutText:
            "Punem în legătură nevoile unităților medicale din Franța cu proiectele profesionale ale medicilor și însoțim fiecare parte pe parcursul procesului.",

          expertiseEyebrow:
            "Expertiza CSTMed",

          methodEyebrow:
            "Metoda noastră",
        }
      : {
          
          doctorsEyebrow:
            "Pour les médecins",

          doctorsTitle:
            "Préparez votre projet médical en France",

          doctorsIntro:
            "De la recherche d’un poste jusqu’à votre installation en France, retrouvez ici les informations et l’accompagnement nécessaires.",

          infoEyebrow:
            "Informations pour les médecins",

          infoTitle:
            "Construisez votre projet professionnel étape par étape",

          infoText:
            "CSTMed vous apporte des informations claires et un accompagnement personnalisé aux étapes importantes de votre projet.",

          freeReminder:
            "Tous les services CSTMed destinés aux médecins sont 100 % gratuits.",

          aboutEyebrow:
            "Qui sommes-nous ?",

          aboutTitle:
            "CSTMed, un partenaire pour les médecins et les établissements",

          aboutText:
            "Nous mettons en relation les besoins des établissements de santé en France avec les projets professionnels des médecins et accompagnons chaque partie tout au long du processus.",

          expertiseEyebrow:
            "Notre expertise",

          methodEyebrow:
            "Notre méthode",
        };

  const informationCards =
    lang === "ro"
      ? [
          {
            eyebrow:
              "Proiect profesional",

            title:
              "Lucrează ca medic în Franța",

            text:
              "Descoperă oportunitățile profesionale și condițiile generale de exercitare.",

            href:
              `/${lang}/offres`,

            linkLabel:
              "Vezi ofertele",
          },
          {
            eyebrow:
              "Instalare",

            title:
              "Instalarea ca medic în Franța",

            text:
              "Pregătește documentele, demersurile profesionale și organizarea instalării.",

            href:
              `/${lang}/candidature`,

            linkLabel:
              "Prezintă-ne proiectul",
          },
          {
            eyebrow:
              "Condiții profesionale",

            title:
              "Posturi, venituri și regiuni",

            text:
              "Condițiile diferă în funcție de specialitate, statut, unitate și regiune.",

            href:
              `/${lang}/offres`,

            linkLabel:
              "Caută un post",
          },
        ]
      : [
          {
            eyebrow:
              "Projet professionnel",

            title:
              "Travailler comme médecin en France",

            text:
              "Découvrez les opportunités professionnelles et les principales conditions d’exercice.",

            href:
              `/${lang}/offres`,

            linkLabel:
              "Voir les offres",
          },
          {
            eyebrow:
              "Installation",

            title:
              "S’installer comme médecin en France",

            text:
              "Préparez les documents, les démarches professionnelles et l’organisation de votre installation.",

            href:
              `/${lang}/candidature`,

            linkLabel:
              "Présenter mon projet",
          },
          {
            eyebrow:
              "Conditions professionnelles",

            title:
              "Postes, revenus et régions",

            text:
              "Les conditions varient selon la spécialité, le statut, l’établissement et la région.",

            href:
              `/${lang}/offres`,

            linkLabel:
              "Rechercher un poste",
          },
        ];

  return (
    <main className="min-h-screen bg-white text-[#102435]">
      <JsonLd
        data={{
          "@context":
            "https://schema.org",

          "@type":
            "Organization",

          name: "CSTMed",

          url: siteUrl,

          logo: absoluteUrl(
            "/images/cstmed-logo.png",
          ),

          email:
            publicLinks.email,

          telephone:
            publicLinks.phoneHref,

          areaServed: [
            {
              "@type":
                "Country",
              name: "France",
            },
            {
              "@type":
                "Country",
              name: "Romania",
            },
          ],

          knowsAbout: [
            "Recrutement médical",
            "Médecins européens",
            "Emploi médical en France",
          ],
        }}
      />

      <SiteHeader
        locale={lang}
        labels={
          dictionary.common
        }
      />

      {/* 1 — ACCUEIL */}
      <HomeHero
        locale={lang}
      />

      

      {/* ===================================
          2 — POUR LES MÉDECINS
      =================================== */}
      <section
        id="medecins"
        className="scroll-mt-40 px-5 pb-16 pt-12 sm:px-8 sm:pb-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {
                content.doctorsEyebrow
              }
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#082a43] sm:text-4xl lg:text-5xl">
              {
                content.doctorsTitle
              }
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {
                content.doctorsIntro
              }
            </p>
          </div>

          {/* INFORMATIONS POUR LES MÉDECINS */}
          <div
            id="projet-medical"
            className="scroll-mt-40 mt-12"
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {
                content.infoEyebrow
              }
            </p>

            <h3 className="mt-3 text-3xl font-black text-[#082a43]">
              {
                content.infoTitle
              }
            </h3>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              {
                content.infoText
              }
            </p>

            <div className="mt-9 grid gap-6 lg:grid-cols-3">
              {informationCards.map(
                (
                  card,
                  index,
                ) => (
                  <article
                    key={
                      card.title
                    }
                    className="group flex min-h-[285px] flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#118c87]">
                        {
                          card.eyebrow
                        }
                      </p>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f7f5] font-black text-[#118c87]">
                        {index + 1}
                      </span>
                    </div>

                    <h4 className="mt-6 text-2xl font-black leading-tight text-[#082a43]">
                      {
                        card.title
                      }
                    </h4>

                    <p className="mt-4 flex-1 leading-7 text-slate-600">
                      {
                        card.text
                      }
                    </p>

                    <Link
                      href={
                        card.href
                      }
                      className="mt-7 inline-flex items-center font-black text-[#0965d8]"
                    >
                      {
                        card.linkLabel
                      }

                      <span className="ml-2">
                        →
                      </span>
                    </Link>
                  </article>
                ),
              )}
            </div>

            {/* A DOUA MENȚIUNE GRATUITATE */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f5f9fb] p-5">
              <CheckIcon />

              <p className="font-black text-[#082a43]">
                {
                  content.freeReminder
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPÉCIALITÉS — rămâne în capitolul MÉDECINS */}
      <section
        id="specialites"
        className="scroll-mt-40 bg-[#f5f9fb] px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {
                home.specialties
                  .eyebrow
              }
            </p>

            <h2 className="mt-4 text-3xl font-black text-[#082a43] sm:text-4xl">
              {
                home.specialties
                  .title
              }
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              {
                home.specialties
                  .description
              }
            </p>

            <Link
              href={`/${lang}/offres`}
              className="mt-7 inline-flex rounded-full bg-[#0D6EFD] px-6 py-3 font-black text-[#082A43] shadow-sm transition hover:bg-[#0B63E5]"
            >
              {
                home.specialties
                  .button
              }
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {home.specialties.list.map(
              (specialty) => (
                <div
                  key={
                    specialty
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold"
                >
                  {specialty}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ACCOMPAGNEMENT + MÉDECINS + INSTALLATION */}
      <div
  id="accompagnement-medecins"
  className="scroll-mt-40"
>
  <HomeVisualSections
    locale={lang}
  />
</div>

<div
  id="demarches-administratives"
  className="scroll-mt-40"
>
  <HomeAdministrativeSection
    locale={lang}
  />
</div>

      {/* ===================================
          3 — QUI SOMMES-NOUS ?
      =================================== */}
      <section
        id="qui-sommes-nous"
        className="scroll-mt-40 px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {
                content.aboutEyebrow
              }
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#082a43] sm:text-4xl lg:text-5xl">
              {
                content.aboutTitle
              }
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {
                content.aboutText
              }
            </p>
          </div>

          {/* DEUX BESOINS, UN MÊME PARTENAIRE */}
          <div className="mt-12 grid gap-7 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#118c87]">
                {
                  home.doctors
                    .eyebrow
                }
              </p>

              <h3 className="mt-4 text-3xl font-black text-[#082a43]">
                {
                  home.doctors
                    .title
                }
              </h3>

              <p className="mt-5 leading-7 text-slate-600">
                {
                  home.doctors
                    .description
                }
              </p>

              <ul className="mt-7 space-y-4">
                {home.doctors.bullets.map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckIcon />

                      <span>
                        {item}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <Link
                href={`/${lang}/candidature`}
                className="mt-8 inline-flex rounded-full bg-[#0D6EFD] px-6 py-3 font-black text-[#082A43]"
              >
                {
                  home.doctors
                    .button
                }
              </Link>
            </article>

            <article className="rounded-[2rem] bg-[#082a43] p-8 text-white shadow-xl">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                {
                  home.establishments
                    .eyebrow
                }
              </p>

              <h3 className="mt-4 text-3xl font-black">
                {
                  home.establishments
                    .title
                }
              </h3>

              <p className="mt-5 leading-7 text-slate-300">
                {
                  home.establishments
                    .description
                }
              </p>

              <ul className="mt-7 space-y-4">
                {home.establishments.bullets.map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckIcon />

                      <span>
                        {item}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <Link
                href={`/${lang}/etablissements`}
                className="mt-8 inline-flex rounded-full bg-[#65d9ce] px-6 py-3 font-black text-[#082a43]"
              >
                {
                  home.establishments
                    .button
                }
              </Link>
            </article>
          </div>

          {/* NOTRE EXPERTISE */}
          <div
            id="expertise"
            className="scroll-mt-40 mt-20"
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {
                content.expertiseEyebrow
              }
            </p>

            <h2 className="mt-4 text-3xl font-black text-[#082a43] sm:text-4xl">
              {
                home.expertise
                  .title
              }
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {home.expertise.items.map(
                (item) => (
                  <article
                    key={
                      item.number
                    }
                    className="rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-7"
                  >
                    <span className="font-black text-[#118c87]">
                      {
                        item.number
                      }
                    </span>

                    <h3 className="mt-5 text-xl font-black text-[#082a43]">
                      {
                        item.title
                      }
                    </h3>

                    <p className="mt-4 leading-7 text-slate-600">
                      {
                        item.description
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>

          {/* NOTRE MÉTHODE */}
          <div
            id="methode-cstmed"
            className="scroll-mt-40 mt-16 overflow-hidden rounded-[2rem] bg-[#082a43] p-7 text-white sm:p-10"
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
              {
                content.methodEyebrow
              }
            </p>

            <h2 className="mt-4 max-w-4xl text-3xl font-black sm:text-4xl">
              {
                home.method.title
              }
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-slate-300">
              {
                home.method
                  .description
              }
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {home.method.steps.map(
                (step) => (
                  <article
                    key={
                      step.number
                    }
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#65d9ce] font-black text-[#082a43]">
                      {
                        step.number
                      }
                    </span>

                    <h3 className="mt-5 text-xl font-black">
                      {
                        step.title
                      }
                    </h3>

                    <p className="mt-3 leading-7 text-slate-300">
                      {
                        step.description
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          4 — POUR LES ÉTABLISSEMENTS
      =================================== */}
      <div id="etablissements">
        <HomeEstablishmentsSection
          locale={lang}
        />
      </div>

      {/* ===================================
          5 — CONTACT
      =================================== */}
      <HomeContactSection
        locale={lang}
      />

      <SiteFooter
        locale={lang}
        labels={
          dictionary.common
        }
      />
    </main>
  );
}