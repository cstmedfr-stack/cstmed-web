"use client";

import type { MouseEvent } from "react";

export function ConfirmDeleteButton({message,label = "Supprimer"}: {message: string; label?: string}) {
  function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }
  return <button type="submit" onClick={confirmDelete}
    className="rounded-full border border-red-300 bg-red-50 px-5 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
    {label}
  </button>;
}
