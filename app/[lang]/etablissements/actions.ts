"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

import {
  sendEstablishmentRequestNotifications,
} from "@/lib/email/establishment-request-notifications";

const establishmentTypes = [
  "hospital",
  "clinic",
  "health_center",
  "ehpad",
  "medical_practice",
  "other",
] as const;

const contractTypes = [
  "cdi",
  "cdd",
  "replacement",
  "liberal",
  "mixed",
  "other",
] as const;

const urgencyLevels = [
  "normal",
  "urgent",
  "very_urgent",
] as const;

function getText(
  formData: FormData,
  name: string,
  maximumLength = 500,
) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maximumLength);
}

function isAllowedValue<
  T extends readonly string[],
>(
  values: T,
  value: string,
): value is T[number] {
  return values.includes(
    value as T[number],
  );
}

function redirectWithError(
  locale: Locale,
  message: string,
): never {
  const parameters = new URLSearchParams({
    error: message,
  });

  redirect(
    `/${locale}/etablissements?${parameters.toString()}`,
  );
}

export async function submitEstablishmentRequest(
  formData: FormData,
) {
  const localeValue = getText(
    formData,
    "locale",
    2,
  );

  const locale: Locale = isLocale(localeValue)
    ? localeValue
    : "fr";

  const website = getText(
    formData,
    "website",
    200,
  );

  if (website) {
    redirect(`/${locale}/etablissements/merci`);
  }

  const establishmentName = getText(
    formData,
    "establishmentName",
    200,
  );

  const establishmentTypeValue = getText(
    formData,
    "establishmentType",
    50,
  );

  const contactName = getText(
    formData,
    "contactName",
    150,
  );

  const contactRole =
    getText(formData, "contactRole", 150) ||
    null;

  const email = getText(
    formData,
    "email",
    254,
  ).toLowerCase();

  const phone = getText(
    formData,
    "phone",
    50,
  );

  const city =
    getText(formData, "city", 120) ||
    null;

  const department =
    getText(formData, "department", 120) ||
    null;

  const specialty = getText(
    formData,
    "specialty",
    180,
  );

  const positionsValue = Number(
    getText(formData, "positionsCount", 3),
  );

  const positionsCount =
    Number.isInteger(positionsValue) &&
    positionsValue >= 1 &&
    positionsValue <= 100
      ? positionsValue
      : 1;

  const contractTypeValue = getText(
    formData,
    "contractType",
    50,
  );

  const desiredStartDateValue = getText(
    formData,
    "desiredStartDate",
    10,
  );

  const desiredStartDate =
    /^\d{4}-\d{2}-\d{2}$/.test(
      desiredStartDateValue,
    )
      ? desiredStartDateValue
      : null;

  const urgencyValue = getText(
    formData,
    "urgency",
    30,
  );

  const urgency = isAllowedValue(
    urgencyLevels,
    urgencyValue,
  )
    ? urgencyValue
    : "normal";

  const housingSupport =
    formData.get("housingSupport") === "on";

  const message =
    getText(formData, "message", 5000) ||
    null;

  const consent =
    formData.get("consent") === "on";

  if (
    !establishmentName ||
    !contactName ||
    !email ||
    !phone ||
    !specialty
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Completează toate câmpurile obligatorii."
        : "Complétez tous les champs obligatoires.",
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Adresa de e-mail nu este validă."
        : "L’adresse e-mail n’est pas valide.",
    );
  }

  if (
    phone.replace(/\D/g, "").length < 7
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Numărul de telefon nu este valid."
        : "Le numéro de téléphone n’est pas valide.",
    );
  }

  if (!consent) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Trebuie confirmat acordul pentru transmiterea solicitării."
        : "Vous devez confirmer votre accord pour transmettre la demande.",
    );
  }

  const establishmentType = isAllowedValue(
    establishmentTypes,
    establishmentTypeValue,
  )
    ? establishmentTypeValue
    : null;

  const contractType = isAllowedValue(
    contractTypes,
    contractTypeValue,
  )
    ? contractTypeValue
    : null;

  const now = new Date();
  const supabase = createAdminClient();

  const {
    data: insertedRequest,
    error,
  } = await supabase
    .from("establishment_requests")
    .insert({
      locale,

      establishment_name:
        establishmentName,

      establishment_type:
        establishmentType,

      contact_name: contactName,
      contact_role: contactRole,

      email,
      phone,

      city,
      department,

      specialty_needed: specialty,
      positions_count: positionsCount,

      contract_type: contractType,
      desired_start_date:
        desiredStartDate,

      urgency,
      housing_support: housingSupport,

      message,
      consent_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (error || !insertedRequest) {
    console.error(
      "Establishment request insert failed:",
      error?.message,
    );

    redirectWithError(
      locale,
      locale === "ro"
        ? "Solicitarea nu a putut fi înregistrată. Încearcă din nou."
        : "La demande n’a pas pu être enregistrée. Veuillez réessayer.",
    );
  }

  await sendEstablishmentRequestNotifications({
    requestId: insertedRequest.id,
    locale,

    establishmentName,
    establishmentType,

    contactName,
    contactRole,

    email,
    phone,

    city,
    department,

    specialty,
    positionsCount,

    contractType,
    desiredStartDate,
    urgency,

    housingSupport,
    message,
  });

  const parameters = new URLSearchParams({
    reference: insertedRequest.id,
  });

  redirect(
    `/${locale}/etablissements/merci?${parameters.toString()}`,
  );
}