import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "../../actions";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const statuses = ["new", "reviewing", "contacted", "interview", "accepted", "rejected", "archived"] as const;
type ApplicationStatus = (typeof statuses)[number];
type StatusFilter = ApplicationStatus | "all";
type Params = { q?: string | string[]; status?: string | string[]; page?: string | string[]; specialty?: string | string[]; city?: string | string[]; french?: string | string[] };
type Props = { searchParams: Promise<Params> };
type ApplicationRow = {
  id: string; first_name: string; last_name: string; email: string; phone: string;
  specialty: string; country: string | null; city: string | null;
  french_level: string | null; locale: "ro" | "fr";
  status: ApplicationStatus; created_at: string;
  jobs: { title: string; location_label: string | null; city: string | null } | null;
};

const labels: Record<ApplicationStatus, string> = {
  new: "Nouvelle", reviewing: "À étudier", contacted: "Contactée",
  interview: "Entretien", accepted: "Acceptée", rejected: "Refusée", archived: "Archivée",
};
const classes: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-700", reviewing: "bg-amber-100 text-amber-800",
  contacted: "bg-cyan-100 text-cyan-800", interview: "bg-violet-100 text-violet-800",
  accepted: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};
function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}
function clean(value: string): string {
  return value.slice(0, 100).replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}
