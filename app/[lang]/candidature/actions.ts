"use server";

import { createHmac, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendApplicationNotifications } from "@/lib/email/application-notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { isLocale, type Locale } from "@/lib/i18n/config";

const MAX_CV_SIZE = 4 * 1024 * 1024;
const MAX_EMAIL_ATTEMPTS_PER_HOUR = 5;
const MAX_IP_ATTEMPTS_PER_HOUR = 20;

const allowedExtensions = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

type AllowedExtension = keyof typeof allowedExtensions;

const allowedFrenchLevels = [
  "none", "a1", "a2", "b1", "b2", "c1", "c2", "native",
] as const;
type FrenchLevel = (typeof allowedFrenchLevels)[number];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getText(formData: FormData, name: string, maximumLength = 500) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function isFrenchLevel(value: string): value is FrenchLevel {
  return allowedFrenchLevels.includes(value as FrenchLevel);
}

function getExtension(fileName: string): AllowedExtension | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension in allowedExtensions
    ? (extension as AllowedExtension)
    : null;
}


/**
 * Lightweight format verification. This is not an antivirus scanner and does
 * not prove that a document is safe to open. Do not render CVs as HTML.
 */
function isAuthenticCv(bytes: Uint8Array, extension: AllowedExtension): boolean {
  if (extension === "pdf") {
    // PDF header must be at the start; EOF marker is usually close to the end.
    const header = new TextDecoder("ascii").decode(bytes.subarray(0, 8));
    if (!header.startsWith("%PDF-")) return false;
    const tail = new TextDecoder("ascii").decode(bytes.subarray(Math.max(0, bytes.length - 2048)));
    return tail.includes("%%EOF");
  }

  if (extension === "doc") {
    // Legacy Word .doc is an OLE Compound File (CFBF).
    const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    return bytes.length >= 512 && signature.every((value, i) => bytes[i] === value);
  }

  // DOCX is an OpenXML ZIP package. Inspect the central directory directly,
  // avoiding an additional ZIP dependency and decompressing untrusted content.
  if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minEocd = Math.max(0, bytes.length - 22 - 65535);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= minEocd; i--) {
    if (view.getUint32(i, true) === 0x06054b50 &&
        i + 22 + view.getUint16(i + 20, true) === bytes.length) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return false;
  if (view.getUint16(eocd + 4, true) !== 0 || view.getUint16(eocd + 6, true) !== 0) return false;
  const entries = view.getUint16(eocd + 10, true);
  const directorySize = view.getUint32(eocd + 12, true);
  const directoryOffset = view.getUint32(eocd + 16, true);
  if (!entries || entries > 2000 || directoryOffset + directorySize > eocd) return false;

  const decoder = new TextDecoder("utf-8", { fatal: true });
  let position = directoryOffset;
  let contentTypes = false;
  let wordDocument = false;
  try {
    for (let i = 0; i < entries; i++) {
      if (position + 46 > eocd || view.getUint32(position, true) !== 0x02014b50) return false;
      const flags = view.getUint16(position + 8, true);
      const nameLength = view.getUint16(position + 28, true);
      const extraLength = view.getUint16(position + 30, true);
      const commentLength = view.getUint16(position + 32, true);
      const next = position + 46 + nameLength + extraLength + commentLength;
      if (next > eocd || (flags & 0x0001) !== 0) return false; // encrypted archive
      const name = decoder.decode(bytes.subarray(position + 46, position + 46 + nameLength));
      if (name === "[Content_Types].xml") contentTypes = true;
      if (name === "word/document.xml") wordDocument = true;
      if (/(^|\/)vbaProject\.bin$/i.test(name)) return false; // macro-bearing files
      position = next;
    }
  } catch {
    return false;
  }
  return position === directoryOffset + directorySize && contentTypes && wordDocument;
}

function redirectWithError(locale: Locale, message: string, jobId?: string): never {
  const parameters = new URLSearchParams({ error: message });
  if (jobId && uuidPattern.test(jobId)) parameters.set("jobId", jobId);
  redirect(`/${locale}/candidature?${parameters.toString()}`);
}

/**
 * Hash identifiers before storing them in the rate-limit table.
 * Uses a key that already exists exclusively on the server.
 */
