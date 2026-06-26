/**
 * CatClean unified design tokens.
 * Single source of truth for colors, radii, shadows, and shared class strings.
 */

/** Brand palette */
export const colors = {
  brand: "#34597E",
  brandHover: "#2d4d6f",
  brandAccent: "#5B8DB8",
  brandLight: "#EEF4FA",
  brandRing: "#C5D9EB",
  brandMuted: "#dce9f5",
  pageBg: "#F6F8FB",
  pageBgAlt: "#EEF2F7",
  infoPanelBg: "#eef5fb",
  infoPanelBorder: "#d6e6f2",
} as const;

/** Surfaces */
export const surfaces = {
  page: "bg-[#F6F8FB]",
  pageAlt: "bg-[#EEF2F7]",
  card: "rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]",
  cardSoft: "rounded-2xl border border-slate-200/80 bg-[#F6F8FB]",
  cardPanel:
    "rounded-2xl border border-white/80 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.10)] backdrop-blur-md",
  infoCallout: "rounded-2xl border border-[#d6e6f2] bg-[#eef5fb]",
  dialog:
    "rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]",
} as const;

/** Typography */
export const typography = {
  label: "text-sm font-medium text-slate-600",
  hint: "text-xs text-slate-400",
  error: "text-xs text-rose-500",
  sectionTitle: "text-lg font-semibold tracking-tight text-slate-800 sm:text-xl",
  greeting: "text-balance text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl",
  muted: "text-sm text-slate-500",
} as const;

/** Inputs */
export const inputBase =
  "w-full rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

export const inputSm = `${inputBase} px-3 py-2 text-sm`;
export const inputMd = `${inputBase} px-4 py-3 text-sm`;
export const inputLg =
  "h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-12 pr-4 text-base text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#5B8DB8]/60 focus:ring-4 focus:ring-[#5B8DB8]/12 sm:h-14";

export const textareaClass = inputMd;

export const selectNative = `${inputSm} font-medium`;

/** Buttons — size modifiers */
export const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
  xl: "h-12 px-6 text-base sm:h-14",
} as const;

/** Buttons — variant modifiers */
export const buttonVariants = {
  primary: `inline-flex items-center justify-center gap-2 rounded-full bg-[#34597E] font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.28)] transition hover:bg-[#2d4d6f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60`,
  secondary: `inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white font-semibold text-[#34597E] shadow-sm transition hover:border-[#C5D9EB] hover:bg-[#f9fcff]`,
  ghost: `inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white font-medium text-slate-600 transition hover:border-slate-300 hover:bg-[#EEF4FA]`,
  outline: `inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white font-medium text-slate-600 transition hover:border-[#34597E]/30 hover:text-[#34597E] disabled:opacity-50`,
  outlineBrand: `inline-flex items-center justify-center gap-2 rounded-full border border-[#34597E]/30 bg-white font-semibold text-[#34597E] transition hover:border-[#34597E] hover:bg-[#f8fbfd]`,
  link: `font-medium text-[#34597E] transition hover:text-[#2d4d6f] hover:underline disabled:opacity-50`,
  linkDanger: `font-medium text-rose-600 transition hover:text-rose-700 hover:underline disabled:opacity-50`,
} as const;

/** Badge base */
export const badgeBase = "inline-flex items-center rounded-full font-semibold ring-1";

export const badgeSizes = {
  xs: "h-5 px-2 text-[11px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3.5 py-1 text-sm",
} as const;

/** Wizard */
export const wizardNavDivider = "border-t border-slate-200/80";
