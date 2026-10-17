import "server-only";
import { createHash } from "node:crypto";

export type ReviewableJob = {
  title: string | null; description: string | null; company_name: string | null;
  specialty: string | null; professional_category: string | null;
  location_label: string | null; city: string | null; postal_code: string | null;
  contract_type: string | null; working_time: string | null;
  salary_text: string | null; experience_text: string | null;
  application_url: string | null; source_url: string | null;
};
export const REVIEW_FIELDS = "title,description,company_name,specialty,professional_category,location_label,city,postal_code,contract_type,working_time,salary_text,experience_text,application_url,source_url";
export function jobSignature(job: ReviewableJob): string {
  const values = [job.title,job.description,job.company_name,job.specialty,job.professional_category,job.location_label,job.city,job.postal_code,job.contract_type,job.working_time,job.salary_text,job.experience_text,job.application_url,job.source_url];
  return createHash("sha256").update(JSON.stringify(values)).digest("hex");
}
