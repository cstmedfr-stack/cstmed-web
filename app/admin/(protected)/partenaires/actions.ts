"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const statuses = ["prospect", "contacted", "negotiation", "signed", "rejected", "archived"] as const;
const types = ["hospital", "clinic", "health_center", "ehpad", "medical_practice", "other"] as const;

function field(data: FormData, name: string, max = 500) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function nullable(value: string) { return value || null; }
function validDate(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error("Date invalide.");
  }
  return value;
}

export async function savePartner(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id", 100);
  const establishment_name = field(formData, "establishment_name", 250);
  if (establishment_name.length < 2) throw new Error("Le nom de l’établissement est obligatoire.");
  const rawType = field(formData, "establishment_type", 60);
  const rawStatus = field(formData, "relationship_status", 60);
  if (!types.includes(rawType as typeof types[number])) throw new Error("Type d’établissement invalide.");
  if (!statuses.includes(rawStatus as typeof statuses[number])) throw new Error("Statut invalide.");

  const websiteRaw = field(formData, "website", 500);
  if (websiteRaw) {
    try { const url = new URL(websiteRaw); if (!["https:", "http:"].includes(url.protocol)) throw Error(); }
    catch { throw new Error("L’adresse du site web doit commencer par https:// ou http://."); }
  }
  const emailRaw = field(formData, "contact_email", 250);
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) throw new Error("Adresse e-mail invalide.");

  const payload = {
    establishment_name,
    establishment_type: rawType,
    relationship_status: rawStatus,
    city: nullable(field(formData, "city", 150)),
    department: nullable(field(formData, "department", 20)),
    postal_code: nullable(field(formData, "postal_code", 20)),
    address: nullable(field(formData, "address", 500)),
    website: nullable(websiteRaw),
    contact_name: nullable(field(formData, "contact_name", 200)),
    contact_role: nullable(field(formData, "contact_role", 200)),
    contact_email: nullable(emailRaw),
    contact_phone: nullable(field(formData, "contact_phone", 80)),
    specialties_needed: nullable(field(formData, "specialties_needed", 1000)),
    commercial_terms: nullable(field(formData, "commercial_terms", 5000)),
    notes: nullable(field(formData, "notes", 5000)),
    last_contact_at: validDate(field(formData, "last_contact_at", 10)),
    follow_up_at: validDate(field(formData, "follow_up_at", 10)),
  };
  const db = createAdminClient();
  if (id) {
    const { data, error } = await db.from("partner_establishments")
      .update(payload).eq("id", id).select("id").single();
    if (error || !data) throw new Error(error?.message ?? "Établissement introuvable.");
  } else {
    const { error } = await db.from("partner_establishments").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/partenaires");
  if (id) revalidatePath(`/admin/partenaires/${id}`);
  redirect("/admin/partenaires?saved=1");
}
