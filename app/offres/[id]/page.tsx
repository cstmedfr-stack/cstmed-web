import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JobPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Job = {
  id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  contract_nature: string | null;
  working_time: string | null;
  salary_text: string | null;
  experience_text: string | null;
  application_url: string | null;
  source_url: string | null;
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

function displayValue(value: string | null) {
  return value?.trim() || "Non précisé";
}

export default async function JobDetailsPage({
  params,
}: JobPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        description,
        company_name,
        specialty,
        location_label,
        city,
        postal_code,
        contract_type,
        contract_nature,
        working_time,
        salary_text,
        experience_text,
        application_url,
        source_url,
        france_travail_published_at
      `,
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const job = data as Job;

  const location =
    job.location_label ||
    [job.postal_code, job.city].filter(Boolean).join(" ") ||
    "France";

  const publishedAt = formatDate(
    job.france_travail_published_at,
  );

  const applicationSubject = encodeURIComponent(
    `Candidature CSTMed – ${job.title}`,
  );

  const applicationBody = encodeURIComponent(
    `Bonjour,

Je souhaite obtenir davantage d’informations et présenter ma candidature pour l’offre suivante :

${job.title}
Référence CSTMed : ${job.id}

Cordialement,`,
  );

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <div className="bg-[#082a43] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-2.5 text-xs sm:px-8 sm:text-sm">
          <p>Recrutement médical • France – Europe</p>

          <div className="flex items-center gap-5">
            <a
              href="tel:+33628262576"
              className="hidden hover:text-[#8ce1d8] sm:inline"
            >
              +33 (0) 6 28 26 25 76
            </a>

            <a
              href="mailto:contact@cstmed.fr"
              className="hover:text-[#8ce1d8]"
            >
              contact@cstmed.fr
            </a>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" aria-label="CSTMed – Accueil">
            <Image
              src="/images/cstmed-logo.jpg"
              alt="CSTMed – Parce que ta valeur doit être appréciée"
              width={240}
              height={80}
              priority
              className="h-auto w-[180px] object-contain sm:w-[220px]"
            />
          </Link>

          <Link
            href="/offres"
            className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-semibold text-[#118c87] transition hover:bg-[#e5f7f5]"
          >
            Retour aux offres
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {job.specialty ? (
              <span className="rounded-full bg-[#65d9ce] px-4 py-2 text-xs font-bold text-[#082a43]">
                {job.specialty}
              </span>
            ) : null}

            {job.contract_type ? (
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold">
                {job.contract_type}
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {job.title}
          </h1>

          <p className="mt-5 text-lg text-slate-200">
            📍 {location}
          </p>

          {publishedAt ? (
            <p className="mt-3 text-sm text-slate-300">
              Offre publiée le {publishedAt}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
              Description du poste
            </p>

            <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
              {job.description ||
                "Contactez CSTMed pour obtenir la description complète de cette opportunité."}
            </div>

            <div className="mt-10 border-t border-slate-100 pt-8">
              <h2 className="text-2xl font-bold text-[#082a43]">
                Informations sur l’offre
              </h2>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Localisation
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {location}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Type de contrat
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {displayValue(job.contract_type)}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Temps de travail
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {displayValue(job.working_time)}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Expérience
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {displayValue(job.experience_text)}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5 sm:col-span-2">
                  <dt className="text-sm font-semibold text-slate-500">
                    Rémunération
                  </dt>
                  <dd className="mt-2 font-bold text-[#082a43]">
                    {displayValue(job.salary_text)}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          <aside className="h-fit rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl lg:sticky lg:top-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
              Candidature accompagnée
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              Cette offre vous intéresse ?
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              CSTMed vous accompagne dans l’analyse du poste, la
              préparation de votre candidature et les démarches
              nécessaires à votre installation en France.
            </p>

            <a
              href={`mailto:contact@cstmed.fr?subject=${applicationSubject}&body=${applicationBody}`}
              className="mt-7 flex w-full items-center justify-center rounded-full bg-[#65d9ce] px-6 py-3.5 text-center font-bold text-[#082a43] transition hover:bg-[#86e3da]"
            >
              Postuler avec CSTMed
            </a>

            <a
              href="tel:+33628262576"
              className="mt-3 flex w-full items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-center font-semibold transition hover:bg-white/10"
            >
              Appeler CSTMed
            </a>

            <div className="mt-7 border-t border-white/10 pt-6 text-sm leading-6 text-slate-300">
              <p>✓ Premier échange confidentiel</p>
              <p className="mt-2">✓ Accompagnement personnalisé</p>
              <p className="mt-2">✓ Suivi jusqu’à l’intégration</p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="bg-[#061f33] px-5 py-8 text-center text-sm text-slate-400 sm:px-8">
        <p>© 2026 CSTMed. Tous droits réservés.</p>
      </footer>
    </main>
  );
}