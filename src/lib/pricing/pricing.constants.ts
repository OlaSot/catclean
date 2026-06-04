import type { OrderServiceType } from "@/lib/constants/orders";

/** EUR per m² — base rates (before extras / minimum). */
export const PRICING_RATE_EUR_PER_M2 = {
  regular_cleaning: 2.8,
  move_in_out_standard: 3.5,
  move_in_out_premium: 4.5,
  office_cleaning: 2.5,
} as const;

export const REGULAR_CLEANING_DEEP_MULTIPLIER = 1.3;

export const MINIMUM_ORDER_AMOUNT_EUR: Record<string, number> = {
  regular_cleaning: 75,
  move_in_out: 120,
  office_cleaning: 100,
};

/** Global fallback minimum when service-specific minimum is not set. */
export const MINIMUM_ORDER_AMOUNT_DEFAULT_EUR = 75;

/** Flat surcharges (EUR). */
export const PRICING_EXTRAS_EUR = {
  oven_cleaning: 25,
  fridge_cleaning: 20,
  inside_cabinets: 30,
  balcony: 20,
  windows_inside: 35,
  pets: 15,
} as const;

export type PricingExtraKey = keyof typeof PRICING_EXTRAS_EUR;

/** Services with automatic sqm-based pricing on create. */
export const AUTO_PRICING_SERVICE_TYPES: OrderServiceType[] = [
  "regular_cleaning",
  "move_in_out",
  "office_cleaning",
];

export function supportsAutoPricing(
  serviceType: string | null | undefined
): serviceType is (typeof AUTO_PRICING_SERVICE_TYPES)[number] {
  return AUTO_PRICING_SERVICE_TYPES.includes(
    serviceType as (typeof AUTO_PRICING_SERVICE_TYPES)[number]
  );
}
