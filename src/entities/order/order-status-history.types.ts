import type { OrderStatus } from "./order.types";

export type OrderStatusHistoryChangedBy = {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
};

export type OrderStatusHistoryItem = {
  id: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  oldStatusLabel: string;
  newStatusLabel: string;
  /** True when status did not change (client request, internal note). */
  isNote: boolean;
  /** Sub-type for isNote events. */
  noteKind: "note" | "request";
  changedBy: OrderStatusHistoryChangedBy | null;
  comment: string | null;
  createdAt: string;
};
