"use client";

import { Check, type LucideIcon } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { formatUpgradePrice } from "../home-reset-wizard.utils";

const CARD_BENEFIT_COUNT = 4;

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  priceEur: number;
  priceLabel?: string;
  selected: boolean;
  onClick?: () => void;
  locked?: boolean;
  onViewFullScope?: () => void;
  className?: string;
};

export function UpgradeOptionCard({
  icon: Icon,
  title,
  description,
  benefits,
  priceEur,
  priceLabel: priceLabelOverride,
  selected,
  onClick,
  locked = false,
  onViewFullScope,
  className = "",
}: Props) {
  const { t } = usePublicT();
  const priceLabel = priceLabelOverride ?? formatUpgradePrice(priceEur);
  const isActive = locked || selected;
  const visibleBenefits = benefits.slice(0, CARD_BENEFIT_COUNT);

  const cardClass = [
    "hr-wizard-card relative flex h-full min-h-[220px] w-full flex-col rounded-xl border bg-white p-4 text-left transition-shadow sm:min-h-[228px]",
    isActive
      ? "hr-wizard-card--selected border-[#34597E] shadow-[0_0_0_1px_#34597E,0_6px_20px_rgba(52,89,126,0.10)]"
      : "border-stone-200/90 shadow-[0_1px_8px_rgba(15,23,42,0.04)] hover:border-stone-300 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]",
    locked ? "hr-wizard-card--locked cursor-default" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isActive ? "bg-[#34597E] text-white" : "bg-[#34597E]/10 text-[#34597E]"
          }`}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold leading-snug text-slate-800">{title}</p>
            <span
              className={`inline-flex max-w-[48%] shrink-0 items-center justify-end gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${
                isActive ? "bg-[#34597E] text-white" : "bg-[#34597E]/10 text-[#34597E]"
              }`}
            >
              <span className="text-right">{priceLabel}</span>
              {isActive && !locked ? (
                <Check className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden />
              ) : null}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>

      <ul className="mt-3 flex flex-1 flex-col justify-start gap-1.5">
        {visibleBenefits.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-xs leading-snug text-slate-600">
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B8DB8]"
              strokeWidth={2.5}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 h-4 shrink-0">
        {onViewFullScope ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewFullScope();
            }}
            className="text-xs font-medium text-[#5B8DB8] underline-offset-2 hover:text-[#34597E] hover:underline"
          >
            {t("public.homeReset.customize.viewFullScope")}
          </button>
        ) : null}
      </div>
    </>
  );

  if (locked) {
    return (
      <div
        className={cardClass}
        aria-label={t("public.homeReset.dialog.includedAria").replace("{title}", title)}
      >
        {content}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {content}
    </button>
  );
}
