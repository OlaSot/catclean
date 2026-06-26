import { HOME_RESET_IMAGES } from "@/features/home-reset-wizard/home-reset-wizard.constants";

/** Query param values for /booking?service= */
export type BookingServiceParam =
  | "home_care"
  | "home_reset"
  | "move_out"
  | "window_cleaning"
  | "upholstery"
  | "legacy";

export type BookingServiceOption = {
  param: BookingServiceParam;
  titleKey: string;
  subtitleKey: string;
  imageUrl: string;
};

export const BOOKING_SERVICE_OPTIONS: BookingServiceOption[] = [
  {
    param: "home_care",
    titleKey: "public.booking.service.homeCare.title",
    subtitleKey: "public.booking.service.homeCare.subtitle",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
  },
  {
    param: "home_reset",
    titleKey: "public.booking.service.homeReset.title",
    subtitleKey: "public.booking.service.homeReset.subtitle",
    imageUrl: HOME_RESET_IMAGES.hero,
  },
  {
    param: "move_out",
    titleKey: "public.booking.service.moveOut.title",
    subtitleKey: "public.booking.service.moveOut.subtitle",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
  },
  {
    param: "window_cleaning",
    titleKey: "public.booking.service.window.title",
    subtitleKey: "public.booking.service.window.subtitle",
    imageUrl: "/windows/m-window.png",
  },
  {
    param: "upholstery",
    titleKey: "public.booking.service.upholstery.title",
    subtitleKey: "public.booking.service.upholstery.subtitle",
    imageUrl: "/dry-cleaning/2-seated-sofa.png",
  },
];

/** Aliases that resolve to a product wizard (backward compatibility). */
export const BOOKING_SERVICE_ALIASES: Record<string, BookingServiceParam | "home_care"> = {
  regular_cleaning: "home_care",
  dry_cleaning: "upholstery",
};

export function resolveBookingServiceParam(
  raw: string | undefined,
): BookingServiceParam | "home_care" | null {
  if (!raw?.trim()) return null;
  const key = raw.trim().toLowerCase();
  if (key in BOOKING_SERVICE_ALIASES) {
    return BOOKING_SERVICE_ALIASES[key];
  }
  const known = BOOKING_SERVICE_OPTIONS.some((s) => s.param === key);
  if (known || key === "legacy") {
    return key as BookingServiceParam;
  }
  return null;
}

export function bookingServiceHref(
  param: BookingServiceParam | "home_care",
  extra?: { addressId?: string; repeatFrom?: string },
): string {
  const search = new URLSearchParams({ service: param });
  if (extra?.addressId?.trim()) {
    search.set("addressId", extra.addressId.trim());
  }
  if (extra?.repeatFrom?.trim()) {
    search.set("repeatFrom", extra.repeatFrom.trim());
  }
  return `/booking?${search.toString()}`;
}
