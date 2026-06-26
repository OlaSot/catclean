import { HOME_RESET_IMAGES } from "@/features/home-reset-wizard/home-reset-wizard.constants";

export type PortalServiceId =
  | "home_care"
  | "home_reset"
  | "move_out"
  | "window_cleaning"
  | "dry_cleaning";

export type PortalService = {
  id: PortalServiceId;
  title: string;
  subtitle: string;
  imageUrl: string;
  bookingHref: string;
};

export const PORTAL_SERVICES: PortalService[] = [
  {
    id: "home_care",
    title: "Home Care",
    subtitle: "Regular upkeep for a consistently fresh home",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
    bookingHref: "/booking?service=home_care",
  },
  {
    id: "home_reset",
    title: "Home Reset",
    subtitle: "A deeper refresh when your home needs a full reset",
    imageUrl: HOME_RESET_IMAGES.hero,
    bookingHref: "/booking?service=home_reset",
  },
  {
    id: "move_out",
    title: "Move Out",
    subtitle: "Handover-ready cleaning for your next chapter",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    bookingHref: "/booking?service=move_out",
  },
  {
    id: "window_cleaning",
    title: "Window Cleaning",
    subtitle: "Crystal-clear views, inside and out",
    imageUrl: "/windows/m-window.png",
    bookingHref: "/booking?service=window_cleaning",
  },
  {
    id: "dry_cleaning",
    title: "Upholstery Cleaning",
    subtitle: "Sofas, mattresses, and fabrics refreshed",
    imageUrl: "/dry-cleaning/2-seated-sofa.png",
    bookingHref: "/booking?service=upholstery",
  },
];

export const PORTAL_SERVICE_BY_ID = Object.fromEntries(
  PORTAL_SERVICES.map((service) => [service.id, service])
) as Record<PortalServiceId, PortalService>;

export function getServiceBookingHref(serviceId: PortalServiceId): string {
  return PORTAL_SERVICE_BY_ID[serviceId].bookingHref;
}
