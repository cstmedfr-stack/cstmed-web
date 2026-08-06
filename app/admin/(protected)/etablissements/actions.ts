"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";

const requestStatuses = [
  "new",
  "reviewing",
  "contacted",
  "proposal",
  "signed",
  "rejected",
  "archived",
] as const;

type RequestStatus = (typeof requestStatuses)[number];

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function isRequestStatus(value: string): value is RequestStatus {
  return requestStatuses.includes(value as RequestStatus);
}

export async function updateEstablishmentRequestStatus(
  formData: FormData,
) {
  const requestId = getFormString(formData, "requestId");
  const status = getFormString(formData, "status");

  if (!requestId) {
    throw new Error("L’identifiant de la demande est absent.");
  }

  if (!isRequestStatus(status)) {
    throw new Error("Le statut demandé n’est pas valide.");
  }

  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("establishment_requests")
    .update({
      status,
    })
    .eq("id", requestId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `La demande n’a pas pu être mise à jour : ${
        error?.message ?? "Demande introuvable."
      }`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/etablissements");
  revalidatePath(`/admin/etablissements/${requestId}`);
}