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
  const dictionary = getDictionary(lang);
  const labels = dictionary.application;

  const query = await searchParams;

  const completeReference =
    getSearchParameter(query.reference);

  const shortReference = completeReference
    ? completeReference
        .replaceAll("-", "")
        .slice(0, 10)
        .toUpperCase()
    : null;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={lang}
        labels={dictionary.common}
      />

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e5f7f5] text-4xl text-[#118c87]">
            ✓
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
            {labels.successEyebrow}
          </p>

          <h1 className="mt-4 text-3xl font-bold text-[#082a43] sm:text-4xl">
            {labels.successTitle}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {labels.successText}
          </p>

          {shortReference ? (
            <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-[#f5f9fb] p-5">
              <p className="text-sm font-semibold text-slate-500">
                {labels.reference}
              </p>

              <p className="mt-2 font-mono text-xl font-bold tracking-wider text-[#082a43]">
                {shortReference}
              </p>
            </div>
          ) : null}

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${lang}`}
              className="rounded-full border border-[#118c87] px-6 py-3 font-bold text-[#118c87]"
            >
              {labels.backHome}
            </Link>

            <Link
              href={`/${lang}/offres`}
              className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white"
            >
              {labels.viewJobs}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter
        locale={lang}
        labels={dictionary.common}
      />
    </main>
  );
}