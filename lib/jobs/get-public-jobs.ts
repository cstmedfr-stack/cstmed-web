import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export type PublicJob = {
  id: string;
  title: string;
  description: string | null;
  specialty: string | null;
  locationLabel: string | null;
  city: string | null;
  postalCode: string | null;
  contractType: string | null;
  salaryText: string | null;
  publishedAt: string | null;
  createdAt: string;
};

type PublicJobFilters = {
  q: string;
  specialty: string;
  location: string;
  contract: string;
  sort: "newest" | "oldest";
  page: number;
  pageSize: number;
};

type OriginalJobRow = {
  id: string;
  title: string;
  description: string | null;
  specialty: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  salary_text: string | null;
  france_travail_published_at: string | null;
  created_at: string;
};

type TranslationRow = {
  title: string | null;
  summary: string | null;
  description: string | null;
  jobs: OriginalJobRow;
};

function uniqueValues(values: Array<string | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, "fr", {
      sensitivity: "base",
    }),
  );
}

function mapOriginalJob(job: OriginalJobRow): PublicJob {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    specialty: job.specialty,
    locationLabel: job.location_label,
    city: job.city,
    postalCode: job.postal_code,
    contractType: job.contract_type,
    salaryText: job.salary_text,
    publishedAt: job.france_travail_published_at,
    createdAt: job.created_at,
  };
}

export async function getPublicJobs(
  locale: Locale,
  filters: PublicJobFilters,
) {
  const supabase = await createClient();

  if (locale === "fr") {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;

    const { data: filterRows } = await supabase
      .from("jobs")
      .select("specialty, contract_type")
      .eq("status", "published")
      .limit(1000);

    let query = supabase
      .from("jobs")
      .select(
        `
          id,
          title,
          description,
          specialty,
          location_label,
          city,
          postal_code,
          contract_type,
          salary_text,
          france_travail_published_at,
          created_at
        `,
        {
          count: "exact",
        },
      )
      .eq("status", "published");

    if (filters.specialty) {
      query = query.eq("specialty", filters.specialty);
    }

    if (filters.contract) {
      query = query.eq("contract_type", filters.contract);
    }

    if (filters.q) {
      const pattern = `%${filters.q}%`;

      query = query.or(
        [
          `title.ilike.${pattern}`,
          `specialty.ilike.${pattern}`,
          `description.ilike.${pattern}`,
        ].join(","),
      );
    }

    if (filters.location) {
      const pattern = `%${filters.location}%`;

      query = query.or(
        [
          `location_label.ilike.${pattern}`,
          `city.ilike.${pattern}`,
          `postal_code.ilike.${pattern}`,
        ].join(","),
      );
    }

    const {
      data,
      count,
      error,
    } = await query
      .order("france_travail_published_at", {
        ascending: filters.sort === "oldest",
        nullsFirst: false,
      })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return {
      jobs: ((data ?? []) as OriginalJobRow[]).map(
        mapOriginalJob,
      ),

      total: count ?? 0,

      specialties: uniqueValues(
        (filterRows ?? []).map((row) => row.specialty),
      ),

      contractTypes: uniqueValues(
        (filterRows ?? []).map((row) => row.contract_type),
      ),
    };
  }

  /*
   * În română încărcăm numai ofertele traduse și publicate.
   * Numărul acestora va fi mult mai mic decât lista franceză.
   */
  const { data, error } = await supabase
    .from("job_translations")
    .select(
      `
        title,
        summary,
        description,
        jobs!inner (
          id,
          title,
          description,
          specialty,
          location_label,
          city,
          postal_code,
          contract_type,
          salary_text,
          france_travail_published_at,
          created_at,
          status
        )
      `,
    )
    .eq("locale", "ro")
    .eq("status", "published")
    .eq("jobs.status", "published")
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  const allJobs = ((data ?? []) as unknown as TranslationRow[])
    .map((translation) => ({
      ...mapOriginalJob(translation.jobs),

      title:
        translation.title?.trim() ||
        translation.jobs.title,

      description:
        translation.summary?.trim() ||
        translation.description?.trim() ||
        translation.jobs.description,
    }));

  const specialties = uniqueValues(
    allJobs.map((job) => job.specialty),
  );

  const contractTypes = uniqueValues(
    allJobs.map((job) => job.contractType),
  );

  const normalizedQuery = filters.q.toLocaleLowerCase("ro");
  const normalizedLocation =
    filters.location.toLocaleLowerCase("ro");

  const filteredJobs = allJobs.filter((job) => {
    if (
      filters.specialty &&
      job.specialty !== filters.specialty
    ) {
      return false;
    }

    if (
      filters.contract &&
      job.contractType !== filters.contract
    ) {
      return false;
    }

    if (normalizedQuery) {
      const searchableText = [
        job.title,
        job.description,
        job.specialty,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ro");

      if (!searchableText.includes(normalizedQuery)) {
        return false;
      }
    }

    if (normalizedLocation) {
      const locationText = [
        job.locationLabel,
        job.city,
        job.postalCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ro");

      if (!locationText.includes(normalizedLocation)) {
        return false;
      }
    }

    return true;
  });

  filteredJobs.sort((first, second) => {
    const firstDate = new Date(
      first.publishedAt ?? first.createdAt,
    ).getTime();

    const secondDate = new Date(
      second.publishedAt ?? second.createdAt,
    ).getTime();

    return filters.sort === "oldest"
      ? firstDate - secondDate
      : secondDate - firstDate;
  });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize;

  return {
    jobs: filteredJobs.slice(from, to),
    total: filteredJobs.length,
    specialties,
    contractTypes,
  };
}