import type { Metadata } from "next";
import Link from "next/link";
import { getPublicJobs, type ProfessionalCategory } from "@/lib/jobs/get-public-jobs";
import { EnglishHeader, EnglishFooter } from "@/components/public/english-site-shell";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Healthcare jobs in France | CSTMed", description: "Search published medical vacancies in France. Listings are provided in their original French language.", alternates: { canonical: "/en/offres" } };
type Params = { q?: string; category?: string; specialty?: string; location?: string; contract?: string; sort?: string; page?: string };
const categories: ProfessionalCategory[] = ["all", "medecins", "dentistes", "pharmaciens", "infirmiers"];
const names: Record<ProfessionalCategory,string> = {all:"All healthcare professions",medecins:"Physicians",dentistes:"Dentists",pharmaciens:"Pharmacists",infirmiers:"Nurses"};
const field = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[#102435]";
function safe(v:string|undefined,max=100){return (v??"").slice(0,max).replace(/[,%()]/g," ").trim();}
export default async function EnglishOffers({searchParams}:{searchParams:Promise<Params>}){
 const q = await searchParams;
 const filters = {q:safe(q.q),professionalCategory:categories.includes(q.category as ProfessionalCategory)?q.category as ProfessionalCategory:"all" as ProfessionalCategory,specialty:safe(q.specialty),location:safe(q.location),contract:safe(q.contract),sort:q.sort==="oldest"?"oldest" as const:"newest" as const,page:Math.max(1,Math.min(10000,parseInt(q.page??"1",10)||1)),pageSize:12};
 // English uses the full set of published French listings; no translation record is required.
 const result = await getPublicJobs("fr",filters);
 const pages = Math.max(1,Math.ceil(result.total/filters.pageSize));
 const pageUrl = (page:number)=>{const p=new URLSearchParams(); if(filters.q)p.set("q",filters.q); if(filters.professionalCategory!=="all")p.set("category",filters.professionalCategory);if(filters.specialty)p.set("specialty",filters.specialty);if(filters.location)p.set("location",filters.location);if(filters.contract)p.set("contract",filters.contract);if(filters.sort==="oldest")p.set("sort","oldest");p.set("page",String(page));return `/en/offres?${p}`;};
 return <main className="min-h-screen bg-[#f5f9fb] text-[#102435]"><EnglishHeader />
 <section className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-12 text-white sm:px-8"><div className="mx-auto max-w-7xl"><h1 className="text-4xl font-black">Healthcare jobs in France</h1><p className="mt-4 max-w-3xl text-slate-200">Search vacancies for physicians, dentists, pharmacists and nurses. <strong>Job titles and descriptions are displayed in French</strong>, the original language of the listings.</p></div></section>
 <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><form method="get" className="grid gap-4 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-3 lg:grid-cols-5">
  <label className="text-sm font-bold">Keywords<input name="q" type="search" defaultValue={filters.q} className={field} placeholder="e.g. cardiologue" /></label>
  <label className="text-sm font-bold">Profession<select name="category" defaultValue={filters.professionalCategory} className={field}>{categories.map(c=><option key={c} value={c}>{names[c]}</option>)}</select></label>
  <label className="text-sm font-bold">Specialty<select name="specialty" defaultValue={filters.specialty} className={field}><option value="">All specialties</option>{result.specialties.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
  <label className="text-sm font-bold">Location<input name="location" defaultValue={filters.location} className={field} placeholder="City or department" /></label>
  <label className="text-sm font-bold">Contract<select name="contract" defaultValue={filters.contract} className={field}><option value="">All contracts</option>{result.contractTypes.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
  <div className="flex flex-wrap items-end gap-3 md:col-span-3 lg:col-span-5"><label className="text-sm font-bold">Sort<select name="sort" defaultValue={filters.sort} className={field}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><button className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white" style={{color:"#fff"}}>Search jobs</button><Link href="/en/offres" className="rounded-full border border-slate-300 px-6 py-3 font-bold">Clear filters</Link></div>
 </form>
 <p className="mt-7 text-lg font-bold">{result.total} published opportunities</p>
 <div className="mt-5 space-y-4">{result.jobs.map(job=><article key={job.id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap gap-2 text-xs font-semibold text-[#0c7773]"><span>{names[(job.professionalCategory as ProfessionalCategory)]??"Healthcare"}</span>{job.specialty&&<span>· {job.specialty}</span>}</div><h2 className="mt-3 text-2xl font-black text-[#082a43]">{job.title}</h2><p className="mt-2 text-slate-600">📍 {job.locationLabel || [job.postalCode,job.city].filter(Boolean).join(" ") || "France"}</p>{job.description&&<p className="mt-3 line-clamp-3 whitespace-pre-line leading-7 text-slate-600">{job.description}</p>}<div className="mt-5 flex flex-wrap gap-3"><Link href={`/fr/offres/${job.id}`} className="rounded-full bg-[#118c87] px-5 py-3 font-bold text-white" style={{color:"#fff"}}>View original job (French) →</Link><Link href={`/en/candidature?jobId=${job.id}`} className="rounded-full border border-[#118c87] px-5 py-3 font-bold text-[#0c7773]">Apply in English</Link></div></article>)}</div>
 {result.jobs.length===0&&<p className="mt-6 rounded-xl bg-white p-6">No jobs match these filters.</p>}
 <nav aria-label="Pagination" className="mt-7 flex items-center justify-between gap-4">{filters.page>1?<Link href={pageUrl(filters.page-1)} className="font-bold underline">← Previous</Link>:<span/>}<span>Page {filters.page} of {pages}</span>{filters.page<pages?<Link href={pageUrl(filters.page+1)} className="font-bold underline">Next →</Link>:<span/>}</nav>
 </section><EnglishFooter /></main>;
}
