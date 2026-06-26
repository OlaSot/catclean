/**
 * Client portal layout tokens — derived from the unified design system.
 * @see @/lib/design-system/tokens
 */
import { surfaces, typography } from "@/lib/design-system/tokens";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui/Button";
import { CARD_CLASS, CARD_SOFT_CLASS } from "@/components/ui/Card";

export const PORTAL_PAGE_CLASS = `min-h-dvh ${surfaces.page}`;

/** Mobile: narrow centered column. Desktop: full width within shell max-width. */
export const PORTAL_CONTENT_CLASS =
  "mx-auto w-full max-w-lg px-5 pb-28 pt-6 sm:max-w-xl sm:px-6 sm:pt-8 lg:max-w-[1240px] lg:px-8 lg:pb-10 lg:pt-8";

export const PORTAL_SHELL_CLASS = "lg:flex lg:min-h-dvh";

export const PORTAL_MAIN_CLASS = "min-w-0 flex-1";

export const PORTAL_CARD_CLASS = CARD_CLASS;

export const PORTAL_CARD_SOFT_CLASS = CARD_SOFT_CLASS;

export const PORTAL_PRIMARY_BUTTON_CLASS = PRIMARY_BUTTON_CLASS;

export const PORTAL_SECONDARY_BUTTON_CLASS = SECONDARY_BUTTON_CLASS;

export const PORTAL_SECTION_TITLE_CLASS = typography.sectionTitle;

export const PORTAL_GREETING_CLASS = typography.greeting;

export const PORTAL_MUTED_CLASS = typography.muted;

export const PORTAL_DESKTOP_GRID_CLASS =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10";

export const PORTAL_DESKTOP_MAIN_CLASS = "min-w-0 space-y-10";

export const PORTAL_DESKTOP_SIDEBAR_CLASS =
  "hidden space-y-5 lg:block lg:sticky lg:top-8";
