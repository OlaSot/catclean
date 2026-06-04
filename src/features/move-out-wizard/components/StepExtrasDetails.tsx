"use client";

import { AlertCircle } from "lucide-react";
import { PremiumSelectCard } from "@/features/home-reset-wizard/components/PremiumSelectCard";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import { MOVE_OUT_EXTRA_OPTION_IDS } from "../move-out-wizard.constants";
import { translateExtra } from "../move-out-wizard.i18n";
import type { MoveOutExtras, MoveOutPackage, MoveOutWizardState } from "../move-out-wizard.types";
import { shouldRecommendPremium } from "../move-out-wizard.utils";

type Props = {
  packageType: MoveOutPackage;
  state: Pick<MoveOutWizardState, "extras" | "apartmentCondition">;
  onExtrasChange: (extras: MoveOutExtras) => void;
  onPackageChange: (pkg: MoveOutPackage) => void;
};

export function StepExtrasDetails({
  packageType,
  state,
  onExtrasChange,
  onPackageChange,
}: Props) {
  const { t } = usePublicT();
  const showUpsell =
    packageType === "standard" && shouldRecommendPremium(packageType, state);

  function toggle(id: keyof MoveOutExtras) {
    onExtrasChange({ ...state.extras, [id]: !state.extras[id] });
  }

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.moveOut.extras.eyebrow")}
        title={t("public.moveOut.extras.title")}
        subtitle={t("public.moveOut.extras.subtitle")}
      />

      {showUpsell ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200/80 bg-amber-50/90 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div>
              <p className="font-semibold text-amber-900">{t("public.moveOut.extras.upsellTitle")}</p>
              <p className="mt-1 text-sm text-amber-800/90">{t("public.moveOut.extras.upsellBody")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPackageChange("premium")}
            className="shrink-0 rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4d6f]"
          >
            {t("public.moveOut.extras.switchPremium")}
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MOVE_OUT_EXTRA_OPTION_IDS.map((id) => {
          const copy = translateExtra(t, id);
          return (
            <PremiumSelectCard
              key={id}
              selected={state.extras[id]}
              onClick={() => toggle(id)}
              title={copy.title}
              description={copy.description}
            />
          );
        })}
      </div>
    </div>
  );
}
