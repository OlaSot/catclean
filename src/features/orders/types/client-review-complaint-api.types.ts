import type { ClientOrderComplaintResult } from "@/entities/complaint/client-complaint.types";
import type { ClientOrderReviewResult } from "@/entities/review/client-review.types";

export type ClientReviewRequestBody = {
  rating?: number;
  comment?: string;
};

export type ClientComplaintRequestBody = {
  reason?: string;
  description?: string;
};

export type ClientReviewApiResponse = {
  data: ClientOrderReviewResult | null;
  error: string | null;
};

export type ClientComplaintApiResponse = {
  data: ClientOrderComplaintResult | null;
  error: string | null;
};
