import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { getOrderStatusLabel } from "@/lib/constants/order-status";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import {
  getBookingProductLabelEn,
  resolveBookingProductKey,
} from "@/lib/orders/booking-product-label";
import { canAssignCleanerForOrder } from "@/lib/orders/can-assign-cleaner";
import { normalizeOrderStatus } from "./order-status.utils";
import type { ClientOrderStats, SupabaseOrderRow } from "./order.supabase.types";
import type { AdminOrderDetail } from "./admin-order-detail.types";
import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";
import type { OrderStatusHistoryItem } from "./order-status-history.types";
import type { OrderPaymentStatus } from "./order.types";

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parseOrderId(id: number | string | null | undefined): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string" && id.trim() !== "") {
    const parsed = Number(id);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function mapPaymentStatus(
  status: string | null | undefined
): OrderPaymentStatus {
  const key = (status ?? "unpaid").toLowerCase().replace(/-/g, "_");
  const map: Record<string, OrderPaymentStatus> = {
    unpaid: "unpaid",
    paid: "paid",
    card_hold: "card_hold",
    hold: "card_hold",
  };
  return map[key] ?? "unpaid";
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function formatDateISO(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function serviceTypeLabel(serviceType: string | null | undefined): string {
  const key = serviceType?.trim() ?? "";
  const match = ORDER_SERVICE_TYPES.find((item) => item.value === key);
  return match?.label ?? (key || "Cleaning");
}

function mapCleanerProfile(
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null
): AdminOrderDetail["assignment"]["cleaners"][number] | null {
  if (!profile?.id) return null;
  const name =
    profile.full_name?.trim() ||
    profile.email?.trim() ||
    profile.phone?.trim() ||
    "Unknown cleaner";
  return {
    id: profile.id,
    name,
    email: profile.email?.trim() || "—",
    phone: profile.phone?.trim() || "—",
  };
}

function buildAssignment(row: SupabaseOrderRow): AdminOrderDetail["assignment"] {
  const cleanersFromAssignments = (row.order_assignments ?? [])
    .map((assignment) => mapCleanerProfile(unwrapRelation(assignment.cleaner)))
    .filter(
      (item): item is AdminOrderDetail["assignment"]["cleaners"][number] =>
        Boolean(item)
    );

  const assignedCleaner = mapCleanerProfile(unwrapRelation(row.assigned_cleaner));
  const cleaners =
    cleanersFromAssignments.length > 0
      ? cleanersFromAssignments
      : assignedCleaner
        ? [assignedCleaner]
        : [];

  return {
    assignedCleanerId: row.assigned_cleaner_id,
    cleanersNeeded: cleaners.length,
    cleaners,
  };
}

function mapOperationalNotes(row: SupabaseOrderRow): AdminOrderDetail["operationalNotes"] {
  const breakdown = row.price_breakdown;
  const priceBreakdown =
    breakdown && typeof breakdown === "object" && !Array.isArray(breakdown)
      ? (breakdown as Record<string, unknown>)
      : null;

  return {
    accessNotes: row.access_notes?.trim() || null,
    petsInfo: row.pets_info?.trim() || null,
    suppliesNote: row.supplies_note?.trim() || null,
    equipmentNote: row.equipment_note?.trim() || null,
    internalNote: row.internal_note?.trim() || null,
    priceBreakdown,
    manualDiscount: Number(row.manual_discount ?? 0) || 0,
    manualSurcharge: Number(row.manual_surcharge ?? 0) || 0,
  };
}

export function mapOrderToAdminDetail(
  row: SupabaseOrderRow,
  clientStats?: ClientOrderStats,
  serviceDetails?: AdminOrderServiceDetails | null,
  statusHistory: OrderStatusHistoryItem[] = []
): AdminOrderDetail {
  const address = unwrapRelation(row.address);
  const client = unwrapRelation(row.client);

  const customerName =
    client?.full_name?.trim() ||
    client?.email?.trim() ||
    client?.phone?.trim() ||
    "Unknown client";

  const doorbellRaw = address?.apartment?.trim() || null;
  const commentRaw = address?.postal_code?.trim() || null;

  const statusRaw = row.status?.trim() || "new";
  const bookingProductRaw = row.booking_product?.trim() || null;
  const productKey = resolveBookingProductKey({
    bookingProduct: bookingProductRaw,
    serviceType: row.service_type,
    customerComment: commentRaw,
  });

  return {
    id: parseOrderId(row.id),
    displayId: formatOrderDisplayId(row.id, row.order_number),
    status: normalizeOrderStatus(statusRaw),
    statusRaw,
    statusLabel: getOrderStatusLabel(statusRaw),
    canAssignCleaner: canAssignCleanerForOrder({
      status: statusRaw,
      payment_status: row.payment_status,
    }),
    paymentStatus: mapPaymentStatus(row.payment_status),
    scheduledDate: formatDateISO(row.scheduled_date),
    scheduledTime: formatTime(row.scheduled_time),
    createdAt: row.created_at,
    client: {
      id: row.client_id,
      name: customerName,
      email: client?.email?.trim() || "—",
      phone: client?.phone?.trim() || "—",
      ordersCount: clientStats?.ordersCount ?? 0,
    },
    address: {
      city: address?.city?.trim() || "—",
      street: address?.street?.trim() || "—",
      house: address?.house_number?.trim() || "—",
      floor: address?.floor?.trim() || null,
      apartment: null,
      doorbell: doorbellRaw,
    },
    service: {
      type: row.service_type?.trim() || "—",
      typeLabel: serviceTypeLabel(row.service_type),
      bookingProduct: bookingProductRaw,
      productKey,
      productLabel: getBookingProductLabelEn(productKey, row.service_type),
      estimatedPrice: row.estimated_price ?? 0,
      finalPrice:
        typeof row.final_price === "number" && Number.isFinite(row.final_price)
          ? row.final_price
          : null,
      currency: row.currency?.toUpperCase() === "EUR" ? "EUR" : "EUR",
      comment: commentRaw,
    },
    assignment: buildAssignment(row),
    operationalNotes: mapOperationalNotes(row),
    serviceDetails: serviceDetails ?? null,
    statusHistory,
  };
}
