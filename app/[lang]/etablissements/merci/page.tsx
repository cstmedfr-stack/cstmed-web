import Link from "next/link";
import { notFound } from "next/navigation";

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

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function EstablishmentSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const locale: Locale =
    requestedLang;

  const dictionary =
    getDictionary(locale);

  const query =
    await searchParams;

  const reference =
    getParameter(
      query.reference,
    );

  const shortReference =
    reference
      ? reference
          .replaceAll("-", "")
          .slice(0, 10)
          .toUpperCase()
      : null;

  const content =
    locale === "ro"
      ? {
          eyebrow:
            "Solicitare transmisă",

          title:
            "Mulțumim! Solicitarea dumneavoastră a fost înregistrată.",

          intro:
            "Echipa CSTMed va analiza nevoia de recrutare și va reveni către dumneavoastră pentru a valida profilul căutat și următorii pași.",

          responseLabel:
            "Primul răspuns",

          responseValue:
            "în maximum 24 h lucrătoare",

          profilesLabel:
            "Primele profiluri",

          profilesValue:
            "posibile în maximum 48 h*",

          contactLabel:
            "Interlocutor",

          contactValue:
            "CSTMed dedicat solicitării",

          nextTitle:
            "Ce urmează?",

          steps: [
            {
              number: "01",
              title:
                "Analizăm solicitarea",
              text:
                "Verificăm specialitatea, numărul de posturi, localizarea și criteriile transmise.",
            },
            {
              number: "02",
              title:
                "Vă contactăm",
              text:
                "Revenim către dumneavoastră pentru a clarifica profilul și condițiile postului.",
            },
            {
              number: "03",
              title:
                "Identificăm profilurile potrivite",
              text:
                "Căutăm și selectăm candidați compatibili cu nevoia dumneavoastră.",
            },
            {
              number: "04",
              title:
                "Vă însoțim în recrutare",
              text:
                "CSTMed rămâne interlocutorul dumneavoastră pe parcursul selecției și al etapelor următoare.",
            },
          ],

          referenceLabel:
            "Referința solicitării",

          referenceHelp:
            "Păstrați această referință pentru eventualele schimburi cu CSTMed.",

          newRequest:
            "Trimite o nouă solicitare",

          home:
            "Înapoi la pagina principală",

          contactTitle:
            "Aveți nevoie să discutăm direct?",

          contactText:
            "Ne puteți contacta pentru informații suplimentare despre recrutare sau despre solicitarea transmisă.",

          call:
            "Sună CSTMed",

          email:
            "Scrie-ne",

          caveat:
            "* În funcție de specialitate, criteriile solicitate și disponibilitatea profilurilor.",
        }
      : {
          eyebrow:
            "Demande transmise",

          title:
            "Merci ! Votre demande a bien été enregistrée.",

          intro:
            "L’équipe CSTMed va analyser votre besoin de recrutement et reviendra vers vous afin de valider le profil recherché et les prochaines étapes.",

          responseLabel:
            "Premier retour",

          responseValue:
            "sous 24 h ouvrées maximum",

          profilesLabel:
            "Premiers profils",

          profilesValue:
            "possibles sous 48 h*",

          contactLabel:
            "Interlocuteur",

          contactValue:
            "CSTMed dédié à votre demande",

          nextTitle:
            "Que se passe-t-il maintenant ?",

          steps: [
            {
              number: "01",
              title:
                "Nous analysons votre demande",
              text:
                "Nous examinons la spécialité, le nombre de postes, la localisation et les critères transmis.",
            },
            {
              number: "02",
              title:
                "Nous vous contactons",
              text:
                "Nous revenons vers vous afin de préciser le profil recherché et les conditions du poste.",
            },
            {
              number: "03",
              title:
                "Nous identifions les profils adaptés",
              text:
                "Nous recherchons et sélectionnons des candidats correspondant à votre besoin.",
            },
            {
              number: "04",
              title:
                "Nous vous accompagnons dans le recrutement",
              text:
                "CSTMed reste votre interlocuteur pendant la sélection et les étapes suivantes.",
            },
          ],

          referenceLabel:
            "Référence de votre demande",

          referenceHelp:
            "Conservez cette référence pour vos éventuels échanges avec CSTMed.",

          newRequest:
            "Envoyer une nouvelle demande",

          home:
            "Retour à l’accueil",

          contactTitle:
            "Besoin d’échanger directement ?",

          contactText:
            "Vous pouvez nous contacter pour toute information complémentaire concernant votre recrutement ou votre demande.",

          call:
            "Appeler CSTMed",

          email:
            "Nous écrire",

          caveat:
            "* Selon la spécialité, les critères recherchés et la disponibilité des profils.",
        };

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={locale}
        labels={dictionary.common}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#65d9ce]/10 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#0D6EFD]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-16">
          <div className="max-w-5xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl text-[#8eeae1] shadow-xl backdrop-blur-sm">
              ✓
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-[#8eeae1]">
              {content.eyebrow}
            </p>

            <h1 className="mt-4 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
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
                  {content.profilesLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.profilesValue}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {content.contactLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.contactValue}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-300">
              {content.caveat}
            </p>
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
              {content.steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f7f5] text-sm font-black text-[#0c7773]">
                    {step.number}
                  </span>

                  <h3 className="mt-4 text-lg font-black text-[#082a43]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 border-t border-slate-200 pt-7 sm:flex-row">
              <Link
                href={`/${locale}/etablissements`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#0D6EFD] px-7 py-3 font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
              >
                {content.newRequest}

                <span
                  className="ml-2"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>

              <Link
                href={`/${locale}`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3 font-black text-[#082a43] transition hover:border-[#118c87] hover:text-[#118c87]"
              >
                ← {content.home}
              </Link>
            </div>
          </div>

          {/* COLOANA DREAPTĂ */}
          <aside className="h-fit space-y-5">
            {shortReference ? (
              <div className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                  {content.referenceLabel}
                </p>

                <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-center">
                  <p className="font-mono text-2xl font-black tracking-[0.12em] text-white">
                    {shortReference}
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-300">
                  {content.referenceHelp}
                </p>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e5f7f5] text-lg text-[#118c87]">
                ☎
              </div>

              <h2 className="mt-4 text-xl font-black text-[#082a43]">
                {content.contactTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {content.contactText}
              </p>

              <a
                href="tel:+33628262576"
                className="mt-5 flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#118c87] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c7773]"
              >
                {content.call}
              </a>

              <a
                href="mailto:contact@cstmed.fr"
                className="mt-3 flex min-h-[46px] w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-[#082a43] transition hover:border-[#118c87] hover:text-[#118c87]"
              >
                {content.email}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter
        locale={locale}
        labels={dictionary.common}
      />
    </main>
  );
}