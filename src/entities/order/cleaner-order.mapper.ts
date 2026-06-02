import { EMPTY_OPERATIONAL_NOTES_PUBLIC } from "@/entities/order/map-order-operational-notes";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import { getOrderStatusLabel, ORDER_STATUSES } from "@/lib/constants/order-status";
import { normalizeOrderStatus } from "./order-status.utils";
import type { SupabaseOrderRow } from "./order.supabase.types";
import type { CleanerOrder, CleanerOrderDetail } from "./cleaner-order.types";
import type { OrderStatus } from "./order.types";

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

function statusLabel(status: OrderStatus): string {
  return (
    ORDER_STATUSES.find((item) => item.value === status)?.label ??
    getOrderStatusLabel(status)
  );
}

function serviceTypeLabel(serviceType: string | null | undefined): string {
  const key = serviceType?.trim() ?? "";
  const match = ORDER_SERVICE_TYPES.find((item) => item.value === key);
  return match?.label ?? (key || "Cleaning");
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function formatDateISO(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

const START_ALLOWED_STATUSES: OrderStatus[] = ["confirmed", "cleaner_assigned"];

function buildAssignment(
  row: SupabaseOrderRow,
  cleanerId: string
): CleanerOrder["assignment"] {
  const assignmentRow = (row.order_assignments ?? []).find(
    (item) => item.cleaner_id === cleanerId
  );

  if (!assignmentRow) return null;

  return {
    id: assignmentRow.id,
    status: assignmentRow.status,
    completedAt: assignmentRow.completed_at ?? null,
  };
}

export function mapOrderToCleanerOrder(
  row: SupabaseOrderRow,
  cleanerId: string
): CleanerOrder {
  const address = unwrapRelation(row.address);
  const client = unwrapRelation(row.client);

  const city = address?.city?.trim() || "—";
  const street = address?.street?.trim() || "—";
  const house = address?.house_number?.trim() || "—";
  const floor = address?.floor?.trim() || null;

  const clientName =
    client?.full_name?.trim() ||
    client?.email?.trim() ||
    client?.phone?.trim() ||
    "Unknown client";

  const status = normalizeOrderStatus(row.status);

  return {
    id: parseOrderId(row.id),
    status,
    statusLabel: statusLabel(status),
    scheduledDate: formatDateISO(row.scheduled_date),
    scheduledTime: formatTime(row.scheduled_time),
    serviceType: row.service_type?.trim() || "—",
    serviceTypeLabel: serviceTypeLabel(row.service_type),
    estimatedPrice: row.estimated_price ?? 0,
    currency: row.currency?.toUpperCase() === "EUR" ? "EUR" : "EUR",
    address: {
      city,
      street,
      house,
      floor,
      line: [city, street, house].filter((part) => part !== "—").join(", ") || "—",
    },
    client: {
      name: clientName,
      email: client?.email?.trim() || "—",
      phone: client?.phone?.trim() || "—",
    },
    assignment: buildAssignment(row, cleanerId),
  };
}

export function mapOrderToCleanerOrderDetail(
  row: SupabaseOrderRow,
  cleanerId: string
): CleanerOrderDetail {
  const base = mapOrderToCleanerOrder(row, cleanerId);
  const address = unwrapRelation(row.address);

  return {
    ...base,
    customerComment: address?.postal_code?.trim() || null,
    doorbell: address?.apartment?.trim() || null,
    serviceDetails: null,
    operationalNotes: EMPTY_OPERATIONAL_NOTES_PUBLIC,
    canStart: START_ALLOWED_STATUSES.includes(base.status),
    canComplete: base.status === "in_progress",
    expectedPayout: 0,
    payoutStatus: null,
    payoutNote: null,
  };
}
