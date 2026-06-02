import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";

/** Matches ORDER_RULES.md §7 policy codes returned by cancel API. */
export type ClientCancellationPolicy =
  | "free_cancellation"
  | "cancellation_fee_50"
  | "cancellation_fee_100"
  | "forbidden";

export type ClientCancellationEvaluation = {
  allowed: boolean;
  policy: ClientCancellationPolicy;
  feePercent: 0 | 50 | 100;
  feeAmount: number;
  hoursUntilStart: number | null;
  message: string;
};

const CLIENT_CANCEL_FORBIDDEN_STATUSES: OrderStatus[] = [
  "in_progress",
  "problem",
  "completed",
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
];

const CLIENT_CANCEL_ALLOWED_STATUSES: OrderStatus[] = [
  "awaiting_confirmation",
  "new",
  "waiting_for_payment",
  "paid",
  "searching_cleaner",
  "cleaner_assigned",
  "confirmed",
];

export function parseScheduledStart(
  scheduledDate: string | null | undefined,
  scheduledTime: string | null | undefined
): Date | null {
  const datePart = scheduledDate?.trim().slice(0, 10);
  if (!datePart) return null;

  const timeRaw = scheduledTime?.trim() ?? "00:00";
  const timePart = timeRaw.length >= 5 ? timeRaw.slice(0, 5) : "00:00";
  const isoLocal = `${datePart}T${timePart}:00`;
  const parsed = new Date(isoLocal);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function evaluateClientCancellation(params: {
  status: string | null | undefined;
  scheduledDate: string | null | undefined;
  scheduledTime: string | null | undefined;
  estimatedPrice: number | null | undefined;
  now?: Date;
}): ClientCancellationEvaluation {
  const status = normalizeOrderStatus(params.status);
  const price = Math.max(0, params.estimatedPrice ?? 0);
  const now = params.now ?? new Date();

  if (CLIENT_CANCEL_FORBIDDEN_STATUSES.includes(status)) {
    const message =
      status === "in_progress" ||
      status === "problem" ||
      status === "completed"
        ? "Cancellation is not allowed while cleaning is in progress, a problem is reported, or the order is completed. Please open a complaint instead."
        : "This order can no longer be cancelled online.";

    return {
      allowed: false,
      policy: "forbidden",
      feePercent: 100,
      feeAmount: 0,
      hoursUntilStart: null,
      message,
    };
  }

  if (!CLIENT_CANCEL_ALLOWED_STATUSES.includes(status)) {
    return {
      allowed: false,
      policy: "forbidden",
      feePercent: 100,
      feeAmount: 0,
      hoursUntilStart: null,
      message: "Cancellation is not available for the current order status.",
    };
  }

  const scheduledStart = parseScheduledStart(
    params.scheduledDate,
    params.scheduledTime
  );

  if (!scheduledStart) {
    return {
      allowed: true,
      policy: "free_cancellation",
      feePercent: 0,
      feeAmount: 0,
      hoursUntilStart: null,
      message: "Free cancellation (scheduled time not set).",
    };
  }

  const hoursUntilStart =
    (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart > 24) {
    return {
      allowed: true,
      policy: "free_cancellation",
      feePercent: 0,
      feeAmount: 0,
      hoursUntilStart,
      message: "Free cancellation — more than 24 hours before the scheduled start.",
    };
  }

  if (hoursUntilStart >= 12) {
    const feeAmount = Math.round(price * 0.5 * 100) / 100;
    return {
      allowed: true,
      policy: "cancellation_fee_50",
      feePercent: 50,
      feeAmount,
      hoursUntilStart,
      message:
        "Cancellation fee 50% applies (between 12 and 24 hours before scheduled start).",
    };
  }

  const feeAmount = Math.round(price * 100) / 100;
  return {
    allowed: true,
    policy: "cancellation_fee_100",
    feePercent: 100,
    feeAmount,
    hoursUntilStart,
    message:
      "Cancellation fee 100% applies (less than 12 hours before scheduled start).",
  };
}

export function policyLabel(policy: ClientCancellationPolicy): string {
  switch (policy) {
    case "free_cancellation":
      return "Free cancellation";
    case "cancellation_fee_50":
      return "50% cancellation fee";
    case "cancellation_fee_100":
      return "100% cancellation fee";
    default:
      return "Cancellation not allowed";
  }
}
