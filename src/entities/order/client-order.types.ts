import type { ClientCancellationPolicy } from "@/lib/orders/client-cancellation";
import type { AdminOrderServiceDetails } from "./admin-order-service-details.types";
import type { OrderOperationalNotesPublic } from "./order-operational-notes.types";
import type { OrderPaymentStatus, OrderStatus } from "./order.types";

export type ClientOrder = {
  id: number;
  routeId: string;
  status: OrderStatus;
  statusLabel: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedPrice: number;
  currency: "EUR";
  paymentStatus: OrderPaymentStatus;
  paymentStatusLabel: string;
  address: {
    city: string;
    street: string;
    house: string;
    floor: string | null;
    line: string;
  };
  assignedCleaner: {
    name: string;
    email: string;
    phone: string;
  } | null;
};

export type ClientOrderCancellationPreview = {
  allowed: boolean;
  policy: ClientCancellationPolicy;
  feePercent: 0 | 50 | 100;
  feeAmount: number;
  policyLabel: string;
  message: string;
};

export type ClientOrderActiveComplaint = {
  id: string;
  reason: string;
  reasonLabel: string;
  description: string;
  createdAt: string;
};

export type ClientOrderDetail = ClientOrder & {
  serviceType: string;
  serviceTypeLabel: string;
  serviceDetails: AdminOrderServiceDetails | null;
  operationalNotes: OrderOperationalNotesPublic;
  customerComment: string | null;
  isProblemStatus: boolean;
  activeComplaint: ClientOrderActiveComplaint | null;
  canCancel: boolean;
  canReschedule: boolean;
  canLeaveReview: boolean;
  canOpenComplaint: boolean;
  hasReview: boolean;
  hasActiveComplaint: boolean;
  paidAmount: number;
  outstandingAmount: number;
  cancellationPreview: ClientOrderCancellationPreview | null;
};

export type ClientOrderCancelResult = {
  order: ClientOrderDetail;
  cancellation: {
    policy: ClientCancellationPolicy;
    feePercent: 0 | 50 | 100;
    feeAmount: number;
    policyLabel: string;
    message: string;
  };
};
