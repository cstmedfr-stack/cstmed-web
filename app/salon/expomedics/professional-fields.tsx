"use client";

import { useState } from "react";

type Language = "ro" | "fr" | "en";
type Labels = { profession: string; specialty: string; select: string; residentYear: string; availability: string; professions: string[]; availabilityOptions: string[] };
const values = ["medecins:specialist","medecins:senior","medecins:resident","medecins:unspecialized","dentistes:","pharmaciens:","infirmiers:","autres:"];
const availabilityValues = ["asap","3_6_months","6_12_months","1_2_years","over_2_years","undecided"];
export function SalonProfessionalFields({ lang: _lang, labels, fieldClass }: {lang:Language;labels:Labels;fieldClass:string}) {
  const [selection, setSelection] = useState("");
  const [profession, grade] = selection.split(":");
  return <>
    <label className="block text-sm font-bold">{labels.profession} *
      <select required value={selection} onChange={e=>setSelection(e.target.value)} className={fieldClass}>
        <option value="" disabled>{labels.select}</option>
        {values.map((v,i)=><option key={v} value={v}>{labels.professions[i]}</option>)}
      </select>
    </label>
    <input type="hidden" name="profession" value={profession || ""}/>
    <input type="hidden" name="medicalGrade" value={grade || ""}/>
    <label className="block text-sm font-bold">{labels.specialty}
      <input name="specialty" maxLength={150} className={fieldClass}/>
    </label>
    {grade === "resident" && <label className="block text-sm font-bold">{labels.residentYear} *
      <select name="residencyYear" required defaultValue="" className={fieldClass}>
        <option value="" disabled>{labels.select}</option>
        {Array.from({length:7},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}
      </select>
    </label>}
    <label className="block text-sm font-bold">{labels.availability} *
      <select name="availability" required defaultValue="" className={fieldClass}>
        <option value="" disabled>{labels.select}</option>
        {availabilityValues.map((value,i)=><option key={value} value={value}>{labels.availabilityOptions[i]}</option>)}
      </select>
    </label>
  </>;
}
