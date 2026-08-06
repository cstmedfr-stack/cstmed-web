import { updateEstablishmentRequestStatus } from "./actions";

export type EstablishmentRequestStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "proposal"
  | "signed"
  | "rejected"
  | "archived";

type RequestStatusActionsProps = {
  requestId: string;
  status: EstablishmentRequestStatus;
};

type StatusButtonProps = {
  requestId: string;
  status: EstablishmentRequestStatus;
  label: string;
  className: string;
};

function StatusButton({
  requestId,
  status,
  label,
  className,
}: StatusButtonProps) {
  return (
    <form action={updateEstablishmentRequestStatus}>
      <input type="hidden" name="requestId" value={requestId} />
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

export function RequestStatusActions({
  requestId,
  status,
}: RequestStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "new" ? (
        <StatusButton
          requestId={requestId}
          status="new"
          label="Nouvelle"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
        />
      ) : null}

      {status !== "reviewing" ? (
        <StatusButton
          requestId={requestId}
          status="reviewing"
          label="À étudier"
          className="bg-amber-100 text-amber-800 hover:bg-amber-200"
        />
      ) : null}

      {status !== "contacted" ? (
        <StatusButton
          requestId={requestId}
          status="contacted"
          label="Contactée"
          className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
        />
      ) : null}

      {status !== "proposal" ? (
        <StatusButton
          requestId={requestId}
          status="proposal"
          label="Proposition"
          className="bg-violet-100 text-violet-800 hover:bg-violet-200"
        />
      ) : null}

      {status !== "signed" ? (
        <StatusButton
          requestId={requestId}
          status="signed"
          label="Signée"
          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
        />
      ) : null}

      {status !== "rejected" ? (
        <StatusButton
          requestId={requestId}
          status="rejected"
          label="Refusée"
          className="bg-red-50 text-red-700 hover:bg-red-100"
        />
      ) : null}

      {status !== "archived" ? (
        <StatusButton
          requestId={requestId}
          status="archived"
          label="Archiver"
          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
        />
      ) : null}
    </div>
  );
}