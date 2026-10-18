import { EnglishLanguageSwitcher } from "@/components/public/english-language-switcher";
import Link from "next/link";
import Image from "next/image";
import { publicLinks } from "@/lib/site/public-links";

export function EnglishHeader() {
  return <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
      <Link href="/en" aria-label="CSTMed home"><Image src="/images/cstmed-logo.png" alt="CSTMed" width={200} height={67} className="h-auto w-[165px] object-contain" priority /></Link>
      <nav aria-label="English navigation" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#082a43]">
        <Link href="/en/offres" className="rounded-full px-3 py-2 hover:bg-slate-100">Jobs</Link>
        <Link href="/en/candidature" className="rounded-full px-3 py-2 hover:bg-slate-100">Apply</Link>
        <Link href="/en/etablissements" className="rounded-full px-3 py-2 hover:bg-slate-100">Employers</Link>
      </nav>
      <EnglishLanguageSwitcher />
    </div>
  </header>;
}
export function EnglishFooter() {
  return <footer className="bg-[#061f33] px-5 py-10 text-sm text-slate-200"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6">
    <div><p className="text-lg font-black text-white">CSTMed</p><p className="mt-2">Medical recruitment and career support in France.</p><a href={`mailto:${publicLinks.email}`} className="mt-2 inline-block underline">{publicLinks.email}</a></div>
    <div className="flex flex-wrap gap-4"><Link href="/en/offres">Jobs</Link><Link href="/en/candidature">Apply</Link><Link href="/en/etablissements">Employers</Link><Link href="/en/confidentialite">Privacy information</Link></div>
    <p>© 2026 CSTMed</p>
  </div></footer>;
}
