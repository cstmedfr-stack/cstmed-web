import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

import { isLocale } from "@/lib/i18n/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://cstmed.fr",
  ),

  applicationName: "CSTMed",

  title: {
    default:
      "CSTMed | Recrutement médical France–Europe",

    template: "%s | CSTMed",
  },

  description:
    "CSTMed accompagne les médecins européens et les établissements de santé français.",

  authors: [
    {
      name: "CSTMed",
    },
  ],

  creator: "CSTMed",
  publisher: "CSTMed",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    siteName: "CSTMed",
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const requestHeaders = await headers();
  const requestedLocale =
    requestHeaders.get("x-cstmed-locale") ?? undefined;

  const documentLocale = isLocale(requestedLocale)
    ? requestedLocale
    : "fr";

  return (
    <html
      lang={documentLocale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}