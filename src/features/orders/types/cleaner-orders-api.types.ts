import type { CleanerOrder } from "@/entities/order/cleaner-order.types";

export type CleanerOrdersApiResponse = {
  data: CleanerOrder[] | null;
  error: string | null;
};
