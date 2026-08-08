import Image from "next/image";

import type { Locale } from "@/lib/i18n/config";
import { publicLinks } from "@/lib/site/public-links";

type HomeContactSectionProps = {
  locale: Locale;
};

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.8a2 2 0 0 1-.45 2.11L8.07 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.84.55 2.8.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M12.04 2a9.86 9.86 0 0 0-8.47 14.9L2 22l5.23-1.52A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.04 8.04 0 0 1-4.1-1.12l-.3-.18-3.1.9.92-3.02-.2-.31a7.94 7.94 0 1 1 6.78 3.73Zm4.42-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2a7.23 7.23 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function HomeContactSection({
  locale,
}: HomeContactSectionProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow: "Să discutăm despre proiectul tău",

          title:
            "Ești medic sau reprezinți o unitate medicală?",

          description:
            "Contactează CSTMed pentru o primă discuție confidențială și personalizată. Revenim la solicitările primite în maximum 24 de ore lucrătoare.",

          responseValue: "24 h",
          responseTitle: "Răspuns rapid",

          responseText:
            "Analizăm mesajul și stabilim împreună următoarea etapă.",

          doctorTitle: "Pentru medici",

          doctorText:
            "Prezintă-ne specialitatea, experiența și proiectul tău profesional.",

          establishmentTitle:
            "Pentru unități medicale",

          establishmentText:
            "Descrie nevoia de recrutare și profilul medicului căutat.",

          emailButton: "Scrie-ne un e-mail",
          phoneButton: "Sună CSTMed",
          whatsappButton: "Discută pe WhatsApp",

          imageLabel: "Echipa CSTMed",

          imageText:
            "Un interlocutor disponibil pentru medici și unități medicale.",
        }
      : {
          eyebrow: "Parlons de votre projet",

          title:
            "Vous êtes médecin ou vous représentez un établissement de santé ?",

          description:
            "Contactez CSTMed pour un premier échange confidentiel et personnalisé. Nous répondons aux demandes reçues sous 24 heures ouvrées.",

          responseValue: "24 h",
          responseTitle: "Réponse rapide",

          responseText:
            "Nous analysons votre message et définissons ensemble la prochaine étape.",

          doctorTitle: "Pour les médecins",

          doctorText:
            "Présentez-nous votre spécialité, votre expérience et votre projet professionnel.",

          establishmentTitle:
            "Pour les établissements",

          establishmentText:
            "Décrivez votre besoin de recrutement et le profil médical recherché.",

          emailButton: "Nous écrire",
          phoneButton: "Appeler CSTMed",
          whatsappButton: "Échanger sur WhatsApp",

          imageLabel: "L’équipe CSTMed",

          imageText:
            "Un interlocuteur disponible pour les médecins et les établissements.",
        };

  const whatsappMessage =
    locale === "ro"
      ? "Bună ziua, doresc informații despre serviciile CSTMed."
      : "Bonjour, je souhaite obtenir des informations sur les services CSTMed.";

  const whatsappUrl =
    `https://wa.me/${publicLinks.whatsappNumber}` +
    `?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section
      id="contact"
      className="scroll-mt-40 bg-[#f5f9fb] px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-7 sm:p-10 lg:p-14">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
            {content.eyebrow}
          </p>

          <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {content.title}
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            {content.description}
          </p>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <span className="flex h-16 min-w-16 items-center justify-center rounded-2xl bg-[#65d9ce] px-3 text-xl font-black text-[#082a43]">
              {content.responseValue}
            </span>

            <div>
              <h3 className="font-bold">
                {content.responseTitle}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-200">
                {content.responseText}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <h3 className="font-bold text-[#65d9ce]">
                {content.doctorTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-200">
                {content.doctorText}
              </p>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <h3 className="font-bold text-[#65d9ce]">
                {content.establishmentTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-200">
                {content.establishmentText}
              </p>
            </article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={`mailto:${publicLinks.email}`}
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 font-black text-[#082a43] shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <MailIcon />
              {content.emailButton}
            </a>

            <a
              href={`tel:${publicLinks.phoneHref}`}
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-7 py-3.5 font-bold text-white transition hover:bg-white/20"
            >
              <PhoneIcon />
              {content.phoneButton}
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#25d366] px-7 py-3.5 font-bold text-[#063f21] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4ae07d]"
            >
              <WhatsAppIcon />
              {content.whatsappButton}
            </a>
          </div>
        </div>

        <div className="relative min-h-[420px] lg:min-h-full">
          <Image
            src="/images/home/contact-team.png"
            alt={
              locale === "ro"
                ? "Echipa medicală CSTMed"
                : "Équipe médicale CSTMed"
            }
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#061f33]/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0b4961]/35 lg:via-transparent lg:to-transparent" />

          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#061f33]/85 p-5 backdrop-blur-sm sm:inset-x-7 sm:bottom-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
              {content.imageLabel}
            </p>

            <p className="mt-2 font-bold leading-7">
              {content.imageText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}