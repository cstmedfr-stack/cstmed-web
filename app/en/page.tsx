import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EnglishHeader, EnglishFooter } from "@/components/public/english-site-shell";
export const metadata: Metadata = { title: "Medical careers in France | CSTMed", description: "CSTMed supports medical professionals seeking opportunities in France and healthcare employers looking for qualified candidates.", alternates: { canonical: "/en", languages: { en: "/en", ro: "/ro", fr: "/fr" } } };
export default function EnglishHome() {
  return <main className="min-h-screen bg-white text-[#102435]"><EnglishHeader />
    <section className="bg-[#f5f9fb] px-5 py-12 sm:px-8"><div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
      <div><p className="text-sm font-black uppercase tracking-widest text-[#118c87]">Medical recruitment · France and Europe</p>
        <h1 className="mt-5 text-4xl font-black leading-tight text-[#082a43] sm:text-5xl">Build your medical career <span className="text-[#0965d8]">in France</span></h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">CSTMed connects healthcare professionals with career opportunities in France and provides personalised guidance throughout recruitment and relocation.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/en/offres" className="rounded-full bg-[#0D6EFD] px-7 py-3 font-black text-[#082a43]">Explore jobs</Link><Link href="/en/candidature" className="rounded-full border-2 border-[#118c87] px-7 py-3 font-bold text-[#0c7773]">Send your CV</Link></div>
        <p className="mt-5 text-sm text-slate-600">CSTMed recruitment and support services are free for medical candidates.</p>
      </div>
      <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] shadow-xl sm:min-h-[460px]"><Image src="/images/home/hero-cstmed.png" alt="Medical career support in France" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
    </div></section>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="text-3xl font-black text-[#082a43]">How CSTMed helps</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[
      ["For healthcare professionals", "We discuss your experience, specialty, preferred location and career goals."],
      ["Recruitment support", "We help you explore suitable opportunities, prepare your application and organise interviews."],
      ["Relocation and integration", "We guide you through the main practical and administrative steps required to work in France."]
    ].map(([title,desc])=><article key={title} className="rounded-3xl border border-slate-200 p-7 shadow-sm"><h3 className="text-xl font-black text-[#082a43]">{title}</h3><p className="mt-4 leading-7 text-slate-600">{desc}</p></article>)}</div></section>
    <section className="bg-[#082a43] px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="text-3xl font-black">Are you a hospital or clinic?</h2><p className="mt-4 max-w-3xl leading-7 text-slate-200">CSTMed can help you identify medical professionals who match your recruitment needs.</p><Link href="/en/etablissements" className="mt-6 inline-flex rounded-full bg-[#65d9ce] px-7 py-3 font-black text-[#082a43]">Recruit with CSTMed</Link></div></section>
    <EnglishFooter />
  </main>;
}