function rateKey(kind: "email" | "ip", value: string): string {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Server rate-limit secret is unavailable.");
  const digest = createHmac("sha256", secret)
    .update(`cstmed:application:${kind}:${value}`)
    .digest("hex");
  return `application:${kind}:${digest}`;
}

async function enforceApplicationRateLimit(
  db: ReturnType<typeof createAdminClient>,
  locale: Locale,
  email: string,
  requestedJobId: string,
) {
  const tooMany = locale === "ro"
    ? "Prea multe încercări de trimitere. Te rugăm să revii peste o oră."
    : "Trop de tentatives d’envoi. Veuillez réessayer dans une heure.";
  const unavailable = locale === "ro"
    ? "Momentan nu putem verifica trimiterea candidaturii. Încearcă din nou mai târziu."
    : "La vérification de l’envoi est temporairement indisponible. Veuillez réessayer plus tard.";

  let keys: Array<{ key: string; max: number }>;
  try {
    keys = [{ key: rateKey("email", email), max: MAX_EMAIL_ATTEMPTS_PER_HOUR }];
    const headerStore = await headers();
    // Vercel's forwarding header is preferred; both forwarding headers are
    // infrastructural signals, not a guarantee against proxy spoofing.
    const forwarded = headerStore.get("x-vercel-forwarded-for")
      ?? headerStore.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim();
    if (ip && ip.length <= 100) {
      keys.unshift({ key: rateKey("ip", ip), max: MAX_IP_ATTEMPTS_PER_HOUR });
    }
  } catch (error) {
    console.error("Application rate-limit configuration error:", error);
    redirectWithError(locale, unavailable, requestedJobId);
  }

  // This SQL function increments atomically via INSERT ... ON CONFLICT.
  // We intentionally reject submissions if the protection cannot be checked.
  for (const entry of keys) {
    const { data, error } = await db.rpc("check_application_rate_limit", {
      p_key: entry.key,
      p_max_attempts: entry.max,
      p_window_minutes: 60,
    });
    if (error || typeof data !== "boolean") {
      console.error("Application rate-limit RPC error:", error?.message ?? "Invalid response");
      redirectWithError(locale, unavailable, requestedJobId);
    }
    if (!data) redirectWithError(locale, tooMany, requestedJobId);
  }
}

