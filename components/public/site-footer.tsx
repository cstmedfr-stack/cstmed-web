import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type SiteFooterProps = {
  locale: Locale;
  labels: Dictionary["common"];
};

export function SiteFooter({
  locale,
  labels,
}: SiteFooterProps) {
  return (
    <footer className="bg-[#061f33] px-5 py-12 text-slate-300 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <p className="text-2xl font-bold text-white">
            CST<span className="text-[#65d9ce]">Med</span>
          </p>

          <p className="mt-3 max-w-sm leading-7">
            {labels.footerDescription}
          </p>
        </div>

        <div>
          <p className="font-bold text-white">Navigation</p>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href={`/${locale}`}>{labels.nav.home}</Link>
            <Link href={`/${locale}/offres`}>
              {labels.nav.jobs}
            </Link>
            <Link href={`/${locale}#medecins`}>
              {labels.nav.doctors}
            </Link>
          </div>
        </div>

        <div>
          <p className="font-bold text-white">Contact</p>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href={`mailto:${labels.email}`}>
              {labels.email}
            </a>
            <a href="tel:+33628262576">{labels.phone}</a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-400">
        © 2026 CSTMed. {labels.rights}
      </div>
    </footer>
  );
}