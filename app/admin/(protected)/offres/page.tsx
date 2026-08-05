import { JobStatusActions } from "./job-status-actions";
import Image from "next/image";
import Link from "next/link";
import { logoutAdmin } from "../../actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const statusLabels = {
  draft: "Brouillon",
  published: "Publiée",
  rejected: "Refusée",
  archived: "Archivée",
} as const;

type JobStatus = keyof typeof statusLabels;
export default async function AdminJobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, specialty, status, location_label, created_at")
    .order("created_at", {
      ascending: false,
    });

  const totalJobs = jobs?.length ?? 0;
  const draftJobs =
    jobs?.filter((job) => job.status === "draft").length ?? 0;
  const publishedJobs =
    jobs?.filter((job) => job.status === "published").length ?? 0;

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
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>

          <div className="flex flex-wrap items-center gap-3">
  <Link
    href="/admin/import"
    className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c7773]"
  >
    Importer France Travail
  </Link>

  <form action={logoutAdmin}>
    <button
      type="submit"
      className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
    >
      Se déconnecter
    </button>
  </form>
</div>
        </div>
      </header>

      <section className="bg-[#082a43] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Gestion des offres
          </h1>

          <p className="mt-4 text-slate-300">
            Vérifiez les offres importées depuis France Travail avant leur
            publication.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Total des offres
              </p>
              <p className="mt-2 text-3xl font-bold text-[#082a43]">
                {totalJobs}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Brouillons
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {draftJobs}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Publiées
              </p>
              <p className="mt-2 text-3xl font-bold text-[#118c87]">
                {publishedJobs}
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error.message}
            </div>
          ) : null}

          {!error && totalJobs === 0 ? (
            <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
              Aucune offre n’a encore été importée.
            </div>
          ) : null}

          {!error && jobs && jobs.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-bold text-[#082a43]">
                  Dernières offres importées
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            job.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : job.status === "draft"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabels[job.status as JobStatus] ?? job.status}
                        </span>

                        {job.specialty ? (
                          <span className="text-sm font-semibold text-[#118c87]">
                            {job.specialty}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 font-bold text-[#082a43]">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.location_label || "Localisation non précisée"}
                      </p>
                    </div>

                    <JobStatusActions
                    jobId={job.id}
                    status={job.status as JobStatus}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}