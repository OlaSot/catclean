"use client";

import { Building2, Home } from "lucide-react";
import { PremiumSelectCard } from "@/features/home-reset-wizard/components/PremiumSelectCard";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import { SIZE_MAX_M2, SIZE_MIN_M2, SIZE_PRESETS } from "../home-care-wizard.constants";
import { formatHomeCarePrice } from "../home-care-wizard.utils";
import type { HomeCarePropertyType } from "../home-care-wizard.types";

type Props = {
  propertyType: HomeCarePropertyType | null;
  propertySizeM2: number;
  estimatePrice: number | null;
  onPropertyTypeChange: (type: HomeCarePropertyType) => void;
  onSizeChange: (size: number) => void;
  error?: string;
};

export function StepHomeDetails({
  propertyType,
  propertySizeM2,
  estimatePrice,
  onPropertyTypeChange,
  onSizeChange,
  error,
}: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeCare.home.eyebrow")}
        title={t("public.homeCare.home.title")}
        subtitle={t("public.homeCare.home.subtitle")}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-600">{t("public.homeCare.propertyType")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PremiumSelectCard
            selected={propertyType === "apartment"}
            onClick={() => onPropertyTypeChange("apartment")}
            title={t("public.homeCare.apartment")}
            subtitle={t("public.homeCare.apartmentSub")}
            icon={
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
                <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
            }
          />
          <PremiumSelectCard
            selected={propertyType === "house"}
            onClick={() => onPropertyTypeChange("house")}
            title={t("public.homeCare.house")}
            subtitle={t("public.homeCare.houseSub")}
            icon={
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
                <Home className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
            }
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-600">{t("public.homeCare.homeSize")}</p>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSizeChange(preset)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                propertySizeM2 === preset
                  ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
                  : "border-stone-200 bg-white text-slate-600 hover:border-stone-300"
              }`}
            >
              {preset} m²
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{t("public.homeCare.customSize")}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                {propertySizeM2 >= SIZE_MAX_M2 ? `${SIZE_MAX_M2}m²+` : `${propertySizeM2}m²`}
              </p>
            </div>
            {estimatePrice != null ? (
              <div className="text-right">
                <p className="text-xs text-slate-400">{t("public.common.from")}</p>
                <p className="text-lg font-semibold text-[#34597E]">
                  {formatHomeCarePrice(estimatePrice)}
                </p>
              </div>
            ) : null}
          </div>
          <input
            type="range"
            min={SIZE_MIN_M2}
            max={SIZE_MAX_M2}
            step={5}
            value={propertySizeM2}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-100 accent-[#34597E]"
            aria-label={t("public.homeCare.sizeAria")}
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
            <span>{SIZE_MIN_M2}m²</span>
            <span>{SIZE_MAX_M2}m²+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
