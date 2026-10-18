"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

type Props = { locale: Locale };
type Language = "ro" | "fr" | "en";
const englishPages = new Set(["", "offres", "candidature", "etablissements", "confidentialite"]);
function languagePath(pathname: string, target: Language) {
  const parts = pathname.split("/").filter(Boolean);
  if (["ro", "fr", "en"].includes(parts[0] ?? "")) parts.shift();
  // English routes are currently available only for these pages.
  if (target === "en") {
    const slug = parts[0] ?? "";
    if (!englishPages.has(slug) || parts.length > 1 && !(slug === "candidature" && parts[1] === "merci")) return "/en";
    return `/en${parts.length ? "/" + parts.join("/") : ""}`;
  }
  // Preserve common RO/FR page when switching from EN; otherwise go to the language home.
  if (pathname.startsWith("/en")) {
    const slug = parts[0] ?? "";
    if (slug === "offres") return `/${target}/offres`;
    if (slug === "candidature") return `/${target}/candidature`;
    if (slug === "etablissements") return `/${target}/etablissements`;
    if (slug === "confidentialite") return `/${target}/confidentialite`;
    return `/${target}`;
  }
  return `/${target}${parts.length ? "/" + parts.join("/") : ""}`;
}
export function HeaderLanguageSwitcher({ locale }: Props) {
  const pathname = usePathname();
  return (
    <nav aria-label="Language / Langue / Limbă" className="inline-flex rounded-full border border-slate-300 bg-white p-1">
      {(["ro", "fr", "en"] as const).map(language => (
        <Link
          key={language}
          href={languagePath(pathname, language)}
          aria-label={{ ro: "Versiunea în română", fr: "Version française", en: "English version" }[language]}
          aria-current={locale === language ? "page" : undefined}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${locale === language ? "bg-[#118c87] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          style={locale === language ? { color: "#ffffff" } : undefined}
        >{language.toUpperCase()}</Link>
      ))}
    </nav>
  );
}
