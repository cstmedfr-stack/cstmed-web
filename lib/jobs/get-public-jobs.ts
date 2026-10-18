import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export type ProfessionalCategory = "all" | "medecins" | "dentistes" | "pharmaciens" | "infirmiers";

export type PublicJob = {
  id: string;
  title: string;
  description: string | null;
  specialty: string | null;
  professionalCategory: string | null;
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
  professionalCategory: ProfessionalCategory;
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
  professional_category: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  contract_type: string | null;
  salary_text: string | null;
  france_travail_published_at: string | null;
  created_at: string;
};

function uniqueValues(values: Array<string | null>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))))
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

function mapOriginalJob(job: OriginalJobRow): PublicJob {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    specialty: job.specialty,
    professionalCategory: job.professional_category,
    locationLabel: job.location_label,
    city: job.city,
    postalCode: job.postal_code,
    contractType: job.contract_type,
    salaryText: job.salary_text,
    publishedAt: job.france_travail_published_at,
    createdAt: job.created_at,
  };
}

// Parametrul locale este pastrat pentru compatibilitate cu paginile RO/FR.
// In ambele limbi se returneaza doar originalul francez publicat.
// Pentru pagina separata /en/offres, se poate apela getPublicJobs("fr", filters).
export async function getPublicJobs(_locale: Locale, filters: PublicJobFilters) {
  const supabase = await createClient();
  const category = filters.professionalCategory === "all" ? "" : filters.professionalCategory;

  // Optiunile de filtre se preiau din ofertele publicate, indiferent de limba.
  const { data: filterRows, error: filterError } = await supabase
    .from("jobs")
    .select("specialty, contract_type, professional_category")
    .eq("status", "published")
    .limit(1000);
  if (filterError) throw new Error(filterError.message);

  const categoryFilterRows = category
    ? (filterRows ?? []).filter((row) => row.professional_category === category)
    : (filterRows ?? []);

  const from = (filters.page - 1) * filters.pageSize;
  const { data, count, error } = await supabase
    .rpc("search_public_jobs", {
      p_q: filters.q,
      p_category: filters.professionalCategory,
      p_specialty: filters.specialty,
      p_location: filters.location,
      p_contract: filters.contract,
    }, { count: "exact" })
    .select("id,title,description,specialty,professional_category,location_label,city,postal_code,contract_type,salary_text,france_travail_published_at,created_at")
    .order("france_travail_published_at", { ascending: filters.sort === "oldest", nullsFirst: false })
    .order("created_at", { ascending: filters.sort === "oldest" })
    .range(from, from + filters.pageSize - 1);

  if (error) throw new Error(error.message);
  return {
    jobs: ((data ?? []) as OriginalJobRow[]).map(mapOriginalJob),
    total: count ?? 0,
    specialties: uniqueValues(categoryFilterRows.map((row) => row.specialty)),
    contractTypes: uniqueValues(categoryFilterRows.map((row) => row.contract_type)),
  };
}
