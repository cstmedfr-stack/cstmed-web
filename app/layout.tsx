import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://cstmed.fr"),
  title: {
    default: "CSTMed | Recrutement médical France–Europe",
    template: "%s | CSTMed",
  },
  description:
    "CSTMed accompagne les médecins européens et les établissements de santé français dans chaque étape du recrutement et de l’intégration.",
  keywords: [
    "recrutement médecins",
    "médecins roumains en France",
    "recrutement médical France",
    "emploi médecin France",
    "CSTMed",
  ],
  openGraph: {
    title: "CSTMed | Recrutement médical France–Europe",
    description:
      "Un accompagnement humain et personnalisé pour les médecins et les établissements de santé.",
    url: "https://cstmed.fr",
    siteName: "CSTMed",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}