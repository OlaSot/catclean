"use client";

import { CookingPot, LayoutGrid, PanelsTopLeft, Refrigerator, Sparkles } from "lucide-react";
import { PremiumSelectCard } from "@/features/home-reset-wizard/components/PremiumSelectCard";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import { ENHANCEMENT_OPTIONS } from "../home-care-wizard.constants";
import { translateEnhancement } from "../home-care-wizard.i18n";
import type { HomeCareEnhancement, HomeCareEnhancements } from "../home-care-wizard.types";

const ENHANCEMENT_ICONS = {
  oven_refresh: CookingPot,
  fridge_refresh: Refrigerator,
  inside_cabinets: PanelsTopLeft,
  balcony_cleaning: LayoutGrid,
  window_cleaning: Sparkles,
} as const satisfies Record<HomeCareEnhancement, typeof CookingPot>;

type Props = {
  value: HomeCareEnhancements;
  onChange: (next: HomeCareEnhancements) => void;
};

export function StepExtras({ value, onChange }: Props) {
  const { t } = usePublicT();

  function toggle(id: HomeCareEnhancement) {
    onChange({ ...value, [id]: !value[id] });
  }

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeCare.extras.eyebrow")}
        title={t("public.homeCare.extras.title")}
        subtitle={t("public.homeCare.extras.subtitle")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ENHANCEMENT_OPTIONS.map((item) => {
          const Icon = ENHANCEMENT_ICONS[item.id];
          return (
            <PremiumSelectCard
              key={item.id}
              selected={value[item.id]}
              onClick={() => toggle(item.id)}
              title={translateEnhancement(t, item.id)}
              subtitle={item.priceLabel}
              icon={
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
