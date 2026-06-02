import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";

export type AssignCleanerRequestBody = {
  cleanerId: string;
};

export type AssignCleanerApiResponse = {
  data: AdminOrderDetail | null;
  error: string | null;
};
