import type { ClientOrderDetail } from "@/entities/order/client-order.types";
import type { ComplaintReason } from "@/lib/constants/complaint";

export type ClientOrderComplaintSummary = {
  id: string;
  reason: ComplaintReason;
  reasonLabel: string;
  description: string;
  status: string;
  createdAt: string;
};

export type ClientOrderComplaintResult = {
  complaint: ClientOrderComplaintSummary;
  order: ClientOrderDetail;
};
