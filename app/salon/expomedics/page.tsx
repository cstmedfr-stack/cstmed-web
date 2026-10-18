import Link from "next/link";
import Image from "next/image";
import { registerSalonContact } from "./actions";
import { SalonProfessionalFields } from "./professional-fields";
export const dynamic = "force-dynamic";
const words = {
  ro:{ title:"Înscriere rapidă – ExpoMedics", intro:"Lasă-ne datele tale și te contactăm pentru oportunități profesionale în Franța. CV-ul nu este necesar acum.", firstname:"Prenume", lastname:"Nume", email:"E-mail",phone:"Telefon / WhatsApp",profession:"Profesia",specialty:"Specialitate (opțional)",city:"Oraș (opțional)",level:"Nivelul de franceză",select:"Alege",consent:"Solicit CSTMed să mă contacteze în legătură cu înregistrarea mea la ExpoMedics și confirm că am citit politica de confidențialitate.",pool:"Opțional: sunt de acord să fiu contactat(ă) și pentru alte oportunități profesionale viitoare.",submit:"Trimite datele",privacy:"Politica de confidențialitate",error:"Verifică datele obligatorii sau încearcă mai târziu.", professions:["Medic specialist","Medic primar","Medic rezident","Medic fără specializare","Medic dentist","Farmacist","Asistent medical","Altă profesie medicală"],grade:"Statut profesional",residentYear:"Anul de rezidențiat",availability:"Când dorești să începi să lucrezi în Franța?",availabilityOptions:["Cât mai curând posibil","În 3–6 luni","În 6–12 luni","În 1–2 ani","Peste 2 ani","Nu m-am hotărât încă"]},
  fr:{ title:"Inscription rapide – ExpoMedics", intro:"Laissez vos coordonnées pour échanger sur les opportunités professionnelles en France. Aucun CV nécessaire pour le moment.",firstname:"Prénom",lastname:"Nom",email:"E-mail",phone:"Téléphone / WhatsApp",profession:"Profession",specialty:"Spécialité (facultatif)",city:"Ville (facultatif)",level:"Niveau de français",select:"Choisir",consent:"Je demande à CSTMed de me contacter au sujet de mon inscription à ExpoMedics et confirme avoir lu la politique de confidentialité.",pool:"Facultatif : j'accepte d'être contacté(e) pour d'autres opportunités professionnelles futures.",submit:"Envoyer",privacy:"Politique de confidentialité",error:"Veuillez vérifier les champs requis ou réessayer plus tard.", professions:["Médecin spécialiste","Médecin senior (praticien confirmé)","Médecin résident (en formation)","Médecin sans spécialisation","Chirurgien-dentiste","Pharmacien","Infirmier","Autre profession de santé"],grade:"Statut professionnel",residentYear:"Année de résidence / internat",availability:"Quand souhaitez-vous commencer à travailler en France ?",availabilityOptions:["Dès que possible","Dans 3 à 6 mois","Dans 6 à 12 mois","Dans 1 à 2 ans","Dans plus de 2 ans","Je ne sais pas encore"]},
  en:{ title:"Quick registration – ExpoMedics", intro:"Leave your details to discuss healthcare career opportunities in France. No CV is required at this stage.",firstname:"First name",lastname:"Last name",email:"Email",phone:"Phone / WhatsApp",profession:"Profession",specialty:"Specialty (optional)",city:"City (optional)",level:"French level",select:"Choose",consent:"I ask CSTMed to contact me about my ExpoMedics registration and confirm that I have read the privacy policy.",pool:"Optional: I agree to be contacted about other future career opportunities.",submit:"Submit",privacy:"Privacy policy",error:"Check the required details or try again later.", professions:["Specialist physician","Senior physician","Resident physician (in training)","Physician without specialization","Dentist","Pharmacist","Nurse","Other healthcare profession"],grade:"Professional status",residentYear:"Year of residency",availability:"When would you like to start working in France?",availabilityOptions:["As soon as possible","In 3–6 months","In 6–12 months","In 1–2 years","In more than 2 years","Not sure yet"]}
} as const;
type Lang = keyof typeof words;
export default async function SalonPage({searchParams}:{searchParams:Promise<{lang?:string;error?:string}>}){
  const query=await searchParams;
  const lang:Lang = query.lang === "en" || query.lang === "fr" ? query.lang : "ro";
  const t=words[lang];
  const field="mt-1 w-full min-h-12 rounded-xl border border-slate-300 bg-white p-3 text-[#102435]";
  return <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
    <header className="bg-white border-b border-slate-200"><div className="mx-auto max-w-xl px-5 py-4 flex justify-between items-center gap-3">
      <Link href="/ro"><Image src="/images/cstmed-logo.png" alt="CSTMed" width={150} height={50}/></Link>
      <nav aria-label="Language" className="flex gap-1">{(["ro","fr","en"] as const).map(l=><Link key={l} href={`/salon/expomedics?lang=${l}`} className={`rounded-lg px-3 py-2 text-sm font-bold ${l===lang?"bg-[#082a43] text-white":"bg-slate-100 text-[#082a43]"}`} style={l===lang?{color:"#ffffff"}:undefined}>{l.toUpperCase()}</Link>)}</nav>
    </div></header>
    <section className="bg-[#082a43] px-5 py-8 text-white"><div className="mx-auto max-w-xl"><p className="font-bold text-[#65d9ce]">CSTMed • ExpoMedics</p><h1 className="mt-2 text-3xl font-black">{t.title}</h1><p className="mt-3 leading-7 text-slate-200">{t.intro}</p></div></section>
    <div className="mx-auto max-w-xl px-5 py-7">
      {query.error ? <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{t.error}</p>:null}
      <form action={registerSalonContact} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <input type="hidden" name="lang" value={lang}/><div className="absolute left-[-10000px]" aria-hidden="true"><input name="website" type="text" tabIndex={-1} autoComplete="off"/></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">{t.firstname} *<input name="firstName" required maxLength={100} autoComplete="given-name" className={field}/></label>
          <label className="text-sm font-bold">{t.lastname} *<input name="lastName" required maxLength={100} autoComplete="family-name" className={field}/></label>
        </div>
        <label className="block text-sm font-bold">{t.email} *<input type="email" name="email" required maxLength={254} autoComplete="email" className={field}/></label>
        <label className="block text-sm font-bold">{t.phone} *<input type="tel" name="phone" required maxLength={50} autoComplete="tel" className={field}/></label>
        <SalonProfessionalFields lang={lang} labels={{ profession:t.profession,specialty:t.specialty,select:t.select,residentYear:t.residentYear,availability:t.availability,professions:[...t.professions],availabilityOptions:[...t.availabilityOptions] }} fieldClass={field} />
        <label className="block text-sm font-bold">{t.city}<input name="city" maxLength={120} autoComplete="address-level2" className={field}/></label>
        <label className="block text-sm font-bold">{t.level}<select name="frenchLevel" className={field} defaultValue=""><option value="">{t.select}</option>{["none","a1","a2","b1","b2","c1","c2","native"].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select></label>
        <div className="rounded-xl bg-slate-50 p-4 space-y-4">
          <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="consent" required className="mt-1"/><span>{t.consent} * <Link className="underline font-semibold" href={`/${lang==="en"?"fr":lang}/confidentialite`} target="_blank">{t.privacy} ↗</Link></span></label>
          <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="talentPoolConsent" className="mt-1"/><span>{t.pool}</span></label>
        </div>
        <button type="submit" className="w-full min-h-12 rounded-full bg-[#118c87] px-5 py-3 font-black text-white" style={{color:"#ffffff"}}>{t.submit}</button>
      </form>
    </div>
  </main>;
}