function pageNumber(value: string): number {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : 1;
}
function fmt(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function url(opts: { status: StatusFilter; q: string; specialty: string; city: string; french: string; page?: number }) {
  const p = new URLSearchParams();
  if (opts.status !== "all") p.set("status", opts.status);
  for (const key of ["q", "specialty", "city", "french"] as const) if (opts[key]) p.set(key, opts[key]);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const qs = p.toString();
  return qs ? `/admin/candidatures?${qs}` : "/admin/candidatures";
}
export default async function ApplicationsPage({ searchParams }: Props) {
  const p = await searchParams;
  const q = clean(param(p.q));
  const specialty = clean(param(p.specialty));
  const city = clean(param(p.city));
  const french = clean(param(p.french));
  const rawStatus = param(p.status);
  const status: StatusFilter = statuses.some(s => s === rawStatus) ? rawStatus as ApplicationStatus : "all";
  const requestedPage = pageNumber(param(p.page));
  const { supabase } = await requireAdmin();

  const countStatus = (s?: ApplicationStatus) => {
    let query = supabase.from("applications").select("id", { count: "exact", head: true });
    if (s) query = query.eq("status", s);
    return query;
  };
  const [totalR, newR, reviewingR, contactedR, acceptedR] = await Promise.all([
    countStatus(), countStatus("new"), countStatus("reviewing"), countStatus("contacted"), countStatus("accepted"),
  ]);
  let query = supabase.from("applications").select(`
    id, first_name, last_name, email, phone, specialty, country, city,
    french_level, locale, status, created_at,
    jobs (title, location_label, city)
  `, { count: "exact" });
  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const pattern = `%${q}%`;
    query = query.or([
      `first_name.ilike.${pattern}`, `last_name.ilike.${pattern}`,
      `email.ilike.${pattern}`, `phone.ilike.${pattern}`,
      `specialty.ilike.${pattern}`, `city.ilike.${pattern}`,
    ].join(","));
  }
  if (specialty) query = query.ilike("specialty", `%${specialty}%`);
  if (city) query = query.ilike("city", `%${city}%`);
  if (french) query = query.ilike("french_level", `%${french}%`);

  const from = (requestedPage - 1) * PAGE_SIZE;
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const applications = (data ?? []) as unknown as ApplicationRow[];
  // Relances liées uniquement aux candidatures présentes sur cette page.
  // Le suivi est privé et chargé après la vérification requireAdmin().
  const reminders = new Map<string, { date: string; note: string }>();
  if (!error && applications.length > 0) {
    const { data: followUps, error: followError } = await supabase
      .from("application_activities")
      .select("application_id, follow_up_at, note")
      .in("application_id", applications.map(item => item.id))
      .not("follow_up_at", "is", null)
      .order("follow_up_at", { ascending: true })
      .limit(500);
    if (followError) {
      console.error("Cannot load application follow-ups:", followError.message);
    } else {
      for (const activity of followUps ?? []) {
        if (!activity.follow_up_at || reminders.has(activity.application_id)) continue;
        reminders.set(activity.application_id, {
          date: activity.follow_up_at,
          note: activity.note ?? "",
        });
      }
    }
  }
  const today = new Date().toISOString().slice(0, 10);

  const totalFiltered = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const urlFor = (page?: number, nextStatus: StatusFilter = status) => url({ status: nextStatus, q, specialty, city, french, page });
  if (!error && requestedPage > totalPages) redirect(urlFor(totalPages));
  const visiblePages = Array.from(new Set([
    ...Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1),
    requestedPage - 1, requestedPage, requestedPage + 1, totalPages,
  ].filter(n => n >= 1 && n <= totalPages))).sort((a, b) => a - b);

  const stats: { label: string; value: number; status: StatusFilter; color: string }[] = [
    { label: "Total", value: totalR.count ?? 0, status: "all", color: "text-[#082a43]" },
    { label: "Nouvelles", value: newR.count ?? 0, status: "new", color: "text-blue-700" },
    { label: "À étudier", value: reviewingR.count ?? 0, status: "reviewing", color: "text-amber-700" },
    { label: "Contactées", value: contactedR.count ?? 0, status: "contacted", color: "text-cyan-700" },
    { label: "Acceptées", value: acceptedR.count ?? 0, status: "accepted", color: "text-emerald-700" },
  ];
  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link href="/admin" aria-label="Tableau de bord CSTMed">
            <Image src="/images/cstmed-logo.png" alt="CSTMed" width={220} height={74} priority className="h-auto w-[190px] object-contain sm:w-[220px]" />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <Link className="rounded-full bg-[#082a43] px-5 py-2.5 text-white" style={{color:"#fff"}} href="/admin">Tableau de bord</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2.5" href="/admin/offres">Offres</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2.5" href="/admin/import">Import</Link>
            <form action={logoutAdmin}><button type="submit" className="rounded-full border border-red-200 px-5 py-2.5 text-red-700">Se déconnecter</button></form>
          </nav>
        </div>
      </header>
      <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-[#65d9ce]">Administration CSTMed</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Candidatures médicales</h1>
          <p className="mt-3 text-slate-200">Consultez les candidatures des professionnels de santé et les relances à effectuer.</p>
        </div>
      </section>
      <section className="px-5 py-9 sm:px-8"><div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(item => (
            <Link key={item.status} href={urlFor(1, item.status)} className={`rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${status === item.status ? "border-[#118c87] bg-[#e5f7f5]" : "border-slate-200 bg-white"}`}>
              <p className="text-sm font-semibold text-slate-600">{item.label}</p>
              <p className={`mt-2 text-3xl font-black ${item.color}`}>{item.value}</p>
            </Link>
          ))}
        </div>
        <form method="get" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm font-bold">Rechercher<input name="q" type="search" defaultValue={q} placeholder="Nom, e-mail, téléphone..." className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
            <label className="text-sm font-bold">Spécialité médicale<input name="specialty" defaultValue={specialty} placeholder="Ex. cardiologie" className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
            <label className="text-sm font-bold">Ville<input name="city" defaultValue={city} placeholder="Ex. Timișoara" className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
            <label className="text-sm font-bold">Niveau de français<input name="french" defaultValue={french} placeholder="Ex. B2" className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
            <label className="text-sm font-bold">Statut<select name="status" defaultValue={status} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"><option value="all">Tous les statuts</option>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="rounded-full bg-[#118c87] px-7 py-3 font-bold text-white" style={{color:"#fff"}}>Filtrer les candidatures</button>
            <Link href="/admin/candidatures" className="rounded-full border border-slate-300 px-6 py-3 font-bold">Effacer les filtres</Link>
          </div>
        </form>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-2">
          <div><h2 className="text-2xl font-black text-[#082a43]">{totalFiltered} candidature{totalFiltered !== 1 ? "s" : ""}</h2><p className="mt-1 text-sm text-slate-500">Résultats correspondant aux filtres actifs</p></div>
          <p className="text-sm font-semibold text-slate-600">Page {requestedPage} sur {totalPages}</p>
        </div>
        {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error.message}</div> : null}
        {!error && applications.length === 0 ? <div className="mt-6 rounded-3xl bg-white p-10 text-center text-slate-600">Aucune candidature ne correspond aux critères sélectionnés.</div> : null}
        {!error && applications.length > 0 ? <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {applications.map(a => {
            const location = a.jobs?.location_label || a.jobs?.city;
             const reminder = reminders.get(a.id);
             const overdue = !!reminder && reminder.date < today;

            return <article key={a.id} className={`flex flex-col justify-between gap-5 px-6 py-6 lg:flex-row lg:items-center ${a.status === "new" ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${classes[a.status] ?? "bg-slate-100 text-slate-700"}`}>{labels[a.status] ?? a.status}</span><span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-xs font-bold text-[#0c7773]">{a.specialty}</span><span className="text-xs font-bold uppercase text-slate-400">{a.locale}</span></div>
                <h3 className="mt-3 text-xl font-bold text-[#082a43]">{a.first_name} {a.last_name}</h3>
                 {reminder && <p className={`mt-2 inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${overdue ? "bg-red-100 text-red-800" : reminder.date === today ? "bg-amber-100 text-amber-900" : "bg-teal-50 text-teal-800"}`}>
                   {overdue ? "⚠ Relance en retard" : reminder.date === today ? "⏰ Relance aujourd’hui" : "📅 Prochaine relance"} : {new Intl.DateTimeFormat("fr-FR", {day:"2-digit",month:"2-digit",year:"numeric",timeZone:"UTC"}).format(new Date(`${reminder.date}T12:00:00Z`))}
                 </p>}

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                  <a className="break-all font-semibold text-[#0c7773] hover:underline" href={`mailto:${a.email}`}>✉️ {a.email}</a>
                  <a className="font-semibold text-[#0c7773] hover:underline" href={`tel:${a.phone}`}>☎️ {a.phone}</a>
                  <span>📍 {a.city || a.country || "Localisation non précisée"}</span>
                  {a.french_level && <span>🇫🇷 Français : <strong>{a.french_level}</strong></span>}
                  <span>Reçue le {fmt(a.created_at)}</span>
                </div>
                {a.jobs ? <div className="mt-4 rounded-xl bg-[#f5f9fb] px-4 py-3 text-sm"><strong>Offre :</strong> {a.jobs.title}{location ? ` — ${location}` : ""}</div> : <p className="mt-4 text-sm font-semibold text-[#118c87]">Candidature spontanée</p>}
              </div>
              <Link href={`/admin/candidatures/${a.id}`} className="shrink-0 rounded-full bg-[#118c87] px-6 py-3 text-center text-sm font-black text-white transition hover:bg-[#0c7773]" style={{color:"#fff"}}>Consulter le profil →</Link>
            </article>;
          })}
        </div> : null}
        {!error && totalPages > 1 ? <nav aria-label="Pagination des candidatures" className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-center text-sm font-bold text-slate-600">Page {requestedPage} sur {totalPages}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {requestedPage > 1 && <Link href={urlFor(requestedPage - 1)} className="rounded-full border border-slate-300 px-4 py-2.5 font-bold">← Précédente</Link>}
            {visiblePages.map((n, i) => <span key={n} className="inline-flex items-center gap-2">{i > 0 && n > visiblePages[i-1] + 1 && <span className="px-1 text-slate-400">…</span>}<Link href={urlFor(n)} aria-current={n === requestedPage ? "page" : undefined} className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 py-2 font-bold ${n === requestedPage ? "border-[#082a43] bg-[#082a43] text-white" : "border-slate-200 bg-white text-[#082a43]"}`} style={n === requestedPage ? {color:"#fff"} : undefined}>{n}</Link></span>)}
            {requestedPage < totalPages && <Link href={urlFor(requestedPage + 1)} className="rounded-full bg-[#082a43] px-4 py-2.5 font-bold text-white" style={{color:"#fff"}}>Suivante →</Link>}
          </div>
          <form method="get" action="/admin/candidatures" className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-5">
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {(["q", "specialty", "city", "french"] as const).map(k => ({key:k, value:{q,specialty,city,french}[k]})).filter(x => x.value).map(x => <input key={x.key} type="hidden" name={x.key} value={x.value} />)}
            <label htmlFor="target-candidatures-page" className="text-sm font-bold">Aller à la page :</label>
            <input id="target-candidatures-page" name="page" type="number" min={1} max={totalPages} defaultValue={requestedPage} required className="w-24 rounded-xl border border-slate-300 px-3 py-2.5 text-center font-bold" />
            <button type="submit" className="rounded-full bg-[#118c87] px-5 py-2.5 font-bold text-white" style={{color:"#fff"}}>Aller →</button>
          </form>
        </nav> : null}
      </div></section>
    </main>
  );
}
