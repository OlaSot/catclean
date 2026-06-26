"use client";

import { CircleCheck } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

export function BookingConfirmHero() {
  const { t } = usePublicT();

  return (
    <header className="space-y-5 pb-2">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34597E]/10 text-[#34597E] sm:h-14 sm:w-14 sm:rounded-[1.1rem]"
        aria-hidden
      >
        <CircleCheck className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
      </span>
      <div className="space-y-3">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
          {t("public.checkout.hero.title")}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          {t("public.checkout.hero.subtitle")}
        </p>
      </div>
    </header>
  );
}
