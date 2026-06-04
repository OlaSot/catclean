"use client";

import { Building2, Home } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { PremiumSelectCard } from "./PremiumSelectCard";
import { WizardMotionImage } from "./WizardMotionImage";
import { WizardStepHeader } from "./WizardStepHeader";
import { HOME_RESET_IMAGES, SIZE_MAX_M2, SIZE_MIN_M2 } from "../home-reset-wizard.constants";
import { formatHomeResetPrice } from "../home-reset-wizard.utils";
import type { HomeResetPropertyType } from "../home-reset-wizard.types";

type Props = {
  propertyType: HomeResetPropertyType | null;
  propertySizeM2: number;
  estimatePrice: number | null;
  onPropertyTypeChange: (type: HomeResetPropertyType) => void;
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
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 xl:gap-12">
      <WizardMotionImage
        src={HOME_RESET_IMAGES.livingRoom}
        alt={t("public.homeReset.home.livingAlt")}
        fill
        sizes="(max-width: 1024px) 100vw, 280px"
        wrapperClassName="aspect-[4/3] rounded-3xl bg-stone-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:order-2 lg:aspect-[3/4]"
      />

      <div className="space-y-8 lg:order-1">
        <WizardStepHeader
          eyebrow={t("public.homeReset.home.eyebrow")}
          title={t("public.homeReset.home.title")}
          subtitle={t("public.homeReset.home.subtitle")}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600">{t("public.wizard.field.propertyType")}</p>
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

        <div className="space-y-4 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{t("public.wizard.field.homeSize")}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                {propertySizeM2 >= SIZE_MAX_M2 ? `${SIZE_MAX_M2}m²+` : `${propertySizeM2}m²`}
              </p>
            </div>
            {estimatePrice != null ? (
              <div className="text-right">
                <p className="text-xs text-slate-400">{t("public.common.from")}</p>
                <p className="text-xl font-semibold text-[#34597E]">{formatHomeResetPrice(estimatePrice)}</p>
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
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-100 accent-[#34597E]"
            aria-label={t("public.homeReset.home.sizeAria")}
          />
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>{SIZE_MIN_M2}m²</span>
            <span>{SIZE_MAX_M2}m²+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
