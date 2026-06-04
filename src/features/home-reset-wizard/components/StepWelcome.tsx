"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { HOME_RESET_IMAGES } from "../home-reset-wizard.constants";
import { getWelcomeBenefits } from "../home-reset-wizard.i18n";
import { WizardMotionImage } from "./WizardMotionImage";

type Props = {
  onStart: () => void;
};

export function StepWelcome({ onStart }: Props) {
  const { t } = usePublicT();
  const benefits = getWelcomeBenefits(t);

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      <div className="order-2 space-y-8 lg:order-1">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {t("public.homeReset.welcome.title")}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-slate-500 sm:text-xl">
            {t("public.homeReset.welcome.subtitle")}
          </p>
          <p className="max-w-md text-base leading-relaxed text-slate-500">
            {t("public.homeReset.welcome.subtitle2")}
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="hr-wizard-btn-primary inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_32px_rgba(52,89,126,0.24)] hover:bg-[#2d4d6f] sm:w-auto sm:text-lg"
        >
          {t("public.homeReset.welcome.cta")}
        </button>

        <ul className="space-y-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title} className="flex gap-3 text-sm">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-slate-700">{benefit.title}</p>
                  <p className="mt-0.5 text-slate-500">{benefit.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="order-1 lg:order-2">
        <WizardMotionImage
          src={HOME_RESET_IMAGES.hero}
          alt={t("public.homeReset.welcome.heroAlt")}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          wrapperClassName="aspect-[4/5] rounded-3xl bg-stone-100 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:aspect-[5/6]"
        />
      </div>
    </div>
  );
}
