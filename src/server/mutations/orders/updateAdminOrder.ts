import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import { resolveDetailTableName } from "@/entities/order/map-order-service-details";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";

function toOptionalString(value: unknown): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s ? s : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pickDefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

function mapServiceDetailsToDetailUpdate(
  serviceType: string | null | undefined,
  details: AdminOrderServiceDetails | null | undefined
): { table: string | null; patch: Record<string, unknown> } {
  const table = resolveDetailTableName(serviceType);
  if (!table || !details || !isPlainObject(details.data)) {
    return { table: table ?? null, patch: {} };
  }

  const type = (details as { type?: string }).type;
  if (!type || type !== serviceType) {
    // Prevent accidental patching of a different service type.
    return { table, patch: {} };
  }

  const data = details.data as Record<string, unknown>;

  // Map camelCase API fields to snake_case DB columns.
  // This intentionally covers fields that exist in docs/ORDER_MODEL.md (some may pre-exist in DB).
  const mappingByType: Record<string, Record<string, string>> = {
    regular_cleaning: {
      propertySizeM2: "property_size_m2",
      cleaningIntensity: "cleaning_intensity",
      roomsCount: "rooms_count",
      bedroomsCount: "bedrooms_count",
      bathroomsCount: "bathrooms_count",
      kitchenIncluded: "kitchen_included",
      livingRoomIncluded: "living_room_included",
      corridorIncluded: "corridor_included",
      balconyIncluded: "balcony_included",
      fridgeCleaning: "fridge_cleaning",
      ovenCleaning: "oven_cleaning",
      insideCabinets: "inside_cabinets",
      windowsInside: "windows_inside",
      hasPets: "has_pets",
      petType: "pet_type",
      extraHours: "extra_hours",
      suppliesProvidedBy: "supplies_provided_by",
      equipmentRequired: "equipment_required",
    },
    move_in_out: {
      propertySizeM2: "property_size_m2",
      packageType: "package_type",
      isMoveIn: "is_move_in",
      isMoveOut: "is_move_out",
      emptyApartment: "empty_apartment",
      heavyLimescale: "heavy_limescale",
      heavyDirt: "heavy_dirt",
      insideCabinets: "inside_cabinets",
      fridgeCleaning: "fridge_cleaning",
      ovenCleaning: "oven_cleaning",
      windowsInside: "windows_inside",
      balconyIncluded: "balcony_included",
    },
    airbnb_turnover: {
      linenChange: "linen_change",
      towelsChange: "towels_change",
      laundryRequired: "laundry_required",
      consumablesRestock: "consumables_restock",
      photoReportRequired: "photo_report_required",
      checkInTime: "check_in_time",
      checkOutTime: "check_out_time",
      keysLocation: "keys_location",
      specialTurnoverNotes: "special_turnover_notes",
      propertySizeM2: "property_size_m2",
      bedroomsCount: "bedrooms_count",
      bathroomsCount: "bathrooms_count",
    },
    office_cleaning: {
      officeSizeM2: "office_size_m2",
      workstationsCount: "workstations_count",
      meetingRoomsCount: "meeting_rooms_count",
      bathroomsCount: "bathrooms_count",
      kitchenArea: "kitchen_area",
      frequency: "frequency",
      afterHours: "after_hours",
      trashRemoval: "trash_removal",
      suppliesRestock: "supplies_restock",
    },
    dry_cleaning: {
      sofasCount: "sofas_count",
      mattressesCount: "mattresses_count",
      carpetsCount: "carpets_count",
      carpetAreaM2: "carpet_area_m2",
      chairsCount: "chairs_count",
      materialNotes: "material_notes",
      stainsDescription: "stains_description",
      petStains: "pet_stains",
      elevatorAvailable: "elevator_available",
    },
    window_cleaning: {
      windowsCount: "windows_count",
      windowSashesCount: "window_sashes_count",
      balconyDoorsCount: "balcony_doors_count",
      outsideAccess: "outside_access",
      ladderRequired: "ladder_required",
      frameCleaning: "frame_cleaning",
      blindsCleaning: "blinds_cleaning",
      interiorOnly: "interior_only",
      highRise: "high_rise",
    },
    special_pet_package: {
      packageFocus: "package_focus",
      allergyFriendlyProducts: "allergy_friendly_products",
      petAreaDescription: "pet_area_description",
      hasPets: "has_pets",
      petTypes: "pet_types",
    },
  };

  const mapping = mappingByType[String(type)] ?? {};
  const patch: Record<string, unknown> = {};

  for (const [apiKey, dbKey] of Object.entries(mapping)) {
    if (data[apiKey] !== undefined) {
      patch[dbKey] = data[apiKey];
    }
  }

  return { table, patch };
}

