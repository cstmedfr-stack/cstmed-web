"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import {
  sendApplicationNotifications,
} from "@/lib/email/application-notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

const MAX_CV_SIZE = 4 * 1024 * 1024;

const allowedExtensions = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

type AllowedExtension = keyof typeof allowedExtensions;

const allowedFrenchLevels = [
  "none",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "native",
] as const;

type FrenchLevel =
  (typeof allowedFrenchLevels)[number];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getText(
  formData: FormData,
  name: string,
  maximumLength = 500,
) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength);
}

function isFrenchLevel(
  value: string,
): value is FrenchLevel {
  return allowedFrenchLevels.includes(
    value as FrenchLevel,
  );
}

function getExtension(
  fileName: string,
): AllowedExtension | null {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    extension &&
    extension in allowedExtensions
  ) {
    return extension as AllowedExtension;
  }

  return null;
}

function redirectWithError(
  locale: Locale,
  message: string,
  jobId?: string,
): never {
  const parameters = new URLSearchParams({
    error: message,
  });

  if (jobId && uuidPattern.test(jobId)) {
    parameters.set("jobId", jobId);
  }

  redirect(
    `/${locale}/candidature?${parameters.toString()}`,
  );
}

export async function submitApplication(
  formData: FormData,
) {
  const requestedLocale = getText(
    formData,
    "locale",
    2,
  );

  const locale: Locale = isLocale(requestedLocale)
    ? requestedLocale
    : "ro";

  const requestedJobId = getText(
    formData,
    "jobId",
    36,
  );

  /*
   * Câmp-capcană pentru boți.
   * Utilizatorii reali nu îl văd și nu îl completează.
   */
  const website = getText(
    formData,
    "website",
    200,
  );

  if (website) {
    redirect(`/${locale}/candidature/merci`);
  }

  const firstName = getText(
    formData,
    "firstName",
    100,
  );

  const lastName = getText(
    formData,
    "lastName",
    100,
  );

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

  const specialty = getText(
    formData,
    "specialty",
    150,
  );

  const country =
    getText(formData, "country", 100) || null;

  const city =
    getText(formData, "city", 120) || null;

  const frenchLevelValue = getText(
    formData,
    "frenchLevel",
    20,
  );

  const message =
    getText(formData, "message", 5000) || null;

  const consent =
    formData.get("consent") === "on";

    const talentPoolConsent =
  formData.get("talentPoolConsent") === "on";

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !specialty
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Completează toate câmpurile obligatorii."
        : "Complétez tous les champs obligatoires.",
      requestedJobId,
    );
  }

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!validEmail) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Adresa de e-mail nu este validă."
        : "L’adresse e-mail n’est pas valide.",
      requestedJobId,
    );
  }

  if (phone.replace(/\D/g, "").length < 7) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Numărul de telefon nu este valid."
        : "Le numéro de téléphone n’est pas valide.",
      requestedJobId,
    );
  }

  if (
    frenchLevelValue &&
    !isFrenchLevel(frenchLevelValue)
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Nivelul de limba franceză nu este valid."
        : "Le niveau de français n’est pas valide.",
      requestedJobId,
    );
  }

  if (!consent) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Trebuie să îți exprimi acordul pentru transmiterea candidaturii."
        : "Vous devez accepter le traitement de votre candidature.",
      requestedJobId,
    );
  }

  const cvValue = formData.get("cv");

  if (
    !(cvValue instanceof File) ||
    cvValue.size === 0
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Atașează CV-ul."
        : "Veuillez joindre votre CV.",
      requestedJobId,
    );
  }

  if (cvValue.size > MAX_CV_SIZE) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "CV-ul depășește limita de 4 MB."
        : "Le CV dépasse la limite de 4 Mo.",
      requestedJobId,
    );
  }

  const extension = getExtension(cvValue.name);

  if (!extension) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "CV-ul trebuie să fie în format PDF, DOC sau DOCX."
        : "Le CV doit être au format PDF, DOC ou DOCX.",
      requestedJobId,
    );
  }

  const expectedMimeType =
    allowedExtensions[extension];

  /*
   * Unele browsere trimit un MIME gol sau
   * application/octet-stream pentru fișiere Word.
   */
  if (
    cvValue.type &&
    cvValue.type !== expectedMimeType &&
    cvValue.type !== "application/octet-stream"
  ) {
    redirectWithError(
      locale,
      locale === "ro"
        ? "Tipul fișierului CV nu corespunde extensiei."
        : "Le type du fichier CV ne correspond pas à son extension.",
      requestedJobId,
    );
  }

  const supabase = createAdminClient();

 let jobId: string | null = null;
