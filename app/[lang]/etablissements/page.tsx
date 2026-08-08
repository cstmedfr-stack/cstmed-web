import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";

import {
  submitEstablishmentRequest,
} from "./actions";

import { SubmitButton } from "./submit-button";

export const dynamic = "force-dynamic";

type EstablishmentsPageProps = {
  params: Promise<{
    lang: string;
  }>;

  searchParams: Promise<{
    error?: string | string[];
  }>;
};

const inputClassName =
  "mt-2 min-h-[52px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition placeholder:text-slate-400 focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function EstablishmentsPage({
  params,
  searchParams,
}: EstablishmentsPageProps) {
  const { lang: requestedLang } =
    await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const locale: Locale =
    requestedLang;

  const dictionary =
    getDictionary(locale);

  const labels =
    dictionary.establishmentRequest;

  const query =
    await searchParams;

  const errorMessage =
    getParameter(query.error);

  const content =
    locale === "ro"
      ? {
          eyebrow:
            "Recrutare medicală pentru unități",

          heroTitle:
            "Găsiți medicii potriviți pentru unitatea dumneavoastră",

          heroText:
            "Spitale, clinici, centre de sănătate și cabinete medicale: spuneți-ne ce profil căutați, iar CSTMed vă însoțește în identificarea și selecția candidaților.",

          responseLabel:
            "Răspuns",

          responseValue:
            "în maximum 24 h lucrătoare",

          profilesLabel:
            "Primele profiluri",

          profilesValue:
            "posibil în maximum 48 h*",

          supportLabel:
            "Serviciu",

          supportValue:
            "interlocutor unic CSTMed",

          formTitle:
            "Descrieți-ne nevoia de recrutare",

          formIntro:
            "Câmpurile marcate cu * sunt obligatorii.",

          step1:
            "Unitatea medicală",

          step2:
            "Persoana de contact",

          step3:
            "Nevoia de recrutare",

          whyTitle:
            "Un proces simplu și rapid",

          whyItems: [
            "Analizăm nevoia și criteriile postului.",
            "Identificăm profiluri medicale compatibile.",
            "Vă prezentăm candidații relevanți.",
            "Rămânem interlocutor pe parcursul procesului de recrutare.",
          ],

          confidentialityTitle:
            "Schimburi confidențiale",

          confidentialityText:
            "Informațiile transmise prin formular sunt utilizate numai pentru analizarea solicitării și gestionarea recrutării.",

          contactTitle:
            "Preferi un contact direct?",

          contactText:
            "Poți discuta direct cu CSTMed despre recrutarea pe care o pregătești.",

          caveat:
            "* În funcție de specialitate, criterii și disponibilitatea profilurilor.",
        }
      : {
          eyebrow:
            "Recrutement médical pour établissements",

          heroTitle:
            "Trouvez les médecins adaptés aux besoins de votre établissement",

          heroText:
            "Hôpitaux, cliniques, centres de santé et cabinets médicaux : décrivez-nous le profil recherché et CSTMed vous accompagne dans l’identification et la sélection des candidats.",

          responseLabel:
            "Réponse",

          responseValue:
            "sous 24 h ouvrées maximum",

          profilesLabel:
            "Premiers profils",

          profilesValue:
            "possibles sous 48 h*",

          supportLabel:
            "Service",

          supportValue:
            "un interlocuteur CSTMed dédié",

          formTitle:
            "Décrivez-nous votre besoin de recrutement",

          formIntro:
            "Les champs marqués d’un * sont obligatoires.",

          step1:
            "Votre établissement",

          step2:
            "Votre contact",

          step3:
            "Votre besoin de recrutement",

          whyTitle:
            "Un processus simple et rapide",

          whyItems: [
            "Nous analysons votre besoin et les critères du poste.",
            "Nous identifions des profils médicaux compatibles.",
            "Nous vous présentons les candidats pertinents.",
            "Nous restons votre interlocuteur pendant le processus de recrutement.",
          ],

          confidentialityTitle:
            "Échanges confidentiels",

          confidentialityText:
            "Les informations transmises via ce formulaire sont utilisées uniquement pour l’étude de votre demande et la gestion du recrutement.",

          contactTitle:
            "Vous préférez échanger directement ?",

          contactText:
            "Vous pouvez contacter CSTMed directement pour nous présenter votre besoin de recrutement.",

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

        <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-14 sm:px-8 sm:pb-32 sm:pt-16">
          <div className="max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8eeae1]">
              {content.eyebrow}
            </p>

            <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              {content.heroTitle}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {content.heroText}
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
                  {content.supportLabel}
                </p>

                <p className="mt-1 font-black">
                  {content.supportValue}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-300">
              {content.caveat}
            </p>
          </div>
        </div>
      </section>

      {/* FORMULAR */}
      <section className="relative z-20 -mt-16 px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {errorMessage ? (
              <div
                role="alert"
                className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-5 text-red-700 shadow-sm"
              >
                <p className="font-black">
                  {locale === "ro"
                    ? "Solicitarea nu a fost trimisă."
                    : "La demande n’a pas été envoyée."}
                </p>

                <p className="mt-2">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            <form
              action={submitEstablishmentRequest}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-9"
            >
              <input
                type="hidden"
                name="locale"
                value={locale}
              />

              {/* Honeypot anti-bot */}
              <div
                aria-hidden="true"
                className="absolute left-[-10000px] h-px w-px overflow-hidden"
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
                  {content.formTitle}
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  {content.formIntro}
                </p>
              </div>

              {/* 01 */}
              <section className="mt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                    01
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {content.step1}
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="establishmentName"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.establishmentName} *
                    </label>

                    <input
                      id="establishmentName"
                      name="establishmentName"
                      type="text"
                      required
                      maxLength={200}
                      autoComplete="organization"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="establishmentType"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.establishmentType}
                    </label>

                    <select
                      id="establishmentType"
                      name="establishmentType"
                      defaultValue=""
                      className={inputClassName}
                    >
                      <option value="">
                        {labels.chooseType}
                      </option>

                      <option value="hospital">
                        {labels.types.hospital}
                      </option>

                      <option value="clinic">
                        {labels.types.clinic}
                      </option>

                      <option value="health_center">
                        {labels.types.healthCenter}
                      </option>

                      <option value="ehpad">
                        {labels.types.ehpad}
                      </option>

                      <option value="medical_practice">
                        {labels.types.medicalPractice}
                      </option>

                      <option value="other">
                        {labels.types.other}
                      </option>
                    </select>
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
                      maxLength={120}
                      autoComplete="address-level2"
                      className={inputClassName}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="department"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.department}
                    </label>

                    <input
                      id="department"
                      name="department"
                      type="text"
                      maxLength={120}
                      placeholder={
                        locale === "ro"
                          ? "Ex. Hérault – 34"
                          : "Ex. Hérault – 34"
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>
              </section>

              {/* 02 */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5f7f5] text-sm font-black text-[#0c7773]">
                    02
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {content.step2}
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.contactName} *
                    </label>

                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      maxLength={150}
                      autoComplete="name"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactRole"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.contactRole}
                    </label>

                    <input
                      id="contactRole"
                      name="contactRole"
                      type="text"
                      maxLength={150}
                      autoComplete="organization-title"
                      className={inputClassName}
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
                      required
                      maxLength={254}
                      autoComplete="email"
                      className={inputClassName}
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
                      required
                      maxLength={50}
                      autoComplete="tel"
                      placeholder="+33..."
                      className={inputClassName}
                    />
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                    03
                  </span>

                  <h2 className="text-xl font-black text-[#082a43]">
                    {content.step3}
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.specialty} *
                    </label>

                    <input
                      id="specialty"
                      name="specialty"
                      type="text"
                      required
                      maxLength={180}
                      placeholder={
                        locale === "ro"
                          ? "Ex. cardiolog"
                          : "Ex. cardiologue"
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="positionsCount"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.positionsCount} *
                    </label>

                    <input
                      id="positionsCount"
                      name="positionsCount"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="1"
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contractType"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.contractType}
                    </label>

                    <select
                      id="contractType"
                      name="contractType"
                      defaultValue=""
                      className={inputClassName}
                    >
                      <option value="">
                        {labels.chooseContract}
                      </option>

                      <option value="cdi">
                        {labels.contracts.cdi}
                      </option>

                      <option value="cdd">
                        {labels.contracts.cdd}
                      </option>

                      <option value="replacement">
                        {labels.contracts.replacement}
                      </option>

                      <option value="liberal">
                        {labels.contracts.liberal}
                      </option>

                      <option value="mixed">
                        {labels.contracts.mixed}
                      </option>

                      <option value="other">
                        {labels.contracts.other}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="desiredStartDate"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.desiredStartDate}
                    </label>

                    <input
                      id="desiredStartDate"
                      name="desiredStartDate"
                      type="date"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="urgency"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.urgency}
                    </label>

                    <select
                      id="urgency"
                      name="urgency"
                      defaultValue="normal"
                      className={inputClassName}
                    >
                      <option value="normal">
                        {labels.urgencies.normal}
                      </option>

                      <option value="urgent">
                        {labels.urgencies.urgent}
                      </option>

                      <option value="very_urgent">
                        {labels.urgencies.veryUrgent}
                      </option>
                    </select>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-5 transition hover:border-[#118c87]/40 sm:col-span-2">
                    <input
                      name="housingSupport"
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[#118c87]"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {labels.housingSupport}
                    </span>
                  </label>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      {labels.message}
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={7}
                      maxLength={5000}
                      placeholder={labels.messagePlaceholder}
                      className={`${inputClassName} resize-y leading-7`}
                    />
                  </div>
                </div>
              </section>

              {/* CONFIDENȚIALITATE */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="rounded-[1.5rem] border border-[#9fded8] bg-[#e5f7f5] p-5">
                  <p className="text-sm leading-6 text-slate-700">
                    {labels.privacySummary}
                  </p>

                  <Link
                    href={`/${locale}/confidentialite`}
                    target="_blank"
                    className="mt-3 inline-flex text-sm font-black text-[#0c7773] underline underline-offset-4"
                  >
                    {labels.privacyLink} ↗
                  </Link>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fbfc] p-5 transition hover:border-[#118c87]/40">
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
              </section>

              <div className="mt-9 border-t border-slate-200 pt-7">
                <SubmitButton
                  label={labels.submit}
                  pendingLabel={labels.submitting}
                />
              </div>
            </form>
          </div>

          {/* COLOANA DREAPTĂ */}
          <aside className="h-fit space-y-5 lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-[2rem] bg-[#082a43] text-white shadow-2xl shadow-slate-900/20">
              <div className="p-7">
                <p className="text-sm font-black uppercase tracking-[0.15em] text-[#65d9ce]">
                  CSTMed
                </p>

                <h2 className="mt-4 text-2xl font-black leading-tight">
                  {content.whyTitle}
                </h2>

                <div className="mt-6 space-y-5">
                  {content.whyItems.map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex gap-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#65d9ce] text-xs font-black text-[#082a43]">
                          {index + 1}
                        </span>

                        <p className="pt-0.5 text-sm leading-6 text-slate-200">
                          {item}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/5 px-7 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-[#65d9ce]">
                    ✓
                  </span>

                  <p className="text-xs leading-5 text-slate-300">
                    {content.responseValue}
                  </p>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <span className="text-[#65d9ce]">
                    ✓
                  </span>

                  <p className="text-xs leading-5 text-slate-300">
                    {content.profilesValue}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-gradient-to-br from-[#e5f7f5] to-[#eef4ff] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#118c87] text-xl text-white">
                ✓
              </div>

              <h2 className="mt-4 text-lg font-black text-[#082a43]">
                {content.confidentialityTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {content.confidentialityText}
              </p>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#082a43]">
                {content.contactTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {content.contactText}
              </p>

              <a
                href="tel:+33628262576"
                className="mt-5 flex min-h-[46px] items-center justify-center rounded-full bg-[#118c87] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c7773]"
              >
                ☎ +33 (0) 6 28 26 25 76
              </a>

              <a
                href="mailto:contact@cstmed.fr"
                className="mt-3 flex min-h-[46px] items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-[#082a43] transition hover:border-[#118c87] hover:text-[#118c87]"
              >
                contact@cstmed.fr
              </a>
            </section>
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