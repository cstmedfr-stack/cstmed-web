import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addImportKeyword, updateImportKeyword } from "./actions";

export const dynamic = "force-dynamic";
type Category = "medecins" | "dentistes" | "pharmaciens" | "infirmiers";
type CategoryFilter = Category | "all";
type StatusFilter = "all" | "active" | "inactive";
type Keyword = {
  id: number; keyword: string; enabled: boolean; jobs_per_keyword: number;
  cdi_only: boolean; updated_at: string; professional_category: Category;
};
type Props = { searchParams: Promise<{ category?: string; q?: string; status?: string; added?: string; error?: string }> };
const categories: { value: Category; label: string }[] = [
  { value: "medecins", label: "Médecins" },
  { value: "dentistes", label: "Chirurgiens-dentistes" },
  { value: "pharmaciens", label: "Pharmaciens" },
  { value: "infirmiers", label: "Infirmiers / Infirmières" },
];
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#102435] focus:border-[#118c87] focus:outline-none";
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
}
function categoryLabel(value: Category) {
  return categories.find((item) => item.value === value)?.label ?? value;
}
function getUrl(category: CategoryFilter, q: string, status: StatusFilter) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);
  const encoded = params.toString();
  return `/admin/mots-cles${encoded ? `?${encoded}` : ""}`;
}
export default async function AdminKeywordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category: CategoryFilter = params.category && categories.some((item) => item.value === params.category)
    ? (params.category as Category)
    : "all";
  const q = (params.q ?? "").trim().slice(0, 120);
  const status: StatusFilter = params.status === "active" || params.status === "inactive" ? params.status : "all";
  const supabase = await createClient();
  const { data, error } = await supabase.from("import_keywords")
    .select("id,keyword,enabled,jobs_per_keyword,cdi_only,updated_at,professional_category")
    .order("keyword", { ascending: true }).limit(1000);
  const keywords = (data ?? []) as Keyword[];
  const filtered = keywords.filter((item) =>
    (category === "all" || item.professional_category === category) &&
    (status === "all" || item.enabled === (status === "active")) &&
    (!q || normalize(item.keyword).includes(normalize(q)))
  );
  const active = keywords.filter((item) => item.enabled).length;
  const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin"><Image src="/images/cstmed-logo.png" alt="CSTMed" width={220} height={74} priority className="h-auto w-[190px] object-contain" /></Link>
          <nav className="flex flex-wrap gap-2 text-sm font-bold">
            <Link href="/admin" className="rounded-full bg-[#082a43] px-5 py-3 text-white">Tableau de bord</Link>
            <Link href="/admin/import" className="rounded-full bg-[#118c87] px-5 py-3 text-white">Import France Travail</Link>
            <Link href="/admin/offres" className="rounded-full border border-slate-300 bg-white px-5 py-3">Gestion des offres</Link>
            <Link href="/admin/candidatures" className="rounded-full border border-slate-300 bg-white px-5 py-3">Candidatures</Link>
          </nav>
        </div>
      </header>
      <section className="bg-[#082a43] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">Administration CSTMed</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Mots-clés France Travail</h1>
          <p className="mt-3 max-w-3xl text-slate-200">Gérez les mots-clés par profession, leur activation et le nombre de résultats souhaité.</p>
        </div>
      </section>
      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {params.added === "1" && <p className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">Le mot-clé a été ajouté.</p>}
          {params.error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-800">{params.error}</p>}
          {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-800">{error.message}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            {[{ label: "Total", value: keywords.length }, { label: "Actifs", value: active }, { label: "Désactivés", value: keywords.length - active }].map((item) =>
              <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-black text-[#082a43]">{item.value}</p></div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => {
              const group = keywords.filter((row) => row.professional_category === item.value);
              return <Link key={item.value} href={getUrl(item.value, "", "all")}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[#118c87] ${category === item.value ? "border-[#118c87] ring-2 ring-[#118c87]/20" : "border-slate-200"}`}>
                <p className="font-bold text-[#082a43]">{item.label}</p>
                <p className="mt-2 text-2xl font-black">{group.length}</p>
                <p className="mt-1 text-xs text-slate-500">{group.filter((row) => row.enabled).length} actifs</p>
              </Link>;
            })}
          </div>
          <form action={addImportKeyword} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-[#082a43]">Ajouter un mot-clé</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_2fr_110px_auto_auto_auto] xl:items-end">
              <label className="block text-sm font-bold">Mot-clé<input name="keyword" required placeholder="Ex. médecin vasculaire" className={`mt-2 ${inputClass}`} /></label>
              <label className="block text-sm font-bold">Catégorie professionnelle
                <select name="professionalCategory" required defaultValue={category === "all" ? "medecins" : category} className={`mt-2 ${inputClass}`}>
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold">Maximum<input name="jobsPerKeyword" type="number" min={1} max={100} defaultValue={10} className={`mt-2 ${inputClass}`} /></label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="enabled" defaultChecked className="h-5 w-5 accent-[#118c87]" /> Actif</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="cdiOnly" className="h-5 w-5 accent-[#118c87]" /> CDI seulement</label>
              <button type="submit" className="rounded-full bg-[#118c87] px-5 py-3 font-bold text-white">Ajouter</button>
            </div>
          </form>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-black text-[#082a43]">Recherches configurées</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={getUrl("all", q, status)} className={`rounded-full px-4 py-2 text-sm font-bold ${category === "all" ? "bg-[#082a43] text-white" : "bg-slate-100"}`}style={{ color: active ? "#ffffff" : "#082a43" }}>Toutes les professions</Link>
              {categories.map((item) => <Link key={item.value} href={getUrl(item.value, q, status)} className={`rounded-full px-4 py-2 text-sm font-bold ${category === item.value ? "bg-[#082a43] text-white" : "bg-slate-100"}`}>{item.label}</Link>)}
            </div>
            <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
              {category !== "all" && <input type="hidden" name="category" value={category} />}
              <label className="min-w-[220px] flex-1 text-sm font-bold">Rechercher un mot-clé<input type="search" name="q" defaultValue={q} placeholder="Ex. pediatre" className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm font-bold">État<select name="status" defaultValue={status} className={`mt-2 ${inputClass}`}><option value="all">Tous</option><option value="active">Actifs</option><option value="inactive">Désactivés</option></select></label>
              <button className="rounded-full bg-[#118c87] px-5 py-3 font-bold text-white">Filtrer</button>
              <Link href="/admin/mots-cles" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold">Effacer</Link>
            </form>
            <p className="mt-4 text-sm text-slate-600">{filtered.length} mot(s)-clé(s) affiché(s). Enregistrez chaque ligne après modification.</p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            {filtered.length === 0 ? <p className="p-8 text-center text-slate-500">Aucun mot-clé trouvé.</p> :
              <div className="divide-y divide-slate-100">
                {filtered.map((item) => <form key={item.id} action={updateImportKeyword}
                  className={`grid gap-3 p-5 sm:p-6 xl:grid-cols-[minmax(180px,2fr)_minmax(170px,1.7fr)_100px_auto_auto_auto] xl:items-center ${item.enabled ? "" : "bg-slate-50"}`}>
                  <input type="hidden" name="id" value={item.id} />
                  <label className="text-xs font-bold text-slate-500">Mot-clé<input name="keyword" required defaultValue={item.keyword} className={`mt-1 ${inputClass}`} /><span className="mt-1 block font-normal">Modifié le {date(item.updated_at)}</span></label>
                  <label className="text-xs font-bold text-slate-500">Catégorie
                    <select name="professionalCategory" defaultValue={item.professional_category} className={`mt-1 ${inputClass}`}>
                      {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-slate-500">Maximum<input name="jobsPerKeyword" type="number" min={1} max={100} defaultValue={item.jobs_per_keyword} className={`mt-1 ${inputClass}`} /></label>
                  <label className="flex items-center gap-2 text-sm font-semibold"><input name="enabled" type="checkbox" defaultChecked={item.enabled} className="h-5 w-5 accent-[#118c87]" /> Actif</label>
                  <label className="flex items-center gap-2 text-sm font-semibold"><input name="cdiOnly" type="checkbox" defaultChecked={item.cdi_only} className="h-5 w-5 accent-[#118c87]" /> CDI</label>
                  <button type="submit" className="rounded-full border border-[#118c87] px-4 py-2.5 text-sm font-bold text-[#0c7773] hover:bg-[#e5f7f5]">Enregistrer</button>
                </form>)}
              </div>}
          </div>
          <p className="text-sm text-slate-500">Les catégories servent à organiser les recherches. L'importateur continue de classifier les offres à partir de leur titre.</p>
        </div>
      </section>
    </main>
  );
}
