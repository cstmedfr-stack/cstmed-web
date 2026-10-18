"use server";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

type Lang = "ro" | "fr" | "en";
const langs: Lang[] = ["ro", "fr", "en"];
const professions = ["medecins", "dentistes", "pharmaciens", "infirmiers", "autres"];
const grades = ["specialist", "senior", "resident", "unspecialized"];
const availabilityOptions = ["asap", "3_6_months", "6_12_months", "1_2_years", "over_2_years", "undecided"];
const levels = ["none", "a1", "a2", "b1", "b2", "c1", "c2", "native"];
function str(form: FormData, key: string, max: number) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function bad(lang: Lang) {
  redirect(`/salon/expomedics?lang=${lang}&error=1`);
}
export async function registerSalonContact(formData: FormData) {
  const requestedLang = str(formData,"lang",2);
  const lang: Lang = langs.includes(requestedLang as Lang) ? requestedLang as Lang : "ro";
  // A honeypot reduces trivial automated abuse, without confirming a real registration.
  if (str(formData,"website",200)) redirect(`/salon/expomedics/merci?lang=${lang}`);
  const first_name = str(formData,"firstName",100);
  const last_name = str(formData,"lastName",100);
  const email = str(formData,"email",254).toLowerCase();
  const phone = str(formData,"phone",50);
  const profession = str(formData,"profession",30);
  const specialty = str(formData,"specialty",150) || null;
  const medicalGradeValue = str(formData,"medicalGrade",30);
  const medical_grade = medicalGradeValue || null;
  const residencyYearValue = str(formData,"residencyYear",2);
  const residency_year = residencyYearValue ? Number(residencyYearValue) : null;
  const availability = str(formData,"availability",30);
  const city = str(formData,"city",120) || null;
  const level = str(formData,"frenchLevel",20);
  const french_level = level || null;
  if (!first_name || !last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g,"").length < 7 ||
      !professions.includes(profession) ||
      (profession === "medecins" ? !grades.includes(medicalGradeValue) : Boolean(medicalGradeValue)) ||
      (medicalGradeValue === "resident" ? !(residency_year !== null && Number.isInteger(residency_year) && residency_year >= 1 && residency_year <= 7) : residency_year !== null) ||
      !availabilityOptions.includes(availability) || (level && !levels.includes(level)) || formData.get("consent") !== "on") bad(lang);
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY missing: secure rate limit cannot run.");
  const db = createAdminClient();
  const h = await headers();
  const forwarded = h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  const identities = ["email:" + email];
  if (ip && ip.length < 100) identities.push("ip:" + ip);
  for (const identity of identities) {
    const key = "salon:" + createHmac("sha256",secret).update(identity).digest("hex");
    const { data, error } = await db.rpc("check_application_rate_limit", {
      p_key:key, p_max_attempts:identity.startsWith("ip:") ? 25 : 5, p_window_minutes:60,
    });
    if (error || data !== true) bad(lang); // fail closed if rate-limit RPC unavailable
  }
  const {error} = await db.from("salon_contacts").insert({
    event_slug:"expomedics", first_name,last_name,email,phone,profession,specialty,city,
    french_level,locale:lang,medical_grade,residency_year,availability,
    talent_pool_consent_at:formData.get("talentPoolConsent") === "on" ? new Date().toISOString() : null,
  });
  // Duplicate submissions get the same generic confirmation, without disclosing data.
  if (error && error.code !== "23505") {
    console.error("Salon contact insert:",error.code,error.message); bad(lang);
  }
  redirect(`/salon/expomedics/merci?lang=${lang}`);
}
