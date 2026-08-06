import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParameters = {
  q?: string | string[];
  specialty?: string | string[];
  location?: string | string[];
  contract?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type JobsPageProps = {
  searchParams: Promise<SearchParameters>;
};

type SortOrder = "newest" | "oldest";

type Job = {
  id: string;
  title: string;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  salary_text: string | null;
  description: string | null;
  france_travail_published_at: string | null;
  created_at: string;
};

type JobFilterRow = {
  specialty: string | null;
  contract_type: string | null;
};

function getParameter(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function getPositiveInteger(
  value: string,
  fallback = 1,
) {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return parsedValue;
}

function cleanSearchValue(
  value: string,
  maximumLength = 100,
) {
  return value
    .slice(0, maximumLength)
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function shortenDescription(
  description: string | null,
) {
  if (!description) {
    return "Consultez cette opportunité médicale et contactez CSTMed pour être accompagné dans votre candidature.";
  }

  const cleanDescription = description
    .replace(/\s+/g, " ")
    .trim();

  if (cleanDescription.length <= 230) {
    return cleanDescription;
  }

  return `${cleanDescription
    .slice(0, 230)
    .trim()}…`;
}

function uniqueSortedValues(
  values: Array<string | null>,
) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter(
          (value): value is string =>
            Boolean(value),
        ),
    ),
  ).sort((first, second) =>
    first.localeCompare(second, "fr", {
      sensitivity: "base",
    }),
  );
}

function createJobsUrl(options: {
  page?: number;
  q: string;
  specialty: string;
  location: string;
  contract: string;
  sort: SortOrder;
}) {
  const parameters = new URLSearchParams();

  if (options.q) {
    parameters.set("q", options.q);
  }

  if (options.specialty) {
    parameters.set(
      "specialty",
      options.specialty,
    );
  }

  if (options.location) {
    parameters.set(
      "location",
      options.location,
    );
  }

  if (options.contract) {
    parameters.set(
      "contract",
      options.contract,
    );
  }

  if (options.sort !== "newest") {
    parameters.set("sort", options.sort);
  }

  if (options.page && options.page > 1) {
    parameters.set(
      "page",
      String(options.page),
    );
  }

  const queryString = parameters.toString();

  return queryString
    ? `/offres?${queryString}`
    : "/offres";
}

