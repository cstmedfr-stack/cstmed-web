"use client";

import { useFormStatus } from "react-dom";

type SubmitApplicationButtonProps = {
  label: string;
  pendingLabel: string;
};

export function SubmitApplicationButton({
  label,
  pendingLabel,
}: SubmitApplicationButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#118c87] px-8 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#0c7773] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}