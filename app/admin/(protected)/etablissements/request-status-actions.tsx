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
  textColor: string;
};

function StatusButton({
  requestId,
  status,
  label,
  className,
  textColor,
}: StatusButtonProps) {
  return (
    <form action={updateEstablishmentRequestStatus}>
      <input
        type="hidden"
        name="requestId"
        value={requestId}
      />

      <input
        type="hidden"
        name="status"
        value={status}
      />

      <button
        type="submit"
        className={`min-h-[42px] rounded-full px-4 py-2 text-xs font-black transition hover:-translate-y-0.5 ${className}`}
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

export function RequestStatusActions({
  requestId,
  status,
}: RequestStatusActionsProps) {
  return (
    <div className="space-y-5">
      {/* FLUX PRINCIPAL */}
      <div>
        <p
          className="mb-3 text-xs font-black uppercase tracking-[0.12em]"
          style={{
            color: "#65d9ce",
          }}
        >
          Étape de la demande
        </p>

        <div className="flex flex-wrap gap-2">
          {status !== "new" ? (
            <StatusButton
              requestId={requestId}
              status="new"
              label="Nouvelle"
              className="bg-blue-100 hover:bg-blue-200"
              textColor="#1d4ed8"
            />
          ) : null}

          {status !== "reviewing" ? (
            <StatusButton
              requestId={requestId}
              status="reviewing"
              label="À étudier"
              className="bg-amber-100 hover:bg-amber-200"
              textColor="#92400e"
            />
          ) : null}

          {status !== "contacted" ? (
            <StatusButton
              requestId={requestId}
              status="contacted"
              label="Contactée"
              className="bg-cyan-100 hover:bg-cyan-200"
              textColor="#155e75"
            />
          ) : null}

          {status !== "proposal" ? (
            <StatusButton
              requestId={requestId}
              status="proposal"
              label="Proposition"
              className="bg-violet-100 hover:bg-violet-200"
              textColor="#6d28d9"
            />
          ) : null}

          {status !== "signed" ? (
            <StatusButton
              requestId={requestId}
              status="signed"
              label="✓ Signée"
              className="bg-emerald-500 shadow-sm hover:bg-emerald-600"
              textColor="#ffffff"
            />
          ) : null}
        </div>
      </div>

      {/* ACTIONS SECONDAIRES */}
      <div className="border-t border-white/10 pt-5">
        <p
          className="mb-3 text-xs font-black uppercase tracking-[0.12em]"
          style={{
            color: "#94a3b8",
          }}
        >
          Autres actions
        </p>

        <div className="flex flex-wrap gap-2">
          {status !== "rejected" ? (
            <StatusButton
              requestId={requestId}
              status="rejected"
              label="Refusée"
              className="bg-red-100 hover:bg-red-200"
              textColor="#b91c1c"
            />
          ) : null}

          {status !== "archived" ? (
            <StatusButton
              requestId={requestId}
              status="archived"
              label="Archiver"
              className="bg-slate-200 hover:bg-slate-300"
              textColor="#334155"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}