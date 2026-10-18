import Link from "next/link";
export default async function SalonThanks({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const {lang}=await searchParams;
 const l=lang==="en"?"en":lang==="fr"?"fr":"ro";
 const text=l==="en"?["Thank you!","Your details have been received. CSTMed will contact you.","Back"]:l==="fr"?["Merci !","Vos coordonnées ont bien été reçues. CSTMed vous contactera.","Retour"]:["Mulțumim!","Datele tale au fost înregistrate. CSTMed te va contacta.","Înapoi"];
 return <main className="min-h-screen bg-[#f5f9fb] flex items-center justify-center p-6 text-[#082a43]"><section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow"><p className="text-5xl">✓</p><h1 className="mt-4 text-3xl font-black">{text[0]}</h1><p className="mt-4">{text[1]}</p><Link href={`/salon/expomedics?lang=${l}`} className="mt-6 inline-block rounded-full bg-[#118c87] px-6 py-3 font-bold text-white" style={{color:"#fff"}}>{text[2]}</Link></section></main>;
}
