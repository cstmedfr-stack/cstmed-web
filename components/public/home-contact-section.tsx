import Image from "next/image";
import Link from "next/link";

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
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
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
      className="h-5 w-5"
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
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M12.04 2a9.84 9.84 0 0 0-8.46 14.87L2 22l5.28-1.55A9.97 9.97 0 1 0 12.04 2Zm0 17.94a8.02 8.02 0 0 1-4.09-1.12l-.29-.17-3.13.92.94-3.05-.19-.31a8.07 8.07 0 1 1 6.76 3.73Zm4.43-6.04c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M13.5 22v-9h3l.45-3.5H13.5V7.3c0-1.01.28-1.7 1.74-1.7H17.1V2.48c-.32-.04-1.43-.14-2.72-.14-2.69 0-4.53 1.64-4.53 4.66v2.5H6.8V13h3.05v9h3.65Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.3"
        cy="6.7"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function HomeContactSection({
  locale,
}: HomeContactSectionProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow:
            "Să discutăm despre proiectul tău",

          title:
            "Ești medic sau reprezinți o unitate medicală?",

          description:
            "Contactează CSTMed pentru o primă discuție confidențială și personalizată. Revenim la solicitările primite în maximum 24 de ore lucrătoare.",

          responseValue: "24 h",
          responseTitle:
            "Răspuns rapid",

          responseText:
            "Analizăm mesajul și stabilim împreună următoarea etapă.",

          doctorTitle:
            "Ești medic?",

          doctorText:
            "Pentru întrebări despre oferte, candidatură sau proiectul tău profesional, ne poți contacta direct pe numărul din România.",

          doctorPhone:
            "Telefon România",

          doctorButton:
            "Trimite CV-ul",

          establishmentTitle:
            "Reprezinți o unitate medicală?",

          establishmentText:
            "Pentru recrutarea de medici și prezentarea nevoii unității, contactează direct CSTMed în Franța.",

          establishmentPhone:
            "Telefon Franța",

          establishmentButton:
            "Solicită profiluri",

          emailButton:
            "Scrie-ne un e-mail",

          whatsappButton:
            "Discută pe WhatsApp",

          follow:
            "Urmărește CSTMed",

          imageLabel:
            "Echipa CSTMed",

          imageText:
            "Un interlocutor disponibil pentru medici și unități medicale.",
        }
      : {
          eyebrow:
            "Parlons de votre projet",

          title:
            "Vous êtes médecin ou vous représentez un établissement de santé ?",

          description:
            "Contactez CSTMed pour un premier échange confidentiel et personnalisé. Nous répondons aux demandes reçues sous 24 heures ouvrées.",

          responseValue: "24 h",
          responseTitle:
            "Réponse rapide",

          responseText:
            "Nous analysons votre message et définissons ensemble la prochaine étape.",

          doctorTitle:
            "Vous êtes médecin ?",

          doctorText:
            "Pour vos questions concernant les offres, votre candidature ou votre projet professionnel, contactez CSTMed sur notre numéro roumain.",

          doctorPhone:
            "Téléphone Roumanie",

          doctorButton:
            "Envoyer mon CV",

          establishmentTitle:
            "Vous représentez un établissement ?",

          establishmentText:
            "Pour vos besoins de recrutement médical, contactez directement CSTMed sur notre numéro français.",

          establishmentPhone:
            "Téléphone France",

          establishmentButton:
            "Demander des profils",

          emailButton:
            "Nous écrire",

          whatsappButton:
            "Échanger sur WhatsApp",

          follow:
            "Suivez CSTMed",

          imageLabel:
            "L’équipe CSTMed",

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
  className="scroll-mt-40 overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white"
>
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* TEXT */}
        <div className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
            {content.eyebrow}
          </p>

          <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {content.title}
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            {content.description}
          </p>

          {/* 24 H */}
          <div className="mt-8 flex items-center gap-4 rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <span className="flex h-16 min-w-16 items-center justify-center rounded-2xl bg-[#65d9ce] px-3 text-xl font-black text-[#082a43]">
              {content.responseValue}
            </span>

            <div>
              <h3 className="font-black">
                {content.responseTitle}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-200">
                {content.responseText}
              </p>
            </div>
          </div>

          {/* MEDICI / ETABLISSEMENTS */}
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {/* MEDICI */}
            <article className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  🇷🇴
                </span>

                <h3 className="font-black text-[#8eeae1]">
                  {content.doctorTitle}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {content.doctorText}
              </p>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                {content.doctorPhone}
              </p>

              <a
                href={`tel:${publicLinks.phoneRomaniaHref}`}
                className="mt-2 flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
              >
                <PhoneIcon />

                {publicLinks.phoneRomaniaDisplay}
              </a>
              <a
                href={`https://wa.me/${publicLinks.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-xs font-bold text-[#65d9ce] transition hover:text-white"
              >
                WhatsApp →
              </a>
              <Link
                href={`/${locale}/candidature`}
                className="mt-3 flex min-h-[46px] items-center justify-center rounded-full bg-[#0D6EFD] px-4 py-3 text-sm font-black text-[#082A43] transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
              >
                {content.doctorButton}
                <span className="ml-2">
                  →
                </span>
              </Link>
            </article>

            {/* ETABLISSEMENTS */}
            <article className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  🇫🇷
                </span>

                <h3 className="font-black text-[#8eeae1]">
                  {content.establishmentTitle}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {content.establishmentText}
              </p>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                {content.establishmentPhone}
              </p>

              <a
                href={`tel:${publicLinks.phoneHref}`}
                className="mt-2 flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-[#65d9ce] hover:text-[#65d9ce]"
              >
                <PhoneIcon />

                {publicLinks.phoneDisplay}
              </a>

              <Link
                href={`/${locale}/etablissements`}
                className="mt-3 flex min-h-[46px] items-center justify-center rounded-full bg-[#65d9ce] px-4 py-3 text-sm font-black text-[#082a43] transition hover:-translate-y-0.5 hover:bg-[#8eeae1]"
              >
                {content.establishmentButton}

                <span className="ml-2">
                  →
                </span>
              </Link>
            </article>
          </div>

          {/* CONTACT GENERAL */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <a
            href={`mailto:${publicLinks.email}`}
            className="inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 font-black shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <span style={{ color: "#082A43" }}>
              <MailIcon />
            </span>

            <span style={{ color: "#082A43" }}>
              {content.emailButton}
            </span>
          </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-[#25d366] px-6 py-3.5 font-black text-[#063f21] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4ae07d]"
            >
              <WhatsAppIcon />
              {content.whatsappButton}
            </a>
          </div>

          {/* SOCIAL */}
          <div className="mt-7 flex items-center gap-3">
            <span className="mr-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              {content.follow}
            </span>

            {publicLinks.facebook ? (
              <a
                href={publicLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook CSTMed"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
              >
                <FacebookIcon />
              </a>
            ) : null}

            {publicLinks.instagram ? (
              <a
                href={publicLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram CSTMed"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
              >
                <InstagramIcon />
              </a>
            ) : null}
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative min-h-[460px] lg:min-h-full">
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

          <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/20 bg-[#061f33]/85 p-5 backdrop-blur-sm sm:inset-x-7 sm:bottom-7">
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