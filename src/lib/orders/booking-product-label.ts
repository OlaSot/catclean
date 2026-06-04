import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import type { TranslationKey } from "@/i18n/i18n.types";

export const BOOKING_PRODUCT_HOME_CARE = "home_care" as const;
export const BOOKING_PRODUCT_HOME_RESET = "home_reset" as const;
export const BOOKING_PRODUCT_MOVE_OUT = "move_out" as const;

export type KnownBookingProduct =
  | typeof BOOKING_PRODUCT_HOME_CARE
  | typeof BOOKING_PRODUCT_HOME_RESET
  | typeof BOOKING_PRODUCT_MOVE_OUT;

const KNOWN_BOOKING_PRODUCTS = new Set<string>([
  BOOKING_PRODUCT_HOME_CARE,
  BOOKING_PRODUCT_HOME_RESET,
  BOOKING_PRODUCT_MOVE_OUT,
]);

const BOOKING_PRODUCT_LABELS_EN: Record<string, string> = {
  [BOOKING_PRODUCT_HOME_CARE]: "Home Care",
  [BOOKING_PRODUCT_HOME_RESET]: "Home Reset",
  [BOOKING_PRODUCT_MOVE_OUT]: "Move Out Cleaning",
  regular_cleaning: "Regular Cleaning",
};

const FREQUENCY_LABELS_EN: Record<string, string> = {
  one_time: "One-time",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Every 4 weeks",
};

const PET_TYPE_LABELS_EN: Record<string, string> = {
  cat: "Cat",
  dog: "Dog",
  multiple: "Multiple pets",
};

export type ResolveBookingProductInput = {
  bookingProduct?: string | null;
  serviceType?: string | null;
  customerComment?: string | null;
  homeResetUpgrade?: string | null;
};

/** Resolves product key used for labels and i18n (may be `regular_cleaning` fallback). */
export function resolveBookingProductKey(input: ResolveBookingProductInput): string {
  const explicit = input.bookingProduct?.trim();
  if (explicit) return explicit;

  const comment = input.customerComment?.trim() ?? "";
  if (/Home Care booking/i.test(comment)) return BOOKING_PRODUCT_HOME_CARE;
  if (/Home Reset booking/i.test(comment)) return BOOKING_PRODUCT_HOME_RESET;

  if (input.homeResetUpgrade?.trim()) return BOOKING_PRODUCT_HOME_RESET;

  const serviceType = input.serviceType?.trim() ?? "";
  if (serviceType === "move_in_out") return BOOKING_PRODUCT_MOVE_OUT;
  if (serviceType === "regular_cleaning") return "regular_cleaning";

  return serviceType || "regular_cleaning";
}

export function isKnownBookingProduct(value: string): value is KnownBookingProduct {
  return KNOWN_BOOKING_PRODUCTS.has(value);
}

export function getBookingProductI18nKey(productKey: string): TranslationKey | null {
  if (productKey === BOOKING_PRODUCT_HOME_CARE) return "bookingProduct.home_care";
  if (productKey === BOOKING_PRODUCT_HOME_RESET) return "bookingProduct.home_reset";
  if (productKey === BOOKING_PRODUCT_MOVE_OUT) return "bookingProduct.move_out";
  return null;
}

function serviceTypeLabelEn(serviceType: string | null | undefined): string {
  const key = serviceType?.trim() ?? "";
  const match = ORDER_SERVICE_TYPES.find((item) => item.value === key);
  return match?.label ?? (key || "Cleaning");
}

/** Server-side / email fallback (English). */
export function getBookingProductLabelEn(
  productKey: string,
  serviceType?: string | null
): string {
  return (
    BOOKING_PRODUCT_LABELS_EN[productKey] ?? serviceTypeLabelEn(serviceType ?? productKey)
  );
}

export function formatCleaningFrequencyLabel(
  frequency: string | null | undefined
): string | null {
  if (!frequency?.trim()) return null;
  return FREQUENCY_LABELS_EN[frequency.trim()] ?? frequency.trim();
}

export function formatPetTypeLabel(petType: string | null | undefined): string | null {
  if (!petType?.trim()) return null;
  const key = petType.trim().toLowerCase();
  if (key === "no_pets") return null;
  return PET_TYPE_LABELS_EN[key] ?? petType.trim();
}

/** Value persisted on `orders.booking_product` when the client omits it. */
export function resolveBookingProductForPersist(
  input: ResolveBookingProductInput
): string | null {
  const key = resolveBookingProductKey(input);
  if (isKnownBookingProduct(key)) return key;
  if (key === "regular_cleaning") return null;
  return key || null;
}
