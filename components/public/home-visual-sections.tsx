import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type HomeVisualSectionsProps = {
  locale: Locale;
};

export function HomeVisualSections({
  locale,
}: HomeVisualSectionsProps) {
  const content =
    locale === "ro"
      ? {
          parallaxEyebrow:
            "Sprijin complet pentru instalarea în Franța",

          parallaxTitle:
            "CSTMed te însoțește în fiecare etapă",

          parallaxText:
            "De la identificarea postului și pregătirea dosarului până la instalare și integrare, beneficiezi de un interlocutor care îți urmărește proiectul.",

          steps: [
            {
              number: "01",
              title: "Analiza proiectului",
              text: "Discutăm despre specialitate, experiență, nivelul limbii franceze și regiunea dorită.",
            },
            {
              number: "02",
              title: "Demersuri administrative",
              text: "Te sprijinim pentru documente, înscriere profesională și pașii necesari pentru exercitarea profesiei.",
            },
            {
              number: "03",
              title: "Instalare și integrare",
              text: "Rămânem alături de tine pentru cazare, organizarea sosirii și integrarea în noul mediu profesional.",
            },
          ],

          doctorsEyebrow: "Pentru medici",

          doctorsTitle:
            "Un proiect profesional construit în jurul profilului tău",

          doctorsText:
            "Nu trimitem pur și simplu un CV. Analizăm experiența, obiectivele și preferințele tale pentru a identifica oportunitățile potrivite.",

          doctorsItems: [
            "Oferte adaptate specialității și experienței",
            "Pregătirea candidaturii și a interviului",
            "Sprijin administrativ și profesional",
            "Urmărire după instalarea în Franța",
          ],

          doctorsButton: "Trimite CV-ul",

          installationEyebrow:
            "Instalarea în Franța",

          installationTitle:
            "Pregătim împreună sosirea și integrarea ta",

          installationText:
            "CSTMed te ajută să înțelegi etapele proiectului și să organizezi mai ușor începutul activității în Franța.",

          installationItems: [
            "Informații despre regiune și unitatea medicală",
            "Orientare pentru cazare și demersuri practice",
            "Pregătirea documentelor necesare",
            "Un contact disponibil pe parcursul instalării",
          ],

          installationButton:
            "Descoperă ofertele",
        }
      : {
          parallaxEyebrow:
            "Un accompagnement complet pour votre installation en France",

          parallaxTitle:
            "CSTMed vous accompagne à chaque étape",

          parallaxText:
            "De la recherche du poste à la préparation du dossier, puis à l’installation et à l’intégration, vous bénéficiez d’un interlocuteur qui suit personnellement votre projet.",

          steps: [
            {
              number: "01",
              title: "Analyse du projet",
              text: "Nous échangeons sur votre spécialité, votre expérience, votre niveau de français et la région recherchée.",
            },
            {
              number: "02",
              title: "Démarches administratives",
              text: "Nous vous accompagnons pour les documents, l’inscription professionnelle et les étapes nécessaires à l’exercice.",
            },
            {
              number: "03",
              title: "Installation et intégration",
              text: "Nous restons à vos côtés pour le logement, l’organisation de l’arrivée et l’intégration professionnelle.",
            },
          ],

          doctorsEyebrow: "Pour les médecins",

          doctorsTitle:
            "Un projet professionnel construit autour de votre profil",

          doctorsText:
            "Nous ne transmettons pas simplement un CV. Nous analysons votre expérience, vos objectifs et vos préférences afin d’identifier les opportunités adaptées.",

          doctorsItems: [
            "Offres adaptées à la spécialité et à l’expérience",
            "Préparation de la candidature et des entretiens",
            "Accompagnement administratif et professionnel",
            "Suivi après l’installation en France",
          ],

          doctorsButton: "Envoyer mon CV",

          installationEyebrow:
            "Installation en France",

          installationTitle:
            "Préparons ensemble votre arrivée et votre intégration",

          installationText:
            "CSTMed vous aide à comprendre les différentes étapes du projet et à organiser plus sereinement le début de votre activité en France.",

          installationItems: [
            "Informations sur la région et l’établissement",
            "Orientation pour le logement et les démarches pratiques",
            "Préparation des documents nécessaires",
            "Un interlocuteur disponible pendant l’installation",
          ],

          installationButton:
            "Découvrir les offres",
        };

  return (
    <>
      <section
  className="relative isolate overflow-hidden bg-cover bg-center bg-scroll md:bg-fixed"
        style={{
          backgroundImage:
            "url('/images/home/hospital-parallax.jpg')",
        }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f33]/95 via-[#082a43]/82 to-[#082a43]/65" />

        <div className="mx-auto max-w-7xl px-5 py-20 text-white sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
              {content.parallaxEyebrow}
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              {content.parallaxTitle}
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {content.parallaxText}
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.steps.map((step) => (
              <article
                key={step.number}
                className="rounded-[1.75rem] border border-white/20 bg-white/10 p-7 backdrop-blur-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#65d9ce] font-black text-[#082a43]">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-200">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f9fb] px-5 py-16 sm:px-8 sm:py-20">

        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-xl sm:min-h-[540px]">
            <Image
              src="/images/home/medical-team.png"
              alt={
                locale === "ro"
                  ? "Echipă medicală CSTMed"
                  : "Équipe médicale accompagnée par CSTMed"
              }
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-[#082a43]/90 p-5 text-white backdrop-blur-sm sm:inset-x-7 sm:bottom-7">
              <p className="text-sm font-bold text-[#65d9ce]">
                24 h
              </p>

              <p className="mt-1 font-bold">
                {locale === "ro"
              ? "Primul răspuns în maximum 24 de ore lucrătoare"
              : "Premier retour sous 24 heures ouvrées"}
             </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#118c87]">
              {content.doctorsEyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082a43] sm:text-4xl">
              {content.doctorsTitle}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {content.doctorsText}
            </p>

            <ul className="mt-7 space-y-4">
              {content.doctorsItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-slate-700"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5f7f5] text-sm font-black text-[#118c87]">
                    ✓
                  </span>

                  <span className="leading-7">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={`/${locale}/candidature`}
              className="mt-8 inline-flex rounded-full bg-[#118c87] px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0c7773]"
            >
              {content.doctorsButton}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0965d8]">
              {content.installationEyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082a43] sm:text-4xl">
              {content.installationTitle}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {content.installationText}
            </p>

            <ul className="mt-7 space-y-4">
              {content.installationItems.map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-700"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                      ✓
                    </span>

                    <span className="leading-7">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>

            <Link
              href={`/${locale}/offres`}
              className="mt-8 inline-flex rounded-full bg-[#0965d8] px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0758bd]"
            >
              {content.installationButton}
            </Link>
          </div>

          <div className="relative order-1 min-h-[410px] overflow-hidden rounded-[2rem] shadow-xl sm:min-h-[520px] lg:order-2">
            <Image
              src="/images/home/installation-france.png"
              alt={
                locale === "ro"
                  ? "Instalarea medicilor în Franța"
                  : "Installation des médecins en France"
              }
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/92 p-5 shadow-lg backdrop-blur-sm sm:inset-x-7 sm:bottom-7">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#0965d8]">
                CSTMed
              </p>

              <p className="mt-2 font-bold text-[#082a43]">
                {locale === "ro"
                  ? "De la proiect profesional la instalarea în Franța"
                  : "Du projet professionnel à l’installation en France"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}