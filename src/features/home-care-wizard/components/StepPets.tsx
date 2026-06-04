"use client";

import { Cat, Dog, Home, PawPrint } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumSelectCard } from "@/features/home-reset-wizard/components/PremiumSelectCard";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import { PETS_OPTIONS } from "../home-care-wizard.constants";
import { translatePets } from "../home-care-wizard.i18n";
import type { HomeCarePetsOption } from "../home-care-wizard.types";

const PET_OPTION_ICONS: Record<HomeCarePetsOption, LucideIcon> = {
  no_pets: Home,
  cat: Cat,
  dog: Dog,
  multiple: PawPrint,
};

type Props = {
  value: HomeCarePetsOption;
  onChange: (option: HomeCarePetsOption) => void;
};

function OptionIcon({ option }: { option: HomeCarePetsOption }) {
  const Icon = PET_OPTION_ICONS[option];
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export function StepPets({ value, onChange }: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeCare.pets.eyebrow")}
        title={t("public.homeCare.pets.title")}
        subtitle={t("public.homeCare.pets.subtitle")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PETS_OPTIONS.map((item) => (
          <PremiumSelectCard
            key={item.id}
            selected={value === item.id}
            onClick={() => onChange(item.id)}
            icon={<OptionIcon option={item.id} />}
            title={translatePets(t, item.id)}
          />
        ))}
      </div>
    </div>
  );
}
