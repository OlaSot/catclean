import type { en } from "@/i18n/dictionaries/en";

export const SUPPORTED_LOCALES = ["en", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "catclean_locale";

export type TranslationKey = keyof typeof en;

export type Dictionary = Record<TranslationKey, string>;

export type TranslateFn = (key: TranslationKey | string) => string;
