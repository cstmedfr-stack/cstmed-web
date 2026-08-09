import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

import { publicLinks } from "@/lib/site/public-links";

type SiteFooterProps = {
  locale: Locale;
  labels: Dictionary["common"];
};

export function SiteFooter({
  locale,
  labels,
}: SiteFooterProps) {
  const content =
    locale === "ro"
      ? {
          legal:
            "Mențiuni legale",

          privacy:
            "Confidențialitate",

          cookies:
            "Cookie-uri",

          legalTitle:
            "Informații juridice",

          navigation:
            "Navigare",

          establishments:
            "Pentru unități medicale",

          contact:
            "Contact",

          doctorsPhone:
            "Medici • România",

          establishmentsPhone:
            "Unități medicale • Franța",

          follow:
            "Urmărește CSTMed",
        }
      : {
          legal:
            "Mentions légales",

          privacy:
            "Confidentialité",

          cookies:
            "Cookies",

          legalTitle:
            "Informations juridiques",

          navigation:
            "Navigation",

          establishments:
            "Pour les établissements",

          contact:
            "Contact",

          doctorsPhone:
            "Médecins • Roumanie",

          establishmentsPhone:
            "Établissements • France",

          follow:
            "Suivez CSTMed",
        };

  return (
    <footer className="bg-[#061f33] px-5 py-12 text-slate-300 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* CSTMED */}
        <div>
          <Link
            href={`/${locale}`}
            className="inline-flex items-baseline text-2xl font-black tracking-tight"
          >
            <span className="text-white">
              CST
            </span>

            <span className="text-[#65d9ce]">
              Med
            </span>
          </Link>

          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-300">
            {labels.footerDescription}
          </p>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              {content.follow}
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              {publicLinks.facebook ? (
                <a
                  href={publicLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
                >
                  Facebook
                </a>
              ) : null}

              {publicLinks.instagram ? (
                <a
                  href={publicLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
                >
                  Instagram
                </a>
              ) : null}

              {publicLinks.linkedin ? (
                <a
                  href={publicLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
                >
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div>
          <p className="font-black text-white">
            {content.navigation}
          </p>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              href={`/${locale}`}
              className="transition hover:text-[#65d9ce]"
            >
              {labels.nav.home}
            </Link>

            <Link
              href={`/${locale}/offres`}
              className="transition hover:text-[#65d9ce]"
            >
              {labels.nav.jobs}
            </Link>

            <Link
              href={`/${locale}#medecins`}
              className="transition hover:text-[#65d9ce]"
            >
              {labels.nav.doctors}
            </Link>

            <Link
              href={`/${locale}/etablissements`}
              className="transition hover:text-[#65d9ce]"
            >
              {content.establishments}
            </Link>
          </div>
        </div>

        {/* JURIDIC */}
        <div>
          <p className="font-black text-white">
            {content.legalTitle}
          </p>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              href={`/${locale}/mentions-legales`}
              className="transition hover:text-[#65d9ce]"
            >
              {content.legal}
            </Link>

            <Link
              href={`/${locale}/confidentialite`}
              className="transition hover:text-[#65d9ce]"
            >
              {content.privacy}
            </Link>

            <Link
              href={`/${locale}/cookies`}
              className="transition hover:text-[#65d9ce]"
            >
              {content.cookies}
            </Link>
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <p className="font-black text-white">
            {content.contact}
          </p>

          <div className="mt-4 space-y-5">

            <a
              href={`mailto:${publicLinks.email}`}
              className="block text-sm font-bold text-white transition hover:text-[#65d9ce]"
            >
              {publicLinks.email}
            </a>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                🇷🇴 {content.doctorsPhone}
              </p>

              <a
                href={`tel:${publicLinks.phoneRomaniaHref}`}
                className="mt-1 inline-block text-sm font-black text-white transition hover:text-[#65d9ce]"
              >
                {publicLinks.phoneRomaniaDisplay}
              </a>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                🇫🇷 {content.establishmentsPhone}
              </p>

              <a
                href={`tel:${publicLinks.phoneHref}`}
                className="mt-1 inline-block text-sm font-black text-white transition hover:text-[#65d9ce]"
              >
                {publicLinks.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-400">
        © 2026 CSTMed. {labels.rights}
      </div>
    </footer>
  );
}