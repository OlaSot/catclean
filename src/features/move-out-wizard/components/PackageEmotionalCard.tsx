"use client";

import { Check } from "lucide-react";
import type { MoveOutPackageCardContent } from "../move-out-wizard.constants";
import type { MoveOutPackage } from "../move-out-wizard.types";

type Props = {
  content: MoveOutPackageCardContent;
  selected: boolean;
  suggested: boolean;
  onSelect: (pkg: MoveOutPackage) => void;
  whatYouGetLabel: string;
};

export function PackageEmotionalCard({
  content,
  selected,
  suggested,
  onSelect,
  whatYouGetLabel,
}: Props) {
  const isPremium = content.id === "premium";

  return (
    <button
      type="button"
      onClick={() => onSelect(content.id)}
      className={`group relative w-full rounded-3xl border p-6 text-left transition sm:p-7 ${
        selected
          ? "border-[#34597E]/50 bg-gradient-to-b from-[#34597E]/[0.07] to-white shadow-[0_0_0_1px_rgba(52,89,126,0.15),0_16px_48px_rgba(52,89,126,0.14)]"
          : suggested
            ? "border-amber-300/90 bg-white shadow-[0_0_0_2px_rgba(251,191,36,0.35),0_12px_36px_rgba(15,23,42,0.06)]"
            : "border-stone-200/90 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.05)] hover:border-stone-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
      }`}
    >
      {content.badge ? (
        <span className="absolute -top-3 left-5 inline-flex rounded-full bg-[#34597E] px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
          {content.badge}
        </span>
      ) : null}

      {selected ? (
        <span className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#34597E] text-white">
          <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
        </span>
      ) : null}

      <div className={content.badge ? "pt-2" : ""}>
        <p
          className={`text-2xl font-semibold tracking-tight sm:text-[1.65rem] ${
            isPremium ? "text-slate-900" : "text-[#34597E]"
          }`}
        >
          {content.title}
        </p>
        <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
          {content.headline}
        </p>

        <ul className="mt-4 space-y-1.5">
          {content.highlights.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-sm font-medium text-slate-700"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  isPremium ? "bg-violet-500" : "bg-[#34597E]"
                }`}
                aria-hidden
              />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-stone-100 bg-[#F6F8FB]/80 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {whatYouGetLabel}
          </p>
          <ul className="mt-3 space-y-2.5">
            {content.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <Check
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    isPremium ? "text-violet-600" : "text-[#34597E]"
                  }`}
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}
