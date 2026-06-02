import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import type { OrderServiceType } from "@/lib/constants/orders";

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

export function formatOrderServiceSummary(
  details: AdminOrderServiceDetails | null | undefined
): string | null {
  if (!details?.data) return null;

  const data = details.data as Record<string, unknown>;
  const type = details.type as OrderServiceType;
  const parts: string[] = [];

  switch (type) {
    case "regular_cleaning": {
      const size = data.propertySizeM2 as number | null;
      if (size && size > 0) parts.push(`${size} m²`);
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
      const size = data.propertySizeM2 as number | null;
      if (size && size > 0) parts.push(`${size}m²`);
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
