import type { Locale } from "./config";
import { fr } from "./dictionaries/fr";
import { ro } from "./dictionaries/ro";

const dictionaries = {
  fr,
  ro,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type { Dictionary } from "./dictionaries/fr";