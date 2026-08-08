import Link from "next/link";
import { notFound } from "next/navigation";
import { publicLinks } from "@/lib/site/public-links";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";

type SuccessPageProps = {
  params: Promise<{
    lang: string;
  }>;

  searchParams: Promise<{
    reference?: string | string[];
  }>;
};

function getSearchParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ApplicationSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const lang: Locale = requestedLang;

  const dictionary =
    getDictionary(lang);

  const labels =
    dictionary.application;

  const query =
    await searchParams;

  const completeReference =
    getSearchParameter(
      query.reference,
    );

  const shortReference =
    completeReference
      ? completeReference
          .replaceAll("-", "")
          .slice(0, 10)
          .toUpperCase()
      : null;

  const content =
    lang === "ro"
      ? {
          eyebrow:
            "Candidatură transmisă",

          title:
            "Mulțumim! Candidatura ta a fost înregistrată.",

          intro:
            "Am primit informațiile și CV-ul tău. Echipa CSTMed va analiza profilul și va reveni către tine pentru următoarele etape.",

          responseLabel:
            "Primul răspuns",

          responseValue:
            "în maximum 24 h",

          confidentialLabel:
            "Confidențialitate",

          confidentialValue:
            "CV-ul tău nu este public",

          supportLabel:
            "Sprijin CSTMed",

          supportValue:
            "pe parcursul întregului proiect",

          nextTitle:
            "Ce urmează?",

          steps: [
            {
              number: "01",
              title:
                "Analizăm candidatura",
              text:
                "Verificăm profilul profesional, specialitatea și informațiile transmise.",
            },
            {
              number: "02",
              title:
                "Te contactăm",
              text:
                "Revenim către tine pentru a discuta disponibilitatea, criteriile și proiectul profesional.",
            },
            {
              number: "03",
              title:
                "Identificăm oportunitățile potrivite",
              text:
                "Dacă profilul corespunde, discutăm posturile care se potrivesc obiectivelor tale.",
            },
            {
              number: "04",
              title:
                "Te însoțim în continuare",
              text:
                "CSTMed rămâne alături de tine în etapele de recrutare și instalare în Franța.",
            },
          ],

          referenceLabel:
            "Referința candidaturii",

          referenceHelp:
            "Poți păstra această referință pentru eventualele schimburi cu CSTMed.",

          home:
            "Înapoi la pagina principală",

          jobs:
            "Vezi ofertele disponibile",

          contact:
            "Ai o întrebare?",

          contactText:
            "Ne poți contacta direct dacă ai nevoie de informații suplimentare despre candidatura ta.",

          call:
            "Sună CSTMed",
        }
      : {
          eyebrow:
            "Candidature envoyée",

          title:
            "Merci ! Votre candidature a bien été enregistrée.",

          intro:
            "Nous avons bien reçu vos informations et votre CV. L’équipe CSTMed va étudier votre profil et reviendra vers vous pour la suite.",

          responseLabel:
            "Premier retour",

          responseValue:
            "sous 24 h maximum",

          confidentialLabel:
            "Confidentialité",

          confidentialValue:
            "Votre CV n’est pas public",

          supportLabel:
            "Accompagnement CSTMed",

          supportValue:
            "tout au long de votre projet",

          nextTitle:
            "Que se passe-t-il maintenant ?",

          steps: [
            {
              number: "01",
              title:
                "Nous étudions votre candidature",
              text:
                "Nous examinons votre profil professionnel, votre spécialité et les informations transmises.",
            },
            {
              number: "02",
              title:
                "Nous vous contactons",
              text:
                "Nous revenons vers vous afin d’échanger sur votre disponibilité, vos critères et votre projet professionnel.",
            },
            {
              number: "03",
              title:
                "Nous identifions les opportunités adaptées",
              text:
                "Lorsque votre profil correspond, nous échangeons sur les postes adaptés à vos objectifs.",
            },
            {
              number: "04",
              title:
                "Nous restons à vos côtés",
              text:
                "CSTMed vous accompagne ensuite dans les étapes de recrutement et d’installation en France.",
            },
          ],

          referenceLabel:
            "Référence de votre candidature",

          referenceHelp:
            "Vous pouvez conserver cette référence pour vos échanges éventuels avec CSTMed.",

          home:
            "Retour à l’accueil",

          jobs:
            "Voir les offres disponibles",

          contact:
            "Une question ?",

          contactText:
            "Vous pouvez nous contacter directement si vous avez besoin d’informations complémentaires concernant votre candidature.",

          call:
            "Appeler CSTMed",
        };

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={lang}
        labels={
          dictionary.common
        }
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#65d9ce]/10 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#0D6EFD]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-16">
          <div className="max-w-4xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl text-[#8eeae1] shadow-xl backdrop-blur-sm">
              ✓
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-[#8eeae1]">
              {content.eyebrow}
            </p>

            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {content.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {content.intro}
            </p>

            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {content.responseLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.responseValue}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {content.confidentialLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.confidentialValue}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {content.supportLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.supportValue}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONȚINUT */}
      <section className="relative z-20 -mt-14 px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#118c87]">
              CSTMed
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#082a43]">
              {content.nextTitle}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.steps.map(
                (step) => (
                  <article
                    key={
                      step.number
                    }
                    className="rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f7f5] text-sm font-black text-[#0c7773]">
                      {
                        step.number
                      }
                    </span>

                    <h3 className="mt-4 text-lg font-black text-[#082a43]">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.text}
                    </p>
                  </article>
                ),
              )}
            </div>

            <div className="mt-9 flex flex-col gap-3 border-t border-slate-200 pt-7 sm:flex-row">
              <Link
                href={`/${lang}/offres`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#0D6EFD] px-7 py-3 font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
              >
                {content.jobs}
                <span
                  className="ml-2"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>

              <Link
                href={`/${lang}`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3 font-black text-[#082a43] transition hover:border-[#118c87] hover:text-[#118c87]"
              >
                ← {content.home}
              </Link>
            </div>
          </div>

          <aside className="h-fit space-y-5">
            {shortReference ? (
              <div className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                  {
                    content.referenceLabel
                  }
                </p>

                <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-center">
                  <p className="font-mono text-2xl font-black tracking-[0.12em] text-white">
                    {
                      shortReference
                    }
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-300">
                  {
                    content.referenceHelp
                  }
                </p>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e5f7f5] text-lg text-[#118c87]">
                ☎
              </div>

              <h2 className="mt-4 text-xl font-black text-[#082a43]">
                {content.contact}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {
                  content.contactText
                }
              </p>

              <a
                  href={`tel:${publicLinks.phoneRomaniaHref}`}
                  className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#118c87] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c7773]"
                >
                  {content.call}
                  <span className="ml-2">
                    {publicLinks.phoneRomaniaDisplay}
                  </span>
                </a>
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