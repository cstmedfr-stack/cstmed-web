import { createAdminClient } from "@/lib/supabase/admin";
import {
  FranceTravailOffer,
  searchFranceTravailOffers,
} from "@/lib/france-travail";
export const runtime = "nodejs";
type ImportRequestBody = {
  keyword?: string;
  limit?: number;
  cdiOnly?: boolean;
  batchOffset?: number;
};
type ImportKeyword = {
  keyword: string;
  jobs_per_keyword: number;
  cdi_only: boolean;
};
type ImportSettings = {
  application_url: string;
  default_jobs_per_keyword: number;
  cdi_only: boolean;
};
function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/*
 * La categorie provient du TITRE du poste, jamais du mot-cle de recherche.
 * Le filtrage reste volontairement prudent : les titres ambigus sont ecartes.
 */
type ProfessionalCategory = "medecins" | "dentistes" | "pharmaciens" | "infirmiers";

function hasTerm(title: string, term: string) {
  const escaped = normalizeText(term).replace(/[^a-z0-9 ]/g, "");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(title);
}

function hasAny(title: string, terms: readonly string[]) {
  return terms.some((term) => hasTerm(title, term));
}

const excludedRoles = [
  "aide soignant", "aide soignante", "aide medico psychologique",
  "assistant dentaire", "assistante dentaire", "prothesiste dentaire",
  "secretaire dentaire", "hygieniste dentaire", "auxiliaire dentaire",
  "preparateur en pharmacie", "preparatrice en pharmacie",
  "preparateur hospitalier", "preparatrice hospitaliere",
  "sage femme", "maieuticien", "maieuticienne",
  "kinesitherapeute", "masseur kinesitherapeute", "orthophoniste",
  "psychomotricien", "psychomotricienne", "ergotherapeute",
  "podologue", "pedicure podologue", "opticien", "opticienne",
  "ambulancier", "ambulanciere", "manipulateur radio",
  "manipulatrice radio", "manipulateur en radiologie",
  "technicien de laboratoire", "technicienne de laboratoire",
  "technicien biomedical", "technicienne biomedical",
  "secretaire medical", "secretaire medicale",
  "assistant medical", "assistante medicale",
  "auxiliaire de puericulture", "agent de service hospitalier",
  "cadre de sante", "ash", "etudiant", "etudiante",
  "alternance", "apprenti", "apprentie", "stagiaire",
];

const dentalRoles = [
  "chirurgien dentiste", "chirurgienne dentiste", "dentiste",
  "medecin dentiste", "odontologue", "odontologiste",
  "orthodontiste", "endodontiste", "parodontologue",
];

const pharmacistRoles = [
  "pharmacien", "pharmacienne", "docteur en pharmacie",
  "pharmacien biologiste", "pharmacienne biologiste",
];

const nurseRoles = [
  "infirmier", "infirmiere", "infirmiers", "infirmieres",
  "infirmier diplome d etat", "infirmiere diplomee d etat",
  "ide", "iade", "ibode", "infirmier anesthesiste",
  "infirmiere anesthesiste", "infirmier de bloc operatoire",
  "infirmiere de bloc operatoire", "infirmier puericulteur",
  "infirmiere puericultrice", "puericultrice",
];

const physicianRoles = [
  "medecin", "medecins", "docteur en medecine", "praticien hospitalier",
  "generaliste", "cardiologue", "psychiatre", "pedopsychiatre",
  "gynecologue", "obstetricien", "dermatologue", "ophtalmologue",
  "pediatre", "radiologue", "radiotherapeute", "anesthesiste",
  "reanimateur", "urgentiste", "neurologue", "neuropediatre",
  "neuropsychiatre", "rhumatologue", "endocrinologue",
  "diabetologue", "pneumologue", "gastro enterologue",
  "hepatologue", "nephrologue", "oncologue", "cancerologue",
  "infectiologue", "geriatre", "hematologue", "urologue",
  "stomatologue", "chirurgien", "chirurgienne", "pathologiste",
  "anatomopathologiste", "anatomo pathologiste", "allergologue",
  "biologiste medical", "geneticien medical", "angiologue",
  "interniste", "addictologue", "algologue", "medecin mpr",
  "neurochirurgien", "chirurgien plasticien", "chirurgien vasculaire",
  "chirurgien orthopediste", "chirurgien maxillo facial",
];

