import { en } from "@/i18n/dictionaries/en";
import { ru } from "@/i18n/dictionaries/ru";
import type { Dictionary, Locale, TranslateFn } from "@/i18n/i18n.types";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ru,
};

function lookup(dict: Dictionary, key: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return dict[key as keyof Dictionary];
  }
  return undefined;
}

export function createTranslate(locale: Locale): TranslateFn {
  return (key: string) => {
    const localized = lookup(dictionaries[locale], key);
    if (localized !== undefined) return localized;

    const fallback = lookup(dictionaries.en, key);
    if (fallback !== undefined) return fallback;

    return key;
  };
}

export function orderStatusTranslationKey(status: string | null | undefined): string {
  const key = (status ?? "new").toLowerCase().replace(/-/g, "_");
  return `orderStatus.${key}`;
}
