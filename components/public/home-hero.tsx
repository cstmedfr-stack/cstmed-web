import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type HomeHeroProps = {
  locale: Locale;
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function HomeHero({
  locale,
}: HomeHeroProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow:
            "Recrutare medicală • Franța – Europa",

          titleStart:
            "Construiește-ți proiectul medical",

          titleAccent:
            "în Franța",

          description:
            "CSTMed conectează medicii europeni cu oportunități profesionale în Franța și îi sprijină de la identificarea postului până la instalare și integrare.",

          search: "Caută oferte",

          application:
            "Trimite CV-ul",

          establishments:
            "Reprezinți o unitate medicală?",

          establishmentsLink:
            "Descrie nevoia de recrutare",

          responseValue: "24 h",
          responseLabel:
            "Răspuns la solicitări",

          profilesValue: "100%",
profilesLabel:
  "Servicii gratuite pentru medici",

          imageEyebrow:
            "CSTMed • Sprijin personalizat",

          imageText:
            "Un singur interlocutor pentru proiectul tău profesional în Franța.",

          note:
         "Fără taxe CSTMed de dosar, intermediere sau însoțire pentru medici.",
        }
      : {
          eyebrow:
            "Recrutement médical • France – Europe",

          titleStart:
            "Construisez votre projet médical",

          titleAccent:
            "en France",

          description:
            "CSTMed met en relation les médecins européens avec des opportunités professionnelles en France et les accompagne de la recherche du poste jusqu’à l’installation et l’intégration.",

          search:
            "Recherche d’offres",

          application:
            "Envoyer mon CV",

          establishments:
            "Vous représentez un établissement ?",

          establishmentsLink:
            "Décrire votre besoin de recrutement",

          responseValue: "24 h",
          responseLabel:
            "Réponse aux demandes",

          profilesValue: "100%",
          profilesLabel:
            "Services gratuits pour les médecins",

          imageEyebrow:
            "CSTMed • Accompagnement personnalisé",

          imageText:
            "Un interlocuteur unique pour votre projet professionnel en France.",

         note:
          "Aucun frais CSTMed de dossier, de mise en relation ou d’accompagnement pour les médecins.",
        };

  return (
    <section className="relative overflow-hidden bg-[#f5f9fb]">
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_12%_20%,rgba(17,140,135,0.10),transparent_34%)]" />

<div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-9 sm:px-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-11">
        <div className="relative z-10">
          <div className="inline-flex rounded-full border border-[#118c87]/25 bg-[#e5f7f5] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#0c7773]">
            {content.eyebrow}
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-[#082a43] sm:text-5xl xl:text-[3.7rem]">
            {content.titleStart}{" "}
            <span className="text-[#0965d8]">
              {content.titleAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/offres`}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#0D6EFD] px-8 py-4 text-center font-black uppercase tracking-[0.04em] text-[#082A43] shadow-xl shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
            >
              <SearchIcon />

              {content.search}
            </Link>

            <Link
              href={`/${locale}/candidature`}
              className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-[#118c87] bg-white px-8 py-4 text-center font-bold text-[#0c7773] transition hover:bg-[#e5f7f5]"
            >
              {content.application}
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <p className="text-3xl font-black text-[#118c87]">
                {content.responseValue}
              </p>

              <p className="mt-1 text-sm font-bold leading-5 text-[#082a43]">
                {content.responseLabel}
              </p>
            </div>

            <div className="border-l border-slate-200 p-5 sm:p-6">
            <p className="text-3xl font-black text-[#118c87]">
              {content.profilesValue}
            </p>

              <p className="mt-1 text-sm font-bold leading-5 text-[#082a43]">
                {content.profilesLabel}
              </p>
            </div>
          </div>

          <p className="mt-3 max-w-xl text-xs leading-5 text-slate-400">
            {content.note}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="font-semibold text-slate-600">
              {content.establishments}
            </span>

            <Link
              href={`/${locale}/etablissements`}
              className="font-black text-[#118c87] underline decoration-[#118c87]/30 underline-offset-4 hover:decoration-[#118c87]"
            >
              {content.establishmentsLink} →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-7 -top-7 h-28 w-28 rounded-full bg-[#65d9ce]/25 blur-2xl" />

          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#0965d8]/15 blur-3xl" />

           <div className="relative min-h-[450px] overflow-hidden rounded-[2.2rem] border border-white bg-white shadow-2xl sm:min-h-[530px]">
            <Image
              src="/images/home/hero-cstmed.png"
              alt={
                locale === "ro"
                  ? "Sprijin CSTMed pentru medicii care doresc să lucreze în Franța"
                  : "Accompagnement CSTMed pour les médecins souhaitant exercer en France"
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#061f33]/75 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/20 bg-[#061f33]/88 p-5 text-white shadow-xl backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                {content.imageEyebrow}
              </p>

              <p className="mt-2 max-w-lg text-lg font-bold leading-7">
                {content.imageText}
              </p>
            </div>
          </div>

          <div className="absolute -left-5 top-8 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl xl:block">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              CSTMed
            </p>

            <p className="mt-1 font-black text-[#082a43]">
              France 🇫🇷
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}