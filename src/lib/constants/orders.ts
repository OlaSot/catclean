export const ORDER_SERVICE_TYPES = [
  { value: "regular_cleaning", label: "Regular Cleaning" },
  { value: "move_in_out", label: "Move In / Out" },
  { value: "airbnb_turnover", label: "Airbnb Turnover" },
  { value: "office_cleaning", label: "Office Cleaning" },
  { value: "dry_cleaning", label: "Dry Cleaning" },
  { value: "window_cleaning", label: "Window Cleaning" },
  { value: "special_pet_package", label: "Special Pet Package" },
] as const;

export type OrderServiceType =
  (typeof ORDER_SERVICE_TYPES)[number]["value"];

/** Detail table per service_type (public schema). */
export const ORDER_SERVICE_DETAIL_TABLE: Record<
  OrderServiceType,
  string
> = {
  regular_cleaning: "regular_cleaning_details",
  move_in_out: "move_cleaning_details",
  airbnb_turnover: "airbnb_details",
  office_cleaning: "office_cleaning_details",
  dry_cleaning: "dry_cleaning_details",
  window_cleaning: "window_cleaning_details",
  special_pet_package: "special_package_details",
};

export const DEFAULT_ORDER_CURRENCY = "EUR" as const;
export const DEFAULT_ORDER_STATUS = "awaiting_confirmation" as const;
export const DEFAULT_PAYMENT_STATUS = "unpaid" as const;
