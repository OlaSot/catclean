"use client";

import { ChevronDown, Languages } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { PublicLocale } from "@/i18n/public/public-i18n.types";

const OPTIONS: { value: PublicLocale; label: string }[] = [
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

export function PublicLanguageSwitcher() {
  const { locale, setLocale, t } = usePublicT();
  return (
    <label className="relative inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200/90 bg-white text-[#34597E] shadow-sm transition hover:border-[#b9ccde] hover:bg-[#f8fbff]">
      <span className="sr-only">{t("public.lang.aria")}</span>
      <Languages className="pointer-events-none ml-3 h-4 w-4" aria-hidden />
      <select value={locale} onChange={(event) => setLocale(event.target.value as PublicLocale)} aria-label={t("public.lang.aria")} className="h-full cursor-pointer appearance-none bg-transparent py-0 pr-8 pl-1.5 text-xs font-bold tracking-wide outline-none">
        {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" aria-hidden />
    </label>
  );
}
