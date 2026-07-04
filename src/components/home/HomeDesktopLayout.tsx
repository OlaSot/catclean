"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_CONTAINER_CLASS } from "@/components/layout/site-layout";
import { usePublicT } from "@/i18n/public/usePublicT";
import { HeroVideoBackground } from "./HeroVideoBackground";
import { HomeBookingSection } from "./HomeBookingSection";
import { HomeSocialTrust } from "./HomeSocialTrust";
import { TrustBadges } from "./TrustBadges";
import { getHomeServiceBookingHref } from "./ServiceCarousel";
import {
  HOME_BOOKING_PANEL_CLASS,
  HOME_BOOKING_TITLE_CLASS,
  HOME_HERO_CTA_CLASS,
  HOME_HERO_SUBTITLE_CLASS,
  HOME_HERO_TITLE_CLASS,
} from "./home-styles";

export function HomeDesktopLayout() {
  const { t } = usePublicT();
  const heroVideo = "/videos/catclean-hero.mp4";

  return (
    <main className="bg-[#EEF2F7] text-slate-700">
      <section className="relative min-h-dvh">
        <HeroVideoBackground src={heroVideo} poster="" />

        <div className={`relative z-10 flex min-h-dvh flex-col ${SITE_CONTAINER_CLASS} lg:pt-3`}>
          <SiteHeader className="hidden shrink-0 lg:flex" />

          <div className="flex flex-1 flex-col justify-center gap-10 pb-6 pt-4 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-12 lg:pb-8 lg:pt-6 xl:gap-16">
            <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
              <h1 className={HOME_HERO_TITLE_CLASS}>{t("public.home.hero.title1")}</h1>

              <p className={HOME_HERO_SUBTITLE_CLASS}>{t("public.home.hero.subtitle")}</p>

              <Link
                href={getHomeServiceBookingHref("home_reset")}
                className={HOME_HERO_CTA_CLASS}
              >
                {t("public.home.cta.homeReset")}
              </Link>
            </div>

            <div className="hidden min-h-[min(52vh,520px)] lg:block" aria-hidden />
          </div>

          <section
            id="booking"
            className={`pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-10 ${HOME_BOOKING_PANEL_CLASS}`}
          >
            <h2 className={HOME_BOOKING_TITLE_CLASS}>{t("public.home.booking.title")}</h2>

            <HomeBookingSection showPrimaryCta={false} />

            <TrustBadges curated />
          </section>
        </div>
      </section>

      <HomeSocialTrust />
    </main>
  );
}
