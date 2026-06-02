import type { Order } from "@/entities/order/order.types";

export type AdminOrdersApiResponse = {
  data: Order[] | null;
  error: string | null;
};
