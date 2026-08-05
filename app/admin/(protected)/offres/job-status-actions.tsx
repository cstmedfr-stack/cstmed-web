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
};

function StatusButton({
  jobId,
  status,
  label,
  className,
}: StatusButtonProps) {
  return (
    <form action={updateJobStatus}>
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="status" value={status} />

      <button
        type="submit"
        className={`rounded-full px-4 py-2 text-xs font-bold transition ${className}`}
      >
        {label}
      </button>
    </form>
  );
}

export function JobStatusActions({
  jobId,
  status,
}: JobStatusActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
        <Link
  href={`/admin/offres/${jobId}`}
  className="rounded-full border border-[#118c87] px-4 py-2 text-xs font-bold text-[#118c87] transition hover:bg-[#e5f7f5]"
>
  Vérifier / modifier
</Link>
      {status !== "published" ? (
        <StatusButton
          jobId={jobId}
          status="published"
          label="Publier"
          className="bg-[#118c87] text-white hover:bg-[#0c7773]"
        />
      ) : (
        <Link
          href={`/offres/${jobId}`}
          target="_blank"
          className="rounded-full bg-[#e5f7f5] px-4 py-2 text-xs font-bold text-[#0c7773] transition hover:bg-[#ccefeb]"
        >
          Voir sur le site
        </Link>
      )}

      {status !== "draft" ? (
        <StatusButton
          jobId={jobId}
          status="draft"
          label="Brouillon"
          className="bg-amber-100 text-amber-800 hover:bg-amber-200"
        />
      ) : null}

      {status !== "rejected" ? (
        <StatusButton
          jobId={jobId}
          status="rejected"
          label="Refuser"
          className="bg-red-50 text-red-700 hover:bg-red-100"
        />
      ) : null}

      {status !== "archived" ? (
        <StatusButton
          jobId={jobId}
          status="archived"
          label="Archiver"
          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
        />
      ) : null}
    </div>
  );
}