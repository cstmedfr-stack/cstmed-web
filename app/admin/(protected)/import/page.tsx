import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { runFranceTravailImport } from "./actions";

export const dynamic = "force-dynamic";

type ImportPageProps = {
  searchParams: Promise<{
    success?: string;
    imported?: string;
    duplicates?: string;
    errors?: string;
    error?: string;
  }>;
};

type ImportKeyword = {
  id: number;
  keyword: string;
  enabled: boolean;
  jobs_per_keyword: number;
  cdi_only: boolean;
};

type ImportRun = {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  imported_count: number;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "En cours";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const runStatusLabels: Record<string, string> = {
  running: "En cours",
  completed: "Terminé",
  failed: "Échec",
};

const runStatusClasses: Record<string, string> = {
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default async function AdminImportPage({
  searchParams,
}: ImportPageProps) {
  const query = await searchParams;
  const supabase = createAdminClient();

  const [keywordsResult, runsResult] = await Promise.all([
    supabase
      .from("import_keywords")
      .select(
        `
          id,
          keyword,
          enabled,
          jobs_per_keyword,
          cdi_only
        `,
      )
      .eq("enabled", true)
      .order("keyword", {
        ascending: true,
      }),

    supabase
      .from("import_runs")
      .select(
        `
          id,
          started_at,
          completed_at,
          status,
          imported_count,
          duplicate_count,
          error_count,
          error_message
        `,
      )
      .order("started_at", {
        ascending: false,
      })
      .limit(10),
  ]);

  const keywords =
    (keywordsResult.data ?? []) as ImportKeyword[];

  const importRuns =
    (runsResult.data ?? []) as ImportRun[];

  const databaseError =
    keywordsResult.error?.message ??
    runsResult.error?.message ??
    null;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/">
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
            href="/admin"
            className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a59]"
          >
            Tableau de bord
          </Link>
            <Link
                href="/admin/mots-cles"
                className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a59]"
                >
                Gérer les mots-clés
                </Link>
            <Link
              href="/admin/offres"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Gestion des offres
            </Link>
<Link
  href="/admin/candidatures"
  className="rounded-full bg-[#082a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a59]"
>
  Candidatures
</Link>
            <Link
              href="/offres"
              target="_blank"
              className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-semibold text-[#118c87] transition hover:bg-[#e5f7f5]"
            >
              Voir le site public ↗
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#082a43] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
            Administration CSTMed
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Import France Travail
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Importez les offres comme brouillons, puis
            vérifiez-les avant leur publication sur CSTMed.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {query.success === "1" ? (
            <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-lg font-bold text-emerald-800">
                Importation terminée
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">
                    Nouvelles offres
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#118c87]">
                    {query.imported ?? "0"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">
                    Doublons ignorés
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {query.duplicates ?? "0"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">
                    Erreurs
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {query.errors ?? "0"}
                  </p>
                </div>
              </div>

              <Link
                href="/admin/offres"
                className="mt-5 inline-flex font-bold text-[#0c7773]"
              >
                Vérifier les offres importées →
              </Link>
            </div>
          ) : null}

          {query.error ? (
            <div
              role="alert"
              className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700"
            >
              <p className="font-bold">
                L’importation n’a pas pu être effectuée.
              </p>
              <p className="mt-2">{query.error}</p>
            </div>
          ) : null}

          {databaseError ? (
            <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              {databaseError}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-2">
            <form
              action={runFranceTravailImport}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
            >
              <input
                type="hidden"
                name="mode"
                value="single"
              />

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#118c87]">
                Importation contrôlée
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[#082a43]">
                Tester une spécialité
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Utilisez cette option pour contrôler les
                résultats avant de lancer l’importation
                complète.
              </p>

              <div className="mt-7">
                <label
                  htmlFor="keyword"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Mot-clé
                </label>

                <select
                  id="keyword"
                  name="keyword"
                  required
                  defaultValue="cardiologue"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                >
                  <option value="">
                    Sélectionner une spécialité
                  </option>

                  {keywords.map((item) => (
                    <option
                      key={item.id}
                      value={item.keyword}
                    >
                      {item.keyword}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="limit"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Nombre maximum d’offres
                </label>

                <input
                  id="limit"
                  name="limit"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="3"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                />
              </div>

              <label className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f5f9fb] p-4">
                <input
                  name="cdiOnly"
                  type="checkbox"
                  className="h-5 w-5 accent-[#118c87]"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Importer uniquement les offres CDI
                </span>
              </label>

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-[#118c87] px-6 py-3.5 font-bold text-white transition hover:bg-[#0c7773]"
              >
                Lancer l’importation test
              </button>
            </form>

            <form
              action={runFranceTravailImport}
              className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl sm:p-9"
            >
              <input
                type="hidden"
                name="mode"
                value="all"
              />

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#65d9ce]">
                Importation complète
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Importer toutes les spécialités
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Les {keywords.length} mots-clés actifs seront
                recherchés successivement. Toutes les nouvelles
                offres entreront comme brouillons.
              </p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                <p className="font-bold">
                  Avant de continuer
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <li>✓ Les doublons seront automatiquement ignorés.</li>
                  <li>✓ Aucune offre ne sera publiée automatiquement.</li>
                  <li>✓ Chaque offre restera à vérifier.</li>
                </ul>
              </div>

              <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                <input
                  name="cdiOnly"
                  type="checkbox"
                  className="h-5 w-5 accent-[#65d9ce]"
                />

                <span className="text-sm font-semibold">
                  Limiter toutes les recherches aux CDI
                </span>
              </label>

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-[#65d9ce] px-6 py-3.5 font-bold text-[#082a43] transition hover:bg-[#86e3da]"
              >
                Importer tous les mots-clés
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Pour le premier essai, utilisez d’abord
                l’importation contrôlée située à gauche.
              </p>
            </form>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-bold text-[#082a43]">
                Historique des importations
              </h2>
            </div>

            {importRuns.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Aucune importation enregistrée.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {importRuns.map((run) => (
                  <div
                    key={run.id}
                    className="grid gap-4 px-6 py-5 sm:px-8 lg:grid-cols-[1.3fr_0.8fr_1fr]"
                  >
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          runStatusClasses[run.status] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {runStatusLabels[run.status] ??
                          run.status}
                      </span>

                      <p className="mt-3 text-sm font-semibold text-[#082a43]">
                        Début : {formatDate(run.started_at)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Fin : {formatDate(run.completed_at)}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p>
                        Nouvelles :{" "}
                        <strong>{run.imported_count}</strong>
                      </p>
                      <p className="mt-1">
                        Doublons :{" "}
                        <strong>{run.duplicate_count}</strong>
                      </p>
                      <p className="mt-1">
                        Erreurs :{" "}
                        <strong>{run.error_count}</strong>
                      </p>
                    </div>

                    <div>
                      {run.error_message ? (
                        <p className="text-sm leading-6 text-red-700">
                          {run.error_message}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Importation enregistrée sans erreur
                          générale.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}