import type { OrderServiceType } from "@/lib/constants/orders";
import { ORDER_SERVICE_DETAIL_TABLE } from "@/lib/constants/orders";

export type CreateOrderServiceDetailsInput = Record<string, unknown>;

function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded > 0 ? rounded : null;
}

function toOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s ? s : null;
}

function toBool(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return defaultValue;
}

export function mapCreateServiceDetailsToDbRow(
  serviceType: OrderServiceType,
  serviceDetails: CreateOrderServiceDetailsInput | null | undefined
): Record<string, unknown> {
  const d = serviceDetails ?? {};

  switch (serviceType) {
    case "regular_cleaning": {
      const petTypeRaw = toOptionalString(d.petType ?? d.pet_type);
      const petsOption = toOptionalString(d.petsOption ?? d.pets_option);
      const petType =
        petTypeRaw ??
        (petsOption && petsOption !== "no_pets" ? petsOption : null);

      return {
        property_size_m2: toOptionalInt(d.propertySizeM2 ?? d.property_size_m2),
        cleaning_intensity:
          d.cleaningIntensity === "deep" || d.cleaning_intensity === "deep"
            ? "deep"
            : "standard",
        cleaning_frequency: toOptionalString(
          d.cleaningFrequency ?? d.cleaning_frequency
        ),
        property_type: toOptionalString(d.propertyType ?? d.property_type),
        rooms_count: toOptionalInt(d.roomsCount ?? d.rooms_count),
        bathrooms_count: toOptionalInt(
          d.bathroomsCount ?? d.bathrooms_count
        ),
        oven_cleaning: toBool(d.ovenCleaning ?? d.oven_cleaning),
        fridge_cleaning: toBool(d.fridgeCleaning ?? d.fridge_cleaning),
        inside_cabinets: toBool(d.insideCabinets ?? d.inside_cabinets),
        balcony_included: toBool(d.balconyIncluded ?? d.balcony_included),
        windows_inside: toBool(d.windowsInside ?? d.windows_inside),
        has_pets: toBool(d.hasPets ?? d.has_pets),
        pet_type: petType,
      };
    }
    case "move_in_out":
      return {
        property_size_m2: toOptionalInt(d.propertySizeM2 ?? d.property_size_m2),
        package_type: String(d.packageType ?? d.package_type ?? "standard")
          .trim()
          .toLowerCase(),
        empty_apartment: toBool(d.emptyApartment ?? d.empty_apartment),
        heavy_limescale: toBool(d.heavyLimescale ?? d.heavy_limescale),
        heavy_dirt: toBool(d.heavyDirt ?? d.heavy_dirt),
        oven_cleaning: toBool(d.ovenCleaning ?? d.oven_cleaning),
        fridge_cleaning: toBool(d.fridgeCleaning ?? d.fridge_cleaning),
        inside_cabinets: toBool(d.insideCabinets ?? d.inside_cabinets),
        windows_inside: toBool(d.windowsInside ?? d.windows_inside),
        balcony_included: toBool(d.balconyIncluded ?? d.balcony_included),
      };
    case "office_cleaning":
      return {
        office_size_m2: toOptionalInt(d.officeSizeM2 ?? d.office_size_m2),
        workstations_count: toOptionalInt(
          d.workstationsCount ?? d.workstations_count
        ),
        bathrooms_count: toOptionalInt(
          d.bathroomsCount ?? d.bathrooms_count
        ),
      };
    default:
      return {};
  }
}

export function getDetailTableForService(
  serviceType: OrderServiceType
): string | null {
  return ORDER_SERVICE_DETAIL_TABLE[serviceType] ?? null;
}
