import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";
import type { OrderStatusHistoryItem } from "./order-status-history.types";
import type { OrderPaymentStatus, OrderStatus } from "./order.types";

export type AdminOrderOperationalNotes = {
  accessNotes: string | null;
  petsInfo: string | null;
  suppliesNote: string | null;
  equipmentNote: string | null;
  internalNote: string | null;
  priceBreakdown: Record<string, unknown> | null;
  manualDiscount: number;
  manualSurcharge: number;
};

export type AdminOrderDetail = {
  id: number;
  displayId: string;
  /** Normalized status for forms and pills. */
  status: OrderStatus;
  /** Raw status from database (enum value). */
  statusRaw: string;
  statusLabel: string;
  canAssignCleaner: boolean;
  paymentStatus: OrderPaymentStatus;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  client: {
    id: string | null;
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
  };
  address: {
    city: string;
    street: string;
    house: string;
    floor: string | null;
    apartment: string | null;
    doorbell: string | null;
  };
  service: {
    type: string;
    typeLabel: string;
    bookingProduct: string | null;
    productKey: string;
    productLabel: string;
    estimatedPrice: number;
    finalPrice: number | null;
    currency: string;
    comment: string | null;
  };
  assignment: {
    assignedCleanerId: string | null;
    cleanersNeeded: number;
    cleaners: {
      id: string;
      name: string;
      email: string;
      phone: string;
    }[];
  };
  operationalNotes: AdminOrderOperationalNotes;
  serviceDetails: AdminOrderServiceDetails | null;
  statusHistory: OrderStatusHistoryItem[];
};
