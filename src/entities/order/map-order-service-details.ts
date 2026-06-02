import {
  ORDER_SERVICE_DETAIL_TABLE,
  ORDER_SERVICE_TYPES,
  type OrderServiceType,
} from "@/lib/constants/orders";
import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";

const SERVICE_TYPE_SET = new Set<string>(ORDER_SERVICE_TYPES.map((t) => t.value));

const DETAIL_META_KEYS = new Set([
  "id",
  "order_id",
  "created_at",
  "updated_at",
]);

type RawDetailRow = Record<string, unknown>;

function isServiceType(value: string): value is OrderServiceType {
  return SERVICE_TYPE_SET.has(value);
}

function pickValue(row: RawDetailRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in row && row[key] !== undefined) {
      return row[key];
    }
  }
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return null;
}

function toString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s ? s : null;
}

function toStringArray(value: unknown): string[] | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean);
    return items.length ? items : null;
  }
  const s = String(value).trim();
  return s ? [s] : null;
}

function formatTime(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function mapMoveTypeFlags(moveType: string | null): {
  isMoveIn: boolean | null;
  isMoveOut: boolean | null;
} {
  if (!moveType) return { isMoveIn: null, isMoveOut: null };
  const key = moveType.toLowerCase();
  if (key === "move_in") return { isMoveIn: true, isMoveOut: false };
  if (key === "move_out") return { isMoveIn: false, isMoveOut: true };
  if (key === "both") return { isMoveIn: true, isMoveOut: true };
  return { isMoveIn: null, isMoveOut: null };
}

function mapRegularCleaning(row: RawDetailRow) {
  const petType = toString(pickValue(row, "pet_type"));
  const hasPetsExplicit = toBoolean(pickValue(row, "has_pets"));
  const hasPets =
    hasPetsExplicit !== null ? hasPetsExplicit : petType ? true : null;

  return {
    propertySizeM2: toNumber(
      pickValue(row, "property_size_m2", "property_size_sqm")
    ),
    cleaningIntensity: toString(pickValue(row, "cleaning_intensity")),
    roomsCount: toNumber(pickValue(row, "rooms_count")),
    bedroomsCount: toNumber(pickValue(row, "bedrooms_count")),
    bathroomsCount: toNumber(pickValue(row, "bathrooms_count")),
    kitchenIncluded: toBoolean(pickValue(row, "kitchen_included")),
    livingRoomIncluded: toBoolean(pickValue(row, "living_room_included")),
    corridorIncluded: toBoolean(pickValue(row, "corridor_included")),
    balconyIncluded: toBoolean(pickValue(row, "balcony_included")),
    fridgeCleaning: toBoolean(pickValue(row, "fridge_cleaning")),
    ovenCleaning: toBoolean(pickValue(row, "oven_cleaning")),
    insideCabinets: toBoolean(pickValue(row, "inside_cabinets")),
    windowsInside: toBoolean(
      pickValue(row, "windows_inside", "windows_included")
    ),
    hasPets,
    petType,
    extraHours: toNumber(pickValue(row, "extra_hours")),
    suppliesProvidedBy: toString(pickValue(row, "supplies_provided_by")),
    equipmentRequired: toStringArray(pickValue(row, "equipment_required")),
  };
}

function mapMoveCleaning(row: RawDetailRow) {
  const moveType = toString(pickValue(row, "move_type"));
  const flags = mapMoveTypeFlags(moveType);
  const isMoveIn = toBoolean(pickValue(row, "is_move_in")) ?? flags.isMoveIn;
  const isMoveOut = toBoolean(pickValue(row, "is_move_out")) ?? flags.isMoveOut;

  return {
    propertySizeM2: toNumber(
      pickValue(row, "property_size_m2", "property_size_sqm")
    ),
    packageType: toString(pickValue(row, "package_type")),
    isMoveIn,
    isMoveOut,
    emptyApartment: toBoolean(pickValue(row, "empty_apartment")),
    heavyLimescale: toBoolean(
      pickValue(row, "heavy_limescale", "limescale_removal")
    ),
    heavyDirt: toBoolean(pickValue(row, "heavy_dirt")),
    insideCabinets: toBoolean(pickValue(row, "inside_cabinets")),
    fridgeCleaning: toBoolean(pickValue(row, "fridge_cleaning")),
    ovenCleaning: toBoolean(pickValue(row, "oven_cleaning")),
    windowsInside: toBoolean(
      pickValue(row, "windows_inside", "windows_included")
    ),
    balconyIncluded: toBoolean(pickValue(row, "balcony_included")),
  };
}

function mapAirbnb(row: RawDetailRow) {
  return {
    linenChange: toBoolean(pickValue(row, "linen_change")),
    towelsChange: toBoolean(pickValue(row, "towels_change")),
    laundryRequired: toBoolean(pickValue(row, "laundry_required")),
    consumablesRestock: toBoolean(
      pickValue(row, "consumables_restock", "consumables_restocked")
    ),
    photoReportRequired: toBoolean(
      pickValue(row, "photo_report_required", "photo_report")
    ),
    checkInTime: formatTime(pickValue(row, "check_in_time")),
    checkOutTime: formatTime(pickValue(row, "check_out_time")),
    keysLocation: toString(pickValue(row, "keys_location", "keys_handover_notes")),
    specialTurnoverNotes: toString(
      pickValue(row, "special_turnover_notes", "turnover_notes")
    ),
    propertySizeM2: toNumber(
      pickValue(row, "property_size_m2", "property_size_sqm")
    ),
    bedroomsCount: toNumber(pickValue(row, "bedrooms_count")),
    bathroomsCount: toNumber(pickValue(row, "bathrooms_count")),
  };
}

function mapOffice(row: RawDetailRow) {
  return {
    officeSizeM2: toNumber(
      pickValue(row, "office_size_m2", "office_size_sqm")
    ),
    workstationsCount: toNumber(pickValue(row, "workstations_count")),
    meetingRoomsCount: toNumber(pickValue(row, "meeting_rooms_count")),
    bathroomsCount: toNumber(pickValue(row, "bathrooms_count")),
    kitchenArea: toBoolean(
      pickValue(row, "kitchen_area", "kitchen_area_included")
    ),
    frequency: toString(pickValue(row, "frequency")),
    afterHours: toBoolean(pickValue(row, "after_hours")),
    trashRemoval: toBoolean(
      pickValue(row, "trash_removal", "waste_disposal_required")
    ),
    suppliesRestock: toBoolean(pickValue(row, "supplies_restock")),
  };
}

function mapDryCleaning(row: RawDetailRow) {
  return {
    sofasCount: toNumber(pickValue(row, "sofas_count")),
    mattressesCount: toNumber(pickValue(row, "mattresses_count")),
    carpetsCount: toNumber(pickValue(row, "carpets_count")),
    carpetAreaM2: toNumber(pickValue(row, "carpet_area_m2", "carpet_area_sqm")),
    chairsCount: toNumber(pickValue(row, "chairs_count")),
    materialNotes: toString(pickValue(row, "material_notes")),
    stainsDescription: toString(
      pickValue(row, "stains_description", "stains")
    ),
    petStains: toBoolean(pickValue(row, "pet_stains")),
    elevatorAvailable: toBoolean(pickValue(row, "elevator_available")),
  };
}

function mapWindowCleaning(row: RawDetailRow) {
  return {
    windowsCount: toNumber(pickValue(row, "windows_count")),
    windowSashesCount: toNumber(
      pickValue(row, "window_sashes_count", "sashes_count")
    ),
    balconyDoorsCount: toNumber(
      pickValue(row, "balcony_doors_count", "balcony_doors")
    ),
    outsideAccess: toBoolean(pickValue(row, "outside_access")),
    ladderRequired: toBoolean(pickValue(row, "ladder_required")),
    frameCleaning: toBoolean(pickValue(row, "frame_cleaning")),
    blindsCleaning: toBoolean(pickValue(row, "blinds_cleaning")),
    interiorOnly: toBoolean(pickValue(row, "interior_only")),
    highRise: toBoolean(pickValue(row, "high_rise")),
  };
}

function mapSpecialPackage(row: RawDetailRow) {
  const petTypes = toString(pickValue(row, "pet_types", "pet_type"));
  return {
    packageFocus: toString(pickValue(row, "package_focus")),
    allergyFriendlyProducts: toBoolean(
      pickValue(row, "allergy_friendly_products")
    ),
    petAreaDescription: toString(pickValue(row, "pet_area_description")),
    hasPets: toBoolean(pickValue(row, "has_pets")) ?? (petTypes ? true : null),
    petTypes,
  };
}

export function mapRawDetailRowToServiceDetails(
  serviceType: string | null | undefined,
  row: RawDetailRow | null
): AdminOrderServiceDetails | null {
  const typeKey = (serviceType ?? "").trim();
  if (!isServiceType(typeKey) || !row) {
    return null;
  }

  const cleaned: RawDetailRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (!DETAIL_META_KEYS.has(key)) {
      cleaned[key] = value;
    }
  }

  switch (typeKey) {
    case "regular_cleaning":
      return { type: typeKey, data: mapRegularCleaning(cleaned) };
    case "move_in_out":
      return { type: typeKey, data: mapMoveCleaning(cleaned) };
    case "airbnb_turnover":
      return { type: typeKey, data: mapAirbnb(cleaned) };
    case "office_cleaning":
      return { type: typeKey, data: mapOffice(cleaned) };
    case "dry_cleaning":
      return { type: typeKey, data: mapDryCleaning(cleaned) };
    case "window_cleaning":
      return { type: typeKey, data: mapWindowCleaning(cleaned) };
    case "special_pet_package":
      return { type: typeKey, data: mapSpecialPackage(cleaned) };
    default:
      return null;
  }
}

export function resolveDetailTableName(
  serviceType: string | null | undefined
): string | null {
  const typeKey = (serviceType ?? "").trim();
  if (!isServiceType(typeKey)) return null;
  return ORDER_SERVICE_DETAIL_TABLE[typeKey];
}
