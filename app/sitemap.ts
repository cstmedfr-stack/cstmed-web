import type { MetadataRoute } from "next";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  absoluteUrl,
  siteUrl,
} from "@/lib/seo/site";

export const revalidate = 3600;

type PublishedJob = {
  id: string;
  created_at: string;
};

type PublishedTranslation = {
  job_id: string;
  updated_at: string;
};

const staticPages = [
  {
    path: "",
    priority: 1,
    changeFrequency: "weekly" as const,
  },

  {
    path: "/offres",
    priority: 0.9,
    changeFrequency: "daily" as const,
  },

  {
    path: "/candidature",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },

  {
    path: "/etablissements",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },

  {
    path: "/confidentialite",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },

  {
    path: "/mentions-legales",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },

  {
    path: "/cookies",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },
];

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap =
    staticPages.flatMap((page) => {
      const romanianUrl = absoluteUrl(
        `/ro${page.path}`,
      );

      const frenchUrl = absoluteUrl(
        `/fr${page.path}`,
      );

      const alternates = {
        languages: {
          ro: romanianUrl,
          fr: frenchUrl,
          "x-default": romanianUrl,
        },
      };

      return [
        {
          url: romanianUrl,
          lastModified: now,
          changeFrequency:
            page.changeFrequency,
          priority: page.priority,
          alternates,
        },

        {
          url: frenchUrl,
          lastModified: now,
          changeFrequency:
            page.changeFrequency,
          priority: page.priority,
          alternates,
        },
      ];
    });

  const supabase = createAdminClient();

  const [
    jobsResult,
    translationsResult,
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, created_at")
      .eq("status", "published")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("job_translations")
      .select("job_id, updated_at")
      .eq("locale", "ro")
      .eq("status", "published"),
  ]);

  if (
    jobsResult.error ||
    translationsResult.error
  ) {
    console.error(
      "Sitemap database error:",
      jobsResult.error?.message ??
        translationsResult.error?.message,
    );

    return staticEntries;
  }

  const jobs =
    (jobsResult.data ?? []) as PublishedJob[];

  const translations =
    (translationsResult.data ??
      []) as PublishedTranslation[];

  const translatedJobs = new Map(
    translations.map((translation) => [
      translation.job_id,
      translation.updated_at,
    ]),
  );

  const frenchJobEntries: MetadataRoute.Sitemap =
    jobs.map((job) => {
      const frenchUrl = absoluteUrl(
        `/fr/offres/${job.id}`,
      );

      const romanianUrl = absoluteUrl(
        `/ro/offres/${job.id}`,
      );

      const hasRomanianTranslation =
        translatedJobs.has(job.id);

      return {
        url: frenchUrl,

        lastModified:
          translatedJobs.get(job.id) ??
          job.created_at,

        changeFrequency: "weekly",
        priority: 0.8,

        alternates: {
          languages: hasRomanianTranslation
            ? {
                ro: romanianUrl,
                fr: frenchUrl,
                "x-default": romanianUrl,
              }
            : {
                fr: frenchUrl,
                "x-default": frenchUrl,
              },
        },
      };
    });

  const romanianJobEntries: MetadataRoute.Sitemap =
    jobs
      .filter((job) =>
        translatedJobs.has(job.id),
      )
      .map((job) => {
        const romanianUrl = absoluteUrl(
          `/ro/offres/${job.id}`,
        );

        const frenchUrl = absoluteUrl(
          `/fr/offres/${job.id}`,
        );

        return {
          url: romanianUrl,

          lastModified:
            translatedJobs.get(job.id) ??
            job.created_at,

          changeFrequency: "weekly",
          priority: 0.8,

          alternates: {
            languages: {
              ro: romanianUrl,
              fr: frenchUrl,
              "x-default": romanianUrl,
            },
          },
        };
      });

  return [
    ...staticEntries,
    ...frenchJobEntries,
    ...romanianJobEntries,
  ];
}