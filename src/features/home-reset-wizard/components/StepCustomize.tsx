"use client";

import { useMemo, useState } from "react";
import { Bath, ChefHat, Home } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { WizardStepHeader } from "./WizardStepHeader";
import { UpgradeOptionCard } from "./UpgradeOptionCard";
import { UpgradeScopeDialog } from "./UpgradeScopeDialog";
import { PetHomeIncludedCard } from "./PetHomeIncludedCard";
import { getCustomizeUpgradeOptions } from "../home-reset-wizard.i18n";
import { hasPetsSelected } from "../home-reset-wizard.utils";
import type { HomeResetPetsOption, HomeResetUpgrade } from "../home-reset-wizard.types";

const UPGRADE_ICONS = {
  standard_home_reset: Home,
  bathroom_upgrade: Bath,
  kitchen_upgrade: ChefHat,
} as const;

function cardSpanClass(cardCount: number, index: number): string {
  if (cardCount === 3 && index === 2) return "sm:col-span-2";
  return "";
}

type ScopeView = { title: string; items: readonly string[] } | null;

type Props = {
  petsOption: HomeResetPetsOption;
  value: HomeResetUpgrade;
  onChange: (upgrade: HomeResetUpgrade) => void;
};

export function StepCustomize({ petsOption, value, onChange }: Props) {
  const { t } = usePublicT();
  const petsSelected = hasPetsSelected(petsOption);
  const upgradeOptions = useMemo(() => getCustomizeUpgradeOptions(t), [t]);
  const cardCount = upgradeOptions.length + (petsSelected ? 1 : 0);
  const [scopeView, setScopeView] = useState<ScopeView>(null);

  return (
    <div className="space-y-5">
      <WizardStepHeader
        eyebrow={t("public.homeReset.customize.eyebrow")}
        title={t("public.homeReset.customize.title")}
        subtitle={t("public.homeReset.customize.subtitle")}
      />

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr">
        {upgradeOptions.map((option, index) => (
          <div
            key={option.id}
            className={`hr-wizard-card-enter flex h-full ${cardSpanClass(cardCount, index)}`}
          >
            <UpgradeOptionCard
              icon={UPGRADE_ICONS[option.id]}
              title={option.title}
              description={option.description}
              benefits={option.benefits}
              priceEur={option.priceEur}
              priceLabel={option.priceLabel}
              selected={value === option.id}
              onClick={() => onChange(option.id)}
              onViewFullScope={
                option.fullScope
                  ? () => setScopeView({ title: option.title, items: option.fullScope! })
                  : undefined
              }
            />
          </div>
        ))}
        {petsSelected ? (
          <div
            className={`hr-wizard-card-enter flex h-full ${cardSpanClass(cardCount, cardCount - 1)}`}
          >
            <PetHomeIncludedCard />
          </div>
        ) : null}
      </div>

      <UpgradeScopeDialog
        open={scopeView != null}
        title={scopeView?.title ?? ""}
        items={scopeView?.items ?? []}
        onClose={() => setScopeView(null)}
      />
    </div>
  );
}
