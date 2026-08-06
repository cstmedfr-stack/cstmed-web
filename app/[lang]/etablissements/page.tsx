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
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

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

  const locale: Locale = requestedLang;
  const dictionary = getDictionary(locale);
  const labels =
    dictionary.establishmentRequest;

  const query = await searchParams;

  const errorMessage = getParameter(
    query.error,
  );

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={locale}
        labels={dictionary.common}
      />

      <section className="bg-gradient-to-br from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-16 text-white sm:px-8">
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
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
            >
              <input
                type="hidden"
                name="locale"
                value={locale}
              />

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

              <p className="text-sm text-slate-500">
                {labels.requiredNotice}
              </p>

              <section className="mt-7">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.establishmentSection}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="establishmentName"
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
                    >
                      {labels.department}
                    </label>

                    <input
                      id="department"
                      name="department"
                      type="text"
                      maxLength={120}
                      placeholder="Ex. Hérault – 34"
                      className={inputClassName}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.contactSection}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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

              <section className="mt-10">
                <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                  {labels.recruitmentSection}
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
                      maxLength={180}
                      placeholder="Ex. cardiologue"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="positionsCount"
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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
                      className="block text-sm font-bold"
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

                  <label className="flex items-start gap-3 rounded-2xl bg-[#f8fbfc] p-5 sm:col-span-2">
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
                      className="block text-sm font-bold"
                    >
                      {labels.message}
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={8}
                      maxLength={5000}
                      placeholder={labels.messagePlaceholder}
                      className={`${inputClassName} resize-y leading-7`}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-8 space-y-5">
                <div className="rounded-2xl border border-[#9fded8] bg-[#e5f7f5] p-5">
                  <p className="text-sm leading-6 text-slate-700">
                    {labels.privacySummary}
                  </p>

                  <Link
                    href={`/${locale}/confidentialite`}
                    target="_blank"
                    className="mt-3 inline-flex text-sm font-bold text-[#0c7773] underline underline-offset-4"
                  >
                    {labels.privacyLink} ↗
                  </Link>
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
              </section>

              <div className="mt-8 flex justify-end border-t border-slate-200 pt-7">
                <SubmitButton
                  label={labels.submit}
                  pendingLabel={labels.submitting}
                />
              </div>
            </form>
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-28">
            <section className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#65d9ce]">
                CSTMed
              </p>

              <h2 className="mt-4 text-2xl font-bold">
                {labels.sideTitle}
              </h2>

              <ul className="mt-6 space-y-4">
                {labels.sideItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#65d9ce] font-bold text-[#082a43]">
                      ✓
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-[#082a43]">
                Contact CSTMed
              </h2>

              <a
                href="mailto:contact@cstmed.fr"
                className="mt-4 block text-sm font-bold text-[#118c87]"
              >
                contact@cstmed.fr
              </a>

              <a
                href="tel:+33628262576"
                className="mt-3 block text-sm font-bold text-[#118c87]"
              >
                +33 (0) 6 28 26 25 76
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