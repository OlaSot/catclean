/**
 * Login page design tokens — derived from the unified design system.
 */
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/Button";
import { inputLg, surfaces } from "@/lib/design-system/tokens";

export const LOGIN_PAGE_BG_CLASS = "relative min-h-dvh overflow-hidden bg-[#EEF2F7] text-slate-700";

export const LOGIN_LAYOUT_MAX_WIDTH_CLASS = "max-w-[1160px]";

/** Home Reset hero — white cat in a bright apartment. */
// TODO: add /wizard/wizard_main.png to public/ when asset is available in repo
export const LOGIN_HERO_IMAGE = "/wizard/wizard_main.png";

/** Homepage hero fallback — used if Home Reset image is unavailable. */
export const LOGIN_HERO_FALLBACK_IMAGE = "/images/catclean-hero-placeholder.jpg";

export const LOGIN_HERO_CSS_FALLBACK_CLASS =
  "bg-[linear-gradient(145deg,#f8fafc_0%,#eef4fa_38%,#dce9f5_100%)] bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.95),transparent_42%),radial-gradient(circle_at_24%_78%,rgba(52,89,126,0.10),transparent_48%)]";

export const LOGIN_CARD_CLASS = `${surfaces.cardPanel} w-full rounded-[32px] p-7 sm:p-9`;

/** Mobile login card — overlaps hero, premium app feel */
export const LOGIN_CARD_MOBILE_CLASS =
  "max-md:-mt-5 max-md:rounded-[32px] max-md:border-slate-100/90 max-md:bg-white max-md:p-5 max-md:pt-6 max-md:shadow-[0_20px_50px_rgba(15,23,42,0.09)] max-md:ring-1 max-md:ring-slate-100/80";

export const LOGIN_INPUT_CLASS = inputLg;

export const LOGIN_INPUT_MOBILE_CLASS = "max-md:h-14 max-md:min-h-14";

export const LOGIN_PRIMARY_BUTTON_CLASS = `${PRIMARY_BUTTON_CLASS} gap-2 hover:shadow-[0_14px_32px_rgba(52,89,126,0.32)] disabled:cursor-not-allowed disabled:opacity-70`;

export const LOGIN_PRIMARY_BUTTON_MOBILE_CLASS = "max-md:h-14 max-md:min-h-[56px] max-md:text-base";

export const LOGIN_COPY = {
  staff: {
    title: "CatClean Operations",
    subtitle: "Sign in to manage bookings, cleaners and daily operations.",
    helper: "Use your staff account.",
  },
  phone: {
    title: "Welcome back",
    subtitle: "Access your bookings, orders and cleaning updates.",
    helper: "Phone login for clients and cleaners is coming soon.",
  },
} as const;

/** Mobile-only staff headline — desktop keeps LOGIN_COPY.staff */
export const LOGIN_MOBILE_STAFF_COPY = {
  title: "Welcome back",
  subtitle: "Sign in to continue managing bookings and daily operations.",
} as const;

export const LOGIN_HERO_LINES = [
  "Professional cleaning.",
  "Premium home experience.",
  "Trusted in Hannover.",
] as const;

export const LOGIN_HERO_MOBILE_LINES = [
  "Professional cleaning.",
  "Premium experience.",
] as const;
