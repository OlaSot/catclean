"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { MOVE_OUT_PROGRESS_STEPS, MOVE_OUT_TOTAL_STEPS } from "../move-out-wizard.constants";
import { translateProgressStep } from "../move-out-wizard.i18n";

type Props = {
  currentStep: number;
  className?: string;
};

export function MoveOutProgress({ currentStep, className = "" }: Props) {
  const { t } = usePublicT();
  const progress = (currentStep / MOVE_OUT_TOTAL_STEPS) * 100;
  const stepId = MOVE_OUT_PROGRESS_STEPS[Math.min(currentStep, MOVE_OUT_TOTAL_STEPS) - 1];
  const stepLabel = stepId ? translateProgressStep(t, stepId) : "";

  return (
    <div
      className={`space-y-2 ${className}`.trim()}
      aria-label={`${t("public.common.step")} ${currentStep} ${t("public.common.of")} ${MOVE_OUT_TOTAL_STEPS}`}
    >
      <div className="flex items-center justify-between text-xs font-medium tracking-wide text-slate-400 uppercase">
        <span>{t("public.booking.moveOut")}</span>
        <span>
          {stepLabel} · {t("public.common.step")} {currentStep}/{MOVE_OUT_TOTAL_STEPS}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="hr-wizard-progress-fill h-full rounded-full bg-[#34597E]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
