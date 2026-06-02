import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";

export type AdminOrderDetailApiResponse = {
  data: AdminOrderDetail | null;
  error: string | null;
};
