import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  title: string;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
  contract_type: string | null;
  salary_text: string | null;
  description: string | null;
  france_travail_published_at: string | null;
};

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function shortenDescription(description: string | null) {
  if (!description) {
    return "Consultez cette opportunité médicale et contactez CSTMed pour obtenir davantage d’informations.";
  }

  const cleanDescription = description.replace(/\s+/g, " ").trim();

  if (cleanDescription.length <= 220) {
    return cleanDescription;
  }

  return `${cleanDescription.slice(0, 220).trim()}…`;
}

export default async function JobsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        specialty,
        location_label,
        city,
        contract_type,
        salary_text,
        description,
        france_travail_published_at
      `,
    )
    .eq("status", "published")
    .order("france_travail_published_at", {
      ascending: false,
      nullsFirst: false,
    });

  const jobs = (data ?? []) as Job[];

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <Link href="/" className="text-2xl font-bold text-[#082a43]">
            CST<span className="text-[#118c87]">Med</span>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-semibold text-[#118c87] transition hover:bg-[#e5f7f5]"
          >
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#76e0d5]">
            Opportunités médicales
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Offres d’emploi pour médecins en France
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Découvrez les opportunités sélectionnées par CSTMed et contactez-nous
            pour être accompagné dans votre candidature.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-18">
        <div className="mx-auto max-w-7xl">
          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
              <h2 className="text-lg font-bold text-red-800">
                Connexion à la base de données impossible
              </h2>

              <p className="mt-2 text-red-700">{error.message}</p>
            </div>
          ) : null}

          {!error && jobs.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f7f5] text-2xl">
                🩺
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#082a43]">
                Les premières offres seront bientôt disponibles
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                La connexion avec CSTMed fonctionne. Aucune offre n’est encore
                publiée, car les offres France Travail seront d’abord importées
                comme brouillons puis vérifiées.
              </p>

              <a
                href="mailto:contact@cstmed.fr?subject=Recherche%20d%27une%20opportunité%20médicale"
                className="mt-7 inline-flex rounded-full bg-[#118c87] px-6 py-3 font-semibold text-white transition hover:bg-[#0c7773]"
              >
                Envoyer ma candidature
              </a>
            </div>
          ) : null}

          {!error && jobs.length > 0 ? (
            <>
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                    Offres disponibles
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#082a43]">
                    {jobs.length} offre{jobs.length > 1 ? "s" : ""} publiée
                    {jobs.length > 1 ? "s" : ""}
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {jobs.map((job) => {
                  const location =
                    job.location_label || job.city || "France entière";
                  const publishedAt = formatDate(
                    job.france_travail_published_at,
                  );

                  return (
                    <article
                      key={job.id}
                      className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#9fded8] hover:shadow-lg"
                    >
                      <div className="flex flex-wrap gap-2">
                        {job.specialty ? (
                          <span className="rounded-full bg-[#e5f7f5] px-3 py-1.5 text-xs font-bold text-[#0c7773]">
                            {job.specialty}
                          </span>
                        ) : null}

                        {job.contract_type ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {job.contract_type}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-5 text-2xl font-bold text-[#082a43]">
                        {job.title}
                      </h3>

                      <p className="mt-3 font-medium text-[#118c87]">
                        📍 {location}
                      </p>

                      <p className="mt-5 flex-1 leading-7 text-slate-600">
                        {shortenDescription(job.description)}
                      </p>

                      {job.salary_text ? (
                        <p className="mt-5 text-sm font-semibold text-slate-700">
                          Rémunération : {job.salary_text}
                        </p>
                      ) : null}

                      <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-slate-500">
                          {publishedAt
                            ? `Publiée le ${publishedAt}`
                            : "Offre sélectionnée par CSTMed"}
                        </span>

                       <Link
                            href={`/offres/${job.id}`}
                            className="rounded-full bg-[#118c87] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0c7773]"
                            >
                            Voir l’offre
                            </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}