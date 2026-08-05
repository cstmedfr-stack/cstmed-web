import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import {
  isLocale,
  locales,
} from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({
    lang,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return children;
}