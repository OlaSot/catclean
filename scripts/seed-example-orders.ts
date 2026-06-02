/**
 * Seeds demo orders with expanded detail fields (migration 001_expand_order_details).
 *
 * On each run: removes previous seed orders (addresses with postal_code like "[seed:%")
 * then creates a fresh demo set. Non-seed orders are not touched.
 *
 * Prerequisites:
 *   npm run seed:examples
 *   Apply supabase/migrations/001_expand_order_details.sql in Supabase
 *
 * Usage: npm run seed:orders
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { ORDER_STATUS_CLEANER_ASSIGNED } from "../src/lib/constants/order-status";
import {
  DEFAULT_ORDER_CURRENCY,
  DEFAULT_PAYMENT_STATUS,
  ORDER_SERVICE_DETAIL_TABLE,
  type OrderServiceType,
} from "../src/lib/constants/orders";
import { resolveCleanerProfileId } from "../src/lib/cleaners/resolve-cleaner-profile-id";
import { canAssignCleanerToOrder } from "../src/lib/orders/can-assign-cleaner";
import { createSupabaseAdminClient } from "../src/lib/supabase/supabaseAdmin";
import { recordOrderStatusHistory } from "../src/server/mutations/orders/recordOrderStatusHistory";
import { loadEnv } from "./lib/load-env";

const SEED_PREFIX = "[seed:";

const ALL_DETAIL_TABLES = Object.values(ORDER_SERVICE_DETAIL_TABLE);

type OrderExtras = {
  access_notes?: string;
  pets_info?: string;
  supplies_note?: string;
  equipment_note?: string;
  price_breakdown?: Record<string, unknown>;
  manual_discount?: number;
  manual_surcharge?: number;
};

type SeedOrderInput = {
  seedKey: string;
  clientEmail: string;
  serviceType: OrderServiceType;
  status: string;
  paymentStatus?: string;
  scheduledDate: string;
  scheduledTime: string;
  city: string;
  street: string;
  houseNumber: string;
  floor?: string;
  doorbellName?: string;
  customerComment?: string;
  estimatedPrice: number;
  extras?: OrderExtras;
  detail: Record<string, unknown>;
  assignCleanerEmail?: string;
};

/** Small set with full new detail + orders fields (post-migration). */
const DEMO_ORDERS: SeedOrderInput[] = [
  {
    seedKey: "v2-regular-john-han",
    clientEmail: "john.mueller@catclean.demo",
    serviceType: "regular_cleaning",
    status: "paid",
    paymentStatus: "paid",
    scheduledDate: "2026-06-10",
    scheduledTime: "10:00",
    city: "Hannover",
    street: "Georgstraße",
    houseNumber: "12",
    floor: "3",
    doorbellName: "Mueller",
    customerComment: "Hardwood floors — please use gentle products only.",
    estimatedPrice: 195,
    extras: {
      access_notes: "Intercom code 1234#, underground parking P2.",
      pets_info: "Indoor cat — stays in the bedroom.",
      supplies_note: "Client provides floor cleaning products.",
      equipment_note: "Vacuum cleaner on site.",
      manual_discount: 0,
      manual_surcharge: 15,
      price_breakdown: {
        currency: "EUR",
        lines: [
          { label: "Base 3 bed regular", amount: 140 },
          { label: "Oven + fridge", amount: 40 },
          { label: "Pet surcharge", amount: 15 },
        ],
        subtotal: 195,
      },
    },
    detail: {
      bedrooms_count: 2,
      living_room_included: true,
      corridor_included: true,
      balcony_included: true,
      fridge_cleaning: true,
      oven_cleaning: true,
      inside_cabinets: false,
      windows_inside: true,
      pet_type: "cat",
      supplies_provided_by: "client",
      equipment_required: ["vacuum_on_site"],
    },
    assignCleanerEmail: "anna.kowalska@catclean.demo",
  },
  {
    seedKey: "v2-move-john-han",
    clientEmail: "john.mueller@catclean.demo",
    serviceType: "move_in_out",
    status: "searching_cleaner",
    paymentStatus: "paid",
    scheduledDate: "2026-06-15",
    scheduledTime: "08:00",
    city: "Hannover",
    street: "Podbielskistraße",
    houseNumber: "44",
    floor: "1",
    customerComment: "Move-out — kitchen and bathroom are top priority.",
    estimatedPrice: 485,
    extras: {
      access_notes: "Keys in lockbox at entrance; code sent via SMS.",
      pets_info: "No pets.",
      equipment_note: "Step ladder needed for upper cabinets.",
      manual_discount: 35,
      manual_surcharge: 0,
      price_breakdown: {
        currency: "EUR",
        lines: [
          { label: "Move-out premium 65m²", amount: 420 },
          { label: "Heavy limescale", amount: 65 },
          { label: "Manual discount", amount: -35 },
        ],
        subtotal: 485,
      },
    },
    detail: {
      empty_apartment: false,
      heavy_limescale: true,
      heavy_dirt: true,
      inside_cabinets: true,
      fridge_cleaning: true,
      oven_cleaning: true,
      windows_inside: true,
      balcony_included: true,
    },
  },
  {
    seedKey: "v2-airbnb-lisa-han",
    clientEmail: "lisa.schmidt@catclean.demo",
    serviceType: "airbnb_turnover",
    status: "confirmed",
    paymentStatus: "paid",
    scheduledDate: "2026-06-08",
    scheduledTime: "13:00",
    city: "Hannover",
    street: "Lister Meile",
    houseNumber: "7",
    doorbellName: "Schmidt",
    customerComment: "Guests check out at 11:00 AM.",
    estimatedPrice: 245,
    extras: {
      access_notes: "Smart lock — code 998877, apartment 2B.",
      supplies_note: "Consumables kit in the kitchen cabinet.",
      price_breakdown: {
        currency: "EUR",
        lines: [
          { label: "Turnover 2 bed", amount: 180 },
          { label: "Laundry + linen", amount: 65 },
        ],
        subtotal: 245,
      },
    },
    detail: {
      laundry_required: true,
      keys_location: "Lockbox on the front door handrail",
      special_turnover_notes: "Photo report required: living room and bathroom.",
    },
  },
  {
    seedKey: "v2-office-greenleaf-han",
    clientEmail: "office@greenleaf.de",
    serviceType: "office_cleaning",
    status: "cleaner_assigned",
    paymentStatus: "paid",
    scheduledDate: "2026-06-12",
    scheduledTime: "06:30",
    city: "Hannover",
    street: "Königstraße",
    houseNumber: "2",
    floor: "4",
    doorbellName: "Green Leaf",
    customerComment: "Enter through the main reception.",
    estimatedPrice: 410,
    extras: {
      access_notes: "Reception 24/7, elevator code 4521#.",
      equipment_note: "Cleaning cart in the service closet.",
      manual_surcharge: 40,
      price_breakdown: {
        currency: "EUR",
        lines: [
          { label: "Office 120m² weekly", amount: 320 },
          { label: "After-hours", amount: 50 },
          { label: "Supplies restock", amount: 40 },
        ],
        subtotal: 410,
      },
    },
    detail: {
      bathrooms_count: 2,
      kitchen_area: true,
      trash_removal: true,
      supplies_restock: true,
    },
    assignCleanerEmail: "anna.kowalska@catclean.demo",
  },
];

