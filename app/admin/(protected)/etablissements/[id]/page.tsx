import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

import {
  RequestStatusActions,
  type EstablishmentRequestStatus,
} from "../request-status-actions";

export const dynamic = "force-dynamic";

type RequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type UrgencyLevel =
  | "normal"
  | "urgent"
  | "very_urgent";

type EstablishmentRequestDetails = {
  id: string;
  locale: "ro" | "fr";

  establishment_name: string;
  establishment_type: string | null;

  contact_name: string;
  contact_role: string | null;

  email: string;
  phone: string;

  city: string | null;
  department: string | null;

  specialty_needed: string;
  positions_count: number;

  contract_type: string | null;
  desired_start_date: string | null;

  urgency: UrgencyLevel;
  housing_support: boolean;

  message: string | null;
  status: EstablishmentRequestStatus;

  consent_at: string;
  created_at: string;
  updated_at: string;
};

const statusLabels: Record<
  EstablishmentRequestStatus,
  string
> = {
  new: "Nouvelle",
  reviewing: "À étudier",
  contacted: "Contactée",
  proposal: "Proposition",
  signed: "Signée",
  rejected: "Refusée",
  archived: "Archivée",
};

const urgencyLabels: Record<
  UrgencyLevel,
  string
> = {
  normal: "Besoin à moyen terme",
  urgent: "Besoin urgent",
  very_urgent: "Besoin très urgent",
};

const urgencyClasses: Record<
  UrgencyLevel,
  string
> = {
  normal: "bg-slate-100 text-slate-700",
  urgent: "bg-orange-100 text-orange-800",
  very_urgent: "bg-red-100 text-red-800",
};

const establishmentTypeLabels: Record<
  string,
  string
> = {
  hospital: "Hôpital ou centre hospitalier",
  clinic: "Clinique",
  health_center: "Centre de santé",
  ehpad: "EHPAD",
  medical_practice:
    "Cabinet ou maison médicale",
  other: "Autre structure",
};

const contractTypeLabels: Record<
  string,
  string
