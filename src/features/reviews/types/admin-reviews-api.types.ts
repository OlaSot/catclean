import type { AdminReviewListItem } from "@/entities/review/admin-review.types";

export type AdminReviewsApiResponse = {
  data: AdminReviewListItem[] | null;
  error: string | null;
};
