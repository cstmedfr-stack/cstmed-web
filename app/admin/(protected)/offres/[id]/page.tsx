import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobStatusActions } from "../job-status-actions";
import {  saveRomanianTranslation,  updateJobDetails,} from "../actions";

export const dynamic = "force-dynamic";

type JobStatus =
  | "draft"
  | "published"
  | "rejected"
  | "archived";

type AdminJobPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    saved?: string;
    translationSaved?: string;
  }>;
};

type Job = {
  id: string;
  source_job_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  working_time: string | null;
  salary_text: string | null;
  experience_text: string | null;
  application_url: string | null;
  source_url: string | null;
  status: JobStatus;
  france_travail_published_at: string | null;
  created_at: string;
};

const statusLabels: Record<JobStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  rejected: "Refusée",
  archived: "Archivée",
};

const statusClasses: Record<JobStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Non précisée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

export default async function AdminJobDetailsPage({
  params,
  searchParams,
}: AdminJobPageProps) {
  
const { id } = await params;

const query = await searchParams;
const saved = query.saved;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        source_job_id,
        title,
        description,
        company_name,
        specialty,
        location_label,
        city,
        postal_code,
        contract_type,
        working_time,
        salary_text,
        experience_text,
        application_url,
        source_url,
        status,
        france_travail_published_at,
        created_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const job = data as Job;
const {
  data: romanianTranslation,
  error: translationError,
} = await supabase
  .from("job_translations")
  .select("title, summary, description, status")
  .eq("job_id", id)
  .eq("locale", "ro")
  .maybeSingle();

if (translationError) {
  throw new Error(translationError.message);
}
    

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href="/">
            <Image
              src="/images/cstmed-logo.jpg"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[185px] object-contain sm:w-[220px]"
            />
          </Link>

          <Link
            href="/admin/offres"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Retour aux offres
          </Link>
        </div>
      </header>

      <section className="bg-[#082a43] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                statusClasses[job.status]
              }`}
            >
              {statusLabels[job.status]}
            </span>

            <span className="text-sm text-slate-300">
              Référence France Travail : {job.source_job_id}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-bold sm:text-4xl">
            Vérifier et modifier l’offre
          </h1>

          <p className="mt-3 text-slate-300">
            Importée le {formatDate(job.created_at)}
          </p>
        </div>
      </section>




      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_330px]">
          <div>
            {saved === "1" ? (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700"
              >
                Les modifications ont été enregistrées.
              </div>
            ) : null}

            <form
              action={updateJobDetails}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
            >
              <input type="hidden" name="jobId" value={job.id} />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Titre de l’offre *
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={job.title}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Spécialité
                  </label>

                  <input
                    id="specialty"
                    name="specialty"
                    type="text"
                    defaultValue={job.specialty ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Établissement
                  </label>

                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    defaultValue={job.company_name ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Description complète
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={18}
                    defaultValue={job.description ?? ""}
                    className={`${inputClassName} resize-y leading-7`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                    Localisation
                  </h2>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="location_label"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Localisation affichée
                  </label>

                  <input
                    id="location_label"
                    name="location_label"
                    type="text"
                    defaultValue={job.location_label ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Ville
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    defaultValue={job.city ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postal_code"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Code postal
                  </label>

                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    defaultValue={job.postal_code ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                    Conditions du poste
                  </h2>
                </div>

                <div>
                  <label
                    htmlFor="contract_type"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Type de contrat
                  </label>

                  <input
                    id="contract_type"
                    name="contract_type"
                    type="text"
                    defaultValue={job.contract_type ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="working_time"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Temps de travail
                  </label>

                  <input
                    id="working_time"
                    name="working_time"
                    type="text"
                    defaultValue={job.working_time ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="salary_text"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Rémunération
                  </label>

                  <input
                    id="salary_text"
                    name="salary_text"
                    type="text"
                    defaultValue={job.salary_text ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="experience_text"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Expérience demandée
                  </label>

                  <input
                    id="experience_text"
                    name="experience_text"
                    type="text"
                    defaultValue={job.experience_text ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-[#082a43]">
                    Liens
                  </h2>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="application_url"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Lien de candidature CSTMed
                  </label>

                  <input
                    id="application_url"
                    name="application_url"
                    type="url"
                    defaultValue={job.application_url ?? ""}
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="source_url"
                    className="block text-sm font-bold text-[#082a43]"
                  >
                    Lien de l’offre originale
                  </label>

                  <input
                    id="source_url"
                    name="source_url"
                    type="url"
                    defaultValue={job.source_url ?? ""}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/admin/offres"
                  className="rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Annuler
                </Link>

                <button
                  type="submit"
                  className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white shadow-sm transition hover:bg-[#0c7773]"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
                    <div className="mt-8">
              {query.translationSaved === "1" ? (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700">
                  Traducerea în limba română a fost salvată.
                </div>
              ) : null}

              <form
                action={saveRomanianTranslation}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
              >
                <input
                  type="hidden"
                  name="jobId"
                  value={job.id}
                />

                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                      Versiunea română
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-[#082a43]">
                      Traducerea ofertei
                    </h2>
                  </div>

                  <select
                    name="translationStatus"
                    defaultValue={
                      romanianTranslation?.status ?? "draft"
                    }
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold"
                  >
                    <option value="draft">
                      Traducere în lucru
                    </option>

                    <option value="published">
                      Traducere publicată
                    </option>
                  </select>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="translationTitle"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      Titlul în limba română
                    </label>

                    <input
                      id="translationTitle"
                      name="translationTitle"
                      type="text"
                      defaultValue={
                        romanianTranslation?.title ?? ""
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="translationSummary"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      Rezumat scurt
                    </label>

                    <textarea
                      id="translationSummary"
                      name="translationSummary"
                      rows={4}
                      defaultValue={
                        romanianTranslation?.summary ?? ""
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 leading-7"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="translationDescription"
                      className="block text-sm font-bold text-[#082a43]"
                    >
                      Descrierea în limba română
                    </label>

                    <textarea
                      id="translationDescription"
                      name="translationDescription"
                      rows={18}
                      defaultValue={
                        romanianTranslation?.description ?? ""
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 leading-7"
                    />
                  </div>
                </div>

                <div className="mt-7 flex justify-end border-t border-slate-200 pt-7">
                  <button
                    type="submit"
                    className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white transition hover:bg-[#0c7773]"
                  >
                    Salvează traducerea
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-6">
            <div className="rounded-[2rem] bg-[#082a43] p-6 text-white shadow-lg">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#65d9ce]">
                Statut de l’offre
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {statusLabels[job.status]}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Enregistrez d’abord vos modifications, puis choisissez le
                statut approprié.
              </p>

              <div className="mt-6">
                <JobStatusActions
                  jobId={job.id}
                  status={job.status}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-[#082a43]">
                Informations d’import
              </h2>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">
                    Publication France Travail
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {formatDate(job.france_travail_published_at)}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Référence
                  </dt>
                  <dd className="mt-1 break-all text-slate-700">
                    {job.source_job_id}
                  </dd>
                </div>
              </dl>




              {job.source_url ? (
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-bold text-[#118c87] hover:text-[#0c7773]"
                >
                  Voir la source originale ↗
                </a>
              ) : null}
            </div>
          </aside>
        </div>


        
      </section>
    </main>
  );
}