import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type HomeEstablishmentsSectionProps = {
  locale: Locale;
};

export function HomeEstablishmentsSection({
  locale,
}: HomeEstablishmentsSectionProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow: "Pentru unitățile medicale",

          title:
            "Identificați mai rapid medicii potriviți pentru unitatea dumneavoastră",

          description:
            "CSTMed analizează nevoia de recrutare, identifică profiluri medicale europene și urmărește procesul până la instalarea și integrarea candidatului.",

          commitments: [
            {
              value: "24 h",
              title: "Răspuns la solicitare",
              text: "Analizăm nevoia unității și revenim în maximum 24 de ore lucrătoare.",
            },
            {
              value: "48 h",
              title: "Prima selecție de profiluri",
              text: "În funcție de specialitate și disponibilitate, putem transmite primele profiluri în maximum 48 de ore.",
            },
          ],

          advantages: [
            {
              title: "Profiluri verificate",
              text: "Analizăm experiența, specialitatea, nivelul de limbă și eligibilitatea profesională.",
            },
            {
              title: "Interviuri organizate",
              text: "Facilităm contactul și pregătim etapele discuției dintre medic și unitate.",
            },
            {
              title: "Sprijin administrativ",
              text: "Urmărim documentele și demersurile necesare începerii activității.",
            },
            {
              title: "Urmărirea integrării",
              text: "Rămânem alături de medic și de unitate și după recrutare.",
            },
          ],

          imageLabel: "Recrutare medicală Franța–Europa",

          imageText:
            "Un interlocutor unic pentru unitate și pentru medic.",

          primaryButton: "Descrieți nevoia de recrutare",
          secondaryButton: "Sunați CSTMed",

          note:
            "Termenul de 48 de ore depinde de specialitatea căutată și de disponibilitatea profilurilor potrivite.",
        }
      : {
          eyebrow: "Pour les établissements",

          title:
            "Identifiez plus rapidement les médecins adaptés à votre établissement",

          description:
            "CSTMed analyse votre besoin, recherche des profils médicaux européens et suit le processus jusqu’à l’installation et l’intégration du candidat.",

          commitments: [
            {
              value: "24 h",
              title: "Réponse à votre demande",
              text: "Nous analysons votre besoin et revenons vers vous sous 24 heures ouvrées.",
            },
            {
              value: "48 h",
              title: "Première sélection de profils",
              text: "Selon la spécialité et les disponibilités, les premiers profils peuvent être transmis sous 48 heures.",
            },
          ],

          advantages: [
            {
              title: "Profils vérifiés",
              text: "Nous étudions l’expérience, la spécialité, le niveau linguistique et l’éligibilité professionnelle.",
            },
            {
              title: "Entretiens organisés",
              text: "Nous facilitons la mise en relation et préparons les échanges entre le médecin et l’établissement.",
            },
            {
              title: "Accompagnement administratif",
              text: "Nous suivons les documents et les démarches nécessaires à la prise de poste.",
            },
            {
              title: "Suivi de l’intégration",
              text: "Nous restons aux côtés du médecin et de l’établissement après le recrutement.",
            },
          ],

          imageLabel: "Recrutement médical France–Europe",

          imageText:
            "Un interlocuteur unique pour l’établissement et pour le médecin.",

          primaryButton: "Décrire mon besoin de recrutement",
          secondaryButton: "Appeler CSTMed",

          note:
            "Le délai de 48 heures dépend de la spécialité recherchée et de la disponibilité des profils adaptés.",
        };

  return (
    <section
      id="etablissements"
      className="scroll-mt-40 bg-[#082a43] px-5 py-16 text-white sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl sm:min-h-[560px]">
            <Image
              src="/images/home/establishments-recruitment.png"
              alt={
                locale === "ro"
                  ? "Recrutarea medicilor pentru unități medicale"
                  : "Recrutement de médecins pour les établissements de santé"
              }
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#061f33]/95 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#061f33]/85 p-5 backdrop-blur-sm sm:inset-x-7 sm:bottom-7 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
                {content.imageLabel}
              </p>

              <p className="mt-2 text-lg font-bold leading-7">
                {content.imageText}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
              {content.eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {content.title}
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-200">
              {content.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.commitments.map(
                (commitment) => (
                  <article
                    key={commitment.value}
                    className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 min-w-16 items-center justify-center rounded-2xl bg-[#65d9ce] px-3 text-xl font-black text-[#082a43]">
                        {commitment.value}
                      </span>

                      <h3 className="font-bold leading-6">
                        {commitment.title}
                      </h3>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-200">
                      {commitment.text}
                    </p>
                  </article>
                ),
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.advantages.map(
                (advantage) => (
                  <article
                    key={advantage.title}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#65d9ce] text-sm font-black text-[#082a43]">
                      ✓
                    </span>

                    <div>
                      <h3 className="font-bold">
                        {advantage.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {advantage.text}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/etablissements`}
                className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#65d9ce] px-7 py-3.5 text-center font-black text-[#082a43] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
              >
                {content.primaryButton}
              </Link>

              <a
                href="tel:+33628262576"
                className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/50 bg-white/10 px-7 py-3.5 text-center font-bold text-white transition hover:bg-white/20"
              >
                {content.secondaryButton}
              </a>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-400">
              * {content.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}