function classifyMedicalOffer(offer: FranceTravailOffer): ProfessionalCategory | null {
  const title = normalizeText(offer.intitule ?? "");
  if (!title || hasAny(title, excludedRoles)) return null;
  // Prioritiser les professions specifiques avant le terme generique 'chirurgien'.
  const matches = [
    hasAny(title, dentalRoles) ? "dentistes" : null,
    hasAny(title, pharmacistRoles) ? "pharmaciens" : null,
    hasAny(title, nurseRoles) ? "infirmiers" : null,
  ].filter((item): item is ProfessionalCategory => item !== null);
  // Ne jamais enregistrer automatiquement une annonce avec professions multiples.
  if (matches.length > 1) return null;
  if (matches.length === 1) return matches[0];
  return hasAny(title, physicianRoles) ? "medecins" : null;
}

function getDepartmentCode(
  communeCode?: string,
) {
  if (!communeCode) {
    return null;
  }
  if (
    communeCode.startsWith("97") ||
    communeCode.startsWith("98")
  ) {
    return communeCode.slice(0, 3);
  }
  return communeCode.slice(0, 2);
}
function mapOfferToJob(
  offer: FranceTravailOffer,
  keyword: string,
  applicationUrl: string,
  professionalCategory: ProfessionalCategory,
) {
  const communeCode =
    offer.lieuTravail?.commune;
  return {
    source: "france_travail",
    source_job_id: offer.id,
    title: offer.intitule,
    description:
      offer.description ?? null,
    company_name:
      offer.entreprise?.nom ?? null,
    company_description:
      offer.entreprise?.description ??
      null,
    specialty: keyword,
    professional_category: professionalCategory,
    rome_code:
      offer.romeCode ?? null,
    location_label:
      offer.lieuTravail?.libelle ??
      null,
    city:
      offer.lieuTravail?.libelle ??
      null,
    postal_code:
      offer.lieuTravail?.codePostal ??
      null,
    department_code:
      getDepartmentCode(communeCode),
    region_code: null,
    latitude:
      offer.lieuTravail?.latitude ??
      null,
    longitude:
      offer.lieuTravail?.longitude ??
      null,
    contract_type:
      offer.typeContratLibelle ??
      offer.typeContrat ??
      null,
    contract_nature:
      offer.natureContrat ?? null,
    working_time:
      offer.dureeTravailLibelleConverti ??
      null,
    salary_text:
      offer.salaire?.libelle ??
      offer.salaire?.commentaire ??
      null,
    experience_text:
      offer.experienceLibelle ?? null,
    education_text:
      offer.formations &&
      offer.formations.length > 0
        ? JSON.stringify(
            offer.formations,
          )
        : null,
    skills:
      offer.competences ?? [],
    languages:
      offer.langues ?? [],
    contact:
      offer.contact ?? null,
    /*
     * La candidature est dirigée
     * vers CSTMed.
     */
    application_url:
      applicationUrl,
    /*
     * Nous conservons également
     * la source originale.
     */
    source_url:
      offer.origineOffre
        ?.urlOrigine ??
      offer.urlPostulation ??
      null,
    france_travail_published_at:
      offer.dateCreation ?? null,
    expires_at: null,
    status: "draft" as const,
    featured: false,
    /*
     * Données France Travail originales
     * conservées pour vérification.
     */
    raw_data: offer,
  };
}
function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds,
    );
  });
}
export async function POST(
  request: Request,
) {
  const expectedToken =
    process.env.IMPORT_ADMIN_TOKEN;
  const receivedToken =
    request.headers.get(
      "x-import-token",
    );
  if (
    !expectedToken ||
    receivedToken !== expectedToken
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Acces neautorizat.",
      },
      {
        status: 401,
      },
    );
  }
  const body = (await request
    .json()
    .catch(
      () => ({}),
    )) as ImportRequestBody;
  // Lots limites a 10 mots-cles, offset valide exclusivement sur le serveur.
  const batchMode = body.batchOffset !== undefined;
  if (batchMode && (body.keyword || !Number.isInteger(body.batchOffset) ||
      (body.batchOffset as number) < 0 || (body.batchOffset as number) % 10 !== 0)) {
    return Response.json({ success: false, error: "Lot invalide." }, { status: 400 });
  }
  // Evite de relancer accidentellement 120 recherches dans une seule requete.
  if (!batchMode && !body.keyword?.trim()) {
    return Response.json({ success: false, error: "Utilisez l'importation par lots." }, { status: 400 });
  }
  const supabase =
    createAdminClient();
  const {
    data: importRun,
    error: runError,
  } = await supabase
    .from("import_runs")
    .insert({
      status: "running",
      details: {
        requested_keyword:
          body.keyword ?? null,
        requested_limit:
          body.limit ?? null,
        batch_offset: batchMode ? body.batchOffset : null,
      },
    })
    .select("id")
    .single();
  if (
    runError ||
    !importRun
  ) {
    return Response.json(
      {
        success: false,
        error:
          runError?.message ??
          "Nu s-a putut crea istoricul importului.",
      },
      {
        status: 500,
      },
    );
  }
  try {
   
   const { data: settingsData, error: settingsError } =
  await supabase
    .from("import_settings")
    .select(
      "application_url, default_jobs_per_keyword, cdi_only"
    )
    .eq("id", true)
    .single();
      if (settingsError) {
      throw new Error(
        settingsError.message,
      );
    }
    const settings =
      settingsData as ImportSettings;
    let keywords:
      ImportKeyword[];
    if (body.keyword?.trim()) {
      keywords = [
        {
          keyword:
            body.keyword.trim(),
          jobs_per_keyword:
            body.limit ??
            settings.default_jobs_per_keyword ??
            30,
          cdi_only:
            body.cdiOnly ??
            settings.cdi_only ??
            false,
        },
      ];
    } else {
     
        const { data, error } = await supabase
  .from("import_keywords")
  .select("id, keyword, jobs_per_keyword, cdi_only")
  .eq("enabled", true)
  .order("id", {
    ascending: true,
  })
  .range(body.batchOffset as number, (body.batchOffset as number) + 9);
      
      if (error) {
        throw new Error(
          error.message,
        );
      }
      keywords =
        (data ??
          []) as ImportKeyword[];
    }
    if (
      keywords.length === 0
    ) {
      throw new Error(
        "Nu există niciun cuvânt-cheie activ pentru import.",
      );
    }
    let importedCount = 0;
    let duplicateCount = 0;
    let filteredOutCount = 0;
    const errors: Array<{
      keyword: string;
      message: string;
    }> = [];
    for (
      const keywordSettings
      of keywords
    ) {
      const keyword =
        keywordSettings.keyword;
      const limit = Math.min(
        Math.max(
          Math.trunc(
            body.limit ??
              keywordSettings.jobs_per_keyword ??
              settings.default_jobs_per_keyword ??
              30,
          ),
          1,
        ),
        100,
      );
      const cdiOnly =
        body.cdiOnly ??
        keywordSettings.cdi_only ??
        settings.cdi_only ??
        false;
      try {
        // Le lot garde 10 mots-cles; chaque mot-cle vise au plus
        // `limit` nouvelles offres, en examinant au plus 3 pages.
        // Les pages suivantes permettent de depasser les doublons.
        const pageSize = Math.min(limit, 10);
        const maxPages = 3;
        const seenInThisKeyword = new Set<string>();
        let importedForKeyword = 0;

        for (let page = 0; page < maxPages && importedForKeyword < limit; page++) {
          const offset = page * pageSize;
          const offers = await searchFranceTravailOffers({
            keyword,
            limit: pageSize,
            offset,
            cdiOnly,
          });
          if (offers.length === 0) break;

          const classifiedOffers = offers.map((offer) => ({
            offer,
            category: classifyMedicalOffer(offer),
          }));
          const relevantOffers = classifiedOffers.filter(
            (item): item is { offer: FranceTravailOffer; category: ProfessionalCategory } =>
              item.category !== null,
          );
          filteredOutCount += offers.length - relevantOffers.length;

          // Elimine doublons aussi entre les pages d'une meme recherche.
          const uniqueOffers = relevantOffers.filter((item) => {
            if (seenInThisKeyword.has(item.offer.id)) {
              duplicateCount++;
              return false;
            }
            seenInThisKeyword.add(item.offer.id);
            return true;
          });

          if (uniqueOffers.length > 0) {
            const sourceJobIds = uniqueOffers.map((item) => item.offer.id);
            const { data: existingJobs, error: existingError } = await supabase
              .from("jobs")
              .select("source_job_id")
              .eq("source", "france_travail")
              .in("source_job_id", sourceJobIds);
            if (existingError) throw new Error(existingError.message);

            const existingIds = new Set(
              (existingJobs ?? []).map((job) => job.source_job_id as string),
            );
            const freshOffers = uniqueOffers.filter((item) =>
              !existingIds.has(item.offer.id),
            );
            duplicateCount += uniqueOffers.length - freshOffers.length;

            const remaining = limit - importedForKeyword;
            const selectedOffers = freshOffers.slice(0, remaining);
            if (selectedOffers.length > 0) {
              const jobsToInsert = selectedOffers.map((item) =>
                mapOfferToJob(
                  item.offer,
                  keyword,
                  settings.application_url,
                  item.category,
                ),
              );
              const { error: insertError } = await supabase
                .from("jobs")
                .insert(jobsToInsert);
              if (insertError) throw new Error(insertError.message);
              importedForKeyword += jobsToInsert.length;
              importedCount += jobsToInsert.length;
            }
          }

          // Ultima pagina este incompleta: nu mai exista o pagina intreaga.
          if (offers.length < pageSize) break;
          if (page < maxPages - 1 && importedForKeyword < limit) {
            await wait(150);
          }
        }
      } catch (error) {
        errors.push({
          keyword,
          message:
            error instanceof Error
              ? error.message
              : "Eroare necunoscută.",
        });
      }
      /*
       * Maintenons l'import sous
       * la limite de l'API.
       */
      await wait(150);
    }
    const finalStatus =
      errors.length ===
      keywords.length
        ? "failed"
        : "completed";
    const {
      error: updateRunError,
    } = await supabase
      .from("import_runs")
      .update({
        completed_at:
          new Date().toISOString(),
        status:
          finalStatus,
        imported_count:
          importedCount,
        duplicate_count:
          duplicateCount,
        error_count:
          errors.length,
        details: {
          keywords_processed:
            keywords.length,
          filtered_out_count:
            filteredOutCount,
          batch_offset: batchMode ? body.batchOffset : null,
          batch_end: batchMode ? (body.batchOffset as number) + keywords.length : null,
          errors,
        },
        error_message:
          finalStatus === "failed"
            ? errors
                .map(
                  (item) =>
                    item.message,
                )
                .join(" | ")
            : null,
      })
      .eq(
        "id",
        importRun.id,
      );
    if (
      updateRunError
    ) {
      throw new Error(
        updateRunError.message,
      );
    }
    return Response.json({
      success:
        finalStatus ===
        "completed",
      status:
        finalStatus,
      keywordsProcessed:
        keywords.length,
      importedCount,
      duplicateCount,
      filteredOutCount,
      errorCount:
        errors.length,
      errors,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Eroare necunoscută.";
    await supabase
      .from("import_runs")
      .update({
        completed_at:
          new Date().toISOString(),
        status: "failed",
        error_count: 1,
        error_message:
          message,
        details: {
          error: message,
        },
      })
      .eq(
        "id",
        importRun.id,
      );
    return Response.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}