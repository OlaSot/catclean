"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_CONTAINER_CLASS } from "@/components/layout/site-layout";
import { usePublicT } from "@/i18n/public/usePublicT";
import { HomeBookingSection } from "./HomeBookingSection";

const TRUST_BADGE_KEYS = [
  "public.home.trust.deepRefresh",
  "public.home.trust.petFriendly",
  "public.home.trust.steam",
  "public.home.trust.reliable",
  "public.home.trust.fastEasy",
  "public.home.trust.online",
] as const;

const TRUST_ICONS = [
  "Sparkles",
  "PawPrint",
  "Droplets",
  "ShieldCheck",
  "Zap",
  "Globe",
] as const;

import {
  Droplets,
  Globe,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const ICON_MAP = {
  Sparkles,
  PawPrint,
  Droplets,
  ShieldCheck,
  Zap,
  Globe,
};

export function HomePageContent() {
  const { t } = usePublicT();
  const heroVideo = "/videos/catclean-hero.mp4";
  const heroFallbackImage = "/images/catclean-hero-placeholder.jpg";

  return (
    <main className="min-h-screen bg-[#EEF2F7] text-slate-700">
      <section className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover motion-fade-in"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster={heroFallbackImage}
        />
        <div className={`relative flex min-h-screen w-full flex-col py-4 ${SITE_CONTAINER_CLASS}`}>
          <SiteHeader className="motion-reveal motion-delay-80" />

          <div className="mt-10 flex flex-1 flex-col pb-8 pt-[100px] sm:mt-14 sm:pt-[100px] md:mt-16 lg:mt-20 xl:mt-24">
            <div className="motion-reveal motion-delay-180 max-w-xl pt-2 sm:pt-4 xl:max-w-2xl">
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl xl:text-7xl">
                {t("public.home.hero.title1")}
                <br />
                {t("public.home.hero.title2")}
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-700 sm:text-xl xl:max-w-xl xl:text-2xl">
                {t("public.home.hero.subtitle1")}
                <br />
                {t("public.home.hero.subtitle2")}
              </p>
            </div>

            <section
              id="booking"
              className="motion-reveal motion-delay-260 mt-8 w-full rounded-3xl border border-white/80 bg-[linear-gradient(225deg,rgba(255,255,255,0.98)_8%,rgba(255,255,255,0.42)_46%,rgba(255,255,255,0.08)_66%,rgba(255,255,255,0)_82%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-md sm:mt-10 sm:p-6 lg:mt-12"
            >
              <h2 className="text-center text-2xl font-medium tracking-tight text-slate-700 sm:text-3xl">
                {t("public.home.booking.title")}
              </h2>

              <HomeBookingSection />

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5">
                {TRUST_BADGE_KEYS.map((key, index) => {
                  const Icon = ICON_MAP[TRUST_ICONS[index] as keyof typeof ICON_MAP];
                  return (
                    <span
                      key={key}
                      className="motion-reveal motion-hover-lift inline-flex items-center gap-3 rounded-full border border-[#c9d8e8]/80 bg-linear-to-br from-white/98 via-[#eef5fb]/94 to-[#dce9f5]/88 px-6 py-2.5 text-base font-semibold text-slate-700 shadow-[0_10px_24px_rgba(52,89,126,0.14)] sm:px-7 sm:py-3 sm:text-lg"
                    >
                      <Icon className="h-4.5 w-4.5 text-[#5B8DB8] sm:h-5 sm:w-5" aria-hidden />
                      {t(key)}
                    </span>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