export default async function JobsPage({
  searchParams,
}: JobsPageProps) {
  const parameters = await searchParams;

  const q = cleanSearchValue(
    getParameter(parameters.q),
  );

  const specialty = getParameter(
    parameters.specialty,
  ).slice(0, 150);

  const location = cleanSearchValue(
    getParameter(parameters.location),
    120,
  );

  const contract = getParameter(
    parameters.contract,
  ).slice(0, 100);

  const sort: SortOrder =
    getParameter(parameters.sort) === "oldest"
      ? "oldest"
      : "newest";

  const requestedPage = getPositiveInteger(
    getParameter(parameters.page),
  );

  const from =
    (requestedPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  /*
   * Această interogare este folosită numai pentru
   * opțiunile filtrelor. RLS permite publicului să
   * primească doar ofertele publicate.
   */
  const { data: filterRowsData } =
    await supabase
      .from("jobs")
      .select("specialty, contract_type")
      .eq("status", "published")
      .order("specialty", {
        ascending: true,
      })
      .limit(1000);

  const filterRows =
    (filterRowsData ?? []) as JobFilterRow[];

  const specialties = uniqueSortedValues(
    filterRows.map(
      (item) => item.specialty,
    ),
  );

  const contractTypes = uniqueSortedValues(
    filterRows.map(
      (item) => item.contract_type,
    ),
  );

  let jobsQuery = supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        specialty,
        location_label,
        city,
        postal_code,
        contract_type,
        salary_text,
        description,
        france_travail_published_at,
        created_at
      `,
      {
        count: "exact",
      },
    )
    .eq("status", "published");

  if (specialty) {
    jobsQuery = jobsQuery.eq(
      "specialty",
      specialty,
    );
  }

  if (contract) {
    jobsQuery = jobsQuery.eq(
      "contract_type",
      contract,
    );
  }

  if (q) {
    const searchPattern = `%${q}%`;

    jobsQuery = jobsQuery.or(
      [
        `title.ilike.${searchPattern}`,
        `specialty.ilike.${searchPattern}`,
        `description.ilike.${searchPattern}`,
      ].join(","),
    );
  }

  if (location) {
    const locationPattern = `%${location}%`;

    jobsQuery = jobsQuery.or(
      [
        `location_label.ilike.${locationPattern}`,
        `city.ilike.${locationPattern}`,
        `postal_code.ilike.${locationPattern}`,
      ].join(","),
    );
  }

  const {
    data,
    count,
    error,
  } = await jobsQuery
    .order("france_travail_published_at", {
      ascending: sort === "oldest",
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: sort === "oldest",
    })
    .range(from, to);

  const jobs = (data ?? []) as Job[];
  const totalJobs = count ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalJobs / PAGE_SIZE),
  );

  if (
    totalJobs > 0 &&
    requestedPage > totalPages
  ) {
    redirect(
      createJobsUrl({
        page: totalPages,
        q,
        specialty,
        location,
        contract,
        sort,
      }),
    );
  }

  const firstDisplayed =
    totalJobs === 0 ? 0 : from + 1;

  const lastDisplayed = Math.min(
    from + jobs.length,
    totalJobs,
  );

  const previousUrl = createJobsUrl({
    page: requestedPage - 1,
    q,
    specialty,
    location,
    contract,
    sort,
  });

  const nextUrl = createJobsUrl({
    page: requestedPage + 1,
    q,
    specialty,
    location,
    contract,
    sort,
  });

  const hasFilters =
    Boolean(q) ||
    Boolean(specialty) ||
    Boolean(location) ||
    Boolean(contract) ||
    sort !== "newest";

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <div className="bg-[#082a43] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-2.5 text-xs sm:px-8 sm:text-sm">
          <p>
            Recrutement médical • France – Europe
          </p>

          <div className="flex items-center gap-5">
            <Link
                        href="/admin/candidatures"
                        className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a59]"
                        >
                        Candidatures
                        </Link>
            <a
              href="tel:+33628262576"
              className="hidden transition hover:text-[#8ce1d8] sm:inline"
            >
              +33 (0) 6 28 26 25 76
            </a>

            <a
              href="mailto:contact@cstmed.fr"
              className="transition hover:text-[#8ce1d8]"
            >
              contact@cstmed.fr
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link
            href="/"
            aria-label="CSTMed – Accueil"
          >
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed – Parce que ta valeur doit être appréciée"
              width={240}
              height={80}
              priority
              className="h-auto w-[180px] object-contain sm:w-[220px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            <Link
              href="/"
              className="transition hover:text-[#118c87]"
            >
              Accueil
            </Link>

            <Link
              href="/#medecins"
              className="transition hover:text-[#118c87]"
            >
              Pour les médecins
            </Link>

            <Link
              href="/#etablissements"
              className="transition hover:text-[#118c87]"
            >
              Pour les établissements
            </Link>

            <span className="text-[#118c87]">
              Offres
            </span>
          </nav>

          <a
            href="mailto:contact@cstmed.fr"
            className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c7773]"
          >
            Nous contacter
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0c3c5d] to-[#11696d] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#76e0d5]">
            Opportunités médicales
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Offres d’emploi pour médecins en
            France
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            Découvrez les opportunités
            sélectionnées par CSTMed et bénéficiez
            d’un accompagnement personnalisé dans
            votre projet professionnel.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              ✓ Offres vérifiées avant publication
            </span>

            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              ✓ Accompagnement de la candidature
            </span>

            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              ✓ Suivi jusqu’à l’intégration
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <form
            method="get"
            className="relative -mt-20 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_0.8fr]">
              <div>
                <label
                  htmlFor="q"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Quel poste recherchez-vous ?
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Ex. cardiologue, urgentiste…"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Spécialité
                </label>

                <select
                  id="specialty"
                  name="specialty"
                  defaultValue={specialty}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="">
                    Toutes les spécialités
                  </option>

                  {specialties.map(
                    (specialtyOption) => (
                      <option
                        key={specialtyOption}
                        value={specialtyOption}
                      >
                        {specialtyOption}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Localisation
                </label>

                <input
                  id="location"
                  name="location"
                  type="search"
                  defaultValue={location}
                  placeholder="Ville, département ou code postal"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="contract"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Contrat
                </label>

                <select
                  id="contract"
                  name="contract"
                  defaultValue={contract}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="">
                    Tous les contrats
                  </option>

                  {contractTypes.map(
                    (contractOption) => (
                      <option
                        key={contractOption}
                        value={contractOption}
                      >
                        {contractOption}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <label
                  htmlFor="sort"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Classer les offres
                </label>

                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="newest">
                    Plus récentes
                  </option>

                  <option value="oldest">
                    Plus anciennes
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {hasFilters ? (
                  <Link
                    href="/offres"
                    className="rounded-full border border-slate-300 px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Effacer les filtres
                  </Link>
                ) : null}

                <button
                  type="submit"
                  className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white shadow-sm transition hover:bg-[#0c7773]"
                >
                  Rechercher les offres
                </button>
              </div>
            </div>
          </form>

          {error ? (
            <div className="mt-10 rounded-[2rem] border border-red-200 bg-red-50 p-7 text-red-700">
              <h2 className="font-bold">
                Les offres ne peuvent pas être
                affichées actuellement.
              </h2>

              <p className="mt-2">
                {error.message}
              </p>
            </div>
          ) : null}

          {!error ? (
            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                  Offres disponibles
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#082a43]">
                  {totalJobs} opportunité
                  {totalJobs > 1 ? "s" : ""}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Résultats {firstDisplayed}–
                  {lastDisplayed} sur {totalJobs}
                </p>
              </div>

              {totalJobs > 0 ? (
                <p className="text-sm font-semibold text-slate-500">
                  Page {requestedPage} sur{" "}
                  {totalPages}
                </p>
              ) : null}
            </div>
          ) : null}

          {!error && jobs.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f7f5] text-2xl">
                🔎
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#082a43]">
                Aucune offre ne correspond à votre
                recherche
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                Modifiez les critères ou transmettez
                directement votre CV à CSTMed. Nous
                pourrons vous contacter lorsqu’une
                opportunité adaptée sera disponible.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/offres"
                  className="rounded-full border border-[#118c87] px-6 py-3 font-bold text-[#118c87] transition hover:bg-[#e5f7f5]"
                >
                  Voir toutes les offres
                </Link>

                <a
                  href="mailto:contact@cstmed.fr?subject=Candidature%20spontanée%20CSTMed"
                  className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white transition hover:bg-[#0c7773]"
                >
                  Envoyer mon CV
                </a>
              </div>
            </div>
          ) : null}

          {!error && jobs.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {jobs.map((job) => {
                const locationText =
                  job.location_label ||
                  [
                    job.postal_code,
                    job.city,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "France";

                const publicationDate =
                  formatDate(
                    job.france_travail_published_at,
                  );

                return (
                  <article
                    key={job.id}
                    className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#9fded8] hover:shadow-xl"
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

                    <h3 className="mt-5 text-2xl font-bold leading-snug text-[#082a43] transition group-hover:text-[#118c87]">
                      <Link
                        href={`/offres/${job.id}`}
                      >
                        {job.title}
                      </Link>
                    </h3>

                    <p className="mt-3 font-semibold text-[#118c87]">
                      📍 {locationText}
                    </p>

                    <p className="mt-5 flex-1 leading-7 text-slate-600">
                      {shortenDescription(
                        job.description,
                      )}
                    </p>

                    {job.salary_text ? (
                      <div className="mt-5 rounded-2xl bg-[#f5f9fb] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Rémunération
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#082a43]">
                          {job.salary_text}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-slate-500">
                        {publicationDate
                          ? `Publiée le ${publicationDate}`
                          : "Offre sélectionnée par CSTMed"}
                      </span>

                      <Link
                        href={`/offres/${job.id}`}
                        className="rounded-full bg-[#118c87] px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#0c7773]"
                      >
                        Voir l’offre
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!error && totalPages > 1 ? (
            <nav
              aria-label="Pagination des offres"
              className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:flex-row"
            >
              {requestedPage > 1 ? (
                <Link
                  href={previousUrl}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← Page précédente
                </Link>
              ) : (
                <span className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-300">
                  ← Page précédente
                </span>
              )}

              <span className="text-sm font-semibold text-slate-600">
                Page {requestedPage} sur{" "}
                {totalPages}
              </span>

              {requestedPage < totalPages ? (
                <Link
                  href={nextUrl}
                  className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c7773]"
                >
                  Page suivante →
                </Link>
              ) : (
                <span className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-300">
                  Page suivante →
                </span>
              )}
            </nav>
          ) : null}

          <div className="mt-14 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0b3a59] to-[#118c87] px-7 py-10 text-white shadow-xl sm:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8ce1d8]">
                  Candidature spontanée
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Vous ne trouvez pas encore
                  l’opportunité recherchée ?
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-200">
                  Transmettez-nous votre profil,
                  votre spécialité et vos critères.
                  CSTMed pourra vous contacter pour
                  une future opportunité adaptée.
                </p>
              </div>

              <a
                href="mailto:contact@cstmed.fr?subject=Candidature%20spontanée%20CSTMed"
                className="rounded-full bg-white px-7 py-3.5 text-center font-bold text-[#082a43] transition hover:bg-slate-100"
              >
                Déposer ma candidature
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#061f33] px-5 py-10 text-slate-300 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-bold text-white">
              CST
              <span className="text-[#65d9ce]">
                Med
              </span>
            </p>

            <p className="mt-2 text-sm">
              Recrutement médical France – Europe
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            <Link
              href="/"
              className="hover:text-white"
            >
              Accueil
            </Link>

            <a
              href="mailto:contact@cstmed.fr"
              className="hover:text-white"
            >
              Contact
            </a>

            <span>
              © 2026 CSTMed
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}