import type { OrderStatus } from "@/entities/order/order.types";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  awaiting_confirmation: "Awaiting confirmation",
  new: "New",
  waiting_for_payment: "Waiting for payment",
  paid: "Paid",
  searching_cleaner: "Searching cleaner",
  cleaner_assigned: "Cleaner assigned",
  confirmed: "Confirmed",
  in_progress: "In progress",
  problem: "Problem",
  completed: "Completed",
  cancelled_by_client: "Cancelled by client",
  cancelled_by_cleaner: "Cancelled by cleaner",
  cancelled_by_admin: "Cancelled by admin",
  refunded: "Refunded",
  canceled: "Canceled",
  cancelled: "Canceled",
};

/** Statuses available in admin manual status change dropdown. */
export const ORDER_STATUSES = [
  {
    value: "awaiting_confirmation" as const,
    label: ORDER_STATUS_LABELS.awaiting_confirmation,
  },
  { value: "new" as const, label: ORDER_STATUS_LABELS.new },
  {
    value: "waiting_for_payment" as const,
    label: ORDER_STATUS_LABELS.waiting_for_payment,
  },
  { value: "paid" as const, label: ORDER_STATUS_LABELS.paid },
  {
    value: "searching_cleaner" as const,
    label: ORDER_STATUS_LABELS.searching_cleaner,
  },
  {
    value: "cleaner_assigned" as const,
    label: ORDER_STATUS_LABELS.cleaner_assigned,
  },
  { value: "confirmed" as const, label: ORDER_STATUS_LABELS.confirmed },
  { value: "in_progress" as const, label: ORDER_STATUS_LABELS.in_progress },
  { value: "problem" as const, label: ORDER_STATUS_LABELS.problem },
  { value: "completed" as const, label: ORDER_STATUS_LABELS.completed },
  {
    value: "cancelled_by_client" as const,
    label: ORDER_STATUS_LABELS.cancelled_by_client,
  },
  {
    value: "cancelled_by_cleaner" as const,
    label: ORDER_STATUS_LABELS.cancelled_by_cleaner,
  },
  {
    value: "cancelled_by_admin" as const,
    label: ORDER_STATUS_LABELS.cancelled_by_admin,
  },
  { value: "refunded" as const, label: ORDER_STATUS_LABELS.refunded },
] satisfies ReadonlyArray<{ value: OrderStatus; label: string }>;

export const ORDER_STATUS_CLEANER_ASSIGNED = "cleaner_assigned" as const;

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((item) => item.value);

export function getOrderStatusLabel(status: string | null | undefined): string {
  const key = (status ?? "new").toLowerCase().replace(/-/g, "_");
  return ORDER_STATUS_LABELS[key] ?? key.replace(/_/g, " ");
}
