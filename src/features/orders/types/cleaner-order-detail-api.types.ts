import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";

export type CleanerOrderDetailApiResponse = {
  data: CleanerOrderDetail | null;
  error: string | null;
};
