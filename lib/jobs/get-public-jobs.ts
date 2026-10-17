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

type TranslationRow = {
  title: string | null;
  summary: string | null;
  description: string | null;
  jobs: OriginalJobRow;
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").toLowerCase();
}

function uniqueValues(values: Array<string | null>) {
  return Array.from(new Set(values.map((v) => v?.trim()).filter((v): v is string => Boolean(v))))
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

export async function getPublicJobs(locale: Locale, filters: PublicJobFilters) {
  const supabase = await createClient();
  const category = filters.professionalCategory === "all" ? "" : filters.professionalCategory;

  if (locale === "fr") {
    // Fetch filter options independently of the current search, but restrict to published jobs.
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
    const { data, count, error } = await supabase.rpc("search_public_jobs", {
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
      specialties: uniqueValues(categoryFilterRows.map((r) => r.specialty)),
      contractTypes: uniqueValues(categoryFilterRows.map((r) => r.contract_type)),
    };
  }

  // Romanian site deliberately shows translated AND published jobs only.
  const { data, error } = await supabase
    .from("job_translations")
    .select(`title,summary,description,jobs!inner (
      id,title,description,specialty,professional_category,location_label,city,
      postal_code,contract_type,salary_text,france_travail_published_at,created_at,status
    )`)
    .eq("locale", "ro")
    .eq("status", "published")
    .eq("jobs.status", "published")
    .limit(1000);
  if (error) throw new Error(error.message);

  const allJobs = ((data ?? []) as unknown as TranslationRow[]).map((translation) => ({
    ...mapOriginalJob(translation.jobs),
    title: translation.title?.trim() || translation.jobs.title,
    description: translation.summary?.trim() || translation.description?.trim() || translation.jobs.description,
  }));

  const categoryJobs = category ? allJobs.filter((job) => job.professionalCategory === category) : allJobs;
  const specialties = uniqueValues(categoryJobs.map((j) => j.specialty));
  const contractTypes = uniqueValues(categoryJobs.map((j) => j.contractType));

  const q = normalize(filters.q);
  const location = normalize(filters.location);
  const filteredJobs = categoryJobs.filter((job) => {
    if (filters.specialty && job.specialty !== filters.specialty) return false;
    if (filters.contract && job.contractType !== filters.contract) return false;
    if (q && !normalize([job.title, job.description, job.specialty].filter(Boolean).join(" ")).includes(q)) return false;
    if (location && !normalize([job.locationLabel, job.city, job.postalCode].filter(Boolean).join(" ")).includes(location)) return false;
    return true;
  });

  filteredJobs.sort((a, b) => {
    const first = new Date(a.publishedAt ?? a.createdAt).getTime();
    const second = new Date(b.publishedAt ?? b.createdAt).getTime();
    return filters.sort === "oldest" ? first - second : second - first;
  });
  const from = (filters.page - 1) * filters.pageSize;
  return {
    jobs: filteredJobs.slice(from, from + filters.pageSize),
    total: filteredJobs.length,
    specialties,
    contractTypes,
  };
}
