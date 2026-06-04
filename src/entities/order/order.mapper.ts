import type { ClientOrderStats, SupabaseOrderRow } from "./order.supabase.types";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { normalizeOrderStatus } from "./order-status.utils";
import { formatOrderServiceSummary } from "@/features/orders/lib/format-order-service-summary";
import {
  getBookingProductLabelEn,
  resolveBookingProductKey,
} from "@/lib/orders/booking-product-label";
import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";
import type { Order, OrderPaymentStatus } from "./order.types";

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapPaymentStatus(status: string | null | undefined): OrderPaymentStatus {
  const key = (status ?? "unpaid").toLowerCase().replace(/-/g, "_");
  const map: Record<string, OrderPaymentStatus> = {
    unpaid: "unpaid",
    paid: "paid",
    card_hold: "card_hold",
    hold: "card_hold",
  };
  return map[key] ?? "unpaid";
}

function mapCurrency(value: string | null | undefined): Order["pricing"]["currency"] {
  return value?.toUpperCase() === "EUR" ? "EUR" : "EUR";
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function formatDateISO(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function parseOrderId(id: number | string | null | undefined): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string" && id.trim() !== "") {
    const parsed = Number(id);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function buildAssignedCleaners(row: SupabaseOrderRow): Order["assigned"] {
  const assignments = row.order_assignments ?? [];
  const cleanersFromAssignments = assignments
    .map((assignment) => {
      const cleaner = unwrapRelation(assignment.cleaner);
      const name = cleaner?.full_name?.trim();
      if (!name) return null;
      return { name, ratePerHour: 0, payout: 0 };
    })
    .filter((item): item is { name: string; ratePerHour: number; payout: number } =>
      Boolean(item)
    );

  if (cleanersFromAssignments.length > 0) {
    return {
      cleanersNeeded: cleanersFromAssignments.length,
      cleaners: cleanersFromAssignments,
    };
  }

  const assignedCleaner = unwrapRelation(row.assigned_cleaner);
  if (assignedCleaner?.full_name?.trim()) {
    return {
      cleanersNeeded: 1,
      cleaners: [
        {
          name: assignedCleaner.full_name.trim(),
          ratePerHour: 0,
          payout: 0,
        },
      ],
    };
  }

  return { cleanersNeeded: 0, cleaners: [] };
}

export function mapOrderToCard(
  row: SupabaseOrderRow,
  clientStats?: ClientOrderStats,
  serviceDetails?: AdminOrderServiceDetails | null,
  options?: { hasActiveConfirmationToken?: boolean }
): Order {
  const address = unwrapRelation(row.address);
  const client = unwrapRelation(row.client);
  const assigned = buildAssignedCleaners(row);

  const customerName =
    client?.full_name?.trim() ||
    client?.email?.trim() ||
    client?.phone?.trim() ||
    "Unknown client";

  const orderNumber = row.order_number ?? null;
  const customerComment = address?.postal_code?.trim() || null;
  const bookingProductRaw = row.booking_product?.trim() || null;
  const productKey = resolveBookingProductKey({
    bookingProduct: bookingProductRaw,
    serviceType: row.service_type,
    customerComment,
  });

  return {
    id: parseOrderId(row.id),
    routeId: String(row.id),
    displayId: formatOrderDisplayId(row.id, orderNumber),
    orderNumber,
    draftId: null,
    channel: "Manual",
    city: address?.city?.trim() || "—",

    dateISO: formatDateISO(row.scheduled_date),
    time: formatTime(row.scheduled_time),
    durationHours: 0,

    serviceType: row.service_type?.trim() || "Cleaning",
    bookingProduct: bookingProductRaw,
    productKey,
    productLabel: getBookingProductLabelEn(productKey, row.service_type),
    serviceSummary: formatOrderServiceSummary(serviceDetails ?? null, {
      bookingProduct: bookingProductRaw,
      customerComment,
      serviceType: row.service_type,
    }),
    rooms: [],

    address: {
      street: address?.street?.trim() || "—",
      house: address?.house_number?.trim() || "—",
      apartment: address?.apartment?.trim() || undefined,
      floor: address?.floor?.trim() || undefined,
      zip: undefined,
      note: [address?.apartment?.trim(), address?.postal_code?.trim()]
        .filter(Boolean)
        .join(" • ") || undefined,
    },

    customer: {
      id: row.client_id ?? null,
      name: customerName,
      email: client?.email?.trim() || "—",
      phone: client?.phone?.trim() || "—",
      ordersCount: clientStats?.ordersCount ?? 0,
      lastOrderDateISO: clientStats?.lastOrderDateISO,
    },

    pricing: {
      base: row.estimated_price ?? 0,
      discountPercent: 0,
      total:
        typeof row.final_price === "number" && Number.isFinite(row.final_price)
          ? row.final_price
          : (row.estimated_price ?? 0),
      currency: mapCurrency(row.currency),
    },

    payment: {
      method: "After",
      status: mapPaymentStatus(row.payment_status),
    },

    assigned,
    status: normalizeOrderStatus(row.status),
    managerChecked: false,
    confirmation: {
      hasActiveToken: Boolean(options?.hasActiveConfirmationToken),
    },
  };
}
