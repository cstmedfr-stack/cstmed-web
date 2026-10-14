import Link from "next/link";
import { savePartner } from "./actions";

export type Partner = {
  id: string;
  establishment_name: string;
  establishment_type: string;
  city: string | null;
  department: string | null;
  postal_code: string | null;
  address: string | null;
  website: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  specialties_needed: string | null;
  relationship_status: string;
  commercial_terms: string | null;
  notes: string | null;
  last_contact_at: string | null;
  follow_up_at: string | null;
};

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[#082a43] focus:border-[#118c87] focus:outline-none";
const types = [
  ["hospital", "Hôpital"], ["clinic", "Clinique"], ["health_center", "Centre de santé"],
  ["ehpad", "EHPAD"], ["medical_practice", "Cabinet médical"], ["other", "Autre"],
];
export const statuses = [
  ["prospect", "À contacter"], ["contacted", "Contacté"], ["negotiation", "En négociation"],
  ["signed", "Partenaire signé"], ["rejected", "Refusé"], ["archived", "Archivé"],
];

export function PartnerForm({ partner }: { partner?: Partner }) {
  const input = (name: keyof Partner, label: string, type = "text") => (
    <label className="block text-sm font-bold text-[#082a43]" key={name}>
      {label}
      <input name={name} type={type} defaultValue={partner?.[name] ?? ""} className={fieldClass} />
    </label>
  );
  const textArea = (name: keyof Partner, label: string) => (
    <label className="block text-sm font-bold text-[#082a43]" key={name}>
      {label}
      <textarea name={name} rows={3} defaultValue={partner?.[name] ?? ""} className={fieldClass} />
    </label>
  );
  return (
    <form action={savePartner} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <input type="hidden" name="id" value={partner?.id ?? ""} />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-bold text-[#082a43] md:col-span-2">
          Nom de l’établissement *
          <input name="establishment_name" required minLength={2} maxLength={250} defaultValue={partner?.establishment_name ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-bold text-[#082a43]">Type d’établissement
          <select name="establishment_type" defaultValue={partner?.establishment_type ?? "hospital"} className={fieldClass}>
            {types.map(([value,label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-bold text-[#082a43]">Statut de la relation
          <select name="relationship_status" defaultValue={partner?.relationship_status ?? "prospect"} className={fieldClass}>
            {statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        {input("city", "Ville")}{input("department", "Département")}
        {input("postal_code", "Code postal")}{input("address", "Adresse")}
        {input("website", "Site web", "url")}{input("contact_name", "Personne de contact")}
        {input("contact_role", "Fonction du contact")}{input("contact_email", "E-mail", "email")}
        {input("contact_phone", "Téléphone", "tel")}{input("specialties_needed", "Spécialités recherchées")}
        {input("last_contact_at", "Dernier contact", "date")}{input("follow_up_at", "Prochaine relance", "date")}
      </div>
      {textArea("commercial_terms", "Conditions commerciales (confidentielles)")}
      {textArea("notes", "Notes internes")}
      <div className="flex flex-wrap gap-3">
        <button type="submit" style={{color:"#ffffff"}} className="rounded-full bg-[#118c87] px-7 py-3 font-bold hover:bg-[#0c7773]">Enregistrer</button>
        <Link href="/admin/partenaires" className="rounded-full border border-slate-300 px-7 py-3 font-bold text-[#082a43]">Annuler</Link>
      </div>
    </form>
  );
}
