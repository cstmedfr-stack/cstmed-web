"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ImportApiResponse = {
  success?: boolean;
  status?: string;
  importedCount?: number;
  duplicateCount?: number;
  errorCount?: number;
  error?: unknown;
  errors?: Array<{ keyword: string; message: string }>;
};

function getImportErrorMessage(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if ("message" in value && typeof value.message === "string") return value.message;
    try { return JSON.stringify(value); } catch { return "Erreur inconnue."; }
  }
  return null;
}

function getFormString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function errorUrl(message: string, batchOffset?: number): string {
  const params = new URLSearchParams({ error: message.slice(0, 1000) });
  if (batchOffset !== undefined) params.set("batch", String(batchOffset));
  return `/admin/import?${params.toString()}`;
}

async function requireAdministrator(): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/admin/login?error=Session%20expir%C3%A9e.");
  const { data: member, error } = await supabase.from("admin_users")
    .select("user_id").eq("user_id", userId).maybeSingle();
  if (error || !member) redirect("/admin/login?error=Acc%C3%A8s%20refus%C3%A9.");
}

export async function runFranceTravailImport(formData: FormData): Promise<void> {
  await requireAdministrator();
  const mode = getFormString(formData, "mode");
  const keyword = getFormString(formData, "keyword");
  const rawLimit = getFormString(formData, "limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : NaN;
  const cdiOnly = formData.get("cdiOnly") === "on";
  const batchOffset = Number(getFormString(formData, "batchOffset"));
  const validBatch = Number.isSafeInteger(batchOffset) && batchOffset >= 0 && batchOffset % 10 === 0;
  if (mode !== "single" && mode !== "batch") redirect(errorUrl("Mode invalide."));
  if (mode === "single" && !keyword) redirect(errorUrl("Sélectionnez un mot-clé."));
  if (mode === "batch" && !validBatch) redirect(errorUrl("Numéro de lot invalide."));

  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 100) : undefined;
  const headerStore = await headers();
  const host = headerStore.get("host");
  if (!host) redirect(errorUrl("Adresse du serveur indisponible."));
  const protocol = headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const token = process.env.IMPORT_ADMIN_TOKEN;
  if (!token) redirect(errorUrl("IMPORT_ADMIN_TOKEN est absent du fichier .env.local."));

  const body: { keyword?: string; limit?: number; cdiOnly?: boolean; batchOffset?: number } = {};
  if (mode === "single") {
    body.keyword = keyword;
    if (safeLimit !== undefined) body.limit = safeLimit;
  } else {
    body.batchOffset = batchOffset;
  }
  if (cdiOnly) body.cdiOnly = true;

  let result: ImportApiResponse | null = null;
  let failure: string | null = null;
  try {
    const response = await fetch(`${origin}/api/admin/import-france-travail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Accept: "application/json",
        "x-import-token": token,
        ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
          ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {}),
      },
      body: JSON.stringify(body), cache: "no-store",
    });
    if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
      throw new Error(`Réponse inattendue du service (HTTP ${response.status}).`);
    }
    result = (await response.json()) as ImportApiResponse;
    if (!response.ok || result.success === false) {
      failure = getImportErrorMessage(result.error) || result.errors?.map(e => `${e.keyword}: ${e.message}`).join(" | ") ||
        `Erreur d'importation (HTTP ${response.status}).`;
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : "Impossible de contacter le service.";
  }
  if (failure) redirect(errorUrl(failure, mode === "batch" ? batchOffset : undefined));
  if (!result) redirect(errorUrl("Aucune réponse reçue.", mode === "batch" ? batchOffset : undefined));
  // Ne pas avancer si un mot-cle a echoue: l'administrateur peut retenter le meme lot.
  const advance = mode === "batch" && (result.errorCount ?? 0) === 0;
  const params = new URLSearchParams({
    success: "1", imported: String(result.importedCount ?? 0),
    duplicates: String(result.duplicateCount ?? 0), errors: String(result.errorCount ?? 0),
  });
  if (mode === "batch") params.set("batch", String(batchOffset + (advance ? 10 : 0)));
  redirect(`/admin/import?${params.toString()}`);
}
