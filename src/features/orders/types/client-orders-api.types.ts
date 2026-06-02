import type {
  ClientOrder,
  ClientOrderCancelResult,
  ClientOrderDetail,
} from "@/entities/order/client-order.types";

export type ClientOrdersApiResponse = {
  data: ClientOrder[] | null;
  error: string | null;
};

export type ClientOrderDetailApiResponse = {
  data: ClientOrderDetail | null;
  error: string | null;
};

export type ClientCancelOrderApiResponse = {
  data: ClientOrderCancelResult | null;
  error: string | null;
};

export type ClientRescheduleRequestBody = {
  message?: string;
};

export type ClientRescheduleApiResponse = {
  data: { ok: true } | null;
  error: string | null;
};
