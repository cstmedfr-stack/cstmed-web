import Image from "next/image";
import Link from "next/link";
import { logoutAdmin } from "../actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
type ApplicationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "interview"
  | "accepted"
  | "rejected"
  | "archived";
type JobStatus =
  | "draft"
  | "published"
  | "rejected"
  | "archived";
type RecentApplication = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  status: ApplicationStatus;
  locale: "ro" | "fr";
  created_at: string;
  jobs:
    | {
        title: string;
      }
    | null;
};
type RecentJob = {
  id: string;
  title: string;
  specialty: string | null;
  location_label: string | null;
  status: JobStatus;
  created_at: string;
};
type ImportRun = {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  imported_count: number;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
};
const applicationStatusLabels: Record<
  ApplicationStatus,
  string
> = {
  new: "Nouvelle",
  reviewing: "À étudier",
  contacted: "Contactée",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  archived: "Archivée",
};
const applicationStatusClasses: Record<
  ApplicationStatus,
  string
> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-800",
  contacted: "bg-cyan-100 text-cyan-800",
  interview: "bg-violet-100 text-violet-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};
const jobStatusLabels: Record<
  JobStatus,
  string
> = {
  draft: "Brouillon",
  published: "Publiée",
  rejected: "Refusée",
  archived: "Archivée",
};
const jobStatusClasses: Record<
  JobStatus,
  string
