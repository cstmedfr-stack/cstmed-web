"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/i18n/config";

type HeaderLanguageSwitcherProps = {
  locale: Locale;
};

function createLocalePath(
  pathname: string,
  targetLocale: Locale,
) {
  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (
    segments[0] === "ro" ||
    segments[0] === "fr"
  ) {
    segments[0] = targetLocale;
  } else {
    segments.unshift(targetLocale);
  }

  return `/${segments.join("/")}`;
}

export function HeaderLanguageSwitcher({
  locale,
}: HeaderLanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <div className="inline-flex rounded-full border border-slate-300 bg-white p-1">
      <Link
        href={createLocalePath(pathname, "ro")}
        aria-label="Versiunea în limba română"
        className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
          locale === "ro"
            ? "bg-[#118c87] text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        RO
      </Link>

      <Link
        href={createLocalePath(pathname, "fr")}
        aria-label="Version française"
        className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
          locale === "fr"
            ? "bg-[#118c87] text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        FR
      </Link>
    </div>
  );
}