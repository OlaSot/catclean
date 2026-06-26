/** Shared responsive typography & spacing for the public home page. */
import { buttonVariants } from "@/lib/design-system/tokens";

/** Compact at xl (1280–1535px, e.g. ~1300px laptops); full size from 2xl. */
export const HOME_HERO_TITLE_CLASS =
  "text-balance text-[clamp(1.625rem,4.2vw+0.2rem,2.75rem)] leading-[1.12] font-semibold tracking-tight text-slate-800 md:text-[clamp(1.75rem,3.2vw+0.2rem,3rem)] xl:text-[clamp(1.5rem,2vw+0.65rem,2.625rem)] 2xl:text-[clamp(1.875rem,3.5vw+0.2rem,4.5rem)]";

export const HOME_HERO_SUBTITLE_CLASS =
  "text-balance mt-2 max-w-[34ch] text-[clamp(0.9375rem,1vw+0.7rem,1.125rem)] leading-relaxed text-slate-700 sm:mt-3 md:max-w-md md:text-lg lg:max-w-lg xl:mt-2 xl:max-w-md xl:text-base 2xl:mt-4 2xl:max-w-xl 2xl:text-xl";

export const HOME_BOOKING_TITLE_CLASS =
  "text-balance text-center text-[clamp(1.125rem,1.6vw+0.65rem,1.5rem)] font-medium tracking-tight text-slate-700 xl:text-xl 2xl:text-3xl";

export const HOME_CTA_PRIMARY_CLASS =
  `motion-cta-glow motion-hover-lift ${buttonVariants.primary} inline-flex w-full max-w-full items-center justify-center px-4 py-2 text-center text-base font-medium leading-snug sm:w-auto sm:px-5 sm:py-2.5 sm:text-lg md:px-6 md:py-2.5 xl:px-5 xl:py-2 xl:text-base 2xl:px-7 2xl:py-3 2xl:text-2xl`;

export const HOME_CTA_SECONDARY_CLASS =
  "mt-2 text-center text-sm font-medium text-slate-500 transition hover:text-[#34597E] sm:mt-2.5 sm:text-base xl:mt-2 xl:text-sm 2xl:mt-3 2xl:text-lg";

export const HOME_SERVICE_CARD_TITLE_CLASS =
  "text-balance mt-1 pr-6 text-base leading-tight font-bold tracking-tight sm:mt-1.5 sm:pr-7 sm:text-lg md:text-xl lg:text-[1.2rem] xl:mt-1 xl:pr-6 xl:text-base 2xl:mt-2 2xl:pr-8 2xl:text-[1.8125rem]";

export const HOME_SERVICE_CARD_SUBTITLE_CLASS =
  "text-balance mt-1 text-xs leading-snug sm:mt-1.5 sm:text-sm md:text-sm xl:mt-1 xl:text-[0.6875rem] xl:leading-tight 2xl:mt-2 2xl:text-base";

export const HOME_SIGNATURE_BADGE_CLASS =
  "mb-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide sm:mb-1.5 sm:gap-1.5 sm:px-2.5 sm:py-0.5 sm:text-[0.6875rem] xl:mb-1 xl:px-2 xl:py-0.5 xl:text-[0.625rem] 2xl:mb-2 2xl:px-3 2xl:py-1 2xl:text-xs";

export const HOME_BOOKING_PANEL_CLASS =
  "w-full min-w-0 rounded-2xl border border-white/80 bg-[linear-gradient(225deg,rgba(255,255,255,0.98)_8%,rgba(255,255,255,0.42)_46%,rgba(255,255,255,0.08)_66%,rgba(255,255,255,0)_82%)] p-3 shadow-[0_12px_36px_rgba(15,23,42,0.10)] backdrop-blur-md sm:rounded-3xl sm:p-4 md:p-4 lg:p-5 xl:p-3.5 xl:shadow-[0_10px_28px_rgba(15,23,42,0.08)] 2xl:p-7 2xl:shadow-[0_16px_45px_rgba(15,23,42,0.10)]";
