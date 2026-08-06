import "server-only";

import { Resend } from "resend";

import type { Locale } from "@/lib/i18n/config";

type ApplicationNotificationData = {
  applicationId: string;
  locale: Locale;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  specialty: string;
  country: string | null;
  city: string | null;
  frenchLevel: string | null;
  message: string | null;

  jobTitle: string | null;
};

const frenchLevelLabels = {
  ro: {
    none: "Începător / fără cunoștințe",
    a1: "A1 – Începător",
    a2: "A2 – Elementar",
    b1: "B1 – Intermediar",
    b2: "B2 – Independent",
    c1: "C1 – Avansat",
    c2: "C2 – Stăpânire foarte bună",
    native: "Limbă maternă",
  },

  fr: {
    none: "Débutant / aucun niveau",
    a1: "A1 – Débutant",
    a2: "A2 – Élémentaire",
    b1: "B1 – Intermédiaire",
    b2: "B2 – Indépendant",
    c1: "C1 – Avancé",
    c2: "C2 – Maîtrise",
    native: "Langue maternelle",
  },
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getShortReference(applicationId: string) {
  return applicationId
    .replaceAll("-", "")
    .slice(0, 10)
    .toUpperCase();
}

function getFrenchLevelLabel(
  locale: Locale,
  frenchLevel: string | null,
) {
  if (!frenchLevel) {
    return locale === "ro"
      ? "Nespecificat"
      : "Non précisé";
  }

  const labels = frenchLevelLabels[locale];

  return (
    labels[
      frenchLevel as keyof typeof labels
    ] ?? frenchLevel
  );
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function sendApplicationNotifications(
  application: ApplicationNotificationData,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.APPLICATION_FROM_EMAIL;
  const administratorEmail =
    process.env.APPLICATION_NOTIFICATION_EMAIL;

  if (
    !apiKey ||
    !fromEmail ||
    !administratorEmail
  ) {
    console.warn(
      "Notificările e-mail nu au fost trimise: configurația Resend este incompletă.",
    );

    return;
  }

  const resend = new Resend(apiKey);

  const fullName =
    `${application.firstName} ${application.lastName}`.trim();

  const reference = getShortReference(
    application.applicationId,
  );

  const siteUrl = getSiteUrl();

  const administratorUrl =
    `${siteUrl}/admin/candidatures/` +
    application.applicationId;

  const location = [
    application.city,
    application.country,
  ]
    .filter(Boolean)
    .join(", ");

  const frenchLevel = getFrenchLevelLabel(
    application.locale,
    application.frenchLevel,
  );

  const safeFullName = escapeHtml(fullName);
  const safeEmail = escapeHtml(application.email);
  const safePhone = escapeHtml(application.phone);
  const safeSpecialty = escapeHtml(
    application.specialty,
  );

  const safeLocation = escapeHtml(
    location || "Non précisée",
  );

  const safeFrenchLevel =
    escapeHtml(frenchLevel);

  const safeJobTitle = escapeHtml(
    application.jobTitle ??
      "Candidature spontanée",
  );

  const safeMessage = application.message
    ? escapeHtml(application.message).replaceAll(
        "\n",
        "<br />",
      )
    : "Aucun message supplémentaire.";

  const administratorHtml = `
    <div style="margin:0;background:#f5f9fb;padding:32px;font-family:Arial,sans-serif;color:#102435">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce5ea">
        <div style="background:#082a43;padding:28px 32px;color:#ffffff">
          <p style="margin:0;color:#65d9ce;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px">
            Nouvelle candidature CSTMed
          </p>

          <h1 style="margin:12px 0 0;font-size:28px">
            ${safeFullName}
          </h1>

          <p style="margin:10px 0 0;color:#d7e2e8">
            ${safeSpecialty}
          </p>
        </div>

        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:10px 0;color:#64748b">E-mail</td>
              <td style="padding:10px 0;font-weight:bold">${safeEmail}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b">Téléphone</td>
              <td style="padding:10px 0;font-weight:bold">${safePhone}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b">Localisation</td>
              <td style="padding:10px 0;font-weight:bold">${safeLocation}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b">Français</td>
              <td style="padding:10px 0;font-weight:bold">${safeFrenchLevel}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b">Offre</td>
              <td style="padding:10px 0;font-weight:bold">${safeJobTitle}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b">Langue du formulaire</td>
              <td style="padding:10px 0;font-weight:bold;text-transform:uppercase">
                ${application.locale}
              </td>
            </tr>
          </table>

          <div style="margin-top:24px;background:#f5f9fb;border-radius:16px;padding:20px;line-height:1.7">
            <strong>Message du candidat</strong>

            <p style="margin:10px 0 0">
              ${safeMessage}
            </p>
          </div>

          <div style="margin-top:28px;text-align:center">
            <a
              href="${administratorUrl}"
              style="display:inline-block;background:#118c87;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-weight:bold"
            >
              Consulter la candidature
            </a>
          </div>

          <p style="margin:26px 0 0;color:#64748b;font-size:13px">
            Référence : ${reference}
          </p>

          <p style="margin:8px 0 0;color:#64748b;font-size:13px">
            Le CV reste dans l’espace privé CSTMed et n’est pas joint à cet e-mail.
          </p>
        </div>
      </div>
    </div>
  `;

  const administratorText = `
Nouvelle candidature CSTMed

Candidat : ${fullName}
Spécialité : ${application.specialty}
E-mail : ${application.email}
Téléphone : ${application.phone}
Localisation : ${location || "Non précisée"}
Niveau de français : ${frenchLevel}
Offre : ${application.jobTitle ?? "Candidature spontanée"}
Langue : ${application.locale.toUpperCase()}

Message :
${application.message ?? "Aucun message supplémentaire."}

Consulter la candidature :
${administratorUrl}

Référence : ${reference}
  `.trim();

  const candidateSubject =
    application.locale === "ro"
      ? `Candidatura ta CSTMed – ${reference}`
      : `Votre candidature CSTMed – ${reference}`;

  const candidateTitle =
    application.locale === "ro"
      ? "Candidatura ta a fost transmisă"
      : "Votre candidature a été transmise";

  const candidateIntro =
    application.locale === "ro"
      ? `Bună ziua ${safeFullName},`
      : `Bonjour ${safeFullName},`;

  const candidateText =
    application.locale === "ro"
      ? `
Bună ziua ${fullName},

Candidatura ta a fost transmisă către CSTMed.

Specialitate: ${application.specialty}
Ofertă: ${application.jobTitle ?? "Candidatură spontană"}
Referință: ${reference}

Vom analiza informațiile și CV-ul transmis și te vom contacta pentru continuarea discuțiilor.

Echipa CSTMed
contact@cstmed.fr
      `.trim()
      : `
Bonjour ${fullName},

Votre candidature a bien été transmise à CSTMed.

Spécialité : ${application.specialty}
Offre : ${application.jobTitle ?? "Candidature spontanée"}
Référence : ${reference}

Nous étudierons les informations et le CV transmis avant de vous contacter pour la suite.

L’équipe CSTMed
contact@cstmed.fr
      `.trim();

  const candidateDescription =
    application.locale === "ro"
      ? "Am primit datele și CV-ul tău. Echipa CSTMed va analiza profilul înainte de a te contacta."
      : "Nous avons reçu vos informations et votre CV. L’équipe CSTMed étudiera votre profil avant de vous contacter.";

  const candidateJobLabel =
    application.locale === "ro"
      ? "Oferta"
      : "Offre";

  const candidateReferenceLabel =
    application.locale === "ro"
      ? "Referința candidaturii"
      : "Référence de candidature";

  const candidateHtml = `
    <div style="margin:0;background:#f5f9fb;padding:32px;font-family:Arial,sans-serif;color:#102435">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce5ea">
        <div style="background:#082a43;padding:28px 32px;color:#ffffff">
          <p style="margin:0;color:#65d9ce;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px">
            CSTMed
          </p>

          <h1 style="margin:12px 0 0;font-size:28px">
            ${candidateTitle}
          </h1>
        </div>

        <div style="padding:32px">
          <p style="font-size:17px;line-height:1.7">
            ${candidateIntro}
          </p>

          <p style="font-size:16px;line-height:1.7;color:#475569">
            ${candidateDescription}
          </p>

          <div style="margin-top:24px;background:#f5f9fb;border-radius:16px;padding:20px">
            <p style="margin:0;color:#64748b;font-size:13px">
              ${candidateJobLabel}
            </p>

            <p style="margin:7px 0 0;font-weight:bold">
              ${safeJobTitle}
            </p>

            <p style="margin:20px 0 0;color:#64748b;font-size:13px">
              ${candidateReferenceLabel}
            </p>

            <p style="margin:7px 0 0;font-family:monospace;font-size:18px;font-weight:bold;letter-spacing:1px">
              ${reference}
            </p>
          </div>

          <p style="margin:28px 0 0;line-height:1.7;color:#475569">
            CSTMed<br />
            <a
              href="mailto:contact@cstmed.fr"
              style="color:#118c87;font-weight:bold"
            >
              contact@cstmed.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const [
      administratorResult,
      candidateResult,
    ] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: administratorEmail,
        replyTo: application.email,
        subject:
          `Nouvelle candidature – ${fullName} – ` +
          application.specialty,
        html: administratorHtml,
        text: administratorText,
        tags: [
          {
            name: "type",
            value: "application_admin",
          },
          {
            name: "application",
            value: reference,
          },
        ],
      }),

      resend.emails.send({
        from: fromEmail,
        to: application.email,
        replyTo: administratorEmail,
        subject: candidateSubject,
        html: candidateHtml,
        text: candidateText,
        tags: [
          {
            name: "type",
            value: "application_confirmation",
          },
          {
            name: "application",
            value: reference,
          },
        ],
      }),
    ]);

    if (administratorResult.error) {
      console.error(
        "Administrator notification failed:",
        administratorResult.error,
      );
    }

    if (candidateResult.error) {
      console.error(
        "Candidate confirmation failed:",
        candidateResult.error,
      );
    }
  } catch (error) {
    console.error(
      "Application email notifications failed:",
      error,
    );
  }
}