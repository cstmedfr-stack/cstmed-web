import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type HomeAdministrativeSectionProps = {
  locale: Locale;
};

export function HomeAdministrativeSection({
  locale,
}: HomeAdministrativeSectionProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow: "Demersuri administrative",

          title:
            "Te sprijinim pentru etapele administrative ale proiectului tău",

          intro:
            "Exercitarea profesiei de medic în Franța presupune mai multe demersuri. CSTMed te ajută să înțelegi pașii, să pregătești documentele și să urmărești dosarul mai ușor.",

          items: [
            {
              number: "01",
              title: "Dosarul profesional",
              text: "Verificăm împreună documentele necesare și elementele care trebuie pregătite înainte de începerea procedurilor.",
            },
            {
              number: "02",
              title: "Ordre des médecins",
              text: "Te orientăm în pregătirea demersurilor pentru înscrierea profesională, în funcție de situația ta.",
            },
            {
              number: "03",
              title: "Protecție socială și asigurări",
              text: "Îți oferim repere pentru Sécurité sociale, asigurarea profesională și celelalte formalități asociate instalării.",
            },
            {
              number: "04",
              title: "Urmărirea etapelor",
              text: "Rămânem disponibili pe parcursul procedurilor și coordonăm informațiile necesare cu proiectul de recrutare.",
            },
          ],

          note:
            "Procedurile exacte pot varia în funcție de statut, diplomă, specialitate și situația profesională.",

          button: "Trimite CV-ul",

          imageEyebrow: "Dossier administratif",

          imageTitle:
            "Un proiect mai simplu atunci când fiecare etapă este pregătită din timp.",
        }
      : {
          eyebrow: "Démarches administratives",

          title:
            "Nous vous accompagnons dans les étapes administratives de votre projet",

          intro:
            "Exercer la médecine en France implique plusieurs démarches. CSTMed vous aide à comprendre les étapes, à préparer les documents et à suivre votre dossier plus sereinement.",

          items: [
            {
              number: "01",
              title: "Dossier professionnel",
              text: "Nous vérifions avec vous les documents à préparer avant le démarrage des différentes démarches.",
            },
            {
              number: "02",
              title: "Ordre des médecins",
              text: "Nous vous orientons dans la préparation des démarches d’inscription professionnelle selon votre situation.",
            },
            {
              number: "03",
              title: "Protection sociale et assurances",
              text: "Nous vous donnons des repères concernant la Sécurité sociale, l’assurance professionnelle et les formalités liées à l’installation.",
            },
            {
              number: "04",
              title: "Suivi des étapes",
              text: "Nous restons disponibles pendant les procédures et coordonnons les informations nécessaires avec votre projet de recrutement.",
            },
          ],

          note:
            "Les démarches exactes peuvent varier selon le statut, le diplôme, la spécialité et la situation professionnelle.",

          button: "Envoyer mon CV",

          imageEyebrow: "Dossier administratif",

          imageTitle:
            "Un projet plus simple lorsque chaque étape est préparée à l’avance.",
        };

  return (
    <section className="bg-[#f5f9fb] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] shadow-xl sm:min-h-[570px]">
          <Image
          src="/images/home/admin-support-cstmed.png"
            alt={
              locale === "ro"
                ? "Sprijin CSTMed pentru demersurile administrative"
                : "Accompagnement CSTMed pour les démarches administratives"
            }
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#061f33]/85 via-transparent to-transparent" />

          <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/20 bg-[#061f33]/88 p-5 text-white backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65d9ce]">
              {content.imageEyebrow}
            </p>

            <p className="mt-2 text-lg font-bold leading-7">
              {content.imageTitle}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0965d8]">
            {content.eyebrow}
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082a43] sm:text-4xl">
            {content.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {content.intro}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.items.map((item) => (
              <article
                key={item.number}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-sm font-black text-[#0965d8]">
                    {item.number}
                  </span>

                  <h3 className="font-bold text-[#082a43]">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            * {content.note}
          </p>

          <Link
            href={`/${locale}/candidature`}
            className="mt-7 inline-flex rounded-full bg-[#0D6EFD] px-7 py-3.5 font-black text-[#082A43] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
          >
            {content.button}
          </Link>
        </div>
      </div>
    </section>
  );
}