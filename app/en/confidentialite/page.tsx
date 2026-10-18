import type { Metadata } from "next";
import Link from "next/link";
import { EnglishHeader, EnglishFooter } from "@/components/public/english-site-shell";
import { legalConfig } from "@/lib/site/legal-config";

export const metadata: Metadata = {
  title: "Privacy policy | CSTMed",
  description: "Information about how CSTMed handles personal data and CVs submitted by candidates and visitors.",
  alternates: { canonical: "/en/confidentialite", languages: { en: "/en/confidentialite", ro: "/ro/confidentialite", fr: "/fr/confidentialite" } },
};

type Section = { title: string; paragraphs?: string[]; bullets?: string[] };
const sections: Section[] = [
  { title: "Data controller", paragraphs: [
    `The controller responsible for personal data collected through CSTMed is ${legalConfig.publisher.legalName}.`,
    `For questions about personal data, contact: ${legalConfig.contactEmail}.`,
  ] },
  { title: "Personal data collected", bullets: [
    "Identity: first name and last name.",
    "Contact details: email address, telephone number, country and city.",
    "Professional information: medical specialty, experience, French language proficiency and career plans.",
    "Documents voluntarily provided, including curricula vitae (CVs).",
    "The job opportunity associated with an application, where applicable.",
    "Technical information necessary for the security and operation of the service.",
  ] },
  { title: "Purposes of processing", bullets: [
    "Receive, record and review applications.",
    "Assess whether a candidate's profile matches a vacancy or recruitment requirement.",
    "Contact candidates and organise discussions relating to their career plans.",
    "Present a profile to a healthcare facility where necessary and appropriate in connection with an application or the candidate's project.",
    "Retain profiles for future opportunities where the candidate has selected this option.",
    "Protect the website and prevent fraudulent use.",
  ] },
  { title: "Legal bases for processing", paragraphs: [
    "Processing data submitted with an application is necessary to review the candidate's request and manage professional introductions.",
    "Some processing may also rely on CSTMed's legitimate interests in following up applications and operating its services.",
    "Keeping a profile for future opportunities is based on the candidate's optional choice expressed in the application form.",
    "Security-related processing relies on CSTMed's legitimate interest in protecting its website, users and data.",
  ] },
  { title: "Required and optional information", paragraphs: [
    "Fields marked with an asterisk are required in order to review an application.",
    "If this information is not provided, CSTMed may be unable to process the request.",
    "Consent to be considered for future opportunities is optional. Declining does not prevent CSTMed from processing the current application.",
  ] },
  { title: "Recipients of personal data", bullets: [
    "Persons authorised to manage CSTMed and the applications it receives.",
    "Healthcare facilities concerned by an application, where sharing a profile is necessary and appropriate.",
    "Technical service providers responsible for hosting, databases, private file storage and sending emails.",
  ] },
  { title: "Technical service providers", bullets: [
    "Vercel – website hosting and delivery.",
    "Supabase – database, authentication and private CV storage.",
    "Resend – transactional emails required to operate the service.",
  ] },
  { title: "Retention periods", paragraphs: [
    "Personal data is retained for as long as necessary to review and follow up an application.",
    "Where a candidate chooses to remain in CSTMed's candidate pool, their profile may be retained for a maximum of two years from the last contact, unless they renew their choice.",
    "Data may be retained for longer where a legal obligation or the establishment, exercise or defence of legal claims justifies this, in an archive with restricted access.",
  ] },
  { title: "Security", paragraphs: [
    "CVs are stored in a private area and do not have permanent public URLs.",
    "Administrative access is protected by authentication, and CV downloads use temporary links.",
    "CSTMed limits access to applications to the persons who need the information to process them.",
    "Despite these safeguards, no online service can guarantee absolute security.",
  ] },
  { title: "Your data protection rights", bullets: [
    "The right to access your personal data.",
    "The right to rectify inaccurate data.",
    "The right to erasure, where the applicable conditions are met.",
    "The right to restrict processing.",
    "The right to object to processing based on legitimate interests.",
    "The right to withdraw your choice regarding future opportunities at any time.",
    "The right to data portability where applicable.",
  ], paragraphs: [
    `To exercise your rights, write to ${legalConfig.contactEmail} and specify your identity and the nature of your request.`,
    "You may also lodge a complaint with the competent data protection authority, including the CNIL in France.",
  ] },
  { title: "International transfers and processors", paragraphs: [
    "Some technical service providers may process personal data from different regions or countries.",
    "CSTMed selects providers offering contractual, organisational and technical safeguards appropriate for protecting personal data.",
  ] },
  { title: "Changes to this policy", paragraphs: [
    "This policy may change to reflect updates to our services, applicable law or technical providers.",
    "The date of the latest update appears at the top of this page.",
  ] },
];

export default function EnglishPrivacyPolicy() {
  return <main className="min-h-screen bg-[#f5f9fb] text-[#102435]"><EnglishHeader />
    <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-wider text-[#76e0d5]">Data protection</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">Privacy policy</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">This policy explains how CSTMed collects, uses, protects and retains personal information provided by candidates and website visitors.</p><p className="mt-5 text-sm text-slate-300">Last updated: 11 August 2026 (translation of the French policy)</p></div></section>
    <section className="px-5 py-12 sm:px-8"><div className="mx-auto max-w-5xl space-y-6">{sections.map(section => <article key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><h2 className="text-2xl font-bold text-[#082a43]">{section.title}</h2>{section.paragraphs && <div className="mt-5 space-y-4 leading-8 text-slate-700">{section.paragraphs.map(p=><p key={p}>{p}</p>)}</div>}{section.bullets && <ul className="mt-5 space-y-3 leading-7 text-slate-700">{section.bullets.map(b=><li key={b} className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#118c87]"/><span>{b}</span></li>)}</ul>}</article>)}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">This page is an English translation of CSTMed's <Link href="/fr/confidentialite" className="font-bold text-[#0965d8] underline">French privacy policy</Link>. Verify that the published privacy policy reflects actual retention and processing practices before public launch.</div><div className="pt-4 text-center"><Link href="/en" className="inline-flex rounded-full bg-[#118c87] px-7 py-3 font-bold text-white">Back to home</Link></div></div></section><EnglishFooter /></main>;
}
