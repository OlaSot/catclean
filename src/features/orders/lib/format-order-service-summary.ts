import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import type { OrderServiceType } from "@/lib/constants/orders";
import {
  BOOKING_PRODUCT_HOME_CARE,
  BOOKING_PRODUCT_HOME_RESET,
  BOOKING_PRODUCT_MOVE_OUT,
  formatCleaningFrequencyLabel,
  formatPetTypeLabel,
  resolveBookingProductKey,
} from "@/lib/orders/booking-product-label";

export type FormatOrderServiceSummaryOptions = {
  bookingProduct?: string | null;
  serviceType?: string | null;
  customerComment?: string | null;
  homeResetUpgrade?: string | null;
};

function pushPart(parts: string[], value: string | null | undefined) {
  if (value) parts.push(value);
}

function countPart(
  value: number | null | undefined,
  label: string,
  pluralLabel?: string
): string | null {
  if (value === null || value === undefined || value <= 0) return null;
  const text = value === 1 ? label : (pluralLabel ?? `${label}s`);
  return `${value} ${text}`;
}

function flagPart(value: boolean | null | undefined, label: string): string | null {
  return value ? label : null;
}

function sizePart(size: number | null | undefined): string | null {
  if (size == null || size <= 0) return null;
  return `${size}m²`;
}

function resolveProductKey(
  details: AdminOrderServiceDetails,
  options?: FormatOrderServiceSummaryOptions
): string {
  return resolveBookingProductKey({
    bookingProduct: options?.bookingProduct,
    serviceType: options?.serviceType ?? details.type,
    customerComment: options?.customerComment,
    homeResetUpgrade: options?.homeResetUpgrade,
  });
}

