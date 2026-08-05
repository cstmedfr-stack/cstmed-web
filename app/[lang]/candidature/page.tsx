import Link from "next/link";
import { notFound } from "next/navigation";

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
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

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
  const dictionary = getDictionary(lang);
  const labels = dictionary.application;

  const query = await searchParams;

  const requestedJobId =
    getSearchParameter(query.jobId);

  const errorMessage =
    getSearchParameter(query.error);

  const supabase = await createClient();

  let selectedJob: SelectedJob | null = null;
  let selectedJobTitle: string | null = null;

  if (
    requestedJobId &&
    uuidPattern.test(requestedJobId)
  ) {
    const { data } = await supabase
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
      .eq("id", requestedJobId)
      .eq("status", "published")
      .maybeSingle();

    selectedJob = data as SelectedJob | null;

    if (selectedJob) {
      selectedJobTitle = selectedJob.title;

      if (lang === "ro") {
        const { data: translation } =
          await supabase
            .from("job_translations")
            .select("title")
            .eq("job_id", selectedJob.id)
            .eq("locale", "ro")
            .eq("status", "published")
            .maybeSingle();

        if (translation?.title) {
          selectedJobTitle = translation.title;
        }
      }
    }
  }

  const selectedLocation =
    selectedJob?.location_label ||
    selectedJob?.city ||
    null;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={lang}
        labels={dictionary.common}
      />

      <section className="bg-gradient-to-br from-[#082a43] via-[#0c3c5d] to-[#11696d] px-5 py-16 text-white sm:px-8">
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

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {errorMessage ? (
              <div
                role="alert"
                className="mb-7 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700"
              >
                <p className="font-bold">
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
              action={submitApplication}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
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
                  value={selectedJob.id}
                />
              ) : null}

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

              <p className="text-sm text-slate-500">
                {labels.requiredNotice}
              </p>

              <section className="mt-7">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.personalSection}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-bold"
                    >
                      {labels.firstName} *
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      maxLength={100}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-bold"
                    >
                      {labels.lastName} *
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      maxLength={100}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold"
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
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold"
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
                      className={inputClassName}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.professionalSection}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-bold"
                    >
                      {labels.specialty} *
                    </label>

                    <input
                      id="specialty"
                      name="specialty"
                      type="text"
                      required
                      maxLength={150}
                      defaultValue={
                        selectedJob?.specialty ?? ""
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-bold"
                    >
                      {labels.country}
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
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-bold"
                    >
                      {labels.city}
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      maxLength={120}
                      className={inputClassName}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="frenchLevel"
                      className="block text-sm font-bold"
                    >
                      {labels.frenchLevel}
                    </label>

                    <select
                      id="frenchLevel"
                      name="frenchLevel"
                      defaultValue=""
                      className={inputClassName}
                    >
                      <option value="">
                        {labels.chooseLevel}
                      </option>

                      <option value="none">
                        {labels.levels.none}
                      </option>

                      <option value="a1">
                        {labels.levels.a1}
                      </option>

                      <option value="a2">
                        {labels.levels.a2}
                      </option>

                      <option value="b1">
                        {labels.levels.b1}
                      </option>

                      <option value="b2">
                        {labels.levels.b2}
                      </option>

                      <option value="c1">
                        {labels.levels.c1}
                      </option>

                      <option value="c2">
                        {labels.levels.c2}
                      </option>

                      <option value="native">
                        {labels.levels.native}
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.documentSection}
                </h2>

                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold"
                    >
                      {labels.message}
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={7}
                      maxLength={5000}
                      placeholder={
                        labels.messagePlaceholder
                      }
                      className={`${inputClassName} resize-y leading-7`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cv"
                      className="block text-sm font-bold"
                    >
                      {labels.cv} *
                    </label>

                    <input
                      id="cv"
                      name="cv"
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="mt-2 block w-full rounded-2xl border border-dashed border-slate-300 bg-[#f8fbfc] px-4 py-5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#118c87] file:px-5 file:py-2.5 file:font-bold file:text-white"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      {labels.cvHelp}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f8fbfc] p-5">
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
                </div>
              </section>

              <div className="mt-8 flex justify-end border-t border-slate-200 pt-7">
                <SubmitApplicationButton
                  label={labels.submit}
                  pendingLabel={labels.submitting}
                />
              </div>
            </form>
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-28">
            <div className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#65d9ce]">
                {selectedJob
                  ? labels.selectedJob
                  : labels.spontaneous}
              </p>

              {selectedJob ? (
                <>
                  <h2 className="mt-4 text-2xl font-bold">
                    {selectedJobTitle}
                  </h2>

                  {selectedLocation ? (
                    <p className="mt-3 text-slate-300">
                      📍 {selectedLocation}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 leading-7 text-slate-300">
                  {lang === "ro"
                    ? "Profilul tău va putea fi analizat pentru viitoare oportunități potrivite specialității și criteriilor tale."
                    : "Votre profil pourra être étudié pour de futures opportunités correspondant à votre spécialité et à vos critères."}
                </p>
              )}

              <Link
                href={`/${lang}/offres`}
                className="mt-6 inline-flex rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold hover:bg-white/10"
              >
                {labels.changeJob}
              </Link>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-[#082a43]">
                CSTMed
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {lang === "ro"
                  ? "Informațiile și CV-ul nu sunt publice. Acestea vor fi utilizate numai pentru analizarea profilului și gestionarea oportunităților profesionale."
                  : "Vos informations et votre CV ne sont pas publics. Ils seront utilisés uniquement pour l’étude de votre profil et la gestion des opportunités professionnelles."}
              </p>
            </div>
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