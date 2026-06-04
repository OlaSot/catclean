import type { OrderServiceType } from "@/lib/constants/orders";
import type { ApartmentCondition, MoveOutPackage } from "./move-out-wizard.types";

export const MOVE_OUT_SERVICE_PARAM = "move_out";
export const BOOKING_PRODUCT_MOVE_OUT = "move_out" as const;
export const MOVE_OUT_ORDER_SERVICE_TYPE: OrderServiceType = "move_in_out";

export const MOVE_OUT_TOTAL_STEPS = 8;

export const MOVE_OUT_SIZE_MIN_M2 = 30;
export const MOVE_OUT_SIZE_MAX_M2 = 200;
export const MOVE_OUT_DEFAULT_SIZE_M2 = 65;

export const MOVE_OUT_SIZE_PRESETS = [30, 45, 65, 85, 110, 140] as const;

export const MOVE_OUT_PROGRESS_STEPS = [
  "package",
  "size",
  "extras",
  "visit",
  "address",
  "schedule",
  "contact",
  "summary",
] as const;

export type MoveOutProgressStepId = (typeof MOVE_OUT_PROGRESS_STEPS)[number];

export type MoveOutPackageCardContent = {
  id: MoveOutPackage;
  title: string;
  badge?: string;
  headline: string;
  highlights: string[];
  checklist: string[];
};

export type ComparisonRow = {
  feature: string;
  standard: string;
  premium: string;
  highlight?: boolean;
};

export type MoveOutExtraOptionId = keyof import("./move-out-wizard.types").MoveOutExtras;

export const MOVE_OUT_EXTRA_OPTION_IDS: MoveOutExtraOptionId[] = [
  "emptyApartment",
  "heavyLimescale",
  "heavyDirt",
  "insideCabinets",
  "fridgeCleaning",
  "ovenCleaning",
  "windowsInside",
  "balconyIncluded",
];

export function conditionSuggestsPremium(condition: ApartmentCondition | null): boolean {
  return condition === "heavy_grease_limescale";
}