function seedMarker(seedKey: string, comment?: string): string {
  const base = `${SEED_PREFIX}${seedKey}]`;
  if (!comment?.trim()) return base;
  return `${base} ${comment.trim()}`;
}

async function findProfileIdByEmail(
  supabase: SupabaseClient,
  email: string,
  role?: "client" | "cleaner"
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error || !data?.id) return null;
  if (role && (data.role ?? "").toLowerCase() !== role) return null;
  return data.id;
}

async function getCreatedByProfileId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "operator"])
    .limit(1);

  if (error || !data?.[0]?.id) return null;
  return data[0].id as string;
}

async function deleteAllSeedOrders(supabase: SupabaseClient): Promise<number> {
  const { data: addresses, error: addrError } = await supabase
    .from("addresses")
    .select("id")
    .like("postal_code", `${SEED_PREFIX}%`);

  if (addrError) {
    throw new Error(`deleteSeedOrders addresses: ${addrError.message}`);
  }

  const addressIds = (addresses ?? []).map((a) => a.id as string);
  if (addressIds.length === 0) {
    console.log("No previous seed orders to delete.");
    return 0;
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("address_id", addressIds);

  if (ordersError) {
    throw new Error(`deleteSeedOrders orders: ${ordersError.message}`);
  }

  const orderIds = (orders ?? []).map((o) => String(o.id));

  if (orderIds.length > 0) {
    const { error: histError } = await supabase
      .from("order_status_history")
      .delete()
      .in("order_id", orderIds);
    if (histError) {
      throw new Error(`deleteSeedOrders history: ${histError.message}`);
    }

    const { error: assignError } = await supabase
      .from("order_assignments")
      .delete()
      .in("order_id", orderIds);
    if (assignError) {
      throw new Error(`deleteSeedOrders assignments: ${assignError.message}`);
    }

    for (const table of ALL_DETAIL_TABLES) {
      const { error: detailError } = await supabase
        .from(table)
        .delete()
        .in("order_id", orderIds);
      if (detailError) {
        throw new Error(`deleteSeedOrders ${table}: ${detailError.message}`);
      }
    }

    const { error: orderDelError } = await supabase
      .from("orders")
      .delete()
      .in("id", orderIds);
    if (orderDelError) {
      throw new Error(`deleteSeedOrders orders delete: ${orderDelError.message}`);
    }
  }

  const { error: addressDelError } = await supabase
    .from("addresses")
    .delete()
    .in("id", addressIds);
  if (addressDelError) {
    throw new Error(`deleteSeedOrders addresses delete: ${addressDelError.message}`);
  }

  return orderIds.length;
}

async function insertOrderDetail(
  supabase: SupabaseClient,
  orderId: number | string,
  serviceType: OrderServiceType,
  detail: Record<string, unknown>
): Promise<string | null> {
  const detailTable = ORDER_SERVICE_DETAIL_TABLE[serviceType];
  const { error } = await supabase.from(detailTable).insert({
    order_id: orderId,
    ...detail,
  });
  return error?.message ?? null;
}

async function assignSeedOrderCleaner(
  supabase: SupabaseClient,
  orderId: string,
  cleanerProfileId: string,
  changedBy: string
): Promise<string | null> {
  const resolved = await resolveCleanerProfileId(supabase, cleanerProfileId);
  if ("error" in resolved) return resolved.error;

  const { data: cleanerProfile, error: cpError } = await supabase
    .from("cleaner_profiles")
    .select("status")
    .eq("profile_id", resolved.profileId)
    .maybeSingle();

  if (cpError) return cpError.message;
  if (!cleanerProfile) return "Cleaner profile not found";
  if ((cleanerProfile.status ?? "").toLowerCase() !== "active") {
    return "Cleaner is not active";
  }

  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, assigned_cleaner_id")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError) return fetchError.message;
  if (!currentOrder) return "Order not found";

  const oldStatus = (currentOrder as { status: string | null }).status;
  if (!canAssignCleanerToOrder(oldStatus)) {
    return "Cannot assign a cleaner for the current order status";
  }

  const { data: existingAssignment, error: assignmentFetchError } = await supabase
    .from("order_assignments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (assignmentFetchError) return assignmentFetchError.message;

  if (existingAssignment?.id) {
    const { error: assignmentUpdateError } = await supabase
      .from("order_assignments")
      .update({
        cleaner_id: resolved.profileId,
        status: "accepted",
      })
      .eq("id", existingAssignment.id);
    if (assignmentUpdateError) return assignmentUpdateError.message;
  } else {
    const { error: assignmentInsertError } = await supabase
      .from("order_assignments")
      .insert({
        order_id: orderId,
        cleaner_id: resolved.profileId,
        status: "accepted",
      });
    if (assignmentInsertError) return assignmentInsertError.message;
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      assigned_cleaner_id: resolved.profileId,
      status: ORDER_STATUS_CLEANER_ASSIGNED,
    })
    .eq("id", orderId);

  if (orderUpdateError) return orderUpdateError.message;

  return recordOrderStatusHistory(supabase, {
    orderId,
    oldStatus,
    newStatus: ORDER_STATUS_CLEANER_ASSIGNED,
    changedBy,
    comment: "Cleaner assigned (seed)",
  });
}

async function createSeedOrder(
  supabase: SupabaseClient,
  createdBy: string,
  input: SeedOrderInput
): Promise<{ orderId: string | null; error: string | null }> {
  const clientId = await findProfileIdByEmail(
    supabase,
    input.clientEmail,
    "client"
  );
  if (!clientId) {
    return {
      orderId: null,
      error: `Client not found: ${input.clientEmail} (run npm run seed:examples first)`,
    };
  }

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .insert({
      city: input.city,
      street: input.street,
      house_number: input.houseNumber,
      floor: input.floor ?? null,
      apartment: input.doorbellName ?? null,
      postal_code: seedMarker(input.seedKey, input.customerComment),
    })
    .select("id")
    .single();

  if (addressError || !address?.id) {
    return {
      orderId: null,
      error: addressError?.message ?? "Failed to create address",
    };
  }

  const extras = input.extras ?? {};

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      address_id: address.id,
      service_type: input.serviceType,
      scheduled_date: input.scheduledDate,
      scheduled_time: input.scheduledTime,
      status: input.status,
      currency: DEFAULT_ORDER_CURRENCY,
      payment_status: input.paymentStatus ?? DEFAULT_PAYMENT_STATUS,
      estimated_price: input.estimatedPrice,
      created_by: createdBy,
      access_notes: extras.access_notes ?? null,
      pets_info: extras.pets_info ?? null,
      supplies_note: extras.supplies_note ?? null,
      equipment_note: extras.equipment_note ?? null,
      price_breakdown: extras.price_breakdown ?? null,
      manual_discount: extras.manual_discount ?? 0,
      manual_surcharge: extras.manual_surcharge ?? 0,
    })
    .select("id, service_type")
    .single();

  if (orderError || !order?.id) {
    return {
      orderId: null,
      error: orderError?.message ?? "Failed to create order",
    };
  }

  const detailError = await insertOrderDetail(
    supabase,
    order.id,
    input.serviceType,
    input.detail
  );
  if (detailError) {
    return { orderId: String(order.id), error: detailError };
  }

  if (input.assignCleanerEmail) {
    const cleanerId = await findProfileIdByEmail(
      supabase,
      input.assignCleanerEmail,
      "cleaner"
    );
    if (!cleanerId) {
      return {
        orderId: String(order.id),
        error: `Cleaner not found: ${input.assignCleanerEmail}`,
      };
    }

    const assignError = await assignSeedOrderCleaner(
      supabase,
      String(order.id),
      cleanerId,
      createdBy
    );
    if (assignError) {
      return {
        orderId: String(order.id),
        error: `Order #${order.id} created but assign failed: ${assignError}`,
      };
    }
  }

  return { orderId: String(order.id), error: null };
}

async function main() {
  loadEnv();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    console.error(admin.error);
    process.exit(1);
  }

  const supabase = admin.supabase;
  const createdBy =
    (await getCreatedByProfileId(supabase)) ??
    (await findProfileIdByEmail(supabase, "john.mueller@catclean.demo", "client"));

  if (!createdBy) {
    console.error("No staff profile and no demo client for created_by");
    process.exit(1);
  }

  console.log("CatClean seed orders (v2 — expanded details)\n");

  try {
    const deleted = await deleteAllSeedOrders(supabase);
    console.log(`Removed ${deleted} previous seed order(s).\n--- New orders ---`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  for (const order of DEMO_ORDERS) {
    const { orderId, error } = await createSeedOrder(supabase, createdBy, order);

    if (error) {
      console.error(`✗ ${order.seedKey}: ${error}`);
      continue;
    }

    const assignNote = order.assignCleanerEmail
      ? ` → ${order.assignCleanerEmail}`
      : "";
    console.log(
      `✓ #${orderId} ${order.serviceType} for ${order.clientEmail} [${order.status}]${assignNote}`
    );
  }

  console.log(
    "\nDone. Demo clients: john.mueller / lisa.schmidt / office@greenleaf.de (@catclean.demo, Hannover)"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