> = {
  draft: "bg-amber-100 text-amber-800",
  published:
    "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};
const importStatusLabels: Record<
  string,
  string
> = {
  running: "En cours",
  completed: "Terminée",
  failed: "Échec",
};
const importStatusClasses: Record<
  string,
  string
> = {
  running: "bg-blue-100 text-blue-700",
  completed:
    "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};
function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Non terminée";
  }
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}
export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase =
    createAdminClient();
  const [
    totalJobsResult,
    draftJobsResult,
    publishedJobsResult,
    totalApplicationsResult,
    newApplicationsResult,
    reviewingApplicationsResult,
    publishedTranslationsResult,
    recentApplicationsResult,
    recentJobsResult,
    recentImportsResult,
    totalEstablishmentRequestsResult,
    newEstablishmentRequestsResult,
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "draft"),
    supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),
    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "new"),
    supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "reviewing"),
    supabase
      .from("job_translations")
      .select("job_id", {
        count: "exact",
        head: true,
      })
      .eq("locale", "ro")
      .eq("status", "published"),
    supabase
      .from("applications")
      .select(
        `
          id,
          first_name,
          last_name,
          specialty,
          status,
          locale,
          created_at,
          jobs (
            title
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
    supabase
      .from("jobs")
      .select(
        `
          id,
          title,
          specialty,
          location_label,
          status,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
    supabase
      .from("import_runs")
      .select(
        `
          id,
          status,
          started_at,
          completed_at,
          imported_count,
          duplicate_count,
          error_count,
          error_message
        `,
      )
      .order("started_at", {
        ascending: false,
      })
      .limit(1),
    supabase
      .from("establishment_requests")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("establishment_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "new"),
  ]);
  const databaseError =
    totalJobsResult.error?.message ??
    draftJobsResult.error?.message ??
    publishedJobsResult.error?.message ??
    totalApplicationsResult.error?.message ??
    newApplicationsResult.error?.message ??
    reviewingApplicationsResult.error?.message ??
    publishedTranslationsResult.error?.message ??
    recentApplicationsResult.error?.message ??
    recentJobsResult.error?.message ??
    recentImportsResult.error?.message ??
    totalEstablishmentRequestsResult.error
      ?.message ??
    newEstablishmentRequestsResult.error
      ?.message ??
    null;
  const totalJobs =
    totalJobsResult.count ?? 0;
  const draftJobs =
    draftJobsResult.count ?? 0;
  const publishedJobs =
    publishedJobsResult.count ?? 0;
  const totalApplications =
    totalApplicationsResult.count ?? 0;
  const newApplications =
    newApplicationsResult.count ?? 0;
  const reviewingApplications =
    reviewingApplicationsResult.count ?? 0;
  const publishedTranslations =
    publishedTranslationsResult.count ?? 0;
  const totalEstablishmentRequests =
    totalEstablishmentRequestsResult.count ??
    0;
  const newEstablishmentRequests =
    newEstablishmentRequestsResult.count ??
    0;
  const recentApplications =
    (recentApplicationsResult.data ??
      []) as unknown as RecentApplication[];
  const recentJobs =
    (recentJobsResult.data ??
      []) as RecentJob[];
  const latestImport =
    (recentImportsResult.data?.[0] ??
      null) as ImportRun | null;
  // Module commercial : lecture uniquement, aucune écriture depuis le tableau de bord.
  const [
    partnersResult,
    contactedPartnersResult,
    negotiatingPartnersResult,
    signedPartnersResult,
    presentationsResult,
    interviewsResult,
    recruitedResult,
    partnerFollowUpsResult,
    activityFollowUpsResult,
    candidateFollowUpsResult,
  ] = await Promise.all([
    supabase.from("partner_establishments").select("id", { count: "exact", head: true }),
    supabase.from("partner_establishments").select("id", { count: "exact", head: true }).eq("relationship_status", "contacted"),
    supabase.from("partner_establishments").select("id", { count: "exact", head: true }).eq("relationship_status", "negotiation"),
    supabase.from("partner_establishments").select("id", { count: "exact", head: true }).eq("relationship_status", "signed"),
    supabase.from("candidate_presentations").select("id", { count: "exact", head: true }),
    supabase.from("candidate_presentations").select("id", { count: "exact", head: true }).eq("stage", "interview"),
    supabase.from("candidate_presentations").select("id", { count: "exact", head: true }).eq("stage", "recruited"),
    supabase.from("partner_establishments")
      .select("id, establishment_name, follow_up_at")
      .not("follow_up_at", "is", null)
      .not("relationship_status", "in", '(rejected,archived)')
      .order("follow_up_at", { ascending: true })
      .limit(100),
    supabase.from("partner_activities")
      .select("id, partner_id, follow_up_at, partner_establishments(establishment_name)")
      .not("follow_up_at", "is", null)
      .order("follow_up_at", { ascending: true })
      .limit(100),
    supabase.from("application_activities")
      .select("id, application_id, follow_up_at, applications(first_name, last_name)")
      .not("follow_up_at", "is", null)
      .order("follow_up_at", { ascending: true })
      .limit(100),
  ]);

  const commercialError = [
    partnersResult, contactedPartnersResult, negotiatingPartnersResult,
    signedPartnersResult, presentationsResult, interviewsResult, recruitedResult,
    partnerFollowUpsResult, activityFollowUpsResult, candidateFollowUpsResult,
  ].find((result) => result.error)?.error?.message ?? null;

  const today = new Date().toISOString().slice(0, 10);
  // Liste bornée aux échéances déjà passées ou dans les 30 prochains jours.
  const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  type DueTask = { id: string; title: string; date: string; href: string; origin: string };
  const dueTasks: DueTask[] = [];
  for (const p of partnerFollowUpsResult.data ?? []) {
    if (p.follow_up_at && p.follow_up_at <= horizon) {
      dueTasks.push({ id: `p-${p.id}`, title: p.establishment_name, date: p.follow_up_at, href: `/admin/partenaires/${p.id}`, origin: "Établissement" });
    }
  }
  for (const a of activityFollowUpsResult.data ?? []) {
    if (a.follow_up_at && a.follow_up_at <= horizon) {
      const partner = Array.isArray(a.partner_establishments) ? a.partner_establishments[0] : a.partner_establishments;
      dueTasks.push({ id: `pa-${a.id}`, title: partner?.establishment_name ?? "Établissement", date: a.follow_up_at, href: `/admin/partenaires/${a.partner_id}`, origin: "Historique établissement" });
    }
  }
  for (const a of candidateFollowUpsResult.data ?? []) {
    if (a.follow_up_at && a.follow_up_at <= horizon) {
      const candidate = Array.isArray(a.applications) ? a.applications[0] : a.applications;
      dueTasks.push({ id: `ca-${a.id}`, title: candidate ? `${candidate.first_name} ${candidate.last_name}` : "Candidat", date: a.follow_up_at, href: `/admin/candidatures/${a.application_id}`, origin: "Candidature" });
    }
  }
  dueTasks.sort((a, b) => a.date.localeCompare(b.date));
  const lateCount = dueTasks.filter((t) => t.date < today).length;
  const todayCount = dueTasks.filter((t) => t.date === today).length;
  const shownTasks = dueTasks.slice(0, 20);

  // Lecture seule : synthèse des factures et paiements.
  const [financeFeesResult, financePaymentsResult] = await Promise.all([
    supabase.from("recruitment_fees")
      .select("id, invoice_number, invoice_due_date, amount_invoiced_eur, amount_received_eur, presentation_id")
      .order("created_at", { ascending: false }).limit(1000),
    supabase.from("recruitment_payments")
      .select("id, recruitment_fee_id, amount_eur")
      .order("created_at", { ascending: false }).limit(2000),
  ]);
  const financeError = financeFeesResult.error?.message ?? financePaymentsResult.error?.message ?? null;
  type FinanceFee = { id: string; invoice_number: string | null; invoice_due_date: string | null; amount_invoiced_eur: number | null; amount_received_eur: number | null; presentation_id: string };
  type FinancePayment = { id: string; recruitment_fee_id: string; amount_eur: number };
  const financeFees = (financeFeesResult.data ?? []) as FinanceFee[];
  const financePayments = (financePaymentsResult.data ?? []) as FinancePayment[];
  const financeMoney = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
  const financeNumber = (value: number | null) => Number(value ?? 0);
  const financePaymentsByFee = new Map<string, number>();
  for (const payment of financePayments) {
    financePaymentsByFee.set(payment.recruitment_fee_id, (financePaymentsByFee.get(payment.recruitment_fee_id) ?? 0) + financeNumber(payment.amount_eur));
  }
  // amount_received_eur est un montant historique distinct des nouveaux paiements détaillés.
  const financeInvoiced = financeFees.reduce((sum, fee) => sum + financeNumber(fee.amount_invoiced_eur), 0);
  const financeReceived = financeFees.reduce((sum, fee) => sum + financeNumber(fee.amount_received_eur) + (financePaymentsByFee.get(fee.id) ?? 0), 0);
  const financeRemaining = financeFees.reduce((sum, fee) => Math.max(0, financeNumber(fee.amount_invoiced_eur) - financeNumber(fee.amount_received_eur) - (financePaymentsByFee.get(fee.id) ?? 0)) + sum, 0);
  const overdueInvoices = financeFees.filter((fee) => fee.invoice_due_date && fee.invoice_due_date < today && financeNumber(fee.amount_invoiced_eur) > financeNumber(fee.amount_received_eur) + (financePaymentsByFee.get(fee.id) ?? 0))
    .sort((a, b) => (a.invoice_due_date ?? "").localeCompare(b.invoice_due_date ?? ""));
  const financeMayBeIncomplete = financeFees.length === 1000 || financePayments.length === 2000;

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/admin"
            aria-label="Tableau de bord CSTMed"
          >
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[180px] object-contain sm:w-[205px]"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/ro"
              target="_blank"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              🇷🇴 Site RO ↗
            </Link>
            <Link
              href="/fr"
              target="_blank"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              🇫🇷 Site FR ↗
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      {/* HERO */}
      <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
            Administration CSTMed
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-200">
            Suivez les recrutements, les partenaires, les offres et les candidatures,
            les demandes des établissements et
            les importations France Travail depuis
            un seul espace.
          </p>
        </div>
      </section>
      <section className="px-5 py-9 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {databaseError ? (
            <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-black">
                Une partie du tableau de bord
                n’a pas pu être chargée.
              </p>
              <p className="mt-2">
                {databaseError}
              </p>
            </div>
          ) : null}
          {/* SUIVI FINANCIER — aucune écriture depuis le tableau de bord */}
          <section className="mb-9" aria-labelledby="finance-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#118c87]">Gestion financière</p>
                <h2 id="finance-title" className="mt-1 text-2xl font-black text-[#082a43]">Factures & Paiements</h2>
              </div>
              <Link href="/admin/finances" className="rounded-full bg-[#118c87] px-5 py-3 text-sm font-black text-white hover:bg-[#0c7773]">
                <span style={{ color: "#ffffff" }}>Ouvrir les finances →</span>
              </Link>
            </div>
            {financeError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Données financières indisponibles : {financeError}</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Total facturé", value: financeInvoiced },
                    { label: "Total encaissé", value: financeReceived },
                    { label: "Reste à encaisser", value: financeRemaining },
                  ].map((item) => (
                    <Link href="/admin/finances" key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                      <p className="text-sm font-semibold text-slate-600">{item.label}</p>
                      <p className="mt-3 text-2xl font-black text-[#082a43]">{financeMoney(item.value)}</p>
                    </Link>
                  ))}
                </div>
                {financeMayBeIncomplete && <p className="mt-3 text-sm text-amber-800">Synthèse limitée aux 1 000 derniers dossiers et 2 000 derniers paiements. Consultez la page financière pour le détail.</p>}
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-[#082a43]">Factures en retard ({overdueInvoices.length})</h3>
                    <Link href="/admin/finances" className="text-sm font-bold text-[#118c87] hover:underline">Consulter les dossiers →</Link>
                  </div>
                  {overdueInvoices.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aucune facture impayée en retard.</p> : (
                    <div className="mt-4 divide-y divide-slate-100">
                      {overdueInvoices.slice(0, 8).map((fee) => {
                        const unpaid = Math.max(0, financeNumber(fee.amount_invoiced_eur) - financeNumber(fee.amount_received_eur) - (financePaymentsByFee.get(fee.id) ?? 0));
                        return <Link key={fee.id} href="/admin/finances" className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-slate-50">
                          <span className="font-semibold text-[#082a43]">{fee.invoice_number || "Facture sans numéro"} <span className="font-normal text-slate-500">· échéance {fee.invoice_due_date}</span></span>
                          <span className="font-bold text-red-700">{financeMoney(unpaid)} restant</span>
                        </Link>;
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
          {/* PILOTAGE COMMERCIAL */}
          <section className="mb-9" aria-labelledby="commercial-title">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#118c87]">Suivi commercial</p>
                <h2 id="commercial-title" className="mt-1 text-2xl font-black text-[#082a43]">Recrutements et partenariats</h2>
              </div>
          <Link
  href="/admin/partenaires"
  className="rounded-full bg-[#082a43] px-6 py-3 text-sm font-bold"
>
  <span style={{ color: "#ffffff" }}>
    Ouvrir les partenaires →
  </span>
</Link>
            </div>
            {commercialError ? (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Données commerciales indisponibles : {commercialError}</p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Établissements enregistrés", value: partnersResult.count ?? 0, note: `${contactedPartnersResult.count ?? 0} contactés` },
                { label: "Négociations en cours", value: negotiatingPartnersResult.count ?? 0, note: "Relations en négociation" },
                { label: "Partenariats signés", value: signedPartnersResult.count ?? 0, note: "Accord commercial enregistré" },
                { label: "Dossiers médecin–hôpital", value: presentationsResult.count ?? 0, note: `${interviewsResult.count ?? 0} entretiens · ${recruitedResult.count ?? 0} recrutements confirmés` },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-600">{metric.label}</p>
                  <p className="mt-3 text-3xl font-black text-[#082a43]">{metric.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-6">
                <div>
                  <h3 className="text-xl font-black text-[#082a43]">Relances à effectuer</h3>
                  <p className="mt-1 text-sm text-slate-500">Échéances passées et des 30 prochains jours, enregistrées dans les fiches et historiques.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-red-100 px-3 py-2 text-red-800">{lateCount} en retard</span>
                  <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-800">{todayCount} aujourd’hui</span>
                </div>
              </div>
              {shownTasks.length === 0 ? (
                <p className="p-7 text-sm text-slate-500">Aucune relance planifiée dans cette période.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {shownTasks.map((task) => (
                    <Link key={task.id} href={task.href} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-[#082a43]">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.origin}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${task.date < today ? "bg-red-100 text-red-800" : task.date === today ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"}`}>
                        {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${task.date}T12:00:00Z`))} →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">Affichage limité aux 20 premières relances sur les 100 premières entrées de chaque source. Une date planifiée reste affichée tant qu’elle n’est pas mise à jour dans le dossier.</p>
            </div>
          </section>

          {/* INDICATEURS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* BROUILLONS */}
            <Link
              href="/admin/offres"
              className="group rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-amber-800">
                  Brouillons à vérifier
                </p>
                <span className="text-xl">
                  📝
                </span>
              </div>
              <p className="mt-3 text-4xl font-black text-[#082a43]">
                {draftJobs}
              </p>
              <p className="mt-4 text-xs font-bold text-slate-500">
                {totalJobs} offres au total
              </p>
              <p className="mt-3 text-xs font-black text-amber-800">
                Ouvrir les brouillons →
              </p>
            </Link>
            {/* CANDIDATURES */}
            <Link
              href="/admin/candidatures"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Candidatures
                </p>
                {newApplications > 0 ? (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
                    {newApplications} nouv.
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-4xl font-black text-[#082a43]">
                {totalApplications}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="text-blue-700">
                  {newApplications} nouvelles
                </span>
                <span className="text-amber-700">
                  {reviewingApplications} à étudier
                </span>
              </div>
            </Link>
            {/* OFFRES PUBLIÉES */}
            <Link
              href="/admin/offres?status=published"
              className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-black text-emerald-800">
                Offres publiées
              </p>
              <p className="mt-3 text-4xl font-black text-[#118c87]">
                {publishedJobs}
              </p>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Visibles sur la version française
              </p>
            </Link>
            {/* RO */}
            <Link
              href="/ro/offres"
              target="_blank"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-500">
                Traductions roumaines
              </p>
              <p className="mt-3 text-4xl font-black text-[#118c87]">
                {publishedTranslations}
              </p>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Traductions actuellement publiées
              </p>
            </Link>
            {/* ÉTABLISSEMENTS */}
            <Link
              href="/admin/etablissements"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Demandes établissements
                </p>
                {newEstablishmentRequests >
                0 ? (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
                    {
                      newEstablishmentRequests
                    }{" "}
                    nouv.
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-4xl font-black text-[#082a43]">
                {
                  totalEstablishmentRequests
                }
              </p>
              <p className="mt-4 text-xs font-semibold text-blue-700">
                {
                  newEstablishmentRequests
                }{" "}
                nouvelles
              </p>
            </Link>
          </div>
          {/* ACTIONS PRINCIPALES */}
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#118c87]">
                  Accès rapide
                </p>
                <h2 className="mt-1 text-xl font-black text-[#082a43]">
                  Gestion CSTMed
                </h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/finances" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span className="text-2xl">💶</span>
                <h3 className="mt-4 font-black text-[#082a43]">Factures & Paiements</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Honoraires, factures et encaissements.</p>
              </Link>
              <Link
                href="/admin/offres"
                className="rounded-3xl bg-[#082a43] p-6 shadow-lg transition hover:-translate-y-1"
              >
                <span className="text-2xl">
                  📋
                </span>
                <h3 className="mt-4 font-black">
                  <span
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    Gérer les offres
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-6">
                  <span
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    Vérifier, modifier et publier.
                  </span>
                </p>
              </Link>
              <Link
                href="/admin/candidatures"
                className="rounded-3xl bg-[#118c87] p-6 shadow-lg transition hover:-translate-y-1"
              >
                <span className="text-2xl">
                  👩‍⚕️
                </span>
                <h3 className="mt-4 font-black">
                  <span
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    Candidatures
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-6">
                  <span
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    Consulter les profils et les CV.
                  </span>
                </p>
              </Link>
              <Link
                href="/admin/etablissements"
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-2xl">
                  🏥
                </span>
                <h3 className="mt-4 font-black text-[#082a43]">
                  Établissements
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Consulter les besoins de recrutement.
                </p>
              </Link>
              <Link
                href="/admin/import"
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-2xl">
                  ⬇️
                </span>
                <h3 className="mt-4 font-black text-[#082a43]">
                  Import France Travail
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Importer de nouvelles offres.
                </p>
              </Link>
              <Link
                href="/admin/mots-cles"
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-2xl">
                  🔎
                </span>
                <h3 className="mt-4 font-black text-[#082a43]">
                  Mots-clés
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Configurer les spécialités.
                </p>
              </Link>
            </div>
          </div>
          {/* DONNÉES RÉCENTES */}
          <div className="mt-10 grid gap-8 xl:grid-cols-2">
            {/* CANDIDATURES */}
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#118c87]">
                    Candidatures
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#082a43]">
                    Derniers profils reçus
                  </h2>
                </div>
                <Link
                  href="/admin/candidatures"
                  className="text-sm font-black text-[#118c87]"
                >
                  Tout voir →
                </Link>
              </div>
              {recentApplications.length ===
              0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aucune candidature reçue.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map(
                    (application) => (
                      <Link
                        key={
                          application.id
                        }
                        href={`/admin/candidatures/${application.id}`}
                        className="block px-6 py-5 transition hover:bg-[#f8fbfc] sm:px-8"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  applicationStatusClasses[
                                    application
                                      .status
                                  ]
                                }`}
                              >
                                {
                                  applicationStatusLabels[
                                    application
                                      .status
                                  ]
                                }
                              </span>
                              <span className="text-xs font-bold uppercase text-slate-400">
                                {
                                  application.locale
                                }
                              </span>
                            </div>
                            <h3 className="mt-3 font-black text-[#082a43]">
                              {
                                application.first_name
                              }{" "}
                              {
                                application.last_name
                              }
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-[#118c87]">
                              {
                                application.specialty
                              }
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {application.jobs
                                ?.title ??
                                "Candidature spontanée"}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(
                              application.created_at,
                            )}
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </section>
            {/* OFFRES */}
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#118c87]">
                    Offres
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#082a43]">
                    Dernières offres importées
                  </h2>
                </div>
                <Link
                  href="/admin/offres"
                  className="text-sm font-black text-[#118c87]"
                >
                  Tout voir →
                </Link>
              </div>
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aucune offre importée.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentJobs.map(
                    (job) => (
                      <Link
                        key={job.id}
                        href={`/admin/offres/${job.id}`}
                        className="block px-6 py-5 transition hover:bg-[#f8fbfc] sm:px-8"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                jobStatusClasses[
                                  job
                                    .status
                                ]
                              }`}
                            >
                              {
                                jobStatusLabels[
                                  job
                                    .status
                                ]
                              }
                            </span>
                            <h3 className="mt-3 font-black text-[#082a43]">
                              {
                                job.title
                              }
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-[#118c87]">
                              {job.specialty ??
                                "Spécialité non précisée"}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {job.location_label ??
                                "Localisation non précisée"}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(
                              job.created_at,
                            )}
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>
          {/* IMPORT */}
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#118c87]">
                  France Travail
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#082a43]">
                  Dernière importation
                </h2>
              </div>
              <Link
                href="/admin/import"
                className="rounded-full bg-[#118c87] px-6 py-3 text-center text-sm font-black"
              >
                <span
                  style={{
                    color: "#ffffff",
                  }}
                >
                  Lancer une importation
                </span>
              </Link>
            </div>
            {!latestImport ? (
              <p className="mt-7 text-slate-500">
                Aucune importation enregistrée.
              </p>
            ) : (
              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Statut
                  </p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      importStatusClasses[
                        latestImport
                          .status
                      ] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {importStatusLabels[
                      latestImport
                        .status
                    ] ??
                      latestImport.status}
                  </span>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Nouvelles
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#118c87]">
                    {
                      latestImport.imported_count
                    }
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Doublons
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-600">
                    {
                      latestImport.duplicate_count
                    }
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Erreurs
                  </p>
                  <p className="mt-2 text-2xl font-black text-red-600">
                    {
                      latestImport.error_count
                    }
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <p className="text-sm text-slate-500">
                    Date
                  </p>
                  <p className="mt-2 text-sm font-black text-[#082a43]">
                    {formatDate(
                      latestImport.completed_at ??
                        latestImport.started_at,
                    )}
                  </p>
                </div>
              </div>
            )}
            {latestImport?.error_message ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {
                  latestImport.error_message
                }
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}