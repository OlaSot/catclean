"use client";

import { useT } from "@/i18n/useT";
import type { Locale } from "@/i18n/i18n.types";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useT();

  return (
    <div
      className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-[11px] font-semibold"
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            className={`min-w-[2rem] rounded-full px-2 py-1 transition ${
              active
                ? "bg-[#34597E] text-white shadow-sm"
                : "text-slate-500 hover:bg-[#EEF4FA] hover:text-[#34597E]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
