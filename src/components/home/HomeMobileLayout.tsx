"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { usePublicT } from "@/i18n/public/usePublicT";
import { MobileCatHero } from "./MobileCatHero";
import {
  HomeMobileFlagshipCard,
  HomeMobileSecondaryCards,
} from "./HomeMobileServicePicker";
import { TrustBadges } from "./TrustBadges";
import {
  getHomeServiceBookingHref,
  useHomeServiceCtaLabel,
  type HomeServiceId,
} from "./ServiceCarousel";
import {
  HOME_BOOKING_PANEL_CLASS,
  HOME_BOOKING_TITLE_CLASS,
  HOME_CTA_MOBILE_PRIMARY_CLASS,
  HOME_CTA_SECONDARY_CLASS,
  HOME_HERO_CTA_CLASS,
  HOME_MOBILE_HERO_SUBTITLE_CLASS,
  HOME_MOBILE_HERO_TITLE_CLASS,
} from "./home-styles";

export function HomeMobileLayout() {
  const { t } = usePublicT();
  const [selectedId, setSelectedId] = useState<HomeServiceId>("home_reset");
  const ctaLabel = useHomeServiceCtaLabel(selectedId);
  const heroVideo = "/videos/catclean-hero.mp4";

  return (
    <main className="bg-[var(--cc-page-bg)] text-slate-700">
      <MobileCatHero
        src={heroVideo}
        header={<SiteHeader compact languageInMenu />}
        footer={
          <Link
            href={getHomeServiceBookingHref("home_reset")}
            className={`${HOME_HERO_CTA_CLASS} w-full px-5 py-3.5 text-[0.9375rem] sm:min-w-0`}
          >
            {t("public.home.cta.homeReset")}
          </Link>
        }
      >
        <h1 className={HOME_MOBILE_HERO_TITLE_CLASS}>{t("public.home.hero.mobile.title")}</h1>
        <p className={HOME_MOBILE_HERO_SUBTITLE_CLASS}>{t("public.home.hero.mobile.subtitle")}</p>
      </MobileCatHero>

      <section id="booking" className="px-5 pt-6">
        <div className={HOME_BOOKING_PANEL_CLASS}>
          <h2 className={HOME_BOOKING_TITLE_CLASS}>{t("public.home.booking.title")}</h2>

          <div id="services" className="mt-4 space-y-4">
            <HomeMobileFlagshipCard selectedId={selectedId} onSelect={setSelectedId} />

            <Link href={getHomeServiceBookingHref(selectedId)} className={HOME_CTA_MOBILE_PRIMARY_CLASS}>
              <span className="text-balance">{ctaLabel}</span>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-center text-[0.6875rem] font-normal uppercase tracking-[0.14em] text-slate-400">
              {t("public.home.mobile.alsoAvailable")}
            </p>
            <HomeMobileSecondaryCards selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <TrustBadges curated />

          <Link href="/booking" className={HOME_CTA_SECONDARY_CLASS}>
            {t("public.home.booking.orCalculate")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
