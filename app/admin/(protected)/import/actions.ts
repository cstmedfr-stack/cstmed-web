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
  error?: string;
  errors?: Array<{
    keyword: string;
    message: string;
  }>;
};

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

async function requireAdministrator() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/admin/login?error=Votre session a expiré.");
  }

  const { data: adminMembership, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminMembership) {
    redirect(
      "/admin/login?error=Accès administrateur refusé.",
    );
  }
}

export async function runFranceTravailImport(
  formData: FormData,
) {
  await requireAdministrator();

  const mode = getFormString(formData, "mode");
  const keyword = getFormString(formData, "keyword");
  const limitValue = Number(
    getFormString(formData, "limit"),
  );

  const cdiOnly = formData.get("cdiOnly") === "on";

  if (mode !== "single" && mode !== "all") {
    redirect(
      "/admin/import?error=Mode d’importation invalide.",
    );
  }

  if (mode === "single" && !keyword) {
    redirect(
      "/admin/import?error=Sélectionnez un mot-clé.",
    );
  }

  const safeLimit = Number.isFinite(limitValue)
    ? Math.min(Math.max(Math.trunc(limitValue), 1), 100)
    : undefined;

  const headerStore = await headers();
  const host = headerStore.get("host");

  if (!host) {
    redirect(
      "/admin/import?error=Adresse du serveur indisponible.",
    );
  }

  const forwardedProtocol =
    headerStore.get("x-forwarded-proto");

  const protocol =
    forwardedProtocol ??
    (host.includes("localhost") ? "http" : "https");

  const origin = `${protocol}://${host}`;

  const adminToken = process.env.IMPORT_ADMIN_TOKEN;

  if (!adminToken) {
    redirect(
      "/admin/import?error=IMPORT_ADMIN_TOKEN est absent du fichier .env.local.",
    );
  }

  const requestBody: {
    keyword?: string;
    limit?: number;
    cdiOnly?: boolean;
  } = {};

  if (mode === "single") {
    requestBody.keyword = keyword;

    if (safeLimit) {
      requestBody.limit = safeLimit;
    }
  }

  if (cdiOnly) {
    requestBody.cdiOnly = true;
  }

  let result: ImportApiResponse;

  try {
    const response = await fetch(
      `${origin}/api/admin/import-france-travail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-import-token": adminToken,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      },
    );

    result = (await response.json()) as ImportApiResponse;

    if (!response.ok) {
      const errorMessage =
        result.error ??
        "L’importation France Travail a échoué.";

      redirect(
        `/admin/import?error=${encodeURIComponent(
          errorMessage,
        )}`,
      );
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de contacter le service d’importation.";

    redirect(
      `/admin/import?error=${encodeURIComponent(message)}`,
    );
  }

  const parameters = new URLSearchParams({
    success: "1",
    imported: String(result.importedCount ?? 0),
    duplicates: String(result.duplicateCount ?? 0),
    errors: String(result.errorCount ?? 0),
  });

  redirect(`/admin/import?${parameters.toString()}`);
}