let jobTitle: string | null = null;

  if (requestedJobId) {
    if (!uuidPattern.test(requestedJobId)) {
      redirectWithError(
        locale,
        locale === "ro"
          ? "Oferta selectată nu este validă."
          : "L’offre sélectionnée n’est pas valide.",
      );
    }

    const {
      data: selectedJob,
      error: selectedJobError,
    } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("id", requestedJobId)
      .eq("status", "published")
      .maybeSingle();

    if (
      selectedJobError ||
      !selectedJob
    ) {
      redirectWithError(
        locale,
        locale === "ro"
          ? "Oferta selectată nu mai este disponibilă."
          : "L’offre sélectionnée n’est plus disponible.",
      );
    }

    jobId = selectedJob.id;
    jobTitle = selectedJob.title;
  }

  const applicationId = randomUUID();
  const now = new Date();

  const year = String(now.getUTCFullYear());

  const month = String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0");

  const cvPath =
    `${year}/${month}/${applicationId}.${extension}`;

  const cvContent =
    await cvValue.arrayBuffer();

  const { error: uploadError } =
    await supabase.storage
      .from("candidate-cvs")
      .upload(cvPath, cvContent, {
        contentType: expectedMimeType,
        cacheControl: "3600",
        upsert: false,
      });

  if (uploadError) {
    console.error(
      "CV upload failed:",
      uploadError.message,
    );

    redirectWithError(
      locale,
      locale === "ro"
        ? "CV-ul nu a putut fi încărcat. Încearcă din nou."
        : "Le CV n’a pas pu être téléchargé. Veuillez réessayer.",
      jobId ?? undefined,
    );
  }

  const originalFileName =
    cvValue.name.slice(0, 255);

  const {
    error: applicationError,
  } = await supabase
    .from("applications")
    .insert({
      id: applicationId,
      job_id: jobId,
      locale,

      first_name: firstName,
      last_name: lastName,
      email,
      phone,

      specialty,
      country,
      city,

      french_level: frenchLevelValue
        ? frenchLevelValue
        : null,

      message,

      cv_path: cvPath,
      cv_original_name: originalFileName,
      cv_mime_type: expectedMimeType,
      cv_size_bytes: cvValue.size,

      consent_at: now.toISOString(),
      talent_pool_consent_at: talentPoolConsent
  ? now.toISOString()
  : null,
    });

  if (applicationError) {
    console.error(
      "Application insert failed:",
      applicationError.message,
    );

    /*
     * Dacă înregistrarea nu reușește,
     * ștergem CV-ul pentru a nu rămâne orfan.
     */
    await supabase.storage
      .from("candidate-cvs")
      .remove([cvPath]);

    redirectWithError(
      locale,
      locale === "ro"
        ? "Candidatura nu a putut fi înregistrată. Încearcă din nou."
        : "La candidature n’a pas pu être enregistrée. Veuillez réessayer.",
      jobId ?? undefined,
    );
  }
await sendApplicationNotifications({
  applicationId,
  locale,

  firstName,
  lastName,
  email,
  phone,

  specialty,
  country,
  city,

  frenchLevel: frenchLevelValue || null,
  message,

  jobTitle,
});
  const successParameters =
    new URLSearchParams({
      reference: applicationId,
    });

  redirect(
    `/${locale}/candidature/merci?${successParameters.toString()}`,
  );
}