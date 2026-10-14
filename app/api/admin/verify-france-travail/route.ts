import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkFranceTravailOffer } from "@/lib/france-travail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();
    const ids = typeof body === "object" && body !== null && "ids" in body
      ? (body as { ids?: unknown }).ids : null;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 5 ||
        ids.some(id => typeof id !== "string" || id.length > 100) ||
        new Set(ids).size !== ids.length) {
      return Response.json({ error: "Sélection invalide (1 à 5 offres)." }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("jobs")
      .select("id,source,source_job_id").in("id", ids);
    if (error) throw new Error(error.message);
    const jobs = data ?? [];
    if (jobs.length !== ids.length) {
      return Response.json({ error: "Certaines offres sont introuvables." }, { status: 404 });
    }
    const results = [];
    for (const job of jobs) {
      if (job.source !== "france_travail" || !job.source_job_id) {
        results.push({ id: job.id, state: "unknown", note: "Offre sans référence France Travail." });
        continue;
      }
      const result = await checkFranceTravailOffer(job.source_job_id);
      results.push({ id: job.id, ...result });
    }
    return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erreur de vérification." }, { status: 500 });
  }
}
