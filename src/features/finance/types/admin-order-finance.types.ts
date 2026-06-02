export type OrderPaymentMethod = "cash" | "card" | "bank_transfer" | "manual" | "other";
export type OrderPaymentRecordStatus = "pending" | "paid" | "failed" | "refunded";

export type CleanerPayoutRecordStatus = "pending" | "paid" | "cancelled";

export type OrderPaymentRecord = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: OrderPaymentMethod;
  status: OrderPaymentRecordStatus;
  note: string | null;
  recordedBy: string | null;
  createdAt: string;
};

export type CleanerPayoutRecord = {
  id: string;
  orderId: string;
  cleanerId: string;
  amount: number;
  currency: string;
  status: CleanerPayoutRecordStatus;
  payoutPercent: number | null;
  baseAmount: number | null;
  adjustmentAmount: number;
  adjustmentReason: string | null;
  isManualOverride: boolean;
  note: string | null;
  recordedBy: string | null;
  createdAt: string;
};

export type AdminOrderFinanceSummary = {
  orderTotal: number;
  currency: string;
  paidAmount: number;
  refundedAmount: number;
  netPaidAmount: number;
  outstandingAmount: number;
  overpaidAmount: number;
  payoutAmount: number;
  marginAmount: number;
  paymentStatus: "unpaid" | "paid" | "card_hold";
};

export type AdminOrderFinanceData = {
  summary: AdminOrderFinanceSummary;
  payments: OrderPaymentRecord[];
  payouts: CleanerPayoutRecord[];
};

export type AdminOrderFinanceApiResponse = {
  data: AdminOrderFinanceData | null;
  error: string | null;
};

export type AdminCreatePaymentRequestBody = {
  amount?: number | string;
  currency?: string;
  method?: string;
  status?: string;
  note?: string;
};

export type AdminCreatePayoutRequestBody = {
  cleanerId?: string;
  amount?: number | string;
  payoutPercent?: number | string;
  adjustmentAmount?: number | string;
  adjustmentReason?: string;
  currency?: string;
  status?: string;
  note?: string;
};

export type AdminUpdatePayoutRequestBody = {
  payoutPercent?: number | string;
  adjustmentAmount?: number | string;
  adjustmentReason?: string;
  amount?: number | string;
  status?: string;
  note?: string;
};

