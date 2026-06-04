"use client";

import { useOptionalPublicI18n } from "@/i18n/public/PublicI18nProvider";

/** Safe on any page — falls back to German when outside PublicI18nProvider (e.g. /login). */
export function usePublicT() {
  const { t, locale, setLocale } = useOptionalPublicI18n();
  return { t, locale, setLocale };
}
