import Link from "next/link";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { LegalDocument } from "@/lib/i18n/legal-content";

type LegalDocumentPageProps = {
  locale: Locale;
  dictionary: Dictionary;
  document: LegalDocument;
};

export function LegalDocumentPage({
  locale,
  dictionary,
  document,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <SiteHeader
        locale={locale}
        labels={dictionary.common}
      />

      <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#76e0d5]">
            {document.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            {document.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            {document.intro}
          </p>

          <p className="mt-5 text-sm text-slate-300">
            {locale === "ro"
              ? "Ultima actualizare:"
              : "Dernière mise à jour :"}{" "}
            {document.lastUpdated}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {document.warning ? (
            <div className="mb-8 rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
              <p className="font-bold">
                {locale === "ro"
                  ? "De completat înainte de publicare"
                  : "À compléter avant publication"}
              </p>

              <p className="mt-2 leading-7">
                {document.warning}
              </p>
            </div>
          ) : null}

          <div className="space-y-6">
            {document.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
              >
                <h2 className="text-2xl font-bold text-[#082a43]">
                  {section.title}
                </h2>

                {section.paragraphs ? (
                  <div className="mt-5 space-y-4 leading-8 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                {section.bullets ? (
                  <ul className="mt-5 space-y-3 leading-7 text-slate-700">
                    {section.bullets.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#118c87]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex rounded-full bg-[#118c87] px-7 py-3 font-bold text-white transition hover:bg-[#0c7773]"
            >
              {locale === "ro"
                ? "Înapoi la pagina principală"
                : "Retour à l’accueil"}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter
        locale={locale}
        labels={dictionary.common}
      />
    </main>
  );
}