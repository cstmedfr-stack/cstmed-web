"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const applicationStatuses = [
  "new",
  "reviewing",
  "contacted",
  "interview",
  "accepted",
  "rejected",
  "archived",
] as const;

type ApplicationStatus =
  (typeof applicationStatuses)[number];

function getFormString(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function isApplicationStatus(
  value: string,
): value is ApplicationStatus {
  return applicationStatuses.includes(
    value as ApplicationStatus,
  );
}

export async function updateApplicationStatus(
  formData: FormData,
) {
  const applicationId = getFormString(
    formData,
    "applicationId",
  );

  const status = getFormString(
    formData,
    "status",
  );

  if (!applicationId) {
    throw new Error(
      "L’identifiant de la candidature est absent.",
    );
  }

  if (!isApplicationStatus(status)) {
    throw new Error(
      "Le statut demandé n’est pas valide.",
    );
  }

  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("applications")
    .update({
      status,
    })
    .eq("id", applicationId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `La candidature n’a pas pu être mise à jour : ${
        error?.message ??
        "Candidature introuvable."
      }`,
    );
  }

  revalidatePath("/admin/candidatures");
  revalidatePath(
    `/admin/candidatures/${applicationId}`,
  );
}

export async function downloadApplicationCv(
  formData: FormData,
) {
  const applicationId = getFormString(
    formData,
    "applicationId",
  );

  if (!applicationId) {
    throw new Error(
      "L’identifiant de la candidature est absent.",
    );
  }

  /*
   * Verificăm administratorul cu clientul utilizatorului,
   * înainte de a folosi cheia secretă.
   */
  const { supabase } = await requireAdmin();

  const {
    data: application,
    error: applicationError,
  } = await supabase
    .from("applications")
    .select(
      `
        id,
        cv_path,
        cv_original_name
      `,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError || !application) {
    throw new Error(
      applicationError?.message ??
        "La candidature est introuvable.",
    );
  }

  const adminClient = createAdminClient();

  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await adminClient.storage
    .from("candidate-cvs")
    .createSignedUrl(
      application.cv_path,
      60,
      {
        download: true,
      },
    );

  if (
    signedUrlError ||
    !signedUrlData?.signedUrl
  ) {
    throw new Error(
      signedUrlError?.message ??
        "Le lien de téléchargement ne peut pas être créé.",
    );
  }

  redirect(signedUrlData.signedUrl);
}