"use client";

import { Sparkles } from "lucide-react";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { ApartmentCondition, MoveOutPackage } from "../move-out-wizard.types";
import { packageForCondition } from "../move-out-wizard.utils";
import {
  getApartmentConditionOptions,
  getMoveOutPackageCards,
} from "../move-out-wizard.i18n";
import { CompareDetailsCollapsible } from "./CompareDetailsCollapsible";
import { PackageEmotionalCard } from "./PackageEmotionalCard";

type Props = {
  selectedPackage: MoveOutPackage | null;
  apartmentCondition: ApartmentCondition | null;
  onPackageChange: (pkg: MoveOutPackage) => void;
  onConditionChange: (condition: ApartmentCondition) => void;
  packageError?: string;
};

export function StepPackageSelection({
  selectedPackage,
  apartmentCondition,
  onPackageChange,
  onConditionChange,
  packageError,
}: Props) {
  const { t } = usePublicT();
  const packageCards = getMoveOutPackageCards(t);
  const conditionOptions = getApartmentConditionOptions(t);
  const suggestedFromCondition = packageForCondition(apartmentCondition);

  return (
    <div className="space-y-10">
      <WizardStepHeader
        eyebrow={t("public.moveOut.handoverEyebrow")}
        title={t("public.moveOut.package.title")}
        subtitle={t("public.moveOut.package.subtitle")}
      />

      <section className="space-y-4" aria-labelledby="apartment-condition-heading">
        <div>
          <h2
            id="apartment-condition-heading"
            className="text-lg font-semibold text-slate-800 sm:text-xl"
          >
            {t("public.moveOut.condition.title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {t("public.moveOut.condition.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {conditionOptions.map((option) => {
            const isActive = apartmentCondition === option.id;
            const pointsToPremium = option.suggestedPackage === "premium";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onConditionChange(option.id)}
                className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                  isActive
                    ? pointsToPremium
                      ? "border-violet-300/80 bg-violet-50/50 shadow-[0_8px_24px_rgba(139,92,246,0.12)]"
                      : "border-[#34597E]/40 bg-[#34597E]/[0.04] shadow-[0_8px_24px_rgba(52,89,126,0.10)]"
                    : "border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{option.description}</p>
                {isActive && option.suggestedPackage ? (
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      pointsToPremium ? "text-violet-700" : "text-[#34597E]"
                    }`}
                  >
                    {option.suggestedPackage === "premium"
                      ? t("public.moveOut.match.premium")
                      : t("public.moveOut.match.standard")}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="package-choice-heading">
        <div>
          <h2
            id="package-choice-heading"
            className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
          >
            {t("public.moveOut.yourPackage")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("public.moveOut.yourPackageHint")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          {packageCards.map((card) => (
            <PackageEmotionalCard
              key={card.id}
              content={card}
              selected={selectedPackage === card.id}
              suggested={suggestedFromCondition === card.id && selectedPackage !== card.id}
              onSelect={onPackageChange}
              whatYouGetLabel={t("public.moveOut.whatYouGet")}
            />
          ))}
        </div>

        {packageError ? <p className="text-sm text-rose-600">{packageError}</p> : null}

        {selectedPackage === "standard" ? (
          <p className="text-xs leading-relaxed text-slate-500">{t("public.moveOut.kalkNote")}</p>
        ) : null}

        {selectedPackage === "premium" ? (
          <p className="flex items-start gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs leading-relaxed text-violet-900/90">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
            {t("public.moveOut.premiumNote")}
          </p>
        ) : null}
      </section>

      <CompareDetailsCollapsible />
    </div>
  );
}
