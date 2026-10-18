import Image from "next/image";
import Link from "next/link";
import { EnglishLanguageSwitcher } from "@/components/public/english-language-switcher";
import { publicLinks } from "@/lib/site/public-links";

const doctorLinks = [
  { title: "Job offers", href: "/en/offres" },
  { title: "Prepare your career plan", href: "/en#projet-medical" },
  { title: "Medical specialties", href: "/en#specialites" },
  { title: "Relocation and integration", href: "/en#accompagnement-medecins" },
  { title: "Administrative procedures", href: "/en#demarches-administratives" },
  { title: "Send your CV", href: "/en/candidature" },
];
const aboutLinks = [
  { title: "Who we are", href: "/en#qui-sommes-nous" },
  { title: "Our expertise", href: "/en#expertise" },
  { title: "Our approach", href: "/en#methode-cstmed" },
];

export function EnglishHeader() {
  return <>
    <div className="relative z-[60] bg-[#082a43] text-white">
      <div className="mx-auto flex min-h-9 max-w-[1450px] items-center justify-between gap-4 px-5 py-2 text-xs sm:px-8">
        <p className="font-semibold text-slate-200">Medical recruitment • France – Europe</p>
        <div className="hidden items-center gap-4 lg:flex">
          {publicLinks.facebook && <a href={publicLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#65d9ce]">Facebook</a>}
          {publicLinks.instagram && <a href={publicLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#65d9ce]">Instagram</a>}
          <a href={`tel:${publicLinks.phoneRomaniaHref}`} className="hover:text-[#65d9ce]">RO {publicLinks.phoneRomaniaDisplay}</a>
          <a href={`tel:${publicLinks.phoneHref}`} className="hover:text-[#65d9ce]">FR {publicLinks.phoneDisplay}</a>
          <a href={`mailto:${publicLinks.email}`} className="hover:text-[#65d9ce]">{publicLinks.email}</a>
        </div>
      </div>
    </div>
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-xl">
      <div className="mx-auto flex min-h-[92px] max-w-[1450px] items-center gap-4 px-5 sm:px-8 xl:gap-3">
        <Link href="/en" aria-label="CSTMed home" className="shrink-0">
          <Image src="/images/cstmed-logo.png" alt="CSTMed" width={420} height={140} priority className="h-auto w-[155px] object-contain sm:w-[170px] xl:w-[175px]" />
        </Link>
        <Link href="/en/offres" className="hidden min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[#0D6EFD] px-5 py-3 text-[13px] font-extrabold uppercase tracking-wide text-[#082a43] shadow-lg md:inline-flex xl:min-w-[200px]">⌕ Search jobs</Link>
        <nav aria-label="English navigation" className="ml-auto hidden items-center gap-1 xl:flex">
          <Link href="/en" className="rounded-full px-2.5 py-2.5 text-[15px] font-semibold text-[#082a43] hover:bg-slate-100">Home</Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full px-2.5 py-2.5 text-[15px] font-semibold text-[#082a43] hover:bg-slate-100">Doctors ▾</summary>
            <div className="absolute left-0 top-[calc(100%+10px)] w-[290px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              {doctorLinks.map(item => <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-[#f5f9fb]">{item.title} →</Link>)}
              <p className="mt-2 rounded-xl bg-[#e5f7f5] p-3 text-xs font-black text-[#0c7773]">✓ CSTMed services are 100% free for doctors</p>
            </div>
          </details>
          <Link href="/en/etablissements" className="rounded-full px-2.5 py-2.5 text-[15px] font-semibold text-[#082a43] hover:bg-slate-100">Healthcare facilities</Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full px-2.5 py-2.5 text-[15px] font-semibold text-[#082a43] hover:bg-slate-100">About us ▾</summary>
            <div className="absolute right-0 top-[calc(100%+10px)] w-[245px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              {aboutLinks.map(item => <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-[#f5f9fb]">{item.title} →</Link>)}
            </div>
          </details>
          <Link href="/en#contact" className="rounded-full px-2.5 py-2.5 text-[15px] font-semibold text-[#082a43] hover:bg-slate-100">Contact</Link>
        </nav>
        <div className="ml-auto shrink-0 xl:ml-2"><EnglishLanguageSwitcher /></div>
      </div>
      <div className="px-5 pb-3 sm:px-8 md:hidden"><Link href="/en/offres" className="flex min-h-[46px] items-center justify-center rounded-full bg-[#0D6EFD] px-6 py-3 text-[13px] font-extrabold uppercase text-[#082a43]">⌕ Search jobs</Link></div>
      <div className="border-t border-slate-200 xl:hidden"><div className="px-5 sm:px-8"><details className="group">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between font-bold text-[#082a43]">Menu <span className="text-xl">+</span></summary>
        <div className="border-t border-slate-100 pb-5 pt-3">
          <Link href="/en" className="block rounded-xl px-4 py-3 hover:bg-slate-100">Home</Link>
          <p className="px-4 pt-3 text-xs font-black uppercase tracking-wider text-[#118c87]">Doctors</p>
          {doctorLinks.map(item => <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-2.5 text-sm hover:bg-slate-100">{item.title}</Link>)}
          <Link href="/en/etablissements" className="block rounded-xl px-4 py-3 font-bold hover:bg-slate-100">Healthcare facilities</Link>
          <p className="px-4 pt-3 text-xs font-black uppercase tracking-wider text-[#118c87]">About us</p>
          {aboutLinks.map(item => <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-2.5 text-sm hover:bg-slate-100">{item.title}</Link>)}
          <Link href="/en#contact" className="block rounded-xl px-4 py-3 font-bold hover:bg-slate-100">Contact</Link>
        </div>
      </details></div></div>
    </header>
    <a href={`https://wa.me/${publicLinks.whatsappNumber}?text=${encodeURIComponent("Hello, I would like information about CSTMed services.")}`} target="_blank" rel="noopener noreferrer" aria-label="Contact CSTMed on WhatsApp" title="WhatsApp CSTMed" className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-2xl font-black text-white shadow-2xl ring-4 ring-white" >☎</a>
  </>;
}

export function EnglishFooter() {
  return <footer className="bg-[#061f33] px-5 py-12 text-slate-300 sm:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div><Link href="/en" className="text-2xl font-black text-white">CST<span className="text-[#65d9ce]">Med</span></Link><p className="mt-3 text-sm leading-7">Medical recruitment and personalised career support in France.</p><p className="mt-6 text-xs font-black uppercase text-slate-400">Follow CSTMed</p><div className="mt-3 flex gap-3 text-sm">{publicLinks.facebook && <a href={publicLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}{publicLinks.instagram && <a href={publicLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}{publicLinks.linkedin && <a href={publicLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}</div></div>
      <div><h2 className="font-black text-white">Navigation</h2><div className="mt-4 flex flex-col gap-3 text-sm"><Link href="/en">Home</Link><Link href="/en/offres">Job offers</Link><Link href="/en#medecins">For doctors</Link><Link href="/en/etablissements">Healthcare facilities</Link></div></div>
      <div><h2 className="font-black text-white">Legal information</h2><div className="mt-4 flex flex-col gap-3 text-sm"><Link href="/en/confidentialite">Privacy policy</Link><Link href="/fr/mentions-legales">Legal notice (French)</Link><Link href="/fr/cookies">Cookies policy (French)</Link></div></div>
      <div><h2 className="font-black text-white">Contact</h2><div className="mt-4 space-y-4 text-sm"><a href={`mailto:${publicLinks.email}`} className="block font-bold text-white">{publicLinks.email}</a><div><p className="text-xs text-slate-400">Doctors • Romania</p><a href={`tel:${publicLinks.phoneRomaniaHref}`} className="font-bold text-white">{publicLinks.phoneRomaniaDisplay}</a></div><div><p className="text-xs text-slate-400">Healthcare facilities • France</p><a href={`tel:${publicLinks.phoneHref}`} className="font-bold text-white">{publicLinks.phoneDisplay}</a></div></div></div>
    </div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-400">© 2026 CSTMed. All rights reserved.</div>
  </footer>;
}
