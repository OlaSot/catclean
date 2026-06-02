import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { OrderStatus } from "@/entities/order/order.types";

export type UpdateOrderStatusRequestBody = {
  status: OrderStatus;
  comment?: string;
};

export type UpdateOrderStatusApiResponse = {
  data: AdminOrderDetail | null;
  error: string | null;
};
