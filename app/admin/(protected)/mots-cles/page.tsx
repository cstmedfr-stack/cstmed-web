import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  addImportKeyword,
  updateImportKeyword,
} from "./actions";

export const dynamic = "force-dynamic";

type KeywordsPageProps = {
  searchParams: Promise<{
    added?: string;
    error?: string;
  }>;
};

type ImportKeyword = {
  id: number;
  keyword: string;
  enabled: boolean;
  jobs_per_keyword: number;
  cdi_only: boolean;
  updated_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10";

export default async function AdminKeywordsPage({
  searchParams,
}: KeywordsPageProps) {
  const query = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("import_keywords")
    .select(
      `
        id,
        keyword,
        enabled,
        jobs_per_keyword,
        cdi_only,
        updated_at
      `,
    )
    .order("keyword", {
      ascending: true,
    });

  const keywords = (data ?? []) as ImportKeyword[];

  const activeCount = keywords.filter(
    (item) => item.enabled,
  ).length;

  const inactiveCount = keywords.length - activeCount;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/import"
              className="rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c7773]"
            >
              Import France Travail
            </Link>

            <Link
              href="/admin/offres"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Gestion des offres
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
            Mots-clés France Travail
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Choisissez les spécialités recherchées, le nombre
            maximum d’offres et les recherches limitées aux CDI.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {query.added === "1" ? (
            <div className="mb-7 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700">
              Le nouveau mot-clé a été ajouté.
            </div>
          ) : null}

          {query.error ? (
            <div
              role="alert"
              className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
            >
              {query.error}
            </div>
          ) : null}

          {error ? (
            <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error.message}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Total
              </p>
              <p className="mt-2 text-3xl font-bold text-[#082a43]">
                {keywords.length}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Actifs
              </p>
              <p className="mt-2 text-3xl font-bold text-[#118c87]">
                {activeCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Désactivés
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-500">
                {inactiveCount}
              </p>
            </div>
          </div>

          <form
            action={addImportKeyword}
            className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#118c87]">
              Nouvelle recherche
            </p>

            <h2 className="mt-3 text-2xl font-bold text-[#082a43]">
              Ajouter un mot-clé
            </h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_180px_auto_auto] lg:items-end">
              <div>
                <label
                  htmlFor="new-keyword"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Mot-clé ou spécialité
                </label>

                <input
                  id="new-keyword"
                  name="keyword"
                  type="text"
                  required
                  placeholder="Ex. médecin vasculaire"
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <div>
                <label
                  htmlFor="new-limit"
                  className="block text-sm font-bold text-[#082a43]"
                >
                  Maximum
                </label>

                <input
                  id="new-limit"
                  name="jobsPerKeyword"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="30"
                  className={`mt-2 ${inputClassName}`}
                />
              </div>

              <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[#f5f9fb] px-4 py-2.5">
                <input
                  name="cdiOnly"
                  type="checkbox"
                  className="h-5 w-5 accent-[#118c87]"
                />

                <span className="text-sm font-semibold">
                  CDI seulement
                </span>
              </label>

              <button
                type="submit"
                className="min-h-11 rounded-full bg-[#118c87] px-6 py-2.5 font-bold text-white transition hover:bg-[#0c7773]"
              >
                Ajouter
              </button>
            </div>
          </form>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-bold text-[#082a43]">
                Recherches configurées
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enregistrez chaque ligne après une modification.
              </p>
            </div>

            {keywords.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun mot-clé n’est configuré.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {keywords.map((item) => (
                  <form
                    key={item.id}
                    action={updateImportKeyword}
                    className={`grid gap-4 px-6 py-5 sm:px-8 xl:grid-cols-[1fr_130px_150px_150px_auto] xl:items-center ${
                      item.enabled
                        ? "bg-white"
                        : "bg-slate-50 opacity-75"
                    }`}
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />

                    <div>
                      <label
                        htmlFor={`keyword-${item.id}`}
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 xl:hidden"
                      >
                        Mot-clé
                      </label>

                      <input
                        id={`keyword-${item.id}`}
                        name="keyword"
                        type="text"
                        required
                        defaultValue={item.keyword}
                        className={inputClassName}
                      />

                      <p className="mt-2 text-xs text-slate-400">
                        Modifié le {formatDate(item.updated_at)}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor={`limit-${item.id}`}
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        Maximum
                      </label>

                      <input
                        id={`limit-${item.id}`}
                        name="jobsPerKeyword"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={item.jobs_per_keyword}
                        className={inputClassName}
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-xl bg-[#f5f9fb] px-4 py-3">
                      <input
                        name="enabled"
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="h-5 w-5 accent-[#118c87]"
                      />

                      <span className="text-sm font-semibold">
                        Actif
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl bg-[#f5f9fb] px-4 py-3">
                      <input
                        name="cdiOnly"
                        type="checkbox"
                        defaultChecked={item.cdi_only}
                        className="h-5 w-5 accent-[#118c87]"
                      />

                      <span className="text-sm font-semibold">
                        CDI seulement
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="rounded-full border border-[#118c87] px-5 py-2.5 text-sm font-bold text-[#118c87] transition hover:bg-[#e5f7f5]"
                    >
                      Enregistrer
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}