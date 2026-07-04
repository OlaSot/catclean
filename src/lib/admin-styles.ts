/**
 * Admin panel layout tokens — viewport-fit scaling and fluid density.
 */
import { typography } from "@/lib/design-system/tokens";

export const ADMIN_SHELL_CLASS =
  "flex h-dvh max-h-dvh overflow-hidden bg-[#F6F8FB] lg:min-h-screen lg:max-h-none";

export const ADMIN_MAIN_CLASS = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";

export const ADMIN_CONTENT_CLASS =
  "mx-auto h-full w-full max-w-[1280px] px-[clamp(0.625rem,2.5vw,2rem)] py-[clamp(0.375rem,1.5vh,1.5rem)]";

/** Fluid vertical rhythm — tighter on short screens */
export const ADMIN_PAGE_STACK_CLASS = "space-y-[clamp(0.5rem,1.8vh,1.5rem)]";

export const ADMIN_PAGE_TITLE_CLASS =
  "text-[clamp(1.125rem,4.2vmin,1.875rem)] font-semibold leading-tight tracking-tight text-slate-800";

export const ADMIN_PAGE_SUBTITLE_CLASS =
  "mt-0.5 text-[clamp(0.6875rem,2.6vmin,0.875rem)] leading-snug text-slate-500";

export const ADMIN_SECTION_TITLE_CLASS = typography.sectionTitle;

export const ADMIN_PAGE_HEADER_ROW_CLASS =
  "flex flex-col gap-[clamp(0.5rem,1.5vh,1rem)] sm:flex-row sm:flex-wrap sm:items-end sm:justify-between";

export const ADMIN_PRIMARY_ACTION_CLASS =
  "inline-flex w-full shrink-0 items-center justify-center rounded-full bg-[#34597E] px-[clamp(0.75rem,3vw,1.25rem)] py-[clamp(0.375rem,1.2vh,0.625rem)] text-[clamp(0.6875rem,2.5vmin,0.875rem)] font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] sm:w-auto";

export const ADMIN_CHIP_CLASS =
  "rounded-full px-[clamp(0.5rem,2vw,0.75rem)] py-0.5 text-[clamp(0.625rem,2.2vmin,0.75rem)] font-medium ring-1";

export const ADMIN_CARD_CLASS =
  "rounded-[clamp(1rem,3vmin,1.5rem)] border border-slate-200/80 bg-white p-[clamp(0.625rem,2vh,1.25rem)] shadow-[0_8px_28px_rgba(15,23,42,0.05)]";
