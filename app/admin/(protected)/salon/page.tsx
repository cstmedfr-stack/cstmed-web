import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateSalonContact } from "./actions";

export const dynamic = "force-dynamic";
const statuses = ["new","contacted","qualified","converted","archived"] as const;
const categories = ["medecins","dentistes","pharmaciens","infirmiers","autres"] as const;
const grades = ["specialist","senior","resident","unspecialized"] as const;
const availabilities = ["asap","3_6_months","6_12_months","1_2_years","over_2_years","undecided"] as const;
const availabilityNames: Record<string,string> = {
  asap:"Dès que possible", "3_6_months":"3–6 mois", "6_12_months":"6–12 mois", "1_2_years":"1–2 ans",
  "over_2_years":"Plus de 2 ans", undecided:"Indécis"
};
const gradeNames: Record<string,string> = {specialist:"Médecin spécialiste", senior:"Médecin senior / primar",resident:"Médecin résident",unspecialized:"Médecin sans spécialisation"};
const professionNames: Record<string,string> = {medecins:"Médecin",dentistes:"Dentiste",pharmaciens:"Pharmacien",infirmiers:"Infirmier",autres:"Autre profession"};
type Params = { status?:string; page?:string; profession?:string; grade?:string; availability?:string; q?:string };
function pick<T extends readonly string[]>(value:string|undefined,values:T):string {return value && values.includes(value)?value:"";}
function href(p:Params, page=1){
  const s=new URLSearchParams();
  for (const key of ["status","profession","grade","availability","q"] as const) if (p[key]) s.set(key,p[key]);
  if(page>1)s.set("page",String(page));
  const query=s.toString();return `/admin/salon${query?`?${query}`:""}`;
}
export default async function SalonAdminPage({searchParams}:{searchParams:Promise<Params>}){
  await requireAdmin();
  const p=await searchParams;
  const status=pick(p.status,statuses);
  const profession=pick(p.profession,categories);
  const grade=pick(p.grade,grades);
  const availability=pick(p.availability,availabilities);
  const search=(p.q??"").trim().slice(0,100).replace(/[,%()]/g," ");
  const rawPage=Number(p.page??1);
  const requestedPage=Number.isSafeInteger(rawPage)&&rawPage>0?rawPage:1;
  let q=createAdminClient().from("salon_contacts")
    .select("id,event_slug,first_name,last_name,email,phone,profession,medical_grade,residency_year,availability,specialty,city,french_level,locale,status,internal_note,talent_pool_consent_at,created_at",{count:"exact"});
  if(status) q=q.eq("status",status);
  if(profession) q=q.eq("profession",profession);
  if(grade) q=q.eq("medical_grade",grade);
  if(availability) q=q.eq("availability",availability);
  if(search) {
    const pattern=`%${search}%`;
    q=q.or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},specialty.ilike.${pattern},city.ilike.${pattern}`);
  }
  const {data,count,error}=await q.order("created_at",{ascending:false}).range((requestedPage-1)*20,requestedPage*20-1);
  if(error)throw new Error(error.message);
  const totalPages=Math.max(1,Math.ceil((count??0)/20));
  const page=Math.min(requestedPage,totalPages);
  const filters={status,profession,grade,availability,q:search};
  return <main className="min-h-screen bg-[#f5f9fb] px-5 py-8 text-[#102435]"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-[#118c87]">CSTMed Admin</p><h1 className="text-3xl font-black">Contacts salon • ExpoMedics</h1></div><Link href="/admin" className="rounded-full border border-slate-300 px-5 py-3 font-semibold">← Tableau de bord</Link></div>
    <nav className="mt-6 flex flex-wrap gap-2">{["",...statuses].map(s=><Link key={s} href={href({...filters,status:s})} className={`rounded-full px-4 py-2 text-sm font-bold ${status===s?"bg-[#082a43] text-white":"border border-slate-200 bg-white"}`} style={status===s?{color:"#fff"}:undefined}>{s||"Tous"}</Link>)}</nav>
    <form className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" method="get" action="/admin/salon">
      {status?<input type="hidden" name="status" value={status}/>:null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-bold">Recherche<input name="q" defaultValue={search} placeholder="Nom, ville, spécialité" className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal"/></label>
        <label className="text-xs font-bold">Profession<select name="profession" defaultValue={profession} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Toutes</option>{categories.map(c=><option key={c} value={c}>{professionNames[c]}</option>)}</select></label>
        <label className="text-xs font-bold">Statut médical<select name="grade" defaultValue={grade} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Tous</option>{grades.map(c=><option key={c} value={c}>{gradeNames[c]}</option>)}</select></label>
        <label className="text-xs font-bold">Disponibilité<select name="availability" defaultValue={availability} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Toutes</option>{availabilities.map(c=><option key={c} value={c}>{availabilityNames[c]}</option>)}</select></label>
        <div className="flex items-end gap-2"><button className="min-h-12 rounded-full bg-[#118c87] px-5 py-2 font-bold text-white" style={{color:"#fff"}}>Filtrer</button><Link href="/admin/salon" className="rounded-full border border-slate-300 px-4 py-3 font-semibold">Effacer</Link></div>
      </div>
    </form>
    <p className="mt-5 text-sm text-slate-600">{count??0} contact(s) • Page {requestedPage}/{totalPages}. Accès réservé aux administrateurs.</p>
    <div className="mt-5 space-y-4">{(data??[]).map(c=><article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">{c.first_name} {c.last_name}</h2><p className="text-xs text-slate-500">{c.event_slug} • {new Date(c.created_at).toLocaleString("fr-FR")} • {c.locale.toUpperCase()}</p></div><span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-sm font-semibold text-[#0c7773]">{c.status}</span></div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><a className="break-all text-[#0c7773] underline" href={`mailto:${c.email}`}>{c.email}</a><a className="text-[#0c7773] underline" href={`tel:${c.phone}`}>{c.phone}</a><span>{professionNames[c.profession]??c.profession}{c.medical_grade?` • ${gradeNames[c.medical_grade]??c.medical_grade}`:""}{c.residency_year?` • Année ${c.residency_year}`:""}</span><span>{c.specialty||"Sans spécialité"}</span><span>{c.city||""}</span><span>FR : {c.french_level||"–"}</span></div>
      <div className="mt-3 rounded-xl bg-[#f5f9fb] p-3 text-sm"><strong>Disponibilité :</strong> {c.availability?availabilityNames[c.availability]??c.availability:"Non précisée (ancien contact)"}<span className="ml-2 text-xs text-slate-500">(depuis le {new Date(c.created_at).toLocaleDateString("fr-FR")})</span></div>
      <p className="mt-2 text-xs text-slate-500">Vivier : {c.talent_pool_consent_at?"Consentement enregistré":"Pas de consentement pour futures opportunités"}</p>
      <form action={updateSalonContact} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-[200px_1fr_auto] md:items-end"><input type="hidden" name="id" value={c.id}/><label className="text-xs font-bold">Statut<select name="status" defaultValue={c.status} className="mt-1 w-full rounded-lg border border-slate-300 p-3">{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></label><label className="text-xs font-bold">Note interne<textarea name="internalNote" defaultValue={c.internal_note??""} rows={2} maxLength={2000} className="mt-1 w-full rounded-lg border border-slate-300 p-3"/></label><button className="rounded-full bg-[#118c87] px-5 py-3 font-bold text-white" style={{color:"#fff"}}>Enregistrer</button></form>
    </article>)}{!data?.length&&<p className="rounded-2xl bg-white p-8 text-center text-slate-500">Aucun contact</p>}</div>
    <nav className="mt-6 flex gap-3">{requestedPage>1&&<Link href={href(filters,requestedPage-1)} className="underline">← Précédent</Link>}{requestedPage<totalPages&&<Link href={href(filters,requestedPage+1)} className="underline">Suivant →</Link>}</nav>
  </div></main>;
}