export async function submitApplication(formData: FormData) {
  const requestedLocale = getText(formData, "locale", 2);
  const locale: Locale = isLocale(requestedLocale) ? requestedLocale : "ro";
  const requestedJobId = getText(formData, "jobId", 36);

  // Honeypot: do not perform storage writes or send notifications for bots.
  if (getText(formData, "website", 200)) {
    redirect(`/${locale}/candidature/merci`);
  }

  const firstName = getText(formData, "firstName", 100);
  const lastName = getText(formData, "lastName", 100);
  const email = getText(formData, "email", 254).toLowerCase();
  const phone = getText(formData, "phone", 50);
  const specialty = getText(formData, "specialty", 150);
  const country = getText(formData, "country", 100) || null;
  const city = getText(formData, "city", 120) || null;
  const frenchLevelValue = getText(formData, "frenchLevel", 20);
  const message = getText(formData, "message", 5000) || null;
  const consent = formData.get("consent") === "on";
  const talentPoolConsent = formData.get("talentPoolConsent") === "on";

  if (!firstName || !lastName || !email || !phone || !specialty) {
    redirectWithError(locale, locale === "ro"
      ? "Completează toate câmpurile obligatorii."
      : "Complétez tous les champs obligatoires.", requestedJobId);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectWithError(locale, locale === "ro"
      ? "Adresa de e-mail nu este validă."
      : "L’adresse e-mail n’est pas valide.", requestedJobId);
  }
  if (phone.replace(/\D/g, "").length < 7) {
    redirectWithError(locale, locale === "ro"
      ? "Numărul de telefon nu este valid."
      : "Le numéro de téléphone n’est pas valide.", requestedJobId);
  }
  if (frenchLevelValue && !isFrenchLevel(frenchLevelValue)) {
    redirectWithError(locale, locale === "ro"
      ? "Nivelul de limba franceză nu este valid."
      : "Le niveau de français n’est pas valide.", requestedJobId);
  }
  if (!consent) {
    redirectWithError(locale, locale === "ro"
      ? "Trebuie să îți exprimi acordul pentru transmiterea candidaturii."
      : "Vous devez accepter le traitement de votre candidature.", requestedJobId);
  }

  const cvValue = formData.get("cv");
  if (!(cvValue instanceof File) || cvValue.size === 0) {
    redirectWithError(locale, locale === "ro"
      ? "Atașează CV-ul."
      : "Veuillez joindre votre CV.", requestedJobId);
  }
  if (cvValue.size > MAX_CV_SIZE) {
    redirectWithError(locale, locale === "ro"
      ? "CV-ul depășește limita de 4 MB."
      : "Le CV dépasse la limite de 4 Mo.", requestedJobId);
  }
  const extension = getExtension(cvValue.name);
  if (!extension) {
    redirectWithError(locale, locale === "ro"
      ? "CV-ul trebuie să fie în format PDF, DOC sau DOCX."
      : "Le CV doit être au format PDF, DOC ou DOCX.", requestedJobId);
  }
  const expectedMimeType = allowedExtensions[extension];
  if (cvValue.type && cvValue.type !== expectedMimeType &&
      cvValue.type !== "application/octet-stream") {
    redirectWithError(locale, locale === "ro"
      ? "Tipul fișierului CV nu corespunde extensiei."
      : "Le type du fichier CV ne correspond pas à son extension.", requestedJobId);
  }

  const supabase = createAdminClient();
  await enforceApplicationRateLimit(supabase, locale, email, requestedJobId);

  let jobId: string | null = null;
  let jobTitle: string | null = null;
  if (requestedJobId) {
    if (!uuidPattern.test(requestedJobId)) {
      redirectWithError(locale, locale === "ro"
        ? "Oferta selectată nu este validă."
        : "L’offre sélectionnée n’est pas valide.");
    }
    const { data: selectedJob, error: selectedJobError } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("id", requestedJobId)
      .eq("status", "published")
      .maybeSingle();
    if (selectedJobError || !selectedJob) {
      redirectWithError(locale, locale === "ro"
        ? "Oferta selectată nu mai este disponibilă."
        : "L’offre sélectionnée n’est plus disponible.");
    }
    jobId = selectedJob.id;
    jobTitle = selectedJob.title;
  }

  const applicationId = randomUUID();
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const cvPath = `${year}/${month}/${applicationId}.${extension}`;
  const cvContent = await cvValue.arrayBuffer();
  if (!isAuthenticCv(new Uint8Array(cvContent), extension)) {
    redirectWithError(locale, locale === "ro"
      ? "Fișierul CV nu are structura unui document PDF, DOC sau DOCX valid. Încarcă un alt fișier."
      : "Le fichier CV ne possède pas la structure d’un document PDF, DOC ou DOCX valide. Choisissez un autre fichier.",
      jobId ?? undefined);
  }

  const { error: uploadError } = await supabase.storage
    .from("candidate-cvs")
    .upload(cvPath, cvContent, {
      contentType: expectedMimeType,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) {
    console.error("CV upload failed:", uploadError.message);
    redirectWithError(locale, locale === "ro"
      ? "CV-ul nu a putut fi încărcat. Încearcă din nou."
      : "Le CV n’a pas pu être téléchargé. Veuillez réessayer.", jobId ?? undefined);
  }

  const { error: applicationError } = await supabase.from("applications").insert({
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
    french_level: frenchLevelValue || null,
    message,
    cv_path: cvPath,
    cv_original_name: cvValue.name.slice(0, 255),
    cv_mime_type: expectedMimeType,
    cv_size_bytes: cvValue.size,
    consent_at: now.toISOString(),
    talent_pool_consent_at: talentPoolConsent ? now.toISOString() : null,
  });
  if (applicationError) {
    console.error("Application insert failed:", applicationError.message);
    await supabase.storage.from("candidate-cvs").remove([cvPath]);
    redirectWithError(locale, locale === "ro"
      ? "Candidatura nu a putut fi înregistrată. Încearcă din nou."
      : "La candidature n’a pas pu être enregistrée. Veuillez réessayer.", jobId ?? undefined);
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

  const successParameters = new URLSearchParams({ reference: applicationId });
  redirect(`/${locale}/candidature/merci?${successParameters.toString()}`);
}
