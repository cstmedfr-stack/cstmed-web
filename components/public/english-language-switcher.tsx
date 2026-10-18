"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EnglishLanguageSwitcher() {
  const pathname = usePathname();
  const route = pathname.replace(/^\/en(?=\/|$)/, "");
  const slug = route.split("/").filter(Boolean)[0] ?? "";
  const destination = slug === "offres" || slug === "candidature" || slug === "etablissements" || slug === "confidentialite" ? `/${slug}` : "";
  return (
    <nav aria-label="Language / Langue / Limbă" className="flex items-center gap-1 rounded-full border border-slate-200 p-1 text-xs font-black">
      <Link href={`/ro${destination}`} className="rounded-full px-3 py-2 hover:bg-slate-100">RO</Link>
      <Link href={`/fr${destination}`} className="rounded-full px-3 py-2 hover:bg-slate-100">FR</Link>
      <Link href={pathname} aria-current="page" className="rounded-full bg-[#118c87] px-3 py-2 text-white" style={{color:"#fff"}}>EN</Link>
    </nav>
  );
}
