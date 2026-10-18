import type { Metadata } from "next";
import Link from "next/link";
import { EnglishHeader, EnglishFooter } from "@/components/public/english-site-shell";
import { publicLinks } from "@/lib/site/public-links";

export const metadata: Metadata = {
  title: "Application received | CSTMed",
  description: "Information about the next steps after applying through CSTMed.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ reference?: string | string[] }>;
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EnglishApplicationSuccess({ searchParams }: Props) {
  const query = await searchParams;
  const raw = Array.isArray(query.reference) ? query.reference[0] : query.reference;
  const validReference = raw && uuidPattern.test(raw) ? raw : null;
  const shortReference = validReference?.replaceAll("-", "").slice(0, 10).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <EnglishHeader />
      <section className="bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] px-5 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl text-[#8eeae1]">✓</div>
          <p className="mt-6 text-sm font-black uppercase tracking-widest text-[#8eeae1]">CSTMed · Application</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            {validReference ? "Thank you! Your application has been received." : "Application confirmation"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            {validReference
              ? "We have received your details and CV. Our team will review your profile and contact you about the next steps."
              : "We cannot verify an application from this page alone. Please use your application form or contact CSTMed if you need assistance."}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 md:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-black text-[#082a43]">{validReference ? "What happens next?" : "Need help?"}</h2>
          {validReference ? (
            <ol className="mt-6 space-y-5">
              {[
                ["01", "We review your profile", "We check your specialty, experience and professional plans."],
                ["02", "We get in touch", "We discuss your availability, preferences and interest in working in France."],
                ["03", "We explore suitable opportunities", "If your profile matches an opportunity, we discuss the role and its requirements."],
                ["04", "We support you", "We can guide you through recruitment and the next administrative steps."],
              ].map(([number, title, detail]) => (
                <li key={number} className="flex gap-4 rounded-2xl bg-[#f5f9fb] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5f7f5] font-black text-[#0c7773]">{number}</span>
                  <div><p className="font-black text-[#082a43]">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-slate-600">If you submitted a CV but did not receive a reference, please contact our team.</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/offres" className="rounded-full bg-[#0D6EFD] px-6 py-3 font-black text-[#082A43]">Browse jobs →</Link>
            <Link href="/en" className="rounded-full border border-slate-300 px-6 py-3 font-bold text-[#082a43]">Back to home</Link>
          </div>
        </div>
        <aside className="space-y-5">
          {shortReference && (
            <div className="rounded-3xl bg-[#082a43] p-6 text-white shadow-lg">
              <p className="text-sm font-black uppercase tracking-wider text-[#65d9ce]">Application reference</p>
              <p className="mt-4 break-all rounded-xl bg-white/10 p-4 text-center font-mono text-xl font-black tracking-wider">{shortReference}</p>
              <p className="mt-3 text-xs leading-5 text-slate-300">Keep this reference for future correspondence with CSTMed.</p>
            </div>
          )}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#082a43]">Questions?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Contact CSTMed if you need more information about your application.</p>
            <a href={`mailto:${publicLinks.email}`} className="mt-4 block break-all font-bold text-[#0c7773] underline">{publicLinks.email}</a>
          </div>
        </aside>
      </section>
      <EnglishFooter />
    </main>
  );
}
