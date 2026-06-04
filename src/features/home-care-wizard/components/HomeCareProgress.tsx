"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { HOME_CARE_TOTAL_STEPS } from "../home-care-wizard.constants";

type Props = {
  currentStep: number;
  className?: string;
};

export function HomeCareProgress({ currentStep, className = "" }: Props) {
  const { t } = usePublicT();
  const progress = (currentStep / HOME_CARE_TOTAL_STEPS) * 100;

  return (
    <div
      className={`space-y-2 ${className}`.trim()}
      aria-label={`${t("public.common.step")} ${currentStep} ${t("public.common.of")} ${HOME_CARE_TOTAL_STEPS}`}
    >
      <div className="flex items-center justify-between text-xs font-medium tracking-wide text-slate-400 uppercase">
        <span>{t("public.booking.homeCare")}</span>
        <span>
          {t("public.common.step")} {currentStep} {t("public.common.of")} {HOME_CARE_TOTAL_STEPS}
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
