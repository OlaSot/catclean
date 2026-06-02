export type OrderPaymentStatus = "unpaid" | "paid" | "card_hold";

export type OrderStatus =
  | "awaiting_confirmation"
  | "new"
  | "waiting_for_payment"
  | "paid"
  | "searching_cleaner"
  | "cleaner_assigned"
  | "confirmed"
  | "in_progress"
  | "problem"
  | "completed"
  | "cancelled_by_client"
  | "cancelled_by_cleaner"
  | "cancelled_by_admin"
  | "refunded"
  | "canceled";

export type Order = {
  id: number;
  /** URL segment for /app/admin/orders/[id] (raw DB id). */
  routeId: string;
  /** UI label: order_number, numeric id, or short uuid suffix. */
  displayId: string;
  orderNumber?: string | null;
  draftId?: number | null;
  channel: "Website" | "Phone" | "Partner" | "Manual";
  city: string;

  dateISO: string;
  time: string;
  durationHours: number;

  serviceType: string;
  /** Compact line for list cards (from service detail table). */
  serviceSummary?: string | null;
  rooms: { label: string; count: number }[];

  address: {
    street: string;
    house: string;
    apartment?: string;
    floor?: string;
    zip?: string;
    note?: string;
  };

  customer: {
      id?: string | null;
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
    lastOrderDateISO?: string;
  };

  pricing: {
    base: number;
    discountPercent: number;
    total: number;
    currency: "EUR";
  };

  payment: {
    method: "Cash" | "Card" | "After";
    status: OrderPaymentStatus;
    cardHoldAmount?: number;
    paymentLink?: string;
    editLink?: string;
  };

  assigned: {
    cleanersNeeded: number;
    cleaners: { name: string; ratePerHour: number; payout: number }[];
  };

  status: OrderStatus;
  managerChecked: boolean;
  confirmation?: {
    hasActiveToken: boolean;
  };

  notes?: string;
};
