import { ORDER_STATUS_VALUES } from "@/lib/constants/order-status";
import type { OrderStatus } from "./order.types";

const STATUS_ALIASES: Record<string, OrderStatus> = {
  done: "completed",
  cancelled: "canceled",
};

export function isOrderStatus(value: string): value is OrderStatus {
  const key = value.toLowerCase().replace(/-/g, "_");
  return (
    (ORDER_STATUS_VALUES as readonly string[]).includes(key) ||
    key in STATUS_ALIASES
  );
}

export function normalizeOrderStatus(
  status: string | null | undefined
): OrderStatus {
  const key = (status ?? "new").toLowerCase().replace(/-/g, "_");

  if ((ORDER_STATUS_VALUES as readonly string[]).includes(key)) {
    return key as OrderStatus;
  }

  if (STATUS_ALIASES[key]) {
    return STATUS_ALIASES[key];
  }

  return "new";
}
