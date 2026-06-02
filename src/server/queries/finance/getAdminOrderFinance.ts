import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminOrderFinanceData,
  AdminOrderFinanceSummary,
  CleanerPayoutRecord,
  CleanerPayoutRecordStatus,
  OrderPaymentMethod,
  OrderPaymentRecord,
  OrderPaymentRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";
import type { OrderPaymentStatus } from "@/entities/order/order.types";

type OrderRow = {
  id: string;
  estimated_price: number | null;
  final_price: number | null;
  currency: string | null;
  payment_status: string | null;
};

function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function normalizeCurrency(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : "EUR";
}

function normalizePaymentStatus(value: string | null | undefined): OrderPaymentStatus {
  const key = (value ?? "unpaid").toLowerCase();
  if (key === "paid" || key === "card_hold") return key;
  return "unpaid";
}

function computeNextPaymentStatus(
  netPaidAmount: number,
  orderTotal: number
): OrderPaymentStatus {
  if (netPaidAmount <= 0) return "unpaid";
  if (netPaidAmount + 0.0001 >= orderTotal) return "paid";
  return "card_hold";
}

export function computeFinanceSummary(input: {
  orderTotal: number;
  currency: string;
  payments: OrderPaymentRecord[];
  payouts: CleanerPayoutRecord[];
  currentPaymentStatus: OrderPaymentStatus;
}): AdminOrderFinanceSummary {
  const paidGrossAmount = parseMoney(
    input.payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0)
  );
  const refundedAmount = parseMoney(
    input.payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0)
  );
  const netPaidAmount = parseMoney(paidGrossAmount - refundedAmount);
  const payoutAmount = parseMoney(
    input.payouts
      .filter((p) => p.status !== "cancelled")
      .reduce((sum, p) => sum + p.amount, 0)
  );
  const outstandingAmount = parseMoney(Math.max(input.orderTotal - netPaidAmount, 0));
  const overpaidAmount = parseMoney(Math.max(netPaidAmount - input.orderTotal, 0));
  const marginAmount = parseMoney(netPaidAmount - payoutAmount);

  const paymentStatus = computeNextPaymentStatus(netPaidAmount, input.orderTotal);

  return {
    orderTotal: parseMoney(input.orderTotal),
    currency: input.currency,
    paidAmount: paidGrossAmount,
    refundedAmount,
    netPaidAmount,
    outstandingAmount,
    overpaidAmount,
    payoutAmount,
    marginAmount,
    paymentStatus,
  };
}

export async function getAdminOrderFinance(
  supabase: SupabaseClient,
  orderId: string
): Promise<{
  data: AdminOrderFinanceData | null;
  error: string | null;
  notFound?: boolean;
}> {
  const id = orderId.trim();
  if (!id) return { data: null, error: "Invalid order id" };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, estimated_price, final_price, currency, payment_status")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    console.error("getAdminOrderFinance order:", orderError);
    return { data: null, error: orderError.message };
  }

  if (!order?.id) {
    return { data: null, error: null, notFound: true };
  }

  const orderRow = order as unknown as OrderRow;
  const currency = normalizeCurrency(orderRow.currency);
  const orderTotal = parseMoney(orderRow.final_price ?? orderRow.estimated_price ?? 0);
  const currentPaymentStatus = normalizePaymentStatus(orderRow.payment_status);

  const [{ data: paymentsRows, error: paymentsError }, { data: payoutsRows, error: payoutsError }] =
    await Promise.all([
      supabase
        .from("order_payments")
        .select("id, order_id, amount, currency, method, status, note, recorded_by, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("cleaner_payouts")
        .select(
          "id, order_id, cleaner_id, amount, currency, status, payout_percent, base_amount, adjustment_amount, adjustment_reason, is_manual_override, note, recorded_by, created_at"
        )
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (paymentsError) {
    console.error("getAdminOrderFinance payments:", paymentsError);
    return { data: null, error: paymentsError.message };
  }

  if (payoutsError) {
    console.error("getAdminOrderFinance payouts:", payoutsError);
    return { data: null, error: payoutsError.message };
  }

  const payments: OrderPaymentRecord[] = (paymentsRows ?? []).map((row) => ({
    id: (row as any).id as string,
    orderId: (row as any).order_id as string,
    amount: parseMoney((row as any).amount),
    currency: normalizeCurrency((row as any).currency),
    method: (row as any).method as OrderPaymentMethod,
    status: (row as any).status as OrderPaymentRecordStatus,
    note: ((row as any).note as string | null) ?? null,
    recordedBy: ((row as any).recorded_by as string | null) ?? null,
    createdAt: (row as any).created_at as string,
  }));

  const payouts: CleanerPayoutRecord[] = (payoutsRows ?? []).map((row) => ({
    id: (row as any).id as string,
    orderId: (row as any).order_id as string,
    cleanerId: (row as any).cleaner_id as string,
    amount: parseMoney((row as any).amount),
    currency: normalizeCurrency((row as any).currency),
    status: (row as any).status as CleanerPayoutRecordStatus,
    payoutPercent:
      (row as any).payout_percent === null || (row as any).payout_percent === undefined
        ? null
        : parseMoney((row as any).payout_percent),
    baseAmount:
      (row as any).base_amount === null || (row as any).base_amount === undefined
        ? null
        : parseMoney((row as any).base_amount),
    adjustmentAmount: parseMoney((row as any).adjustment_amount ?? 0),
    adjustmentReason: ((row as any).adjustment_reason as string | null) ?? null,
    isManualOverride: Boolean((row as any).is_manual_override),
    note: ((row as any).note as string | null) ?? null,
    recordedBy: ((row as any).recorded_by as string | null) ?? null,
    createdAt: (row as any).created_at as string,
  }));

  const summary = computeFinanceSummary({
    orderTotal,
    currency,
    payments,
    payouts,
    currentPaymentStatus,
  });

  return { data: { summary, payments, payouts }, error: null };
}

export async function updateOrderPaymentStatusFromFinance(
  supabase: SupabaseClient,
  orderId: string,
  summary: AdminOrderFinanceSummary
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: summary.paymentStatus })
    .eq("id", orderId.trim());

  if (error) {
    console.error("updateOrderPaymentStatusFromFinance:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}

