import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerForm, type Partner } from "../partner-form";
import { addPartnerActivity } from "../activity-actions";


export const dynamic = "force-dynamic";

type Activity = {
  id: string;
  activity_type: string;
  contact_person: string | null;
  details: string;
  activity_date: string;
  follow_up_at: string | null;
  created_at: string;
};
const activityLabels: Record<string, string> = {
  note: "Note interne", email: "E-mail", phone: "Appel téléphonique",
  meeting: "Rendez-vous", follow_up: "Relance", other: "Autre",
};
const fieldStyle = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[#082a43] focus:border-[#118c87] focus:outline-none";
function formatDate(value: string) {
  // YYYY-MM-DD is a SQL date and must not shift days due to browser timezone.
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let partner: Partner | undefined;
  let activities: Activity[] = [];
  if (id !== "nouveau") {
    const db = createAdminClient();
    const [{ data, error }, activityResult] = await Promise.all([
      db.from("partner_establishments").select("*").eq("id", id).maybeSingle(),
      db.from("partner_activities")
        .select("id,activity_type,contact_person,details,activity_date,follow_up_at,created_at")
        .eq("partner_id", id)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (error) throw new Error(error.message);
    if (!data) notFound();
    if (activityResult.error) throw new Error(activityResult.error.message);
    partner = data as Partner;
    activities = (activityResult.data ?? []) as Activity[];
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="min-h-screen bg-[#f5f9fb] px-5 py-10 text-[#082a43]">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/admin/partenaires" className="text-sm font-bold text-[#118c87]">← Retour aux établissements</Link>
        <h1 className="text-3xl font-black">{partner ? "Modifier l’établissement" : "Nouvel établissement"}</h1>
        <PartnerForm partner={partner} />
        {partner ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black text-[#082a43]">Historique des contacts</h2>
              <p className="mt-2 text-sm text-slate-600">Notes et échanges internes CSTMed, réservés aux administrateurs.</p>
              <form action={addPartnerActivity} className="mt-6 space-y-4">
                <input type="hidden" name="partner_id" value={partner.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold">Type d’activité
                    <select name="activity_type" defaultValue="note" required className={fieldStyle}>
                      {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold">Personne contactée
                    <input name="contact_person" maxLength={200} placeholder="Responsable RH, direction..." className={fieldStyle} />
                  </label>
                  <label className="text-sm font-bold">Date de l’activité
                    <input name="activity_date" type="date" required defaultValue={today} className={fieldStyle} />
                  </label>
                  <label className="text-sm font-bold">Prochaine relance (facultatif)
                    <input name="follow_up_at" type="date" className={fieldStyle} />
                  </label>
                </div>
                <label className="block text-sm font-bold">Compte rendu / note interne
                  <textarea name="details" required minLength={2} maxLength={5000} rows={4}
                    placeholder="Ex. Appel avec la direction, souhaite recevoir une présentation des services CSTMed..."
                    className={fieldStyle} />
                </label>
                <button type="submit" style={{ color: "#ffffff" }}
                  className="rounded-full bg-[#118c87] px-6 py-3 text-sm font-black hover:bg-[#0c7773]">
                  Enregistrer dans l’historique
                </button>
              </form>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">Échanges enregistrés ({activities.length}{activities.length === 100 ? "+" : ""})</h2>
              {activities.length === 0 ? (
                <p className="mt-4 text-slate-500">Aucun contact enregistré pour cet établissement.</p>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {activities.map((item) => (
                    <article key={item.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e5f7f5] px-3 py-1 text-xs font-bold text-[#0c7773]">{activityLabels[item.activity_type] ?? item.activity_type}</span>
                        <span className="text-xs font-semibold text-slate-500">{formatDate(item.activity_date)}</span>
                        {item.follow_up_at ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Relance : {formatDate(item.follow_up_at)}</span> : null}
                      </div>
                      {item.contact_person ? <p className="mt-2 text-sm font-semibold">Contact : {item.contact_person}</p> : null}
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.details}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
