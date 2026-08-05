"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({
  locale,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLanguage(nextLocale: Locale) {
    const segments = pathname.split("/");

    if (isLocale(segments[1])) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }

    const nextPath = segments.join("/") || `/${nextLocale}`;
    const query = searchParams.toString();

    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    startTransition(() => {
      router.push(query ? `${nextPath}?${query}` : nextPath);
    });
  }

  return (
    <div
      aria-label="Choix de la langue"
      className="flex items-center rounded-full border border-current/20 p-1 text-xs font-bold"
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeLanguage("ro")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "ro"
            ? "bg-[#118c87] text-white"
            : "hover:bg-slate-100 hover:text-[#082a43]"
        }`}
      >
        RO
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => changeLanguage("fr")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "fr"
            ? "bg-[#118c87] text-white"
            : "hover:bg-slate-100 hover:text-[#082a43]"
        }`}
      >
        FR
      </button>
    </div>
  );
}