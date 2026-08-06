import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type SiteHeaderProps = {
  locale: Locale;
  labels: Dictionary["common"];
};

export function SiteHeader({
  locale,
  labels,
}: SiteHeaderProps) {
  return (
    <>
      <div className="bg-[#082a43] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5 text-xs sm:px-8 sm:text-sm">
          <p>{labels.topLine}</p>

          <div className="flex items-center gap-5">
            <a
              href="tel:+33628262576"
              className="hidden hover:text-[#8ce1d8] sm:inline"
            >
              {labels.phone}
            </a>

            <a
              href={`mailto:${labels.email}`}
              className="hover:text-[#8ce1d8]"
            >
              {labels.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href={`/${locale}`} aria-label="CSTMed">
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={240}
              height={80}
              priority
              className="h-auto w-[175px] object-contain sm:w-[220px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            <Link href={`/${locale}`}>{labels.nav.home}</Link>
            <Link href={`/${locale}#medecins`}>
              {labels.nav.doctors}
            </Link>
            <Link href={`/${locale}#etablissements`}>
              {labels.nav.establishments}
            </Link>
            <Link href={`/${locale}/offres`}>
              {labels.nav.jobs}
            </Link>
            <Link href={`/${locale}#methode`}>
              {labels.nav.method}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />

            <a
              href={`mailto:${labels.email}`}
              className="hidden rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c7773] sm:inline-flex"
            >
              {labels.nav.contact}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}