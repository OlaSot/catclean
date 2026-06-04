export const PUBLIC_LOCALES = ["de", "en"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

/** German-first for public website (separate from CRM `catclean_locale`). */
export const PUBLIC_DEFAULT_LOCALE: PublicLocale = "de";

export const PUBLIC_LOCALE_STORAGE_KEY = "catclean_public_locale";

export type PublicTranslationKey = string;

export type PublicTranslateFn = (key: PublicTranslationKey) => string;
