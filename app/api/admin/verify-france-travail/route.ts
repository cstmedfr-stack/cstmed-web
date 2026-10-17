import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkFranceTravailOffer } from "@/lib/france-travail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type State = "active" | "unavailable" | "unknown";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validIds(value: unknown, maximum = 20): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= maximum &&
    value.every((id) => typeof id === "string" && UUID.test(id)) &&
    new Set(value).size === value.length;
}

// Read persisted results for the current admin page; only the server can write.
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const ids = new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
    if (!validIds(ids)) return Response.json({ error: "Sélection invalide." }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("job_ft_verifications")
      .select("job_id,state,note,checked_at").in("job_id", ids);
    if (error) throw new Error(error.message);
    return Response.json({ results: (data ?? []).map((row) => ({
      id: row.job_id, state: row.state as State, note: row.note, checkedAt: row.checked_at,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erreur de vérification." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();
    const ids = typeof body === "object" && body !== null && "ids" in body
      ? (body as { ids?: unknown }).ids : null;
    if (!validIds(ids, 5)) {
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
    const results: Array<{ id: string; state: State; note: string; checkedAt: string }> = [];
    for (const job of jobs) {
      const checked = job.source === "france_travail" && job.source_job_id
        ? await checkFranceTravailOffer(job.source_job_id)
        : { state: "unknown" as State, note: "Offre sans référence France Travail." };
      const checkedAt = new Date().toISOString();
      const { error: saveError } = await supabase.from("job_ft_verifications")
        .upsert({ job_id: job.id, state: checked.state, note: checked.note,
          checked_at: checkedAt }, { onConflict: "job_id" });
      if (saveError) throw new Error(`Enregistrement de la vérification impossible : ${saveError.message}`);
      results.push({ id: job.id, ...checked, checkedAt });
    }
    return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erreur de vérification." }, { status: 500 });
  }
}
