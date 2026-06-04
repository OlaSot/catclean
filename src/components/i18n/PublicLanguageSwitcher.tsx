"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import type { PublicLocale } from "@/i18n/public/public-i18n.types";

const OPTIONS: { value: PublicLocale; labelKey: string; flag: string }[] = [
  { value: "de", labelKey: "public.lang.de", flag: "🇩🇪" },
  { value: "en", labelKey: "public.lang.en", flag: "🇬🇧" },
];

export function PublicLanguageSwitcher() {
  const { locale, setLocale, t } = usePublicT();

  return (
    <div
      className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/95 p-0.5 text-[11px] font-semibold shadow-sm"
      role="group"
      aria-label={t("public.lang.aria")}
    >
      {OPTIONS.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition sm:px-3 ${
              active
                ? "bg-[#34597E] text-white shadow-sm"
                : "text-slate-600 hover:bg-[#EEF4FA] hover:text-[#34597E]"
            }`}
          >
            <span aria-hidden>{option.flag}</span>
            <span>{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
