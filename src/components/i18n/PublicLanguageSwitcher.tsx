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
      className="inline-flex shrink-0 items-center rounded-full border border-slate-200/90 bg-white/95 p-0.5 text-[10px] font-semibold shadow-sm min-[420px]:text-[11px] sm:text-xs"
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
            aria-label={t(option.labelKey)}
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 transition min-[420px]:gap-1 min-[420px]:px-2 min-[420px]:py-1 sm:gap-1 sm:px-2.5 sm:py-1 md:px-3 ${
              active
                ? "bg-[#34597E] text-white shadow-sm"
                : "text-slate-600 hover:bg-[#EEF4FA] hover:text-[#34597E]"
            }`}
          >
            <span className="md:hidden">{option.value}</span>
            <span aria-hidden className="hidden md:inline">
              {option.flag}
            </span>
            <span className="hidden min-[480px]:inline">{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
