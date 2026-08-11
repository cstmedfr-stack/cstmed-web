import { randomUUID } from "node:crypto";

import {
  sendApplicationNotifications,
} from "@/lib/email/application-notifications";
import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_CV_SIZE = 4 * 1024 * 1024;

const allowedExtensions = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

type AllowedExtension =
  keyof typeof allowedExtensions;

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type",
};

function json(
  body: Record<string, unknown>,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}

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

function isFrenchLevel(
  value: string,
): value is FrenchLevel {
  return allowedFrenchLevels.includes(
    value as FrenchLevel,
  );
}

function errorMessage(
  locale: Locale,
  ro: string,
  fr: string,
) {
  return locale === "ro"
    ? ro
    : fr;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(
  request: Request,
) {
  let formData: FormData;

  try {
    formData =
      await request.formData();
  } catch {
    return json(
      {
        success: false,
        error:
          "Le formulaire transmis n’est pas valide.",
      },
      400,
    );
  }

  const requestedLocale =
    getText(
      formData,
      "locale",
      2,
    );

  const locale: Locale =
    isLocale(requestedLocale)
      ? requestedLocale
      : "fr";

  /*
   * Honeypot anti-bot.
   * L'application CSTMed envoie toujours
   * ce champ vide.
   */
  const website =
    getText(
      formData,
      "website",
      200,
    );

  if (website) {
    return json({
      success: true,
    });
  }

  const requestedJobId =
    getText(
      formData,
      "jobId",
      36,
    );

  const firstName =
    getText(
      formData,
      "firstName",
      100,
    );

  const lastName =
    getText(
      formData,
      "lastName",
      100,
    );

  const email =
    getText(
      formData,
      "email",
      254,
    ).toLowerCase();

  const phone =
    getText(
      formData,
      "phone",
      50,
    );

  const specialty =
    getText(
      formData,
      "specialty",
      150,
    );

  const country =
    getText(
      formData,
      "country",
      100,
    ) || null;

  const city =
    getText(
      formData,
      "city",
      120,
    ) || null;

  const frenchLevelValue =
    getText(
      formData,
      "frenchLevel",
      20,
    );

  const message =
    getText(
      formData,
      "message",
      5000,
    ) || null;

  const consent =
    getText(
      formData,
      "consent",
      10,
    ) === "true";

  const talentPoolConsent =
    getText(
      formData,
      "talentPoolConsent",
      10,
    ) === "true";

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !specialty
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Completează toate câmpurile obligatorii.",
          "Complétez tous les champs obligatoires.",
        ),
      },
      400,
    );
  }

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );

  if (!validEmail) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Adresa de e-mail nu este validă.",
          "L’adresse e-mail n’est pas valide.",
        ),
      },
      400,
    );
  }

  if (
    phone.replace(/\D/g, "")
      .length < 7
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Numărul de telefon nu este valid.",
          "Le numéro de téléphone n’est pas valide.",
        ),
      },
      400,
    );
  }

  if (
    frenchLevelValue &&
    !isFrenchLevel(
      frenchLevelValue,
    )
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Nivelul de limba franceză nu este valid.",
          "Le niveau de français n’est pas valide.",
        ),
      },
      400,
    );
  }

  if (!consent) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Trebuie să îți exprimi acordul pentru transmiterea candidaturii.",
          "Vous devez accepter le traitement de votre candidature.",
        ),
      },
      400,
    );
  }

  const cvValue =
    formData.get("cv");

  if (
    !(cvValue instanceof File) ||
    cvValue.size === 0
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Atașează CV-ul.",
          "Veuillez joindre votre CV.",
        ),
      },
      400,
    );
  }

  if (
    cvValue.size >
    MAX_CV_SIZE
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "CV-ul depășește limita de 4 MB.",
          "Le CV dépasse la limite de 4 Mo.",
        ),
      },
      400,
    );
  }

  const extension =
    getExtension(cvValue.name);

  if (!extension) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "CV-ul trebuie să fie în format PDF, DOC sau DOCX.",
          "Le CV doit être au format PDF, DOC ou DOCX.",
        ),
      },
      400,
    );
  }

  const expectedMimeType =
    allowedExtensions[
      extension
    ];

  if (
    cvValue.type &&
    cvValue.type !==
      expectedMimeType &&
    cvValue.type !==
      "application/octet-stream"
  ) {
    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Tipul fișierului CV nu corespunde extensiei.",
          "Le type du fichier CV ne correspond pas à son extension.",
        ),
      },
      400,
    );
  }

  const supabase =
    createAdminClient();

  let jobId:
    | string
    | null = null;

  let jobTitle:
    | string
    | null = null;

  if (requestedJobId) {
    if (
      !uuidPattern.test(
        requestedJobId,
      )
    ) {
      return json(
        {
          success: false,
          error: errorMessage(
            locale,
            "Oferta selectată nu este validă.",
            "L’offre sélectionnée n’est pas valide.",
          ),
        },
        400,
      );
    }

    const {
      data: selectedJob,
      error: selectedJobError,
    } = await supabase
      .from("jobs")
      .select("id, title")
      .eq(
        "id",
        requestedJobId,
      )
      .eq(
        "status",
        "published",
      )
      .maybeSingle();

    if (
      selectedJobError ||
      !selectedJob
    ) {
      return json(
        {
          success: false,
          error: errorMessage(
            locale,
            "Oferta selectată nu mai este disponibilă.",
            "L’offre sélectionnée n’est plus disponible.",
          ),
        },
        404,
      );
    }

    jobId =
      selectedJob.id;

    jobTitle =
      selectedJob.title;
  }

  const applicationId =
    randomUUID();

  const now =
    new Date();

  const year =
    String(
      now.getUTCFullYear(),
    );

  const month =
    String(
      now.getUTCMonth() + 1,
    ).padStart(2, "0");

  const cvPath =
    `${year}/${month}/${applicationId}.${extension}`;

  const cvContent =
    await cvValue.arrayBuffer();

  const {
    error: uploadError,
  } = await supabase.storage
    .from("candidate-cvs")
    .upload(
      cvPath,
      cvContent,
      {
        contentType:
          expectedMimeType,

        cacheControl:
          "3600",

        upsert: false,
      },
    );

  if (uploadError) {
    console.error(
      "Mobile CV upload failed:",
      uploadError.message,
    );

    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "CV-ul nu a putut fi încărcat. Încearcă din nou.",
          "Le CV n’a pas pu être téléchargé. Veuillez réessayer.",
        ),
      },
      500,
    );
  }

  const originalFileName =
    cvValue.name.slice(
      0,
      255,
    );

  const {
    error: applicationError,
  } = await supabase
    .from("applications")
    .insert({
      id: applicationId,

      job_id: jobId,

      locale,

      first_name:
        firstName,

      last_name:
        lastName,

      email,
      phone,

      specialty,

      country,
      city,

      french_level:
        frenchLevelValue
          ? frenchLevelValue
          : null,

      message,

      cv_path:
        cvPath,

      cv_original_name:
        originalFileName,

      cv_mime_type:
        expectedMimeType,

      cv_size_bytes:
        cvValue.size,

      consent_at:
        now.toISOString(),

      talent_pool_consent_at:
        talentPoolConsent
          ? now.toISOString()
          : null,
    });

  if (applicationError) {
    console.error(
      "Mobile application insert failed:",
      applicationError.message,
    );

    await supabase.storage
      .from("candidate-cvs")
      .remove([cvPath]);

    return json(
      {
        success: false,
        error: errorMessage(
          locale,
          "Candidatura nu a putut fi înregistrată. Încearcă din nou.",
          "La candidature n’a pas pu être enregistrée. Veuillez réessayer.",
        ),
      },
      500,
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

    frenchLevel:
      frenchLevelValue ||
      null,

    message,
    jobTitle,
  });

  return json({
    success: true,
    reference:
      applicationId,
  });
}