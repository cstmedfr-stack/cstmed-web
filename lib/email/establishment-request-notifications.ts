import "server-only";

import { Resend } from "resend";

import type { Locale } from "@/lib/i18n/config";

type EstablishmentRequestNotification = {
  requestId: string;
  locale: Locale;

  establishmentName: string;
  establishmentType: string | null;

  contactName: string;
  contactRole: string | null;

  email: string;
  phone: string;

  city: string | null;
  department: string | null;

  specialty: string;
  positionsCount: number;

  contractType: string | null;
  desiredStartDate: string | null;
  urgency: string;

  housingSupport: boolean;
  message: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shortReference(id: string) {
  return id
    .replaceAll("-", "")
    .slice(0, 10)
    .toUpperCase();
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function sendEstablishmentRequestNotifications(
  request: EstablishmentRequestNotification,
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
      "Configurația Resend pentru solicitările unităților este incompletă.",
    );

    return;
  }

  const resend = new Resend(apiKey);
  const reference = shortReference(request.requestId);

  const location = [
    request.city,
    request.department,
  ]
    .filter(Boolean)
    .join(", ");

  const safeEstablishment = escapeHtml(
    request.establishmentName,
  );

  const safeContact = escapeHtml(
    request.contactName,
  );

  const safeSpecialty = escapeHtml(
    request.specialty,
  );

  const safeEmail = escapeHtml(request.email);
  const safePhone = escapeHtml(request.phone);

  const safeMessage = request.message
    ? escapeHtml(request.message).replaceAll(
        "\n",
        "<br />",
      )
    : "Aucune information complémentaire.";

  const administratorHtml = `
    <div style="margin:0;background:#f5f9fb;padding:32px;font-family:Arial,sans-serif;color:#102435">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce5ea">
        <div style="background:#082a43;padding:30px;color:#ffffff">
          <p style="margin:0;color:#65d9ce;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1.4px">
            Nouvelle demande d’établissement
          </p>

          <h1 style="margin:12px 0 0;font-size:28px">
            ${safeEstablishment}
          </h1>

          <p style="margin:10px 0 0;color:#d7e2e8">
            Recherche : ${safeSpecialty}
          </p>
        </div>

        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:9px 0;color:#64748b">Contact</td>
              <td style="padding:9px 0;font-weight:bold">${safeContact}</td>
            </tr>

            <tr>
              <td style="padding:9px 0;color:#64748b">E-mail</td>
              <td style="padding:9px 0;font-weight:bold">${safeEmail}</td>
            </tr>

            <tr>
              <td style="padding:9px 0;color:#64748b">Téléphone</td>
              <td style="padding:9px 0;font-weight:bold">${safePhone}</td>
            </tr>

            <tr>
              <td style="padding:9px 0;color:#64748b">Localisation</td>
              <td style="padding:9px 0;font-weight:bold">
                ${escapeHtml(location || "Non précisée")}
              </td>
            </tr>

            <tr>
              <td style="padding:9px 0;color:#64748b">Postes</td>
              <td style="padding:9px 0;font-weight:bold">
                ${request.positionsCount}
              </td>
            </tr>

            <tr>
              <td style="padding:9px 0;color:#64748b">Urgence</td>
              <td style="padding:9px 0;font-weight:bold">
                ${escapeHtml(request.urgency)}
              </td>
            </tr>
          </table>

          <div style="margin-top:24px;background:#f5f9fb;border-radius:16px;padding:20px;line-height:1.7">
            <strong>Informations complémentaires</strong>
            <p style="margin:10px 0 0">${safeMessage}</p>
          </div>

          <div style="margin-top:28px;text-align:center">
            <a
              href="${getSiteUrl()}/admin"
              style="display:inline-block;background:#118c87;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-weight:bold"
            >
              Ouvrir l’administration CSTMed
            </a>
          </div>

          <p style="margin:24px 0 0;color:#64748b;font-size:13px">
            Référence : ${reference}
          </p>
        </div>
      </div>
    </div>
  `;

  const isRomanian = request.locale === "ro";

  const confirmationSubject = isRomanian
    ? `Solicitarea dumneavoastră CSTMed – ${reference}`
    : `Votre demande CSTMed – ${reference}`;

  const confirmationTitle = isRomanian
    ? "Solicitarea a fost transmisă"
    : "Votre demande a été transmise";

  const confirmationText = isRomanian
    ? `
Bună ziua ${request.contactName},

Solicitarea unității ${request.establishmentName} a fost transmisă către CSTMed.

Specialitatea căutată: ${request.specialty}
Numărul de posturi: ${request.positionsCount}
Referință: ${reference}

Vom analiza informațiile și vă vom contacta pentru a discuta despre nevoia de recrutare.

CSTMed
contact@cstmed.fr
    `.trim()
    : `
Bonjour ${request.contactName},

La demande de l’établissement ${request.establishmentName} a bien été transmise à CSTMed.

Spécialité recherchée : ${request.specialty}
Nombre de postes : ${request.positionsCount}
Référence : ${reference}

Nous analyserons les informations et vous contacterons afin d’échanger sur votre besoin de recrutement.

CSTMed
contact@cstmed.fr
    `.trim();

  const confirmationHtml = `
    <div style="margin:0;background:#f5f9fb;padding:32px;font-family:Arial,sans-serif;color:#102435">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce5ea">
        <div style="background:#082a43;padding:30px;color:#ffffff">
          <p style="margin:0;color:#65d9ce;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1.4px">
            CSTMed
          </p>

          <h1 style="margin:12px 0 0;font-size:28px">
            ${confirmationTitle}
          </h1>
        </div>

        <div style="padding:32px">
          <p style="font-size:17px;line-height:1.7">
            ${
              isRomanian
                ? `Bună ziua ${safeContact},`
                : `Bonjour ${safeContact},`
            }
          </p>

          <p style="font-size:16px;line-height:1.7;color:#475569">
            ${
              isRomanian
                ? "Am primit informațiile referitoare la nevoia de recrutare. Echipa CSTMed vă va contacta pentru continuarea discuțiilor."
                : "Nous avons reçu les informations relatives à votre besoin de recrutement. L’équipe CSTMed vous contactera pour poursuivre les échanges."
            }
          </p>

          <div style="margin-top:24px;background:#f5f9fb;border-radius:16px;padding:20px">
            <p style="margin:0;color:#64748b;font-size:13px">
              ${
                isRomanian
                  ? "Specialitatea căutată"
                  : "Spécialité recherchée"
              }
            </p>

            <p style="margin:7px 0 0;font-weight:bold">
              ${safeSpecialty}
            </p>

            <p style="margin:20px 0 0;color:#64748b;font-size:13px">
              ${
                isRomanian
                  ? "Referința solicitării"
                  : "Référence de la demande"
              }
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
    const [adminResult, confirmationResult] =
      await Promise.all([
        resend.emails.send({
          from: fromEmail,
          to: administratorEmail,
          replyTo: request.email,

          subject:
            `Nouveau besoin médical – ` +
            `${request.establishmentName} – ` +
            request.specialty,

          html: administratorHtml,

          text: `
Nouvelle demande CSTMed

Établissement : ${request.establishmentName}
Contact : ${request.contactName}
E-mail : ${request.email}
Téléphone : ${request.phone}
Spécialité : ${request.specialty}
Nombre de postes : ${request.positionsCount}
Localisation : ${location || "Non précisée"}
Référence : ${reference}
          `.trim(),
        }),

        resend.emails.send({
          from: fromEmail,
          to: request.email,
          replyTo: administratorEmail,
          subject: confirmationSubject,
          html: confirmationHtml,
          text: confirmationText,
        }),
      ]);

    if (adminResult.error) {
      console.error(
        "Establishment administrator e-mail failed:",
        adminResult.error,
      );
    }

    if (confirmationResult.error) {
      console.error(
        "Establishment confirmation e-mail failed:",
        confirmationResult.error,
      );
    }
  } catch (error) {
    console.error(
      "Establishment notification error:",
      error,
    );
  }
}