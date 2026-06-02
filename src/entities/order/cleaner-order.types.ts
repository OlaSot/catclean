import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";
import type { OrderOperationalNotesPublic } from "./order-operational-notes.types";
import type { OrderStatus } from "./order.types";

export type CleanerOrder = {
  id: number;
  status: OrderStatus;
  statusLabel: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  serviceTypeLabel: string;
  estimatedPrice: number;
  currency: string;
  address: {
    city: string;
    street: string;
    house: string;
    floor: string | null;
    line: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
  };
  assignment: {
    id: string;
    status: string | null;
    completedAt: string | null;
  } | null;
};

export type CleanerOrderDetail = CleanerOrder & {
  customerComment: string | null;
  doorbell: string | null;
  serviceDetails: AdminOrderServiceDetails | null;
  operationalNotes: OrderOperationalNotesPublic;
  canStart: boolean;
  canComplete: boolean;
  expectedPayout: number;
  payoutStatus: string | null;
  payoutNote: string | null;
};
