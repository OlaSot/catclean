"use client";

import { Clock, Euro } from "lucide-react";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import {
  MOVE_OUT_SIZE_MAX_M2,
  MOVE_OUT_SIZE_MIN_M2,
  MOVE_OUT_SIZE_PRESETS,
} from "../move-out-wizard.constants";
import type { MoveOutEstimate, MoveOutPackage } from "../move-out-wizard.types";
import { formatMoveOutPrice } from "../move-out-wizard.utils";

type Props = {
  selectedPackage: MoveOutPackage;
  propertySizeM2: number;
  estimate: MoveOutEstimate;
  onSizeChange: (size: number) => void;
};

export function StepApartmentSize({
  selectedPackage,
  propertySizeM2,
  estimate,
  onSizeChange,
}: Props) {
  const { t } = usePublicT();
  const atMin = propertySizeM2 <= MOVE_OUT_SIZE_MIN_M2;
  const packageLabel =
    selectedPackage === "premium"
      ? t("public.moveOut.premium.title")
      : t("public.moveOut.standard.title");

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.moveOut.size.eyebrow")}
        title={t("public.moveOut.size.title")}
        subtitle={t("public.moveOut.size.subtitle")}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[#34597E]/10 px-3 py-1 text-xs font-semibold text-[#34597E]">
          {packageLabel} {t("public.moveOut.size.packageChip")}
        </span>
        <span className="text-xs text-slate-400">{t("public.moveOut.size.estimateUpdates")}</span>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-600">{t("public.moveOut.size.presets")}</p>
        <div className="flex flex-wrap gap-2">
          {MOVE_OUT_SIZE_PRESETS.map((preset) => (
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{t("public.moveOut.size.label")}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                {propertySizeM2 >= MOVE_OUT_SIZE_MAX_M2
                  ? `${MOVE_OUT_SIZE_MAX_M2}m²+`
                  : `${propertySizeM2}m²`}
              </p>
              {atMin ? (
                <p className="mt-1 text-xs font-medium text-slate-400">{t("public.moveOut.size.minHint")}</p>
              ) : null}
            </div>
          </div>

          <input
            type="range"
            min={MOVE_OUT_SIZE_MIN_M2}
            max={MOVE_OUT_SIZE_MAX_M2}
            step={5}
            value={propertySizeM2}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-100 accent-[#34597E]"
            aria-label={t("public.moveOut.size.label")}
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
            <span>{MOVE_OUT_SIZE_MIN_M2}m²</span>
            <span>{MOVE_OUT_SIZE_MAX_M2}m²+</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#34597E]/20 bg-gradient-to-br from-[#34597E]/[0.06] to-white p-5 shadow-[0_8px_32px_rgba(52,89,126,0.10)]">
          <div className="flex items-center gap-2 text-[#34597E]">
            <Euro className="h-4 w-4" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide">
              {t("public.moveOut.estimatedPrice")}
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
            {formatMoveOutPrice(estimate.price)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("public.moveOut.estimatedPriceHint")}</p>
        </div>

        <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide">
              {t("public.moveOut.estimatedDuration")}
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
            {estimate.durationLabel ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("public.moveOut.estimatedDurationHint")}</p>
        </div>
      </div>
    </div>
  );
}
