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
import { HOME_CTA_PRIMARY_CLASS, HOME_CTA_SECONDARY_CLASS } from "./home-styles";

export function HomeBookingSection() {
  const { t } = usePublicT();
  const [selectedId, setSelectedId] = useState<HomeServiceId>("home_reset");
  const ctaLabel = useHomeServiceCtaLabel(selectedId);

  return (
    <>
      <div id="services" className="min-w-0">
        <ServiceCarousel selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="mt-3 flex min-w-0 flex-col items-stretch px-0.5 sm:mt-4 sm:items-center sm:px-0 md:mt-5 xl:mt-3 2xl:mt-6">
        <Link href={getHomeServiceBookingHref(selectedId)} className={HOME_CTA_PRIMARY_CLASS}>
          <span className="text-balance">{ctaLabel}</span>
        </Link>
        <Link href="/booking" className={HOME_CTA_SECONDARY_CLASS}>
          {t("public.home.booking.orCalculate")}
        </Link>
      </div>
    </>
  );
}
