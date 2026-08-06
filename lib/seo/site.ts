import type { Locale } from "@/lib/i18n/config";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = (
  configuredSiteUrl ||
  "http://localhost:3000"
).replace(/\/+$/, "");

export const siteName = "CSTMed";

export const defaultSocialImage =
  "/images/cstmed-logo.jpg";

export const seoContent = {
  ro: {
    home: {
      title:
        "CSTMed – Oportunități profesionale pentru medici în Franța",

      description:
        "CSTMed sprijină medicii români în identificarea oportunităților profesionale și integrarea în unități medicale din Franța.",
    },

    jobs: {
      title: "Oferte de muncă pentru medici în Franța",

      description:
        "Descoperă ofertele medicale traduse în limba română și beneficiază de sprijin CSTMed pentru candidatura și instalarea în Franța.",
    },

    application: {
      title: "Trimite candidatura către CSTMed",

      description:
        "Completează formularul CSTMed și transmite CV-ul pentru oportunități profesionale medicale în Franța.",
    },

    establishments: {
      title: "Recrutarea medicilor pentru unități medicale",

      description:
        "Spitalele și clinicile pot transmite către CSTMed nevoile lor de recrutare medicală.",
    },

    jobFallbackDescription:
      "Consultă această oportunitate medicală în Franța și transmite candidatura prin CSTMed.",
  },

  fr: {
    home: {
      title:
        "CSTMed – Recrutement médical France–Europe",

      description:
        "CSTMed accompagne les médecins européens et les établissements de santé français dans leurs projets de recrutement médical.",
    },

    jobs: {
      title: "Offres d’emploi médical en France",

      description:
        "Consultez les offres d’emploi pour médecins en France et bénéficiez de l’accompagnement personnalisé de CSTMed.",
    },

    application: {
      title: "Transmettre une candidature médicale à CSTMed",

      description:
        "Complétez le formulaire CSTMed et transmettez votre CV pour des opportunités professionnelles médicales en France.",
    },

    establishments: {
      title: "Recruter un médecin avec CSTMed",

      description:
        "Les hôpitaux, cliniques et centres de santé peuvent transmettre leurs besoins de recrutement médical à CSTMed.",
    },

    jobFallbackDescription:
      "Consultez cette opportunité médicale en France et transmettez votre candidature avec CSTMed.",
  },
} satisfies Record<
  Locale,
  {
    home: {
      title: string;
      description: string;
    };

    jobs: {
      title: string;
      description: string;
    };

    application: {
      title: string;
      description: string;
    };

    establishments: {
      title: string;
      description: string;
    };

    jobFallbackDescription: string;
  }
>;

export function absoluteUrl(path: string) {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${siteUrl}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

export function createSeoDescription(
  value: string | null | undefined,
  fallback: string,
  maximumLength = 160,
) {
  const cleanValue = (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanValue) {
    return fallback;
  }

  if (cleanValue.length <= maximumLength) {
    return cleanValue;
  }

  return `${cleanValue
    .slice(0, maximumLength - 1)
    .trim()}…`;
}

export function getOpenGraphLocale(
  locale: Locale,
) {
  return locale === "ro"
    ? "ro_RO"
    : "fr_FR";
}