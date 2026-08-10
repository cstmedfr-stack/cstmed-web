import Link from "next/link";

import { updateJobStatus } from "./actions";

type JobStatus =
  | "draft"
  | "published"
  | "rejected"
  | "archived";

type JobStatusActionsProps = {
  jobId: string;
  status: JobStatus;
};

type StatusButtonProps = {
  jobId: string;
  status: JobStatus;
  label: string;
  className: string;
  textColor: string;
};

function StatusButton({
  jobId,
  status,
  label,
  className,
  textColor,
}: StatusButtonProps) {
  return (
    <form action={updateJobStatus}>
      <input
        type="hidden"
        name="jobId"
        value={jobId}
      />

      <input
        type="hidden"
        name="status"
        value={status}
      />

      <button
        type="submit"
        className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-black transition ${className}`}
      >
        <span
          style={{
            color: textColor,
          }}
        >
          {label}
        </span>
      </button>
    </form>
  );
}

export function JobStatusActions({
  jobId,
  status,
}: JobStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {/* EDITARE */}
      <Link
        href={`/admin/offres/${jobId}`}
        className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#0D6EFD] px-4 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B63E5]"
      >
        <span
          style={{
            color: "#082A43",
          }}
        >
          ✏️ Vérifier / modifier
        </span>
      </Link>

      {/* PUBLICARE */}
      {status !== "published" ? (
        <StatusButton
          jobId={jobId}
          status="published"
          label="✓ Publier"
          className="bg-[#118c87] hover:bg-[#0c7773]"
          textColor="#ffffff"
        />
      ) : null}

      {/* VEZI OFERTA PUBLICĂ */}
      {status === "published" ? (
        <Link
          href={`/fr/offres/${jobId}`}
          target="_blank"
          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#118c87] bg-white px-4 py-2 text-xs font-black transition hover:bg-[#e5f7f5]"
        >
          <span
            style={{
              color: "#0c7773",
            }}
          >
            Voir sur le site ↗
          </span>
        </Link>
      ) : null}

      {/* REVENIRE ÎN BROUILLON */}
      {status !== "draft" ? (
        <StatusButton
          jobId={jobId}
          status="draft"
          label="Brouillon"
          className="bg-amber-100 hover:bg-amber-200"
          textColor="#92400e"
        />
      ) : null}

      {/* REFUZ */}
      {status !== "rejected" ? (
        <StatusButton
          jobId={jobId}
          status="rejected"
          label="Refuser"
          className="bg-red-100 hover:bg-red-200"
          textColor="#b91c1c"
        />
      ) : null}

      {/* ARHIVARE */}
      {status !== "archived" ? (
        <StatusButton
          jobId={jobId}
          status="archived"
          label="Archiver"
          className="bg-slate-200 hover:bg-slate-300"
          textColor="#334155"
        />
      ) : null}
    </div>
  );
}