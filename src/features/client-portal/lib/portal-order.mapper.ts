import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import { SERVICE_DETAIL_DISPLAY } from "@/entities/order/service-detail-display-config";
import type { ClientOrder, ClientOrderDetail } from "@/entities/order/client-order.types";
import type { OrderStatus } from "@/entities/order/order.types";
import type { PortalServiceId } from "./service-catalog";
import type {
  PortalDashboardStats,
  PortalOrder,
  PortalOrderDetail,
  PortalOrderStatus,
  PortalTimelineStep,
} from "../types/portal.types";

const COMPLETED_STATUSES: OrderStatus[] = ["completed"];
const CANCELLED_STATUSES: OrderStatus[] = [
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
];
const UPCOMING_STATUSES: OrderStatus[] = [
  "awaiting_confirmation",
  "new",
  "waiting_for_payment",
  "paid",
  "searching_cleaner",
  "cleaner_assigned",
  "confirmed",
  "in_progress",
];

export function mapServiceTypeToPortalId(serviceType: string): PortalServiceId {
  const key = serviceType.trim().toLowerCase();
  if (key === "home_reset") return "home_reset";
  if (key === "move_out" || key === "move_in_out") return "move_out";
  if (key === "window_cleaning") return "window_cleaning";
  if (key === "dry_cleaning") return "dry_cleaning";
  return "home_care";
}

export function mapOrderStatusToPortalStatus(status: OrderStatus): PortalOrderStatus {
  if (status === "awaiting_confirmation") return "awaiting_confirmation";
  if (status === "in_progress") return "in_progress";
  if (COMPLETED_STATUSES.includes(status)) return "completed";
  if (CANCELLED_STATUSES.includes(status)) return "cancelled";
  return "confirmed";
}

export function portalStatusLabel(status: OrderStatus, statusLabel: string): string {
  if (status === "awaiting_confirmation") return "Waiting for confirmation";
  return statusLabel;
}

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

function formatTimeRange(time: string): string {
  const normalized = time?.trim();
  if (!normalized || normalized === "—") return "—";
  return normalized;
}

function buildAddress(order: ClientOrder): PortalOrder["address"] {
  const parts = order.address;
  return {
    line: [parts.street, parts.house].filter((p) => p && p !== "—").join(" ") || parts.line,
    city: parts.city !== "—" ? parts.city : "",
    floor: parts.floor,
    apartment: null,
  };
}

