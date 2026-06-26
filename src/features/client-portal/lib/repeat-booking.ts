import type { PortalServiceId } from "../lib/service-catalog";
import type { BookingServiceParam } from "@/lib/booking/booking-services";

/** Build booking URL for repeat booking from a prior order. */
export function buildRepeatBookingHref(order: {
  id: string;
  serviceId: PortalServiceId;
}): string {
  const serviceParam: BookingServiceParam =
    order.serviceId === "dry_cleaning" ? "upholstery" : order.serviceId;
  const params = new URLSearchParams({
    service: serviceParam,
    repeatFrom: order.id,
  });
  return `/booking?${params.toString()}`;
}
