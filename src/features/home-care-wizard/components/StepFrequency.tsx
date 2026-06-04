"use client";

import { Calendar, CalendarClock, CalendarDays, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumSelectCard } from "@/features/home-reset-wizard/components/PremiumSelectCard";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import { FREQUENCY_OPTIONS } from "../home-care-wizard.constants";
import { translateFrequency } from "../home-care-wizard.i18n";
import type { HomeCareFrequency } from "../home-care-wizard.types";

const FREQUENCY_ICONS: Record<HomeCareFrequency, LucideIcon> = {
  one_time: Sparkles,
  weekly: CalendarDays,
  biweekly: CalendarClock,
  monthly: Calendar,
};

type Props = {
  value: HomeCareFrequency;
  onChange: (frequency: HomeCareFrequency) => void;
};

export function StepFrequency({ value, onChange }: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeCare.freq.eyebrow")}
        title={t("public.homeCare.freq.title")}
        subtitle={t("public.homeCare.freq.subtitle")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FREQUENCY_OPTIONS.map((item) => {
          const Icon = FREQUENCY_ICONS[item.id];
          return (
            <PremiumSelectCard
              key={item.id}
              selected={value === item.id}
              onClick={() => onChange(item.id)}
              title={translateFrequency(t, item.id)}
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
