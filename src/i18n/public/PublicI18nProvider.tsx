"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPublicTranslate } from "@/i18n/public/translate-public";
import {
  PUBLIC_DEFAULT_LOCALE,
  PUBLIC_LOCALE_STORAGE_KEY,
  PUBLIC_LOCALES,
  type PublicLocale,
  type PublicTranslateFn,
} from "@/i18n/public/public-i18n.types";

type PublicI18nContextValue = {
  locale: PublicLocale;
  setLocale: (locale: PublicLocale) => void;
  t: PublicTranslateFn;
};

const PublicI18nContext = createContext<PublicI18nContextValue | null>(null);

function readStoredPublicLocale(): PublicLocale {
  if (typeof window === "undefined") return PUBLIC_DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(PUBLIC_LOCALE_STORAGE_KEY);
    if (stored && PUBLIC_LOCALES.includes(stored as PublicLocale)) {
      return stored as PublicLocale;
    }
  } catch {
    // ignore
  }
  return PUBLIC_DEFAULT_LOCALE;
}

export function PublicI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<PublicLocale>(PUBLIC_DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredPublicLocale());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
  }, [hydrated, locale]);

  const setLocale = useCallback((next: PublicLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(PUBLIC_LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useMemo(() => createPublicTranslate(locale), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <PublicI18nContext.Provider value={value}>{children}</PublicI18nContext.Provider>;
}

const FALLBACK_VALUE: PublicI18nContextValue = {
  locale: PUBLIC_DEFAULT_LOCALE,
  setLocale: () => {},
  t: createPublicTranslate(PUBLIC_DEFAULT_LOCALE),
};

export function useOptionalPublicI18n(): PublicI18nContextValue {
  const ctx = useContext(PublicI18nContext);
  return ctx ?? FALLBACK_VALUE;
}

export function usePublicI18n(): PublicI18nContextValue {
  const ctx = useContext(PublicI18nContext);
  if (!ctx) {
    throw new Error("usePublicI18n must be used within PublicI18nProvider");
  }
  return ctx;
}
