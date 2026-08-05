export const locales = ["ro", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ro";

export const localeCookieName = "cstmed_locale";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}