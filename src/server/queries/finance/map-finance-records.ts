import type {
  CleanerPayoutRecord,
  CleanerPayoutRecordStatus,
  OrderPaymentMethod,
  OrderPaymentRecord,
  OrderPaymentRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";

export type OrderPaymentRow = {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string | null;
  method: OrderPaymentMethod;
  status: OrderPaymentRecordStatus;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type CleanerPayoutRow = {
  id: string;
  order_id: string;
  cleaner_id: string;
  amount: number | string;
  currency: string | null;
  status: CleanerPayoutRecordStatus;
  payout_percent: number | string | null;
  base_amount: number | string | null;
  adjustment_amount: number | string | null;
  adjustment_reason: string | null;
  is_manual_override: boolean | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
};

function toMoney(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function mapOrderPaymentRow(row: OrderPaymentRow): OrderPaymentRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: toMoney(row.amount),
    currency: row.currency?.trim().toUpperCase() || "EUR",
    method: row.method,
    status: row.status,
    note: row.note ?? null,
    recordedBy: row.recorded_by ?? null,
    createdAt: row.created_at,
  };
}

export function mapCleanerPayoutRow(row: CleanerPayoutRow): CleanerPayoutRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    cleanerId: row.cleaner_id,
    amount: toMoney(row.amount),
    currency: row.currency?.trim().toUpperCase() || "EUR",
    status: row.status,
    payoutPercent: row.payout_percent == null ? null : toMoney(row.payout_percent),
    baseAmount: row.base_amount == null ? null : toMoney(row.base_amount),
    adjustmentAmount: toMoney(row.adjustment_amount),
    adjustmentReason: row.adjustment_reason ?? null,
    isManualOverride: Boolean(row.is_manual_override),
    note: row.note ?? null,
    recordedBy: row.recorded_by ?? null,
    createdAt: row.created_at,
  };
}
