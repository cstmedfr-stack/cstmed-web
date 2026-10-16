import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendProspectionCampaign } from "./actions";
import { saveProspectionReply } from "./reply-actions";

export const dynamic = "force-dynamic";
const DEFAULT_SUBJECT = "CSTMed – Accompagnement au recrutement de médecins spécialistes";
const DEFAULT_BODY = `Madame, Monsieur,

Je me permets de vous contacter afin de vous présenter CSTMed, un service spécialisé dans l’accompagnement au recrutement de médecins pour les établissements de santé en France.

Nous accompagnons notamment des médecins spécialistes formés en Roumanie et intéressés par des opportunités professionnelles en France.

Nous serions ravis de connaître les besoins actuels ou futurs de {{etablissement}} et d’envisager une éventuelle collaboration.

Je reste à votre disposition pour un premier échange.

Bien cordialement,
L’équipe CSTMed
https://www.cstmed.fr`;

type Partner = { id: string; establishment_name: string; city: string | null; contact_name: string | null; contact_email: string | null; relationship_status: string };
type SentRecord = { id: string; to_email: string; subject: string; status: string; error_message: string | null; created_at: string; partner_id: string };
type Campaign = { id: string; name: string; created_at: string };
type Reply = { id: string; partner_id: string; sender_email: string; received_at: string; reply_status: string; message_text: string; follow_up_at: string | null };
const replyStatusLabels: Record<string, string> = {
  interested: "Intéressé", follow_up: "À relancer", not_interested: "Pas intéressé", other: "Autre réponse",
};

