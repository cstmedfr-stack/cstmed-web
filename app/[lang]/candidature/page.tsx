import Link from "next/link";
import { notFound } from "next/navigation";
import { CvFileInput } from "@/components/public/cv-file-input";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";

import { submitApplication } from "./actions";
import { SubmitApplicationButton } from "./submit-button";

export const dynamic = "force-dynamic";

type ApplicationPageProps = {
  params: Promise<{
    lang: string;
  }>;

  searchParams: Promise<{
    jobId?: string | string[];
    error?: string | string[];
  }>;
};

type SelectedJob = {
  id: string;
  title: string;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const inputClassName =
  "mt-2 min-h-[52px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition placeholder:text-slate-400 focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

function getSearchParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ApplicationPage({
  params,
  searchParams,
}: ApplicationPageProps) {
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

  const requestedJobId =
    getSearchParameter(
      query.jobId,
    );

  const errorMessage =
    getSearchParameter(
      query.error,
    );

  const supabase =
    await createClient();

  let selectedJob:
    SelectedJob | null = null;

  let selectedJobTitle:
    string | null = null;

  if (
    requestedJobId &&
    uuidPattern.test(
      requestedJobId,
    )
  ) {
    const { data } =
      await supabase
        .from("jobs")
        .select(
          `
            id,
            title,
            specialty,
            location_label,
            city
          `,
        )
        .eq(
          "id",
          requestedJobId,
        )
        .eq(
          "status",
          "published",
        )
        .maybeSingle();

    selectedJob =
      data as SelectedJob | null;

    if (selectedJob) {
      selectedJobTitle =
        selectedJob.title;

      if (lang === "ro") {
        const {
          data: translation,
        } = await supabase
          .from(
            "job_translations",
          )
          .select("title")
          .eq(
            "job_id",
            selectedJob.id,
          )
          .eq("locale", "ro")
          .eq(
            "status",
            "published",
          )
          .maybeSingle();

        if (
          translation?.title
        ) {
          selectedJobTitle =
            translation.title;
        }
      }
    }
  }

  const selectedLocation =
    selectedJob?.location_label ||
    selectedJob?.city ||
    null;

  const content =
    lang === "ro"
      ? {
          eyebrow:
            "Candidatură medicală",

          heroTitle:
            "Proiectul tău medical începe aici",

          heroText:
            "Trimite-ne profilul tău și CV-ul. Analizăm candidatura și revenim către tine pentru a discuta proiectul profesional și oportunitățile potrivite.",

          responseLabel:
            "Răspuns rapid",

          responseValue:
            "în maximum 24 h",

          confidentialLabel:
            "Confidențial",

          confidentialValue:
            "CV-ul tău nu este public",

          supportLabel:
            "Sprijin CSTMed",

          supportValue:
            "până la instalarea în Franța",

          formTitle:
            "Completează candidatura",

          formIntro:
            "Câmpurile marcate cu * sunt obligatorii.",

          step1:
            "Date personale",

          step1Number:
            "01",

          step2:
            "Profil profesional",

          step2Number:
            "02",

          step3:
            "CV și mesaj",

          step3Number:
            "03",

          selectedEyebrow:
            "Aplici pentru această ofertă",

          spontaneousEyebrow:
            "Candidatură spontană",

          spontaneousText:
            "Nu ai selectat o ofertă. Profilul tău poate fi analizat pentru oportunități care corespund specialității și criteriilor tale.",

          change:
            "Vezi alte oferte",

          whyTitle:
            "Ce se întâmplă după trimitere?",

          whyItems: [
            "Analizăm profilul și CV-ul tău.",
            "Te contactăm pentru a înțelege proiectul profesional.",
            "Îți prezentăm oportunitățile potrivite.",
            "Te însoțim în etapele de recrutare și instalare.",
          ],

          privacyTitle:
            "Datele tale sunt protejate",

          privacyText:
            "CV-ul și informațiile transmise nu sunt publice și sunt utilizate numai pentru analizarea profilului și gestionarea oportunităților profesionale.",

          associated:
            "Candidatura va fi asociată automat acestei oferte.",
        }
      : {
          eyebrow:
            "Candidature médicale",

          heroTitle:
            "Votre projet médical commence ici",

          heroText:
            "Envoyez-nous votre profil et votre CV. Nous analysons votre candidature et revenons vers vous afin d’échanger sur votre projet professionnel et les opportunités adaptées.",

          responseLabel:
            "Réponse rapide",

          responseValue:
            "sous 24 h maximum",

          confidentialLabel:
            "Confidentiel",

          confidentialValue:
            "Votre CV n’est pas public",

          supportLabel:
            "Accompagnement CSTMed",

          supportValue:
            "jusqu’à votre installation en France",

          formTitle:
            "Complétez votre candidature",

          formIntro:
            "Les champs marqués d’un * sont obligatoires.",

          step1:
            "Informations personnelles",

          step1Number:
            "01",

          step2:
            "Profil professionnel",

          step2Number:
            "02",

          step3:
            "CV et message",

          step3Number:
            "03",

          selectedEyebrow:
            "Vous postulez à cette offre",

          spontaneousEyebrow:
            "Candidature spontanée",

          spontaneousText:
            "Vous n’avez pas sélectionné d’offre. Votre profil pourra être étudié pour des opportunités correspondant à votre spécialité et à vos critères.",

          change:
            "Voir d’autres offres",

          whyTitle:
            "Que se passe-t-il après l’envoi ?",

          whyItems: [
            "Nous analysons votre profil et votre CV.",
            "Nous vous contactons pour comprendre votre projet professionnel.",
            "Nous vous présentons les opportunités adaptées.",
            "Nous vous accompagnons dans les étapes de recrutement et d’installation.",
          ],

          privacyTitle:
            "Vos données sont protégées",

          privacyText:
            "Votre CV et les informations transmises ne sont pas publics et sont utilisés uniquement pour l’étude de votre profil et la gestion des opportunités professionnelles.",

          associated:
            "Votre candidature sera automatiquement associée à cette offre.",
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
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#65d9ce]/10 blur-3xl" />

        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#0D6EFD]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-16">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8eeae1]">
              {content.eyebrow}
            </p>

            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              {content.heroTitle}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {content.heroText}
            </p>

            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {
                    content.responseLabel
                  }
                </p>

                <p className="mt-1 font-black">
                  {
                    content.responseValue
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {
                    content.confidentialLabel
                  }
                </p>

                <p className="mt-1 font-black">
                  {
                    content.confidentialValue
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8eeae1]">
                  {
                    content.supportLabel
                  }
                </p>

                <p className="mt-1 font-black">
                  {
                    content.supportValue
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAR */}
      <section className="relative z-20 -mt-14 px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {errorMessage ? (
              <div
                role="alert"
                className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-5 text-red-700 shadow-sm"
              >
                <p className="font-black">
                  {lang === "ro"
                    ? "Candidatura nu a fost trimisă."
                    : "La candidature n’a pas été envoyée."}
                </p>

                <p className="mt-2">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            <form
              action={
                submitApplication
              }
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-9"
            >
              <input
                type="hidden"
                name="locale"
                value={lang}
              />

              {selectedJob ? (
                <input
                  type="hidden"
                  name="jobId"
                  value={
                    selectedJob.id
                  }
                />
              ) : null}

              {/* Honeypot anti-bot */}
              <div
                aria-hidden="true"
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor="website">
                  Website
                </label>

                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="border-b border-slate-200 pb-7">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#118c87]">
                  CSTMed
                </p>

                <h2 className="mt-3 text-3xl font-black text-[#082a43]">
                  {
                    content.formTitle
                  }
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  {
                    content.formIntro
                  }
                </p>
              </div>

              {/* 01 */}
              <section className="mt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                    {
                      content.step1Number
                    }
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {
                      content.step1
                    }
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {
                        labels.firstName
                      }{" "}
                      *
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      maxLength={100}
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {
                        labels.lastName
                      }{" "}
                      *
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      maxLength={100}
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.email} *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.phone} *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={50}
                      placeholder="+40..."
                      className={
                        inputClassName
                      }
                    />
                  </div>
                </div>
              </section>

              {/* 02 */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5f7f5] text-sm font-black text-[#0c7773]">
                    {
                      content.step2Number
                    }
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {
                      content.step2
                    }
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {
                        labels.specialty
                      }{" "}
                      *
                    </label>

                    <input
                      id="specialty"
                      name="specialty"
                      type="text"
                      required
                      maxLength={150}
                      defaultValue={
                        selectedJob
                          ?.specialty ??
                        ""
                      }
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {
                        labels.country
                      }
                    </label>

                    <input
                      id="country"
                      name="country"
                      type="text"
                      autoComplete="country-name"
                      maxLength={100}
                      defaultValue={
                        lang === "ro"
                          ? "România"
                          : "Roumanie"
                      }
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.city}
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      maxLength={120}
                      className={
                        inputClassName
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="frenchLevel"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {
                        labels.frenchLevel
                      }
                    </label>

                    <select
                      id="frenchLevel"
                      name="frenchLevel"
                      defaultValue=""
                      className={
                        inputClassName
                      }
                    >
                      <option value="">
                        {
                          labels.chooseLevel
                        }
                      </option>

                      <option value="none">
                        {
                          labels.levels.none
                        }
                      </option>

                      <option value="a1">
                        {
                          labels.levels.a1
                        }
                      </option>

                      <option value="a2">
                        {
                          labels.levels.a2
                        }
                      </option>

                      <option value="b1">
                        {
                          labels.levels.b1
                        }
                      </option>

                      <option value="b2">
                        {
                          labels.levels.b2
                        }
                      </option>

                      <option value="c1">
                        {
                          labels.levels.c1
                        }
                      </option>

                      <option value="c2">
                        {
                          labels.levels.c2
                        }
                      </option>

                      <option value="native">
                        {
                          labels.levels.native
                        }
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                    {
                      content.step3Number
                    }
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {
                      content.step3
                    }
                  </h2>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.message}
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      maxLength={5000}
                      placeholder={
                        labels.messagePlaceholder
                      }
                      className={`${inputClassName} resize-y leading-7`}
                    />
                  </div>

                 <CvFileInput
  locale={lang}
  label={labels.cv}
  help={labels.cvHelp}
/>

                  <div className="rounded-[1.5rem] border border-[#9fded8] bg-[#e5f7f5] p-5">
                    <p className="text-sm leading-6 text-slate-700">
                      {
                        labels.privacySummary
                      }
                    </p>

                    <Link
                      href={`/${lang}/confidentialite`}
                      target="_blank"
                      className="mt-3 inline-flex text-sm font-black text-[#0c7773] underline underline-offset-4"
                    >
                      {
                        labels.privacyLink
                      }{" "}
                      ↗
                    </Link>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-5 transition hover:border-[#118c87]/40">
                    <input
                      name="consent"
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 shrink-0 accent-[#118c87]"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {labels.consent} *
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[#118c87]/40">
                    <input
                      name="talentPoolConsent"
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[#118c87]"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {
                        labels.talentPoolConsent
                      }
                    </span>
                  </label>
                </div>
              </section>

              <div className="mt-9 border-t border-slate-200 pt-7">
                <SubmitApplicationButton
                  label={labels.submit}
                  pendingLabel={
                    labels.submitting
                  }
                />
              </div>
            </form>
          </div>

          {/* COLOANA DREAPTĂ */}
          <aside className="h-fit space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[2rem] bg-[#082a43] text-white shadow-2xl shadow-slate-900/20">
              <div className="p-7">
                <p className="text-sm font-black uppercase tracking-[0.15em] text-[#65d9ce]">
                  {selectedJob
                    ? content.selectedEyebrow
                    : content.spontaneousEyebrow}
                </p>

                {selectedJob ? (
                  <>
                    <h2 className="mt-4 text-2xl font-black leading-tight">
                      {
                        selectedJobTitle
                      }
                    </h2>

                    {selectedJob.specialty ? (
                      <span className="mt-4 inline-flex rounded-full bg-[#65d9ce] px-3 py-1.5 text-xs font-black text-[#082a43]">
                        {
                          selectedJob.specialty
                        }
                      </span>
                    ) : null}

                    {selectedLocation ? (
                      <p className="mt-4 flex items-center gap-2 text-slate-300">
                        <span aria-hidden="true">
                          📍
                        </span>

                        {
                          selectedLocation
                        }
                      </p>
                    ) : null}

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs leading-5 text-slate-300">
                        {
                          content.associated
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 leading-7 text-slate-300">
                    {
                      content.spontaneousText
                    }
                  </p>
                )}

                <Link
                  href={`/${lang}/offres`}
                  className="mt-6 inline-flex rounded-full border border-white/25 px-5 py-2.5 text-sm font-black transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
                >
                  ← {content.change}
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#082a43]">
                {
                  content.whyTitle
                }
              </h2>

              <div className="mt-5 space-y-4">
                {content.whyItems.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={item}
                      className="flex gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5f7f5] text-xs font-black text-[#0c7773]">
                        {index + 1}
                      </span>

                      <p className="pt-0.5 text-sm leading-6 text-slate-600">
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-[#e5f7f5] to-[#eef4ff] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#118c87] text-xl text-white">
                ✓
              </div>

              <h2 className="mt-4 font-black text-[#082a43]">
                {
                  content.privacyTitle
                }
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {
                  content.privacyText
                }
              </p>
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