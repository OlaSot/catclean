"use client";

import { CookingPot, LayoutGrid, Refrigerator } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { PremiumSelectCard } from "./PremiumSelectCard";
import { WizardStepHeader } from "./WizardStepHeader";
import { getEnhancementOptions } from "../home-reset-wizard.i18n";
import { getAvailableEnhancementOptions } from "../home-reset-wizard.utils";
import type {
  HomeResetEnhancements,
  HomeResetEnhancement,
  HomeResetUpgrade,
} from "../home-reset-wizard.types";

const ENHANCEMENT_ICONS = {
  oven_refresh: CookingPot,
  fridge_refresh: Refrigerator,
  balcony_cleaning: LayoutGrid,
} as const satisfies Record<HomeResetEnhancement, typeof CookingPot>;

function EnhancementIcon({ id }: { id: HomeResetEnhancement }) {
  const Icon = ENHANCEMENT_ICONS[id];
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

type Props = {
  upgrade: HomeResetUpgrade;
  value: HomeResetEnhancements;
  onChange: (next: HomeResetEnhancements) => void;
  error?: string;
};

export function StepEnhancements({ upgrade, value, onChange, error }: Props) {
  const { t } = usePublicT();
  const localized = getEnhancementOptions(t);
  const availableIds = new Set(
    getAvailableEnhancementOptions(upgrade).map((item) => item.id)
  );
  const options = localized.filter((item) => availableIds.has(item.id));

  function toggle(id: HomeResetEnhancement) {
    onChange({ ...value, [id]: !value[id] });
  }

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeReset.enhancements.eyebrow")}
        title={t("public.homeReset.enhancements.title")}
        subtitle={
          upgrade === "kitchen_upgrade"
            ? t("public.homeReset.enhancements.subtitleKitchen")
            : t("public.homeReset.enhancements.subtitle")
        }
      />

      <div
        className={`grid grid-cols-1 gap-3 ${options.length === 1 ? "sm:max-w-xs" : "sm:grid-cols-3"}`}
      >
        {options.map((item) => (
          <PremiumSelectCard
            key={item.id}
            selected={value[item.id]}
            onClick={() => toggle(item.id)}
            icon={<EnhancementIcon id={item.id} />}
            title={item.title}
            subtitle={item.priceLabel}
          />
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
