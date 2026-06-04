import { de } from "@/i18n/public/dictionaries/de";
import { en } from "@/i18n/public/dictionaries/en";
import type { PublicLocale, PublicTranslateFn } from "@/i18n/public/public-i18n.types";

const dictionaries = { de, en } as const;

function lookup(dict: Record<string, string>, key: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return dict[key];
  }
  return undefined;
}

export function createPublicTranslate(locale: PublicLocale): PublicTranslateFn {
  return (key: string) => {
    const localized = lookup(dictionaries[locale], key);
    if (localized !== undefined) return localized;

    const fallback = lookup(dictionaries.en, key);
    if (fallback !== undefined) return fallback;

    return key;
  };
}