function formatHomeCareSummary(data: Record<string, unknown>): string | null {
  const parts: string[] = [];
  pushPart(parts, sizePart(data.propertySizeM2 as number | null));
  pushPart(
    parts,
    formatCleaningFrequencyLabel(
      (data.cleaningFrequency as string) ?? (data.cleaning_frequency as string)
    )
  );
  const petLabel = formatPetTypeLabel(
    (data.petType as string) ?? (data.pet_type as string)
  );
  if (petLabel) {
    pushPart(parts, petLabel);
  } else {
    pushPart(parts, flagPart(data.hasPets as boolean, "pets"));
  }
  pushPart(parts, flagPart(data.windowsInside as boolean, "windows"));
  pushPart(parts, flagPart(data.ovenCleaning as boolean, "oven"));
  pushPart(parts, flagPart(data.fridgeCleaning as boolean, "fridge"));
  pushPart(parts, flagPart(data.balconyIncluded as boolean, "balcony"));
  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatHomeResetSummary(
  data: Record<string, unknown>,
  options?: FormatOrderServiceSummaryOptions
): string | null {
  const parts: string[] = [];
  pushPart(parts, sizePart(data.propertySizeM2 as number | null));
  const upgrade = options?.homeResetUpgrade?.trim();
  pushPart(parts, upgrade ? `deep reset · ${upgrade}` : "deep reset");
  pushPart(parts, flagPart(data.ovenCleaning as boolean, "oven"));
  pushPart(parts, flagPart(data.fridgeCleaning as boolean, "fridge"));
  pushPart(parts, flagPart(data.balconyIncluded as boolean, "balcony"));
  pushPart(parts, flagPart(data.windowsInside as boolean, "windows"));
  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatMoveOutProductSummary(data: Record<string, unknown>): string | null {
  const parts: string[] = [];
  pushPart(parts, sizePart(data.propertySizeM2 as number | null));
  const pkg = (data.packageType as string)?.trim();
  pushPart(parts, pkg || "premium");
  pushPart(parts, flagPart(data.insideCabinets as boolean, "cabinets"));
  pushPart(parts, flagPart(data.ovenCleaning as boolean, "oven"));
  pushPart(parts, flagPart(data.fridgeCleaning as boolean, "fridge"));
  pushPart(parts, flagPart(data.windowsInside as boolean, "windows"));
  pushPart(parts, flagPart(data.balconyIncluded as boolean, "balcony"));
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatOrderServiceSummary(
  details: AdminOrderServiceDetails | null | undefined,
  options?: FormatOrderServiceSummaryOptions
): string | null {
  if (!details?.data) return null;

  const data = details.data as Record<string, unknown>;
  const type = details.type as OrderServiceType;
  const productKey = resolveProductKey(details, options);

  if (type === "regular_cleaning" && productKey === BOOKING_PRODUCT_HOME_CARE) {
    return formatHomeCareSummary(data);
  }
  if (type === "regular_cleaning" && productKey === BOOKING_PRODUCT_HOME_RESET) {
    return formatHomeResetSummary(data, options);
  }
  if (type === "move_in_out" && productKey === BOOKING_PRODUCT_MOVE_OUT) {
    return formatMoveOutProductSummary(data);
  }

  const parts: string[] = [];

  switch (type) {
    case "regular_cleaning": {
      pushPart(parts, sizePart(data.propertySizeM2 as number | null));
      const intensity = (data.cleaningIntensity as string)?.trim();
      if (intensity && intensity !== "standard") pushPart(parts, intensity);
      pushPart(parts, countPart(data.roomsCount as number, "room"));
      pushPart(parts, countPart(data.bathroomsCount as number, "bathroom", "bathrooms"));
      pushPart(parts, flagPart(data.ovenCleaning as boolean, "oven"));
      pushPart(parts, flagPart(data.fridgeCleaning as boolean, "fridge"));
      pushPart(parts, flagPart(data.windowsInside as boolean, "windows"));
      pushPart(parts, flagPart(data.hasPets as boolean, "pets"));
      if (!parts.length) {
        pushPart(parts, countPart(data.bedroomsCount as number, "bedroom", "bedrooms"));
      }
      break;
    }
    case "move_in_out": {
      pushPart(parts, sizePart(data.propertySizeM2 as number | null));
      pushPart(parts, (data.packageType as string)?.trim() || null);
      pushPart(parts, flagPart(data.windowsInside as boolean, "windows"));
      pushPart(parts, flagPart(data.ovenCleaning as boolean, "oven"));
      pushPart(parts, flagPart(data.heavyLimescale as boolean, "limescale"));
      break;
    }
    case "airbnb_turnover": {
      pushPart(parts, countPart(data.bedroomsCount as number, "bedroom", "bedrooms"));
      pushPart(parts, countPart(data.bathroomsCount as number, "bathroom", "bathrooms"));
      pushPart(parts, flagPart(data.linenChange as boolean, "linen"));
      pushPart(parts, flagPart(data.laundryRequired as boolean, "laundry"));
      break;
    }
    case "office_cleaning": {
      const officeSize = data.officeSizeM2 as number | null;
      if (officeSize && officeSize > 0) parts.push(`${officeSize} m²`);
      pushPart(
        parts,
        countPart(data.workstationsCount as number, "workstation", "workstations")
      );
      pushPart(parts, countPart(data.bathroomsCount as number, "bathroom", "bathrooms"));
      pushPart(parts, flagPart(data.kitchenArea as boolean, "kitchen"));
      break;
    }
    case "window_cleaning": {
      pushPart(parts, countPart(data.windowsCount as number, "window", "windows"));
      pushPart(parts, countPart(data.balconyDoorsCount as number, "balcony door", "balcony doors"));
      break;
    }
    case "dry_cleaning": {
      pushPart(parts, countPart(data.sofasCount as number, "sofa", "sofas"));
      pushPart(parts, countPart(data.mattressesCount as number, "mattress", "mattresses"));
      pushPart(parts, countPart(data.carpetsCount as number, "carpet", "carpets"));
      break;
    }
    case "special_pet_package": {
      pushPart(parts, (data.packageFocus as string)?.trim() || null);
      pushPart(parts, flagPart(data.hasPets as boolean, "pets"));
      pushPart(parts, flagPart(data.allergyFriendlyProducts as boolean, "allergy-safe"));
      break;
    }
    default:
      break;
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
