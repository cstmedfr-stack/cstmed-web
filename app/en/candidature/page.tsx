import type { Metadata } from "next";
import Link from "next/link";
import { submitApplication } from "@/app/[lang]/candidature/actions";
import { EnglishHeader, EnglishFooter } from "@/components/public/english-site-shell";
import { CvFileInput } from "@/components/public/cv-file-input";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Apply for healthcare jobs in France | CSTMed",
  description: "Submit your professional profile and CV to CSTMed for healthcare recruitment in France.",
};

const input = "mt-1 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[#102435]";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EnglishApplicationProps = {
  searchParams: Promise<{ jobId?: string; error?: string }>;
};

export default async function EnglishApplication({ searchParams }: EnglishApplicationProps) {
  const p = await searchParams;
  const jobId = p.jobId && uuid.test(p.jobId) ? p.jobId : null;
  const supabase = await createClient();
  const { data: job } = jobId
    ? await supabase
        .from("jobs")
        .select("id,title,specialty,location_label")
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle()
    : { data: null };

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <EnglishHeader />
      <section className="bg-[#082a43] px-5 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black">Apply with CSTMed</h1>
          <p className="mt-4 text-slate-200">
            Send us your profile and CV. We will contact you to discuss your plans to work in France.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-9">
        {job && (
          <div className="mb-6 rounded-2xl border border-teal-200 bg-[#e5f7f5] p-5">
            <p className="font-semibold">Applying for: {job.title}</p>
            {job.location_label && <p className="mt-1 text-sm">{job.location_label}</p>}
          </div>
        )}

        {p.error ? (
          <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
            {p.error.slice(0, 400)}
          </p>
        ) : null}
        <form
          action={submitApplication}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          encType="multipart/form-data"
        >
          {/* The existing backend currently accepts ro/fr; retain fr until English is supported server-side. */}
          <input name="locale" type="hidden" value="fr" />
          <input name="formLanguage" type="hidden" value="en" />
          {job && <input name="jobId" type="hidden" value={job.id} />}
          <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
            <input name="website" type="text" tabIndex={-1} autoComplete="new-password" defaultValue="" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              First name *
              <input name="firstName" required maxLength={100} autoComplete="given-name" className={input} />
            </label>
            <label className="text-sm font-bold">
              Last name *
              <input name="lastName" required maxLength={100} autoComplete="family-name" className={input} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Email *
              <input name="email" type="email" required maxLength={254} autoComplete="email" className={input} />
            </label>
            <label className="text-sm font-bold">
              Phone / WhatsApp *
              <input name="phone" type="tel" required maxLength={50} autoComplete="tel" className={input} />
            </label>
          </div>
          <label className="block text-sm font-bold">
            Medical specialty *
            <input name="specialty" required maxLength={150} defaultValue={job?.specialty ?? ""} className={input} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Country
              <input name="country" maxLength={100} className={input} />
            </label>
            <label className="text-sm font-bold">
              City
              <input name="city" maxLength={120} className={input} />
            </label>
          </div>
          <label className="block text-sm font-bold">
            French language level
            <select name="frenchLevel" className={input} defaultValue="">
              <option value="">Select your level</option>
              {["none", "a1", "a2", "b1", "b2", "c1", "c2", "native"].map((level) => (
                <option key={level} value={level}>
                  {level === "none" ? "No French" : level === "native" ? "Native" : level.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Your professional plans / message
            <textarea name="message" rows={5} maxLength={5000} className={input} />
          </label>

          <CvFileInput
            locale="en"
            label="Your CV (PDF, DOC or DOCX; maximum 4 MB)"
            help="Choose a PDF, DOC or DOCX file, up to 4 MB."
          />

          <p className="text-sm leading-6 text-slate-700">
            Your personal data and CV will be processed to review your application and contact you about recruitment opportunities.{" "}
            <Link href="/en/confidentialite" className="font-bold underline">Privacy information</Link>
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" required className="mt-1" />
            <span>I have read the privacy information and request that CSTMed process my application. *</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="talentPoolConsent" className="mt-1" />
            <span>Optional: I agree that CSTMed may retain my profile to contact me about suitable future opportunities.</span>
          </label>
          <button type="submit" className="w-full rounded-full bg-[#118c87] px-6 py-4 font-black text-white" style={{ color: "#fff" }}>
            Submit application
          </button>

        </form>
      </div>
      <EnglishFooter />
    </main>
  );
}