export default async function ProspectionPage({ searchParams }: { searchParams: Promise<{ campaign?: string; reply_saved?: string }> }) {
  await requireAdmin();
  const db = createAdminClient();
  const params = await searchParams;
  const [partnersResult, campaignsResult, repliesResult] = await Promise.all([
    db.from("partner_establishments").select("id,establishment_name,city,contact_name,contact_email,relationship_status")
      .order("establishment_name").limit(500),
    db.from("prospection_campaigns").select("id,name,created_at").order("created_at", { ascending: false }).limit(10),
    db.from("prospection_replies").select("id,partner_id,sender_email,received_at,reply_status,message_text,follow_up_at")
      .order("received_at", { ascending: false }).limit(40),
  ]);
  const partners = (partnersResult.data ?? []) as Partner[];
  const campaigns = (campaignsResult.data ?? []) as Campaign[];
  const replies = (repliesResult.data ?? []) as Reply[];
  const campaignId = params.campaign && /^[a-f0-9-]{36}$/i.test(params.campaign) ? params.campaign : null;
  const emailsResult = campaignId ? await db.from("prospection_emails")
    .select("id,to_email,subject,status,error_message,created_at,partner_id")
    .eq("campaign_id", campaignId).order("created_at").limit(100) : null;
  const emails = (emailsResult?.data ?? []) as SentRecord[];
  const eligible = partners.filter(p => !!p.contact_email && !["rejected", "archived"].includes(p.relationship_status));
  const partnerNames = new Map(partners.map(p => [p.id, p.establishment_name]));
  const failure = partnersResult.error?.message || campaignsResult.error?.message || repliesResult.error?.message || emailsResult?.error?.message;

  return <main className="min-h-screen bg-[#f5f9fb] text-[#102435]">
    <header className="bg-gradient-to-r from-[#082a43] to-[#11696d] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-semibold text-[#8ce2da]">← Tableau de bord</Link>
        <h1 className="mt-3 text-3xl font-black">Prospection & E-mails</h1>
        <p className="mt-2 text-slate-200">Envoyer des e-mails personnalisés et enregistrer les réponses des établissements.</p>
      </div>
    </header>
    <div className="mx-auto max-w-6xl space-y-7 px-5 py-8">
      {failure && <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800">Erreur Supabase : {failure}</div>}
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
        <strong>Expéditeur : CSTMed &lt;contact@cstmed.fr&gt;.</strong> Les envois passent par Resend. Les réponses sont enregistrées manuellement depuis Gmail, sans synchronisation automatique.
      </div>

      <section id="reponses" className="space-y-5 rounded-[2rem] border border-teal-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black">Réponses reçues des établissements</h2>
        <p className="text-sm text-slate-600">Copiez uniquement le contenu professionnel utile depuis Gmail. Cette action n’envoie aucun e-mail.</p>
        {params.reply_saved === "1" && <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Réponse enregistrée avec succès.</div>}
        <form action={saveProspectionReply} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="reply_partner" className="block text-sm font-semibold">Établissement concerné</label>
            <select id="reply_partner" name="partner_id" required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
              <option value="" disabled>Choisir un établissement</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.establishment_name}{p.city ? ` — ${p.city}` : ""}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="reply_sender" className="block text-sm font-semibold">E-mail de l'expéditeur</label>
            <input id="reply_sender" type="email" name="sender_email" required maxLength={250} placeholder="rh@hopital.fr" className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
          </div>
          <div>
            <label htmlFor="reply_received" className="block text-sm font-semibold">Date et heure de réception</label>
            <input id="reply_received" type="datetime-local" name="received_at" required defaultValue={new Date().toLocaleString("sv-SE", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(" ", "T")} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
          </div>
          <div>
            <label htmlFor="reply_status" className="block text-sm font-semibold">Résultat de la réponse</label>
            <select id="reply_status" name="reply_status" required defaultValue="interested" className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
              <option value="interested">Intéressé</option>
              <option value="follow_up">À relancer</option>
              <option value="not_interested">Pas intéressé</option>
              <option value="other">Autre réponse</option>
            </select>
          </div>
          <div>
            <label htmlFor="reply_followup" className="block text-sm font-semibold">Date de relance (facultatif)</label>
            <input id="reply_followup" type="date" name="follow_up_at" className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="reply_message" className="block text-sm font-semibold">Réponse du correspondant / résumé</label>
            <textarea id="reply_message" name="message_text" required minLength={2} maxLength={10000} rows={5} placeholder="Contenu du message reçu ou résumé des échanges…" className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white hover:bg-[#0c7773]">Enregistrer la réponse</button>
          </div>
        </form>
        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-black">Dernières réponses enregistrées</h3>
          {replies.length === 0 ? <p className="mt-2 text-sm text-slate-500">Aucune réponse enregistrée.</p> : <div className="mt-3 space-y-3">
            {replies.map(r => <article key={r.id} className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/partenaires/${r.partner_id}`} className="font-black text-[#118c87] underline">{partnerNames.get(r.partner_id) ?? "Établissement"}</Link>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{replyStatusLabels[r.reply_status] ?? r.reply_status}</span>
              </div>
              <p className="mt-1 text-slate-500">{r.sender_email} · {new Date(r.received_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">{r.message_text}</p>
              {r.follow_up_at && <p className="mt-2 font-semibold text-amber-700">Relance : {new Date(`${r.follow_up_at}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</p>}
            </article>)}
          </div>}
        </div>
      </section>

      <form action={sendProspectionCampaign} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black">Nouvelle campagne</h2>
        <div><label htmlFor="name" className="block text-sm font-semibold">Nom interne de campagne</label>
          <input id="name" name="name" required minLength={2} maxLength={180} defaultValue="Présentation CSTMed – Hôpitaux" className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></div>
        <div><label htmlFor="subject" className="block text-sm font-semibold">Objet de l'e-mail</label>
          <input id="subject" name="subject" required maxLength={300} defaultValue={DEFAULT_SUBJECT} className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></div>
        <div><label htmlFor="body" className="block text-sm font-semibold">Message en français</label>
          <textarea id="body" name="body" required minLength={10} maxLength={10000} rows={13} defaultValue={DEFAULT_BODY} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
          <p className="mt-2 text-xs text-slate-600">Variables possibles : {"{{etablissement}}"} et {"{{contact}}"}. Le texte final sera enregistré pour chaque destinataire.</p>
        </div>
        <div>
          <h3 className="font-black">Destinataires ({eligible.length} éligibles)</h3>
          <p className="mt-1 text-sm text-slate-600">Sélectionnez 1 à 20 établissements par envoi. Vérifiez l'adresse et la pertinence de chaque contact professionnel.</p>
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
            {eligible.length === 0 && <p className="text-sm text-slate-500">Ajoutez d'abord des partenaires avec une adresse e-mail dans <Link className="underline" href="/admin/partenaires">Établissements partenaires</Link>.</p>}
            {eligible.map(p => <label key={p.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50">
              <input name="partner_ids" value={p.id} type="checkbox" className="mt-1 h-4 w-4" />
              <span className="text-sm"><strong>{p.establishment_name}</strong>{p.city ? ` — ${p.city}` : ""}<span className="block text-slate-600">{p.contact_name ? `${p.contact_name} · ` : ""}{p.contact_email}</span></span>
            </label>)}
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <input type="checkbox" name="confirmed" value="yes" required className="mt-1 h-4 w-4" />
          <span>Je confirme avoir vérifié les destinataires, le contenu, la pertinence de la prospection B2B et avoir prévu un moyen simple de s'opposer aux futurs messages.</span>
        </label>
        <button type="submit" className="rounded-full bg-[#118c87] px-6 py-3 font-bold text-white hover:bg-[#0c7773]">Confirmer et envoyer (20 max.)</button>
        <p className="text-xs text-slate-500">Attention : le bouton déclenche réellement l'envoi. Pour tester, sélectionnez d'abord uniquement votre propre adresse enregistrée comme partenaire de test.</p>
      </form>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black">Historique des campagnes</h2>
        {campaigns.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aucune campagne envoyée.</p> : <div className="mt-4 space-y-2">{campaigns.map(c => <Link key={c.id} href={`/admin/prospection?campaign=${c.id}`} className="block rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><strong>{c.name}</strong><span className="ml-2 text-xs text-slate-500">{new Date(c.created_at).toLocaleString("fr-FR")}</span></Link>)}</div>}
        {campaignId && <div className="mt-6"><h3 className="font-black">Messages de la campagne sélectionnée</h3>
          <div className="mt-3 space-y-2">{emails.map(e => <div key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm"><Link className="font-semibold text-[#118c87] underline" href={`/admin/partenaires/${e.partner_id}`}>{e.to_email}</Link> · <strong>{e.status}</strong><p className="text-slate-600">{e.subject}</p>{e.error_message && <p className="text-red-700">{e.error_message}</p>}</div>)}</div>
        </div>}
      </section>
    </div>
  </main>;
}
