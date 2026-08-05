import { updateApplicationStatus } from "./actions";

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "interview"
  | "accepted"
  | "rejected"
  | "archived";

type ApplicationStatusActionsProps = {
  applicationId: string;
  status: ApplicationStatus;
};

type StatusButtonProps = {
  applicationId: string;
  status: ApplicationStatus;
  label: string;
  className: string;
};

function StatusButton({
  applicationId,
  status,
  label,
  className,
}: StatusButtonProps) {
  return (
    <form action={updateApplicationStatus}>
      <input
        type="hidden"
        name="applicationId"
        value={applicationId}
      />

      <input
        type="hidden"
        name="status"
        value={status}
      />

      <button
        type="submit"
        className={`rounded-full px-4 py-2 text-xs font-bold transition ${className}`}
      >
        {label}
      </button>
    </form>
  );
}

export function ApplicationStatusActions({
  applicationId,
  status,
}: ApplicationStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "new" ? (
        <StatusButton
          applicationId={applicationId}
          status="new"
          label="Nouvelle"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
        />
      ) : null}

      {status !== "reviewing" ? (
        <StatusButton
          applicationId={applicationId}
          status="reviewing"
          label="À étudier"
          className="bg-amber-100 text-amber-800 hover:bg-amber-200"
        />
      ) : null}

      {status !== "contacted" ? (
        <StatusButton
          applicationId={applicationId}
          status="contacted"
          label="Contactée"
          className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
        />
      ) : null}

      {status !== "interview" ? (
        <StatusButton
          applicationId={applicationId}
          status="interview"
          label="Entretien"
          className="bg-violet-100 text-violet-800 hover:bg-violet-200"
        />
      ) : null}

      {status !== "accepted" ? (
        <StatusButton
          applicationId={applicationId}
          status="accepted"
          label="Acceptée"
          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
        />
      ) : null}

      {status !== "rejected" ? (
        <StatusButton
          applicationId={applicationId}
          status="rejected"
          label="Refusée"
          className="bg-red-50 text-red-700 hover:bg-red-100"
        />
      ) : null}

      {status !== "archived" ? (
        <StatusButton
          applicationId={applicationId}
          status="archived"
          label="Archiver"
          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
        />
      ) : null}
    </div>
  );
}