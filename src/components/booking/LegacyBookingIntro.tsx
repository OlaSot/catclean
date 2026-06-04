"use client";

import { usePublicT } from "@/i18n/public/usePublicT";

export function LegacyBookingIntro() {
  const { t } = usePublicT();

  return (
    <div className="mb-6 mt-4 sm:mt-6">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-700 sm:text-5xl">
        {t("public.bookingLegacy.title")}
      </h1>
      <p className="mt-2 text-lg text-slate-600">{t("public.bookingLegacy.subtitle")}</p>
    </div>
  );
}
