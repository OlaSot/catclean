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

type HomeBookingSectionProps = {
  showPrimaryCta?: boolean;
};

export function HomeBookingSection({ showPrimaryCta = true }: HomeBookingSectionProps) {
  const { t } = usePublicT();
  const [selectedId, setSelectedId] = useState<HomeServiceId>("home_reset");
  const ctaLabel = useHomeServiceCtaLabel(selectedId);

  return (
    <>
      <div id="services" className="mt-4 min-w-0">
        <ServiceCarousel selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {showPrimaryCta ? (
        <div className="mt-4 flex min-w-0 flex-col items-stretch sm:items-center">
          <Link href={getHomeServiceBookingHref(selectedId)} className={HOME_CTA_PRIMARY_CLASS}>
            <span className="text-balance">{ctaLabel}</span>
          </Link>
          <Link href="/booking" className={HOME_CTA_SECONDARY_CLASS}>
            {t("public.home.booking.orCalculate")}
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex justify-center">
          <Link href="/booking" className={HOME_CTA_SECONDARY_CLASS}>
            {t("public.home.booking.orCalculate")}
          </Link>
        </div>
      )}
    </>
  );
}