function buildTimeline(status: OrderStatus, hasCleaner: boolean): PortalTimelineStep[] {
  const steps: PortalTimelineStep[] = [
    { id: "booked", label: "Booking confirmed", state: "done" },
  ];

  if (hasCleaner) {
    steps.push({ id: "assigned", label: "Cleaner assigned", state: "upcoming" });
  }

  steps.push(
    { id: "visit", label: "Cleaning visit", state: "upcoming" },
    { id: "complete", label: "Completed", state: "upcoming" },
  );

  if (CANCELLED_STATUSES.includes(status)) {
    return steps.map((step) => ({ ...step, state: step.id === "booked" ? "done" : "upcoming" }));
  }

  if (status === "completed") {
    return steps.map((step) => ({ ...step, state: "done" }));
  }

  if (status === "in_progress") {
    return steps.map((step) => {
      if (step.id === "booked" || step.id === "assigned" || step.id === "visit") {
        return { ...step, state: step.id === "visit" ? "current" : "done" };
      }
      return step;
    });
  }

  if (hasCleaner) {
    return steps.map((step) => {
      if (step.id === "booked" || step.id === "assigned") return { ...step, state: "done" };
      if (step.id === "visit") return { ...step, state: "current" };
      return step;
    });
  }

  return steps.map((step) => {
    if (step.id === "booked") return { ...step, state: "done" };
    if (step.id === "visit") return { ...step, state: "current" };
    return step;
  });
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function extractServiceSummary(
  serviceDetails: AdminOrderServiceDetails | null,
  serviceName: string,
): { included: string[]; extras: string[] } {
  const included: string[] = [serviceName];
  const extras: string[] = [];

  if (!serviceDetails) {
    return { included, extras };
  }

  const config = SERVICE_DETAIL_DISPLAY[serviceDetails.type as keyof typeof SERVICE_DETAIL_DISPLAY];
  if (!config) {
    return { included, extras };
  }

  const data = serviceDetails.data as Record<string, unknown>;

  for (const field of config) {
    const value = data[field.key];
    if (value === null || value === undefined) continue;

    const label = field.label || humanizeKey(field.key);

    if (field.valueType === "boolean") {
      if (value === true) extras.push(label);
      continue;
    }

    if (field.valueType === "number" && typeof value === "number") {
      included.push(`${label}: ${value}`);
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      included.push(`${label}: ${value.join(", ")}`);
      continue;
    }

    const text = String(value).trim();
    if (text) included.push(`${label}: ${text}`);
  }

  return { included, extras };
}

export function isCompletedOrder(order: ClientOrder): boolean {
  return COMPLETED_STATUSES.includes(order.status);
}

export function isUpcomingOrder(order: ClientOrder): boolean {
  if (!UPCOMING_STATUSES.includes(order.status)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return order.scheduledDate >= today;
}

export function getNextUpcomingOrder(orders: ClientOrder[]): ClientOrder | null {
  const upcoming = orders
    .filter(isUpcomingOrder)
    .sort((a, b) => {
      const dateCmp = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCmp !== 0) return dateCmp;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  return upcoming[0] ?? null;
}

export function getLatestCompletedOrder(orders: ClientOrder[]): ClientOrder | null {
  const completed = orders
    .filter(isCompletedOrder)
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  return completed[0] ?? null;
}

export function computeDashboardStats(orders: ClientOrder[]): PortalDashboardStats {
  const completed = orders.filter(isCompletedOrder);
  const upcoming = orders.filter(isUpcomingOrder);
  const latest = getLatestCompletedOrder(orders);

  const serviceTypeCounts = new Map<string, { count: number; label: string }>();
  for (const order of completed) {
    const key = order.serviceType;
    const current = serviceTypeCounts.get(key);
    serviceTypeCounts.set(key, {
      count: (current?.count ?? 0) + 1,
      label: order.serviceTypeLabel,
    });
  }

  let favoriteService: string | null = null;
  let maxCount = 0;
  for (const [, { count, label }] of serviceTypeCounts) {
    if (count > maxCount) {
      maxCount = count;
      favoriteService = label;
    }
  }

  return {
    completedCleanings: completed.length,
    upcomingBookings: upcoming.length,
    lastBookingDate: latest?.scheduledDate ?? null,
    lastBookingService: latest?.serviceTypeLabel ?? null,
    favoriteService,
    averageRating: null, // TODO: aggregate client review ratings when list endpoint exists
  };
}

export function mapClientOrderToPortal(order: ClientOrder): PortalOrder {
  const serviceId = mapServiceTypeToPortalId(order.serviceType);
  const hasCleaner = Boolean(order.assignedCleaner?.name);

  return {
    id: order.routeId,
    serviceId,
    serviceName: order.serviceTypeLabel,
    scheduledDate: order.scheduledDate,
    dayLabel: formatDayLabel(order.scheduledDate),
    timeRange: formatTimeRange(order.scheduledTime),
    status: mapOrderStatusToPortalStatus(order.status),
    statusLabel: portalStatusLabel(order.status, order.statusLabel),
    apiStatus: order.status,
    price: order.estimatedPrice,
    currency: order.currency,
    address: buildAddress(order),
    cleaner: order.assignedCleaner
      ? {
          id: order.assignedCleaner.name,
          name: order.assignedCleaner.name,
          avatarUrl: null,
          phone: order.assignedCleaner.phone !== "—" ? order.assignedCleaner.phone : "",
        }
      : null,
    timeline: buildTimeline(order.status, hasCleaner),
    included: [order.serviceTypeLabel],
    extras: [],
  };
}

export function mapClientOrderDetailToPortal(order: ClientOrderDetail): PortalOrderDetail {
  const base = mapClientOrderToPortal(order);
  const summary = extractServiceSummary(order.serviceDetails, order.serviceTypeLabel);

  return {
    ...base,
    included: summary.included,
    extras: summary.extras,
    customerComment: order.customerComment,
    canCancel: order.canCancel,
    canReschedule: order.canReschedule,
    canLeaveReview: order.canLeaveReview,
    canOpenComplaint: order.canOpenComplaint,
  };
}
