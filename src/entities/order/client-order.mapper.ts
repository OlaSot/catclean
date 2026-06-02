import { EMPTY_OPERATIONAL_NOTES_PUBLIC } from "@/entities/order/map-order-operational-notes";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import { getOrderStatusLabel, ORDER_STATUSES } from "@/lib/constants/order-status";
import {
  evaluateClientCancellation,
  policyLabel,
} from "@/lib/orders/client-cancellation";
import { normalizeOrderStatus } from "./order-status.utils";
import type { SupabaseOrderRow } from "./order.supabase.types";
import type {
  ClientOrder,
  ClientOrderCancellationPreview,
  ClientOrderDetail,
} from "./client-order.types";
import type { OrderPaymentStatus, OrderStatus } from "./order.types";

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

function orderRouteId(id: number | string | null | undefined): string {
  if (typeof id === "string" && id.trim() !== "") return id.trim();
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  return "0";
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

function normalizePaymentStatus(
  value: string | null | undefined
): OrderPaymentStatus {
  const key = (value ?? "unpaid").toLowerCase();
  if (key === "paid" || key === "card_hold") return key;
  return "unpaid";
}

function paymentStatusLabel(status: OrderPaymentStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "card_hold":
      return "Partial / pending";
    default:
      return "Unpaid";
  }
}

const TERMINAL_STATUSES: OrderStatus[] = [
  "problem",
  "completed",
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
];

function buildCancellationPreview(
  row: SupabaseOrderRow
): ClientOrderCancellationPreview | null {
  const evaluation = evaluateClientCancellation({
    status: row.status,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    estimatedPrice: row.estimated_price,
  });

  if (!evaluation.allowed) {
    return {
      allowed: false,
      policy: evaluation.policy,
      feePercent: evaluation.feePercent,
      feeAmount: evaluation.feeAmount,
      policyLabel: policyLabel(evaluation.policy),
      message: evaluation.message,
    };
  }

  return {
    allowed: true,
    policy: evaluation.policy,
    feePercent: evaluation.feePercent,
    feeAmount: evaluation.feeAmount,
    policyLabel: policyLabel(evaluation.policy),
    message: evaluation.message,
  };
}

export function mapOrderToClientOrder(row: SupabaseOrderRow): ClientOrder {
  const address = unwrapRelation(row.address);
  const cleaner = unwrapRelation(row.assigned_cleaner);

  const city = address?.city?.trim() || "—";
  const street = address?.street?.trim() || "—";
  const house = address?.house_number?.trim() || "—";
  const floor = address?.floor?.trim() || null;

  const status = normalizeOrderStatus(row.status);
  const paymentStatus = normalizePaymentStatus(row.payment_status);

  const cleanerName =
    cleaner?.full_name?.trim() ||
    cleaner?.email?.trim() ||
    cleaner?.phone?.trim() ||
    null;

  return {
    id: parseOrderId(row.id),
    routeId: orderRouteId(row.id),
    status,
    statusLabel: statusLabel(status),
    scheduledDate: formatDateISO(row.scheduled_date),
    scheduledTime: formatTime(row.scheduled_time),
    estimatedPrice: row.estimated_price ?? 0,
    currency: "EUR",
    paymentStatus,
    paymentStatusLabel: paymentStatusLabel(paymentStatus),
    address: {
      city,
      street,
      house,
      floor,
      line: [city, street, house].filter((part) => part !== "—").join(", ") || "—",
    },
    assignedCleaner: cleanerName
      ? {
          name: cleanerName,
          email: cleaner?.email?.trim() || "—",
          phone: cleaner?.phone?.trim() || "—",
        }
      : null,
  };
}

export function mapOrderToClientOrderDetail(row: SupabaseOrderRow): ClientOrderDetail {
  const base = mapOrderToClientOrder(row);
  const address = unwrapRelation(row.address);
  const preview = buildCancellationPreview(row);

  const canCancel = Boolean(preview?.allowed);
  const canReschedule =
    !TERMINAL_STATUSES.includes(base.status) &&
    base.status !== "in_progress";
  return {
    ...base,
    serviceType: row.service_type?.trim() || "—",
    serviceTypeLabel: serviceTypeLabel(row.service_type),
    serviceDetails: null,
    operationalNotes: EMPTY_OPERATIONAL_NOTES_PUBLIC,
    customerComment: address?.postal_code?.trim() || null,
    canCancel,
    canReschedule,
    isProblemStatus: base.status === "problem",
    activeComplaint: null,
    canLeaveReview: false,
    canOpenComplaint: false,
    hasReview: false,
    hasActiveComplaint: false,
    paidAmount: 0,
    outstandingAmount: 0,
    cancellationPreview: preview,
  };
}
