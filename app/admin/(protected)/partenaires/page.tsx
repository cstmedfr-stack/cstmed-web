import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { statuses } from "./partner-form";
import { deletePartner } from "./delete-actions";
import { ConfirmDeleteButton } from "./confirm-delete-button";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
type SearchParams = { q?: string | string[]; status?: string | string[]; page?: string | string[]; saved?: string; deleted?: string };
function value(x?: string | string[]) { return (Array.isArray(x) ? x[0] : x)?.trim() ?? ""; }
function link(q: string, status: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return `/admin/partenaires${params.size ? `?${params}` : ""}`;
}
type Row = {
 id: string; establishment_name: string; establishment_type: string; city: string | null;
 department: string | null; contact_name: string | null; contact_email: string | null;
 specialties_needed: string | null; relationship_status: string; follow_up_at: string | null;
};
export default async function PartnersPage({ searchParams }: {searchParams: Promise<SearchParams>}) {
  await requireAdmin();
  const params = await searchParams;
  const q = value(params.q).slice(0,100).replace(/[,%()]/g," ").trim();
  const wantedStatus = value(params.status);
  const status = statuses.some(([key]) => key === wantedStatus) ? wantedStatus : "all";
  const pageValue = Number(value(params.page));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const db = createAdminClient();
  let query = db.from("partner_establishments")
    .select("id, establishment_name, establishment_type, city, department, contact_name, contact_email, specialties_needed, relationship_status, follow_up_at", {count:"exact"});
  if (status !== "all") query = query.eq("relationship_status", status);
  if (q) query = query.or(`establishment_name.ilike.%${q}%,city.ilike.%${q}%,contact_name.ilike.%${q}%,specialties_needed.ilike.%${q}%`);
  const {data, count, error} = await query.order("created_at", {ascending:false}).range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total/PAGE_SIZE));
  if (!error && page > totalPages) redirect(link(q,status,totalPages));
  const partners = (data ?? []) as Row[];
  return <main className="min-h-screen bg-[#f5f9fb] text-[#082a43]">
    <div className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-11 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-bold text-[#65d9ce]">← Tableau de bord</Link>
        <h1 className="mt-4 text-3xl font-black">Établissements partenaires</h1>
        <p className="mt-2 text-slate-200">Prospection, contacts et accords commerciaux CSTMed</p>
      </div>
    </div>
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-bold">{total} établissement{total !== 1 ? "s" : ""}</p>
        <Link href="/admin/partenaires/nouveau" style={{color:"#ffffff"}} className="rounded-full bg-[#118c87] px-6 py-3 font-bold">+ Ajouter un établissement</Link>
      </div>
      {params.deleted === "1" && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Établissement supprimé.</p>}
      {params.saved === "1" && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Établissement enregistré.</p>}
      <form method="get" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_220px_auto]">
        <input name="q" type="search" defaultValue={q} placeholder="Établissement, ville, contact, spécialité..." className="rounded-xl border border-slate-300 px-4 py-3" />
        <select name="status" defaultValue={status} className="rounded-xl border border-slate-300 bg-white px-4 py-3">
          <option value="all">Tous les statuts</option>
          {statuses.map(([key,label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <button style={{color:"#ffffff"}} className="rounded-full bg-[#082a43] px-5 py-3 font-bold">Rechercher</button>
      </form>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">Impossible de charger les établissements : {error.message}</p>}
      {!error && partners.length === 0 && <p className="rounded-2xl border bg-white p-8 text-slate-600">Aucun établissement trouvé. Ajoutez votre premier contact.</p>}
      <div className="grid gap-4">
        {partners.map(partner => <article key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{statuses.find(([key]) => key===partner.relationship_status)?.[1] ?? partner.relationship_status}</span>
              <h2 className="text-xl font-black">{partner.establishment_name}</h2>
              <p className="text-sm text-slate-600">{[partner.city,partner.department].filter(Boolean).join(" · ") || "Localisation non précisée"}</p>
              {partner.contact_name && <p className="text-sm">Contact : {partner.contact_name}</p>}
              {partner.specialties_needed && <p className="text-sm">Spécialités : {partner.specialties_needed}</p>}
              {partner.follow_up_at && <p className="text-sm font-semibold text-[#118c87]">Relance : {partner.follow_up_at}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/partenaires/${partner.id}`} className="rounded-full border border-[#118c87] px-5 py-2 font-bold text-[#0c7773]">Consulter / modifier →</Link>
              <form action={deletePartner}>
                <input type="hidden" name="partner_id" value={partner.id}/>
                <ConfirmDeleteButton message={`Supprimer définitivement « ${partner.establishment_name} » ? Impossible si des contrats, médecins, contacts ou e-mails sont associés.`}/>
              </form>
            </div>
          </div>
        </article>)}
      </div>
      {!error && totalPages > 1 && <nav className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-5">
        {page>1 && <Link href={link(q,status,page-1)} className="font-bold">← Précédente</Link>}
        <span>Page {page} / {totalPages}</span>
        {page<totalPages && <Link href={link(q,status,page+1)} className="font-bold">Suivante →</Link>}
      </nav>}
    </div>
  </main>;
}
