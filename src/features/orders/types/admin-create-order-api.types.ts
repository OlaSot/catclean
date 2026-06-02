import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";

export type AdminCreateOrderRequestBody = {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  street: string;
  city: string;
  houseNumber: string;
  apartment?: string;
  zip?: string;
  postalCode?: string;
  floor?: string;
  doorbellName?: string;
  estimatedPrice?: string | number;
  finalPrice?: string | number;
  useManualPrice?: boolean;
  serviceDetails?: Record<string, unknown>;
  customerComment?: string;
};

export type AdminCreateOrderApiResponse = {
  data: AdminOrderDetail | null;
  error: string | null;
  createdClient?: boolean;
  clientId?: string;
};

