import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import {  isLocale,  type Locale,} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  defaultSocialImage,
  getOpenGraphLocale,
  seoContent,
  siteName,
  siteUrl,
} from "@/lib/seo/site";



type HomePageProps = {
  params: Promise<{
    lang: string;
  }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { lang: requestedLang } = await params;

  if (!isLocale(requestedLang)) {
    return {};
  }

  const locale: Locale = requestedLang;
  const content = seoContent[locale].home;
  const canonicalPath = `/${locale}`;
  

  return {
    title: content.title,
    description: content.description,

    alternates: {
      canonical: canonicalPath,

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

    robots: {
      index: true,
      follow: true,
    },
  };
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#118c87] text-xs font-bold text-white">
      ✓
    </span>
  );
}

export default async function HomePage({
  params,
}: HomePageProps) {
  const { lang: requestedLang } = await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale = requestedLang;
  const dictionary = getDictionary(lang);
  const home = dictionary.home;
const serviceCommitments =
  lang === "ro"
    ? [
        {
          value: "24 h",
          title: "Răspuns rapid",
          text: "Răspundem solicitării tale în maximum 24 de ore lucrătoare.",
        },
        {
          value: "48 h",
          title: "Primele profiluri",
          text: "Unitățile medicale pot primi o primă selecție de profiluri în maximum 48 de ore, în funcție de disponibilitate.",
        },
        {
          value: "100%",
          title: "Sprijin personalizat",
          text: "Urmărim proiectul până la recrutare, instalare și integrare.",
        },
      ]
    : [
        {
          value: "24 h",
          title: "Réponse rapide",
          text: "Nous répondons à votre demande sous 24 heures ouvrées.",
        },
        {
          value: "48 h",
          title: "Premiers profils",
          text: "Une première sélection de profils peut être transmise sous 48 heures, selon la spécialité et les disponibilités.",
        },
        {
          value: "100%",
          title: "Suivi personnalisé",
          text: "Nous accompagnons le projet jusqu’au recrutement, à l’installation et à l’intégration.",
        },
      ];

const informationCards =
  lang== "ro"
    ? [
        {
          eyebrow: "Proiect profesional",
          title: "Lucrează ca medic în Franța",
          text: "Descoperă oportunitățile profesionale, condițiile generale de exercitare și sprijinul oferit de CSTMed.",
          href: `/${lang}/offres`,
          linkLabel: "Vezi ofertele",
        },
        {
          eyebrow: "Instalare",
          title: "Instalarea ca medic în Franța",
          text: "Te sprijinim pentru documente, înscrierea profesională, cazare și organizarea vieții de zi cu zi.",
          href: `/${lang}/candidature`,
          linkLabel: "Prezintă-ne proiectul tău",
        },
        {
          eyebrow: "Condiții profesionale",
          title: "Posturi, venituri și regiuni",
          text: "Condițiile diferă în funcție de specialitate, statut, unitatea medicală și regiunea aleasă.",
          href: `/${lang}/offres`,
          linkLabel: "Caută un post",
        },
      ]
    : [
        {
          eyebrow: "Projet professionnel",
          title: "Travailler comme médecin en France",
          text: "Découvrez les opportunités professionnelles, les principales conditions d’exercice et l’accompagnement CSTMed.",
          href: `/${lang}/offres`,
          linkLabel: "Voir les offres",
        },
        {
          eyebrow: "Installation",
          title: "S’installer comme médecin en France",
          text: "Nous vous accompagnons pour les documents, l’inscription professionnelle, le logement et les démarches du quotidien.",
          href: `/${lang}/candidature`,
          linkLabel: "Présenter mon projet",
        },
        {
          eyebrow: "Conditions professionnelles",
          title: "Postes, revenus et régions",
          text: "Les conditions varient selon la spécialité, le statut, l’établissement de santé et la région choisie.",
          href: `/${lang}/offres`,
          linkLabel: "Rechercher un poste",
        },
      ];

  return (
    <main className="min-h-screen bg-white text-[#102435]">
      <JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "CSTMed",
    url: siteUrl,

    logo: absoluteUrl(
      "/images/cstmed-logo.jpg",
    ),

    email: "contact@cstmed.fr",
    telephone: "+33628262576",

    areaServed: [
      {
        "@type": "Country",
        name: "France",
      },

      {
        "@type": "Country",
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
        labels={dictionary.common}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0c3c5d] to-[#11696d] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              {home.badge}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {home.title}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              {home.intro}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#medecins"
                className="rounded-full bg-[#65d9ce] px-7 py-3.5 text-center font-bold text-[#082a43]"
              >
                {home.doctorButton}
              </a>

              <a
                href="#etablissements"
                className="rounded-full border border-white/30 px-7 py-3.5 text-center font-bold"
              >
                {home.establishmentButton}
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-200">
              {home.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="flex items-center gap-2"
                >
                  <CheckIcon />
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl">
            <div className="rounded-[1.5rem] bg-white p-7 text-[#102435]">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                CSTMed
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#082a43]">
                {home.audiencesTitle}
              </h2>

              <div className="mt-7 space-y-4">
                {home.method.steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-4 rounded-2xl bg-[#f5f9fb] p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#118c87] font-bold text-white">
                      {step.number}
                    </span>

                    <div>
                      <p className="font-bold text-[#082a43]">
                        {step.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="relative z-10 -mt-6 px-5 sm:px-8">
  <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl md:grid-cols-3">
    {serviceCommitments.map(
      (commitment, index) => (
        <article
          key={commitment.title}
          className={`p-7 sm:p-8 ${
            index > 0
              ? "border-t border-slate-200 md:border-l md:border-t-0"
              : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-16 min-w-16 items-center justify-center rounded-2xl bg-[#e5f7f5] px-3 text-xl font-black text-[#118c87]">
              {commitment.value}
            </span>

            <h2 className="text-xl font-bold text-[#082a43]">
              {commitment.title}
            </h2>
          </div>

          <p className="mt-4 leading-7 text-slate-600">
            {commitment.text}
          </p>
        </article>
      ),
    )}
  </div>
</section>

<section className="px-5 py-16 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
        {lang === "ro"
          ? "Informații pentru medici"
          : "Informations pour les médecins"}
      </p>

      <h2 className="mt-4 text-3xl font-bold text-[#082a43] sm:text-4xl">
        {lang === "ro"
          ? "Pregătește-ți proiectul profesional în Franța"
          : "Préparez votre projet professionnel en France"}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {lang === "ro"
          ? "CSTMed îți oferă informații clare și sprijin personalizat în fiecare etapă."
          : "CSTMed vous apporte des informations claires et un accompagnement personnalisé à chaque étape."}
      </p>
    </div>

    <div className="mt-9 grid gap-6 lg:grid-cols-3">
      {informationCards.map(
        (card, index) => (
          <article
            key={card.title}
            className="group flex min-h-[310px] flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#118c87]">
                {card.eyebrow}
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f7f5] font-bold text-[#118c87]">
                {index + 1}
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-bold leading-tight text-[#082a43]">
              {card.title}
            </h3>

            <p className="mt-4 flex-1 leading-7 text-slate-600">
              {card.text}
            </p>

            <Link
              href={card.href}
              className="mt-7 inline-flex items-center font-bold text-[#0965d8] transition group-hover:gap-3"
            >
              {card.linkLabel}
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </article>
        ),
      )}
    </div>
  </div>
</section>

      <section
        id="medecins"
        className="scroll-mt-24 bg-[#f5f9fb] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
              {home.audiencesEyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold text-[#082a43] sm:text-4xl">
              {home.audiencesTitle}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {home.audiencesIntro}
            </p>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                {home.doctors.eyebrow}
              </p>

              <h3 className="mt-4 text-3xl font-bold text-[#082a43]">
                {home.doctors.title}
              </h3>

              <p className="mt-5 leading-7 text-slate-600">
                {home.doctors.description}
              </p>

              <ul className="mt-7 space-y-4">
                {home.doctors.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:contact@cstmed.fr"
                className="mt-8 inline-flex rounded-full bg-[#118c87] px-6 py-3 font-bold text-white"
              >
                {home.doctors.button}
              </a>
            </article>

            <article
              id="etablissements"
              className="scroll-mt-24 rounded-[2rem] bg-[#082a43] p-8 text-white shadow-xl"
            >
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
                {home.establishments.eyebrow}
              </p>

              <h3 className="mt-4 text-3xl font-bold">
                {home.establishments.title}
              </h3>

              <p className="mt-5 leading-7 text-slate-300">
                {home.establishments.description}
              </p>

              <ul className="mt-7 space-y-4">
                {home.establishments.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
  href={`/${lang}/etablissements`}
  className="mt-8 inline-flex rounded-full bg-[#65d9ce] px-6 py-3 font-bold text-[#082a43]"
>
  {home.establishments.button}
</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
            {home.expertise.eyebrow}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-[#082a43] sm:text-4xl">
            {home.expertise.title}
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.expertise.items.map((item) => (
              <article
                key={item.number}
                className="rounded-3xl border border-slate-200 p-7"
              >
                <span className="font-bold text-[#118c87]">
                  {item.number}
                </span>

                <h3 className="mt-5 text-xl font-bold text-[#082a43]">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="methode"
        className="scroll-mt-24 bg-[#082a43] px-5 py-20 text-white sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#65d9ce]">
            {home.method.eyebrow}
          </p>

          <h2 className="mt-4 max-w-4xl text-3xl font-bold sm:text-4xl">
            {home.method.title}
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-slate-300">
            {home.method.description}
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.method.steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#65d9ce] font-bold text-[#082a43]">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
              {home.specialties.eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold text-[#082a43] sm:text-4xl">
              {home.specialties.title}
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              {home.specialties.description}
            </p>

            <Link
              href={`/${lang}/offres`}
              className="mt-7 inline-flex rounded-full border border-[#118c87] px-6 py-3 font-bold text-[#118c87]"
            >
              {home.specialties.button}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {home.specialties.list.map((specialty) => (
              <div
                key={specialty}
                className="rounded-2xl border border-slate-200 bg-[#f8fbfc] px-5 py-4 font-semibold"
              >
                {specialty}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-r from-[#0b3a59] to-[#118c87] p-10 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8ce1d8]">
            {home.contact.eyebrow}
          </p>

          <h2 className="mt-4 max-w-4xl text-3xl font-bold sm:text-4xl">
            {home.contact.title}
          </h2>

          <p className="mt-5 max-w-2xl leading-8 text-slate-200">
            {home.contact.description}
          </p>

          <a
            href="mailto:contact@cstmed.fr"
            className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-[#082a43]"
          >
            contact@cstmed.fr
          </a>
        </div>
      </section>

      <SiteFooter
        locale={lang}
        labels={dictionary.common}
      />
    </main>
  );
}