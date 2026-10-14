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
    if ("message" in value && typeof value.message === "string") {
      return value.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "Erreur inconnue lors de l’importation.";
    }
  }
  return null;
}

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function importErrorUrl(message: string): string {
  return `/admin/import?error=${encodeURIComponent(message.slice(0, 1000))}`;
}

async function requireAdministrator(): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/admin/login?error=Votre%20session%20a%20expir%C3%A9.");
  }

  const { data: adminMembership, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !adminMembership) {
    redirect("/admin/login?error=Acc%C3%A8s%20administrateur%20refus%C3%A9.");
  }
}

export async function runFranceTravailImport(formData: FormData): Promise<void> {
  // Important : ne pas placer ces redirections dans le try/catch de l'appel API.
  await requireAdministrator();

  const mode = getFormString(formData, "mode");
  const keyword = getFormString(formData, "keyword");
  const rawLimit = getFormString(formData, "limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : NaN;
  const cdiOnly = formData.get("cdiOnly") === "on";

  if (mode !== "single" && mode !== "all") {
    redirect(importErrorUrl("Mode d’importation invalide."));
  }
  if (mode === "single" && !keyword) {
    redirect(importErrorUrl("Sélectionnez un mot-clé."));
  }

  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 100)
    : undefined;

  const headerStore = await headers();
  const host = headerStore.get("host");
  if (!host) {
    redirect(importErrorUrl("Adresse du serveur indisponible."));
  }

  const forwardedProtocol = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProtocol ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const adminToken = process.env.IMPORT_ADMIN_TOKEN;
  if (!adminToken) {
    redirect(importErrorUrl("IMPORT_ADMIN_TOKEN est absent du fichier .env.local."));
  }

  const requestBody: { keyword?: string; limit?: number; cdiOnly?: boolean } = {};
  if (mode === "single") {
    requestBody.keyword = keyword;
    if (safeLimit !== undefined) requestBody.limit = safeLimit;
  }
  if (cdiOnly) requestBody.cdiOnly = true;

  let result: ImportApiResponse | null = null;
  let importError: string | null = null;

  try {
    const response = await fetch(`${origin}/api/admin/import-france-travail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-import-token": adminToken,
        ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
          ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
          : {}),
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Le service d’importation a répondu avec un format inattendu (HTTP ${response.status}).`
      );
    }

    result = (await response.json()) as ImportApiResponse;
    if (!response.ok || result.success === false) {
      const generalError = getImportErrorMessage(result.error);
      const detailedErrors = result.errors
        ?.map((item) => `${item.keyword}: ${item.message}`)
        .join(" | ");
      importError = generalError || detailedErrors ||
        `L’importation France Travail a échoué (HTTP ${response.status}).`;
    }
  } catch (error) {
    importError = error instanceof Error
      ? error.message
      : "Impossible de contacter le service d’importation.";
  }

  // Next.js lance une exception interne NEXT_REDIRECT : ces appels sont
  // volontairement EN DEHORS du try/catch.
  if (importError) {
    redirect(importErrorUrl(importError));
  }
  if (!result) {
    redirect(importErrorUrl("Aucune réponse reçue du service d’importation."));
  }

  const parameters = new URLSearchParams({
    success: "1",
    imported: String(result.importedCount ?? 0),
    duplicates: String(result.duplicateCount ?? 0),
    errors: String(result.errorCount ?? 0),
  });
  redirect(`/admin/import?${parameters.toString()}`);
}
