"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getHomeServiceBookingHref,
  ServiceCarousel,
  useHomeServiceCtaLabel,
  type HomeServiceId,
} from "./ServiceCarousel";
import { usePublicT } from "@/i18n/public/usePublicT";

export function HomeBookingSection() {
  const { t } = usePublicT();
  const [selectedId, setSelectedId] = useState<HomeServiceId>("home_reset");
  const ctaLabel = useHomeServiceCtaLabel(selectedId);

  return (
    <>
      <div id="services">
        <ServiceCarousel selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="mt-5 flex flex-col items-center">
        <Link
          href={getHomeServiceBookingHref(selectedId)}
          className="motion-cta-glow motion-hover-lift inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-7 py-3 text-xl font-medium text-white shadow-[0_10px_24px_rgba(52,89,126,0.32)] transition hover:bg-[#2d4d6f] sm:w-auto sm:text-2xl"
        >
          {ctaLabel}
        </Link>
        <Link
          href="/booking"
          className="mt-3 text-base font-medium text-slate-500 transition hover:text-[#34597E] sm:text-lg"
        >
          {t("public.home.booking.orCalculate")}
        </Link>
      </div>
    </>
  );
}
