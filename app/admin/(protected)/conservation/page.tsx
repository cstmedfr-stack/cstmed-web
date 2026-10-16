import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  talent_pool_consent_at: string | null;
};

type Activity = {
  application_id: string;
  activity_type: string;
  created_at: string;
};

const DAY = 24 * 60 * 60 * 1000;
const fieldClass = "rounded-xl border border-slate-200 bg-white p-4";

function dateFR(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function monthsSince(value: string, now: number) {
  return Math.floor((now - new Date(value).getTime()) / DAY / 30.4375);
}

export default async function ConservationPage() {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error, count } = await db
    .from("applications")
    .select("id,first_name,last_name,email,status,created_at,updated_at,talent_pool_consent_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`Impossible de charger les candidatures : ${error.message}`);
  const applications = (data ?? []) as Application[];
  const ids = applications.map((a) => a.id);
  let activities: Activity[] = [];
  if (ids.length) {
    // Activités potentiellement liées à un échange. Elles ne prouvent pas
    // qu'un contact bilatéral avec le candidat a réellement eu lieu.
    const result = await db
      .from("application_activities")
      .select("application_id,activity_type,created_at")
      .in("application_id", ids)
      .in("activity_type", ["email", "call"])
      .order("created_at", { ascending: false })
      .limit(1000);
    if (result.error) throw new Error(`Impossible de charger les activités : ${result.error.message}`);
    activities = (result.data ?? []) as Activity[];
  }

  const lastPossibleContact = new Map<string, string>();
  for (const item of activities) {
    if (!lastPossibleContact.has(item.application_id)) {
      lastPossibleContact.set(item.application_id, item.created_at);
    }
  }

  const now = Date.now();
  const rows = applications.map((a) => {
    const months = a.talent_pool_consent_at ? monthsSince(a.talent_pool_consent_at, now) : null;
    const priority = months === null ? 0 : months >= 24 ? 2 : months >= 18 ? 1 : 0;
    return { ...a, months, priority, possibleContact: lastPossibleContact.get(a.id) ?? null };
  }).sort((a, b) => b.priority - a.priority || a.created_at.localeCompare(b.created_at));

  const overdue = rows.filter((a) => a.priority === 2).length;
  const upcoming = rows.filter((a) => a.priority === 1).length;
  const inPool = rows.filter((a) => a.talent_pool_consent_at).length;

  return (
    <main className="min-h-screen bg-[#f5f9fb] px-5 py-10 text-[#082a43] sm:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <Link href="/admin" className="text-sm font-bold text-[#118c87]">← Retour au tableau de bord</Link>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-[#118c87]">Administration CSTMed • RGPD</p>
          <h1 className="mt-2 text-3xl font-black">Conservation des données</h1>
          <p className="mt-3 max-w-4xl text-slate-600">Tableau de revue manuelle. Aucune candidature ni aucun CV n'est supprimé ou modifié depuis cette page.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={fieldClass}><div className="text-sm text-slate-600">Accord pour le vivier (dans la liste)</div><div className="mt-1 text-2xl font-black">{inPool}</div></div>
          <div className={fieldClass}><div className="text-sm text-slate-600">Accord datant de 18 à 23 mois</div><div className="mt-1 text-2xl font-black text-amber-700">{upcoming}</div></div>
          <div className={fieldClass}><div className="text-sm text-slate-600">Accord datant de 24 mois ou plus</div><div className="mt-1 text-2xl font-black text-red-700">{overdue}</div></div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <p className="font-bold">Attention : dates indicatives, pas une date automatique d'effacement.</p>
          <p className="mt-1">Les seuils ci-dessous sont calculés à partir de la date de consentement au vivier. La politique CSTMed évoque deux ans après le dernier contact : un e-mail ou un appel enregistré n'en apporte pas à lui seul la preuve. Vérifier chaque dossier et toute obligation de conservation avant de décider. Pour les candidatures hors vivier, une revue distincte est nécessaire.</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#082a43] text-white">
              <tr>
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Candidature</th>
                <th className="px-4 py-3">Accord vivier</th>
                <th className="px-4 py-3">E-mail / appel enregistré*</th>
                <th className="px-4 py-3">Revue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3"><Link className="font-bold text-[#118c87] underline-offset-2 hover:underline" href={`/admin/candidatures/${a.id}`}>{a.first_name} {a.last_name}</Link><div className="text-xs text-slate-500">{a.email}</div></td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3">{dateFR(a.created_at)}</td>
                  <td className="px-4 py-3">{dateFR(a.talent_pool_consent_at)}</td>
                  <td className="px-4 py-3">{dateFR(a.possibleContact)}</td>
                  <td className="px-4 py-3">
                    {a.priority === 2 ? <span className="font-bold text-red-700">À examiner en priorité</span> : a.priority === 1 ? <span className="font-bold text-amber-700">À vérifier prochainement</span> : a.talent_pool_consent_at ? <span className="text-slate-600">Suivi normal</span> : <span className="text-slate-600">Hors vivier : revue manuelle</span>}
                  </td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucune candidature.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-6 text-slate-500">* Les activités « email » et « call » sont des indices à vérifier, non la preuve d'un contact effectif. Vue limitée aux 500 candidatures les plus récentes et aux 1 000 activités les plus récentes de cet ensemble. {count !== null && count > 500 ? `Total en base : ${count}. Les dossiers plus anciens ne figurent pas dans cette vue.` : ""} Aucun traitement automatique de suppression.</p>
      </div>
    </main>
  );
}
