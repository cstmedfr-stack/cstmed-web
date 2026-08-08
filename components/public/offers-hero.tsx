import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type OffersHeroProps = {
  locale: Locale;
  offersCount?: number;
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function OffersHero({
  locale,
  offersCount,
}: OffersHeroProps) {
  const content =
    locale === "ro"
      ? {
          eyebrow: "Oportunități profesionale în Franța",

          titleStart: "Oferte de muncă pentru",
          titleAccent: "medici în Franța",

          description:
            "Descoperă oportunitățile selectate de CSTMed și găsește proiectul profesional care corespunde specialității, experienței și preferințelor tale.",

          offers:
            offersCount === 1
              ? "1 ofertă disponibilă"
              : `${offersCount ?? 0} oferte disponibile`,

          accompaniment: "Sprijin CSTMed",
          accompanimentText:
            "De la candidatură la instalare",

          cvButton: "Trimite CV-ul",
        }
      : {
          eyebrow: "Opportunités professionnelles en France",

          titleStart: "Offres d’emploi pour",
          titleAccent: "médecins en France",

          description:
            "Découvrez les opportunités sélectionnées par CSTMed et trouvez le projet professionnel correspondant à votre spécialité, votre expérience et vos préférences.",

          offers:
            offersCount === 1
              ? "1 offre disponible"
              : `${offersCount ?? 0} offres disponibles`,

          accompaniment: "Accompagnement CSTMed",
          accompanimentText:
            "De la candidature à l’installation",

          cvButton: "Envoyer mon CV",
        };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0b4961] to-[#118c87] text-white">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#65d9ce]/10 blur-3xl" />

      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#0D6EFD]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-16">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#65d9ce]">
            {content.eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {content.titleStart}{" "}
            <span className="text-[#8eeae1]">
              {content.titleAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="inline-flex min-h-14 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#65d9ce] text-[#082a43]">
                <SearchIcon />
              </span>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9ceae3]">
                  CSTMed
                </p>

                <p className="font-bold">
                  {content.offers}
                </p>
              </div>
            </div>

            <div className="inline-flex min-h-14 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl">✓</span>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9ceae3]">
                  {content.accompaniment}
                </p>

                <p className="font-bold">
                  {content.accompanimentText}
                </p>
              </div>
            </div>

            <Link
                    href={`/${locale}/candidature`}
                    className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-7 py-3 font-black shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                    <span style={{ color: "#082A43" }}>
                        {content.cvButton}
                    </span>
                    </Link>
          </div>
        </div>
      </div>
    </section>
  );
}