> = {
  cdi: "CDI",
  cdd: "CDD",
  replacement: "Remplacement",
  liberal: "Exercice libéral",
  mixed: "Exercice mixte",
  other: "Autre",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function formatSimpleDate(
  value: string | null,
) {
  if (!value) {
    return "Non précisée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T12:00:00`),
  );
}

export default async function RequestDetailsPage({
  params,
}: RequestDetailsPageProps) {
  const { id } = await params;

  const { supabase } =
    await requireAdmin();

  const { data, error } =
    await supabase
      .from(
        "establishment_requests",
      )
      .select(
        `
          id,
          locale,
          establishment_name,
          establishment_type,
          contact_name,
          contact_role,
          email,
          phone,
          city,
          department,
          specialty_needed,
          positions_count,
          contract_type,
          desired_start_date,
          urgency,
          housing_support,
          message,
          status,
          consent_at,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!data) {
    notFound();
  }

  const request =
    data as EstablishmentRequestDetails;

  const location = [
    request.city,
    request.department,
  ]
    .filter(Boolean)
    .join(", ");

  const replySubject =
    encodeURIComponent(
      `Votre demande de recrutement CSTMed – ${request.specialty_needed}`,
    );

  return (
    <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link
            href="/admin"
            aria-label="Tableau de bord CSTMed"
          >
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={220}
              height={74}
              priority
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>

          <Link
            href="/admin/etablissements"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Retour aux demandes
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#082a43] via-[#0b3a59] to-[#11696d] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white">
              {
                statusLabels[
                  request.status
                ]
              }
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-black ${
                urgencyClasses[
                  request.urgency
                ]
              }`}
            >
              {
                urgencyLabels[
                  request.urgency
                ]
              }
            </span>

            <span className="text-sm font-bold uppercase text-slate-300">
              Formulaire{" "}
              {request.locale}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            {
              request.establishment_name
            }
          </h1>

          <p className="mt-3 text-lg text-slate-200">
            Recherche :{" "}
            <strong>
              {
                request.specialty_needed
              }
            </strong>
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
            <span>
              👨‍⚕️{" "}
              {
                request.positions_count
              }{" "}
              poste
              {request.positions_count >
              1
                ? "s"
                : ""}
            </span>

            {location ? (
              <span>
                📍 {location}
              </span>
            ) : null}

            {request.contract_type ? (
              <span>
                📄{" "}
                {contractTypeLabels[
                  request
                    .contract_type
                ] ??
                  request.contract_type}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            {/* ÉTABLISSEMENT */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-black text-[#082a43]">
                Établissement
              </h2>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Nom
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {
                      request.establishment_name
                    }
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Type
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {request.establishment_type
                      ? establishmentTypeLabels[
                          request
                            .establishment_type
                        ] ??
                        request.establishment_type
                      : "Non précisé"}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5 sm:col-span-2">
                  <dt className="text-sm font-semibold text-slate-500">
                    Localisation
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {location ||
                      "Non précisée"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* BESOIN */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-black text-[#082a43]">
                Besoin de recrutement
              </h2>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Spécialité
                  </dt>

                  <dd className="mt-2 font-black text-[#118c87]">
                    {
                      request.specialty_needed
                    }
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Nombre de postes
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {
                      request.positions_count
                    }
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Contrat
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {request.contract_type
                      ? contractTypeLabels[
                          request
                            .contract_type
                        ] ??
                        request.contract_type
                      : "Non précisé"}
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Début souhaité
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {formatSimpleDate(
                      request.desired_start_date,
                    )}
                  </dd>
                </div>

                <div
                  className={`rounded-2xl p-5 ${
                    request.urgency ===
                    "very_urgent"
                      ? "border border-red-200 bg-red-50"
                      : request.urgency ===
                          "urgent"
                        ? "border border-orange-200 bg-orange-50"
                        : "bg-[#f5f9fb]"
                  }`}
                >
                  <dt className="text-sm font-semibold text-slate-500">
                    Urgence
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {
                      urgencyLabels[
                        request.urgency
                      ]
                    }
                  </dd>
                </div>

                <div className="rounded-2xl bg-[#f5f9fb] p-5">
                  <dt className="text-sm font-semibold text-slate-500">
                    Aide au logement
                  </dt>

                  <dd className="mt-2 font-black text-[#082a43]">
                    {request.housing_support
                      ? "✓ Oui"
                      : "Non"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* MESSAGE */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-black text-[#082a43]">
                Informations complémentaires
              </h2>

              {request.message ? (
                <div className="mt-6 whitespace-pre-line rounded-2xl bg-[#f5f9fb] p-6 leading-8 text-slate-700">
                  {request.message}
                </div>
              ) : (
                <p className="mt-5 text-slate-500">
                  Aucun message supplémentaire.
                </p>
              )}
            </section>
          </div>

          {/* COLONNE DROITE */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-28">
            {/* STATUT */}
            <section className="rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#65d9ce]">
                Suivi de la demande
              </p>

              <h2
                className="mt-3 text-2xl font-black"
                style={{
                  color: "#ffffff",
                }}
              >
                {
                  statusLabels[
                    request.status
                  ]
                }
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Sélectionnez l’étape
                actuelle de la relation
                avec l’établissement.
              </p>

              <div className="mt-6">
                <RequestStatusActions
                  requestId={
                    request.id
                  }
                  status={
                    request.status
                  }
                />
              </div>
            </section>

            {/* CONTACT */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#118c87]">
                Contact
              </p>

              <h2 className="mt-3 text-xl font-black text-[#082a43]">
                {
                  request.contact_name
                }
              </h2>

              {request.contact_role ? (
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {
                    request.contact_role
                  }
                </p>
              ) : null}

              <a
                href={`mailto:${request.email}?subject=${replySubject}`}
                className="mt-6 flex min-h-[46px] items-center justify-center rounded-full bg-[#118c87] px-6 py-3 text-center font-black shadow-sm transition hover:bg-[#0c7773]"
              >
                <span
                  style={{
                    color: "#ffffff",
                  }}
                >
                  ✉️ Répondre par e-mail
                </span>
              </a>

              <a
                href={`tel:${request.phone}`}
                className="mt-3 flex min-h-[46px] items-center justify-center rounded-full bg-[#0D6EFD] px-6 py-3 text-center font-black shadow-sm transition hover:bg-[#0B63E5]"
              >
                <span
                  style={{
                    color: "#ffffff",
                  }}
                >
                  ☎️ Appeler
                </span>
              </a>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">
                    E-mail
                  </dt>

                  <dd className="mt-1 break-all">
                    <a
                      href={`mailto:${request.email}`}
                      className="font-semibold text-[#0c7773] hover:underline"
                    >
                      {
                        request.email
                      }
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Téléphone
                  </dt>

                  <dd className="mt-1">
                    <a
                      href={`tel:${request.phone}`}
                      className="font-semibold text-[#0c7773] hover:underline"
                    >
                      {
                        request.phone
                      }
                    </a>
                  </dd>
                </div>
              </dl>
            </section>

            {/* TECHNIQUE */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="font-black text-[#082a43]">
                Informations techniques
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">
                    Demande reçue
                  </dt>

                  <dd className="mt-1 text-slate-700">
                    {formatDate(
                      request.created_at,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Consentement
                  </dt>

                  <dd className="mt-1 text-slate-700">
                    {formatDate(
                      request.consent_at,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Dernière modification
                  </dt>

                  <dd className="mt-1 text-slate-700">
                    {formatDate(
                      request.updated_at,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Référence
                  </dt>

                  <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                    {request.id}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}