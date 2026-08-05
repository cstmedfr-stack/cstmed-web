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

function getDepartmentCode(communeCode?: string) {
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
) {
  const communeCode = offer.lieuTravail?.commune;

  return {
    source: "france_travail",
    source_job_id: offer.id,

    title: offer.intitule,
    description: offer.description ?? null,

    company_name: offer.entreprise?.nom ?? null,
    company_description:
      offer.entreprise?.description ?? null,

    specialty: keyword,
    rome_code: offer.romeCode ?? null,

    location_label: offer.lieuTravail?.libelle ?? null,
    city: offer.lieuTravail?.libelle ?? null,
    postal_code: offer.lieuTravail?.codePostal ?? null,
    department_code: getDepartmentCode(communeCode),
    region_code: null,

    latitude: offer.lieuTravail?.latitude ?? null,
    longitude: offer.lieuTravail?.longitude ?? null,

    contract_type:
      offer.typeContratLibelle ??
      offer.typeContrat ??
      null,

    contract_nature: offer.natureContrat ?? null,

    working_time:
      offer.dureeTravailLibelleConverti ?? null,

    salary_text:
      offer.salaire?.libelle ??
      offer.salaire?.commentaire ??
      null,

    experience_text: offer.experienceLibelle ?? null,

    education_text:
      offer.formations && offer.formations.length > 0
        ? JSON.stringify(offer.formations)
        : null,

    skills: offer.competences ?? [],
    languages: offer.langues ?? [],
    contact: offer.contact ?? null,

    // Candidatura este dirijată către CSTMed.
    application_url: applicationUrl,

    // Păstrăm și sursa originală a ofertei.
    source_url:
      offer.origineOffre?.urlOrigine ??
      offer.urlPostulation ??
      null,

    france_travail_published_at:
      offer.dateCreation ?? null,

    expires_at: null,

    status: "draft" as const,
    featured: false,

    // Datele originale sunt păstrate pentru verificare.
    raw_data: offer,
  };
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function POST(request: Request) {
  const expectedToken = process.env.IMPORT_ADMIN_TOKEN;
  const receivedToken = request.headers.get("x-import-token");

  if (!expectedToken || receivedToken !== expectedToken) {
    return Response.json(
      {
        success: false,
        error: "Acces neautorizat.",
      },
      {
        status: 401,
      },
    );
  }

  const body = (await request
    .json()
    .catch(() => ({}))) as ImportRequestBody;

  const supabase = createAdminClient();

  const { data: importRun, error: runError } = await supabase
    .from("import_runs")
    .insert({
      status: "running",
      details: {
        requested_keyword: body.keyword ?? null,
        requested_limit: body.limit ?? null,
      },
    })
    .select("id")
    .single();

  if (runError || !importRun) {
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
          `
            application_url,
            default_jobs_per_keyword,
            cdi_only
          `,
        )
        .eq("id", true)
        .single();

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    const settings = settingsData as ImportSettings;

    let keywords: ImportKeyword[];

    if (body.keyword?.trim()) {
      keywords = [
        {
          keyword: body.keyword.trim(),
          jobs_per_keyword:
            body.limit ??
            settings.default_jobs_per_keyword ??
            30,
          cdi_only:
            body.cdiOnly ?? settings.cdi_only ?? false,
        },
      ];
    } else {
      const { data, error } = await supabase
        .from("import_keywords")
        .select(
          `
            keyword,
            jobs_per_keyword,
            cdi_only
          `,
        )
        .eq("enabled", true)
        .order("id", {
          ascending: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      keywords = (data ?? []) as ImportKeyword[];
    }

    if (keywords.length === 0) {
      throw new Error(
        "Nu există niciun cuvânt-cheie activ pentru import.",
      );
    }

    let importedCount = 0;
    let duplicateCount = 0;

    const errors: Array<{
      keyword: string;
      message: string;
    }> = [];

    for (const keywordSettings of keywords) {
      const keyword = keywordSettings.keyword;

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
        const offers = await searchFranceTravailOffers({
          keyword,
          limit,
          cdiOnly,
        });

        if (offers.length === 0) {
          await wait(150);
          continue;
        }

        const sourceJobIds = offers.map((offer) => offer.id);

        const { data: existingJobs, error: existingError } =
          await supabase
            .from("jobs")
            .select("source_job_id")
            .eq("source", "france_travail")
            .in("source_job_id", sourceJobIds);

        if (existingError) {
          throw new Error(existingError.message);
        }

        const existingIds = new Set(
          (existingJobs ?? []).map(
            (job) => job.source_job_id as string,
          ),
        );

        const newOffers = offers.filter(
          (offer) => !existingIds.has(offer.id),
        );

        duplicateCount += offers.length - newOffers.length;

        if (newOffers.length > 0) {
          const jobsToInsert = newOffers.map((offer) =>
            mapOfferToJob(
              offer,
              keyword,
              settings.application_url,
            ),
          );

          const { error: insertError } = await supabase
            .from("jobs")
            .insert(jobsToInsert);

          if (insertError) {
            throw new Error(insertError.message);
          }

          importedCount += jobsToInsert.length;
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

      // Menținem importul sub limita API.
      await wait(150);
    }

    const finalStatus =
      errors.length === keywords.length
        ? "failed"
        : "completed";

    const { error: updateRunError } = await supabase
      .from("import_runs")
      .update({
        completed_at: new Date().toISOString(),
        status: finalStatus,
        imported_count: importedCount,
        duplicate_count: duplicateCount,
        error_count: errors.length,
        details: {
          keywords_processed: keywords.length,
          errors,
        },
        error_message:
          finalStatus === "failed"
            ? errors.map((item) => item.message).join(" | ")
            : null,
      })
      .eq("id", importRun.id);

    if (updateRunError) {
      throw new Error(updateRunError.message);
    }

    return Response.json({
      success: finalStatus === "completed",
      status: finalStatus,
      keywordsProcessed: keywords.length,
      importedCount,
      duplicateCount,
      errorCount: errors.length,
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
        completed_at: new Date().toISOString(),
        status: "failed",
        error_count: 1,
        error_message: message,
        details: {
          error: message,
        },
      })
      .eq("id", importRun.id);

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