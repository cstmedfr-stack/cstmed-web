import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";

type HomePageProps = {
  params: Promise<{
    lang: string;
  }>;
};

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

  return (
    <main className="min-h-screen bg-white text-[#102435]">
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

              <a
                href="mailto:contact@cstmed.fr"
                className="mt-8 inline-flex rounded-full bg-[#65d9ce] px-6 py-3 font-bold text-[#082a43]"
              >
                {home.establishments.button}
              </a>
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