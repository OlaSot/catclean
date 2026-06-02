import type { ClientOrderDetail } from "@/entities/order/client-order.types";

export type ClientOrderReviewSummary = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ClientOrderReviewResult = {
  review: ClientOrderReviewSummary;
  order: ClientOrderDetail;
};
