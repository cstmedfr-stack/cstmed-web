"use client";

import {
  useState,
  type ChangeEvent,
} from "react";

import type { Locale } from "@/lib/i18n/config";

type CvFileInputProps = {
  locale: Locale;
  label: string;
  help: string;
};

export function CvFileInput({
  locale,
  label,
  help,
}: CvFileInputProps) {
  const [fileName, setFileName] =
    useState("");

  const content =
    locale === "ro"
      ? {
          choose: "Alege fișierul",
          empty:
            "Nu ai ales niciun fișier",
        }
      : {
          choose:
            "Choisir le fichier",
          empty:
            "Aucun fichier sélectionné",
        };

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    setFileName(
      file?.name ?? "",
    );
  }

  return (
    <div>
      <label
        htmlFor="cv"
        className="block text-sm font-bold text-[#082a43]"
      >
        {label} *
      </label>

      <div className="mt-2 rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-[#f8fbfc] p-5 transition hover:border-[#118c87]/60">
        <input
          id="cv"
          name="cv"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={
            handleChange
          }
          className="sr-only"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor="cv"
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-[#118c87] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0c7773]"
          >
            {content.choose}
          </label>

          <p className="min-w-0 text-sm text-slate-600">
            {fileName ? (
              <span className="font-bold text-[#082a43]">
                {fileName}
              </span>
            ) : (
              content.empty
            )}
          </p>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {help}
        </p>
      </div>
    </div>
  );
}