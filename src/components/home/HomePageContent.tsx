"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_CONTAINER_CLASS } from "@/components/layout/site-layout";
import { usePublicT } from "@/i18n/public/usePublicT";
import { HeroVideoBackground } from "./HeroVideoBackground";
import { HomeBookingSection } from "./HomeBookingSection";
import { TrustBadges } from "./TrustBadges";
import {
  HOME_BOOKING_PANEL_CLASS,
  HOME_BOOKING_TITLE_CLASS,
  HOME_HERO_SUBTITLE_CLASS,
  HOME_HERO_TITLE_CLASS,
} from "./home-styles";

export function HomePageContent() {
  const { t } = usePublicT();
  const heroVideo = "/videos/catclean-hero.mp4";
  const heroFallbackImage = "/images/catclean-hero-placeholder.jpg";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#EEF2F7] text-slate-700 lg:bg-transparent">
      <section className="relative lg:min-h-dvh lg:bg-transparent">
        <div className="relative lg:contents">
          <HeroVideoBackground src={heroVideo} poster={heroFallbackImage} />

          {/* Mobile: header floats over the video so the cat area stays unobstructed below */}
          <div
            className={`absolute inset-x-0 top-0 z-20 bg-linear-to-b from-white/70 via-white/30 to-transparent pb-6 lg:hidden ${SITE_CONTAINER_CLASS}`}
          >
            <SiteHeader className="motion-reveal motion-delay-80" />
          </div>
        </div>

        <div
          className={`relative z-10 -mt-8 flex w-full flex-col bg-[#EEF2F7] py-2 min-[420px]:-mt-10 min-[420px]:py-2.5 sm:-mt-12 sm:py-3 md:mt-0 md:py-5 lg:min-h-dvh lg:bg-transparent ${SITE_CONTAINER_CLASS}`}
        >
          <SiteHeader className="motion-reveal motion-delay-80 hidden lg:flex" />

          <div className="flex min-h-0 flex-1 flex-col gap-3 pb-4 pt-0 min-[420px]:gap-3.5 sm:gap-4 sm:pb-5 md:mt-6 md:gap-7 md:pb-7 lg:mt-10 lg:gap-7 lg:pb-8 xl:mt-12 xl:gap-5 xl:pb-6 2xl:mt-14 2xl:gap-10 2xl:pb-12">
            <div className="motion-reveal motion-delay-180 min-w-0 shrink-0 max-w-xl sm:pt-0.5 md:max-w-2xl lg:max-w-2xl lg:pt-2 xl:max-w-lg xl:pt-4 2xl:max-w-3xl 2xl:pt-6">
              <h1 className={HOME_HERO_TITLE_CLASS}>
                <span className="block">{t("public.home.hero.title1")}</span>
                <span className="block">{t("public.home.hero.title2")}</span>
              </h1>
              <p className={HOME_HERO_SUBTITLE_CLASS}>
                <span className="block sm:inline">{t("public.home.hero.subtitle1")}</span>{" "}
                <span className="block sm:inline">{t("public.home.hero.subtitle2")}</span>
              </p>
            </div>

            <section
              id="booking"
              className={`motion-reveal motion-delay-260 w-full min-w-0 lg:mt-auto ${HOME_BOOKING_PANEL_CLASS}`}
            >
              <h2 className={HOME_BOOKING_TITLE_CLASS}>{t("public.home.booking.title")}</h2>

              <HomeBookingSection />

              <TrustBadges />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
