import type { OrderStatus } from "@/entities/order/order.types";

export function scheduleStatusStyles(status: string): {
  border: string;
  bg: string;
  text: string;
} {
  const key = status.toLowerCase().replace(/-/g, "_");

  const map: Record<string, { border: string; bg: string; text: string }> = {
    searching_cleaner: {
      border: "border-violet-300",
      bg: "bg-violet-50",
      text: "text-violet-800",
    },
    confirmed: {
      border: "border-sky-300",
      bg: "bg-sky-50",
      text: "text-sky-800",
    },
    cleaner_assigned: {
      border: "border-indigo-300",
      bg: "bg-indigo-50",
      text: "text-indigo-800",
    },
    in_progress: {
      border: "border-amber-300",
      bg: "bg-amber-50",
      text: "text-amber-900",
    },
    completed: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
    },
    canceled: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      text: "text-rose-800",
    },
    cancelled_by_client: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      text: "text-rose-800",
    },
    cancelled_by_cleaner: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      text: "text-rose-800",
    },
    cancelled_by_admin: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      text: "text-rose-800",
    },
    cancelled: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      text: "text-rose-800",
    },
    refunded: {
      border: "border-slate-300",
      bg: "bg-slate-50",
      text: "text-slate-600",
    },
    paid: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/60",
      text: "text-emerald-800",
    },
    new: {
      border: "border-slate-200",
      bg: "bg-white",
      text: "text-slate-700",
    },
    waiting_for_payment: {
      border: "border-amber-200",
      bg: "bg-amber-50/60",
      text: "text-amber-900",
    },
    problem: {
      border: "border-rose-400",
      bg: "bg-rose-50",
      text: "text-rose-900",
    },
  };

  return (
    map[key] ?? {
      border: "border-slate-200",
      bg: "bg-white",
      text: "text-slate-700",
    }
  );
}

export function isCancelledScheduleStatus(status: string): boolean {
  const key = status.toLowerCase().replace(/-/g, "_");
  return (
    key === "canceled" ||
    key === "cancelled" ||
    key.startsWith("cancelled_") ||
    key === "refunded"
  );
}

export type { OrderStatus };
