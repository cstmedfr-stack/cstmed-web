"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { updateJobsStatusesBulk } from "./bulk-offers-actions";

type BulkStatus = "published" | "rejected" | "archived" | "draft";
type SelectionContext = {
  selected: string[];
  toggle: (id: string) => void;
};
const SelectionContext = createContext<SelectionContext | null>(null);

const commands: { status: BulkStatus; label: string; color: string }[] = [
  { status: "published", label: "✓ Publier", color: "bg-[#118c87]" },
  { status: "rejected", label: "Refuser", color: "bg-red-700" },
  { status: "archived", label: "Archiver", color: "bg-slate-700" },
  { status: "draft", label: "Remettre en brouillon", color: "bg-amber-700" },
];

export function BulkOffersSelection({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));

  function toggle(id: string) {
    setMessage("");
    setSelected((previous) => previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id]);
  }

  function run(status: BulkStatus) {
    if (!selected.length || pending) return;
    const label = commands.find((item) => item.status === status)?.label ?? status;
    const note = status === "published"
      ? "Confirmez que vous avez vérifié individuellement les offres sélectionnées avant leur publication.\n\n"
      : "";
    if (!window.confirm(`${note}${label} : appliquer à ${selected.length} offre(s) ?`)) return;

    startTransition(async () => {
      const result = await updateJobsStatusesBulk(selected, status);
      setMessage(result.message);
      if (result.ok) setSelected([]);
      router.refresh();
    });
  }

  return (
    <SelectionContext.Provider value={{ selected, toggle }}>
      <div className="mt-7 rounded-2xl border border-[#b7dcd9] bg-[#effaf9] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-3 font-bold text-[#082a43]">
            <input type="checkbox" checked={allChecked}
              onChange={() => { setMessage(""); setSelected(allChecked ? [] : ids); }}
              disabled={pending} className="h-5 w-5 accent-[#118c87]" />
            Tout sélectionner (cette page : {ids.length})
          </label>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#082a43]">
            {selected.length} sélectionnée(s)
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {commands.map((cmd) => (
            <button key={cmd.status} type="button" disabled={!selected.length || pending}
              onClick={() => run(cmd.status)}
              className={`${cmd.color} rounded-full px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40`}
              style={{ color: "#ffffff" }}>
              {cmd.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Les actions concernent uniquement les offres cochées sur cette page. Vérifiez les offres avant de les publier.
        </p>
        {message ? <p role="status" className="mt-3 font-bold text-[#082a43]">{message}</p> : null}
      </div>
      {children}
    </SelectionContext.Provider>
  );
}

export function BulkOfferCheckbox({ id }: { id: string }) {
  const context = useContext(SelectionContext);
  if (!context) return null;
  return (
    <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
      <input type="checkbox" checked={context.selected.includes(id)}
        onChange={() => context.toggle(id)} className="h-5 w-5 accent-[#118c87]" />
      Sélectionner cette offre
    </label>
  );
}
