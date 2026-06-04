"use client";

import { Cat, Dog, Home, PawPrint } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { WizardMotionImage } from "./WizardMotionImage";
import { PremiumSelectCard } from "./PremiumSelectCard";
import { WizardStepHeader } from "./WizardStepHeader";
import { HOME_RESET_PET_STEP_IMAGES, PETS_OPTIONS } from "../home-reset-wizard.constants";
import { getPetHomeUpgradeCard, getPetStepImageAlt, translateHomeResetPets } from "../home-reset-wizard.i18n";
import type { HomeResetPetsOption } from "../home-reset-wizard.types";

const PET_OPTION_ICONS: Record<HomeResetPetsOption, LucideIcon> = {
  no_pets: Home,
  cat: Cat,
  dog: Dog,
  multiple: PawPrint,
};

type Props = {
  value: HomeResetPetsOption;
  onChange: (option: HomeResetPetsOption) => void;
};

function OptionIcon({ option }: { option: HomeResetPetsOption }) {
  const Icon = PET_OPTION_ICONS[option];
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export function StepPets({ value, onChange }: Props) {
  const { t } = usePublicT();
  const hasPets = value !== "no_pets";
  const stepImage = HOME_RESET_PET_STEP_IMAGES[value];
  const petUpgrade = getPetHomeUpgradeCard(t);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">
      <WizardMotionImage
        key={stepImage.src}
        src={stepImage.src}
        alt={getPetStepImageAlt(t, value) || stepImage.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 260px"
        wrapperClassName="aspect-[4/3] rounded-3xl bg-stone-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:order-2 lg:aspect-square"
      />

      <div className="space-y-8 lg:order-1">
        <WizardStepHeader
          eyebrow={t("public.homeReset.pets.eyebrow")}
          title={t("public.homeReset.pets.title")}
          subtitle={t("public.homeReset.pets.subtitle")}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PETS_OPTIONS.map((item) => (
            <PremiumSelectCard
              key={item.id}
              selected={value === item.id}
              onClick={() => onChange(item.id)}
              icon={<OptionIcon option={item.id} />}
              title={translateHomeResetPets(t, item.id)}
            />
          ))}
        </div>

        {hasPets ? (
          <div className="rounded-2xl border border-[#34597E]/15 bg-[#E8F2FA]/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-base font-semibold text-[#34597E]">{petUpgrade.petsStepTitle}</p>
              <span className="rounded-full bg-[#34597E] px-3 py-1 text-xs font-semibold text-white">
                {t("public.wizard.included")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{petUpgrade.petsStepIntro}</p>
            <ul className="mt-3 space-y-1.5">
              {petUpgrade.petsStepBullets.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-slate-400" aria-hidden>
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-500">{t("public.homeReset.pets.noPetsNote")}</p>
        )}
      </div>
    </div>
  );
}