export async function updateAdminOrder(
  supabase: SupabaseClient,
  orderId: string,
  input: {
    scheduled_date?: unknown;
    scheduled_time?: unknown;
    estimated_price?: unknown;
    final_price?: unknown;
    payment_status?: unknown;
    customer_comment?: unknown;
    internal_note?: unknown;
    address?: unknown;
    serviceDetails?: unknown;
  }
): Promise<{ order: Awaited<ReturnType<typeof getAdminOrderById>>["order"]; error: string | null; notFound?: boolean }> {
  const id = orderId.trim();
  if (!id) return { order: null, error: "Invalid order id" };

  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select("id, address_id, service_type")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("updateAdminOrder fetch:", fetchError);
    return { order: null, error: fetchError.message };
  }

  if (!current?.id) {
    return { order: null, error: null, notFound: true };
  }

  const addressId = (current as { address_id: string | null }).address_id;
  const serviceType = (current as { service_type: string | null }).service_type;

  // Address patch
  if (addressId && isPlainObject(input.address)) {
    const addr = input.address as Record<string, unknown>;
    const addressPatch = pickDefined({
      city: toOptionalString(addr.city) ?? undefined,
      street: toOptionalString(addr.street) ?? undefined,
      house_number: toOptionalString(addr.house_number) ?? undefined,
      floor: addr.floor === null ? null : toOptionalString(addr.floor),
      apartment:
        addr.doorbell_name === null ? null : toOptionalString(addr.doorbell_name),
    });

    if (Object.keys(addressPatch).length > 0) {
      const { error: addrError } = await supabase
        .from("addresses")
        .update(addressPatch)
        .eq("id", addressId);
      if (addrError) {
        console.error("updateAdminOrder address:", addrError);
        return { order: null, error: addrError.message };
      }
    }
  }

  // Customer comment is stored in addresses.postal_code (legacy hack used in createOrderAction)
  if (addressId && input.customer_comment !== undefined) {
    const comment =
      input.customer_comment === null
        ? null
        : toOptionalString(input.customer_comment);
    const { error: ccError } = await supabase
      .from("addresses")
      .update({ postal_code: comment })
      .eq("id", addressId);
    if (ccError) {
      console.error("updateAdminOrder customerComment:", ccError);
      return { order: null, error: ccError.message };
    }
  }

  // Service details patch
  const typedServiceDetails = (input.serviceDetails ??
    null) as AdminOrderServiceDetails | null;
  const { table, patch: detailPatch } = mapServiceDetailsToDetailUpdate(
    serviceType,
    typedServiceDetails
  );

  if (table && Object.keys(detailPatch).length > 0) {
    const { error: detailError } = await supabase
      .from(table)
      .update(detailPatch)
      .eq("order_id", id);
    if (detailError) {
      console.error("updateAdminOrder service details:", detailError);
      return { order: null, error: detailError.message };
    }
  }

  let scheduledTimePatch: string | undefined;
  if (input.scheduled_time !== undefined) {
    const raw = toOptionalString(input.scheduled_time);
    if (!raw) {
      return {
        order: null,
        error: "Scheduled time is required",
      };
    }
    const normalized = normalizeScheduleTime(raw);
    if (!normalized) {
      return {
        order: null,
        error: "Time must be in 15-minute steps",
      };
    }
    scheduledTimePatch = normalized;
  }

  const orderPatch = pickDefined({
    scheduled_date: toOptionalString(input.scheduled_date) ?? undefined,
    scheduled_time: scheduledTimePatch,
    estimated_price:
      input.estimated_price === undefined ? undefined : Number(input.estimated_price),
    final_price:
      input.final_price === undefined ? undefined : (input.final_price === null ? null : Number(input.final_price)),
    payment_status:
      input.payment_status === undefined ? undefined : toOptionalString(input.payment_status),
    internal_note:
      input.internal_note === undefined
        ? undefined
        : (input.internal_note === null ? null : toOptionalString(input.internal_note)),
  });

  if (Object.keys(orderPatch).length > 0) {
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update(orderPatch)
      .eq("id", id);
    if (orderUpdateError) {
      console.error("updateAdminOrder order:", orderUpdateError);
      return { order: null, error: orderUpdateError.message };
    }
  }

  return getAdminOrderById(id);
}

