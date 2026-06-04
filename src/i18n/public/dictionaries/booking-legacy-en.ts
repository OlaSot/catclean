import type { bookingLegacyDe } from "./booking-legacy-de";

export const bookingLegacyEn: Record<keyof typeof bookingLegacyDe, string> = {
  "public.bookingLegacy.title": "Book your cleaning",
  "public.bookingLegacy.subtitle": "Premium booking flow with instant estimate.",
  "public.bookingLegacy.createBooking": "Create booking",
  "public.bookingLegacy.creating": "Creating...",
  "public.bookingLegacy.back": "Back",
  "public.bookingLegacy.continue": "Continue",
  "public.bookingLegacy.step": "Step",
  "public.bookingLegacy.chooseService": "Please choose a service",
  "public.bookingLegacy.invalidSize": "Enter valid size in m²",
  "public.bookingLegacy.deepHint": "Deep reset uses higher intensity pricing.",
  "public.bookingLegacy.extrasNone": "None",
  "public.bookingLegacy.successTitle": "Booking created successfully.",
  "public.bookingLegacy.orderId": "Order ID",
  "public.bookingLegacy.confirmPending": "Confirmation pending",
  "public.bookingLegacy.confirmHint":
    "Please confirm your booking using the confirmation link sent by our team.",
  "public.bookingLegacy.submitFailed": "Failed to create booking",
  "public.bookingLegacy.stepOf": "Step {current} of {total}",
  "public.bookingLegacy.next": "Next →",
  "public.bookingLegacy.todoNote":
    "Legacy calculator: primary flows use /booking?service=home_reset|home_care|move_out.",
};
