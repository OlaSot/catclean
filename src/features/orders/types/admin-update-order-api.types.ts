import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";

export type AdminUpdateOrderRequestBody = {
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_price?: number;
  final_price?: number | null;
  payment_status?: string;
  customer_comment?: string | null;
  internal_note?: string | null;
  address?: {
    city?: string;
    street?: string;
    house_number?: string;
    floor?: string | null;
    doorbell_name?: string | null;
  };
  serviceDetails?: AdminOrderServiceDetails | null;
};

export type AdminUpdateOrderApiResponse = {
  data: AdminOrderDetail | null;
  error: string | null;
};

