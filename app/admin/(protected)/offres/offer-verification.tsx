"use client";

import { useState } from "react";
import Link from "next/link";

type Offer = { id: string; title: string; reference: string; status: string };
type Result = { id: string; state: "active" | "unavailable" | "unknown"; note: string };

export function OfferVerification({ offers }: { offers: Offer[] }) {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [message, setMessage] = useState("");

  async function verify() {
    setRunning(true);
    setMessage("");
    setDone(0);
    setResults({});
    const accumulated: Record<string, Result> = {};
    try {
      // Small batches prevent excessively long requests and reduce API pressure.
      for (let start = 0; start < offers.length; start += 5) {
        const ids = offers.slice(start, start + 5).map((offer) => offer.id);
        const response = await fetch("/api/admin/verify-france-travail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.results)) {
          throw new Error(data.error || "La vérification a échoué.");
        }
        for (const result of data.results as Result[]) accumulated[result.id] = result;
        setResults({ ...accumulated });
        setDone(Math.min(start + ids.length, offers.length));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setRunning(false);
    }
  }

  const values = Object.values(results);
  const unavailableCount = values.filter((r) => r.state === "unavailable").length;
  return (
    <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Vérification France Travail">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-[#082a43]">Vérification France Travail</h3>
          <p className="text-sm text-slate-600">Contrôle les {offers.length} offres de cette page uniquement. Aucun archivage automatique.</p>
        </div>
        <button type="button" onClick={verify} disabled={running}
          style={{ color: "#ffffff" }}
          className="rounded-full bg-[#118c87] px-5 py-3 text-sm font-bold text-white hover:bg-[#0c7773] disabled:opacity-60">
          {running ? `Vérification ${done}/${offers.length}…` : "Vérifier les offres de cette page"}
        </button>
      </div>
      {message ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{message}</p> : null}
      {values.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">{values.filter(r => r.state === "active").length} actives · {unavailableCount} introuvables · {values.filter(r => r.state === "unknown").length} indéterminées</p>
          {offers.filter(offer => !!results[offer.id]).map(offer => {
            const result = results[offer.id];
            const label = result.state === "active" ? "Active" : result.state === "unavailable" ? "Introuvable / à confirmer" : "Indéterminée";
            const className = result.state === "active" ? "text-emerald-800 bg-emerald-50" : result.state === "unavailable" ? "text-amber-900 bg-amber-50" : "text-slate-700 bg-slate-100";
            return <div key={offer.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1"><p className="font-semibold text-[#082a43]">{offer.title}</p><p className="text-xs text-slate-500">{offer.reference}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`} title={result.note}>{label}</span>
              <Link href={`/admin/offres/${offer.id}`} className="font-bold text-[#0c7773]">Examiner →</Link>
            </div>;
          })}
          {unavailableCount > 0 ? <p className="text-sm text-amber-900">« Introuvable » ne prouve pas définitivement que le recrutement est clos. Vérifiez l'établissement ou l'annonce d'origine avant d'archiver.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
