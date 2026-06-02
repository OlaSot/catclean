import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CleanerPayoutRecord,
  CleanerPayoutRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";
import {
  calculateCleanerPayout,
  DEFAULT_CLEANER_PAYOUT_PERCENT,
} from "@/lib/finance/calculate-cleaner-payout";

function parseNonNegativeMoney(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n * 100) / 100;
  return rounded < 0 ? null : rounded;
}

function parseAnyMoney(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function normalizeStatus(value: unknown): CleanerPayoutRecordStatus | null {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowed: CleanerPayoutRecordStatus[] = ["pending", "paid", "cancelled"];
  return (allowed as string[]).includes(key) ? (key as CleanerPayoutRecordStatus) : null;
}

export async function updateAdminCleanerPayout(
  supabase: SupabaseClient,
  orderId: string,
  payoutId: string,
  input: {
    payoutPercent?: unknown;
    adjustmentAmount?: unknown;
    adjustmentReason?: unknown;
    amount?: unknown;
    status?: unknown;
    note?: unknown;
  }
): Promise<{ payout: CleanerPayoutRecord | null; error: string | null; notFound?: boolean }> {
  const id = orderId.trim();
  const payoutRowId = payoutId.trim();
  if (!id || !payoutRowId) return { payout: null, error: "Invalid payout id" };

  const { data: payoutRow, error: payoutError } = await supabase
    .from("cleaner_payouts")
    .select("id, order_id, cleaner_id, currency, status, payout_percent, base_amount, adjustment_amount, adjustment_reason, amount, note")
    .eq("id", payoutRowId)
    .eq("order_id", id)
    .maybeSingle();
  if (payoutError) return { payout: null, error: payoutError.message };
  if (!payoutRow?.id) return { payout: null, error: null, notFound: true };

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, final_price, estimated_price")
    .eq("id", id)
    .maybeSingle();
  if (orderError) return { payout: null, error: orderError.message };
  if (!orderRow?.id) return { payout: null, error: null, notFound: true };

  const payoutPercent =
    input.payoutPercent === undefined
      ? Number(payoutRow.payout_percent ?? DEFAULT_CLEANER_PAYOUT_PERCENT)
      : Number(input.payoutPercent);
  if (!Number.isFinite(payoutPercent) || payoutPercent < 0 || payoutPercent > 100) {
    return { payout: null, error: "payoutPercent must be between 0 and 100" };
  }

  const adjustmentAmount =
    input.adjustmentAmount === undefined
      ? parseAnyMoney(payoutRow.adjustment_amount ?? 0) ?? 0
      : parseAnyMoney(input.adjustmentAmount);
  if (adjustmentAmount === null) return { payout: null, error: "Invalid adjustmentAmount" };

  const manualAmountProvided = input.amount !== undefined;
  const manualAmount = manualAmountProvided
    ? parseNonNegativeMoney(input.amount)
    : null;
  if (manualAmountProvided && manualAmount === null) {
    return { payout: null, error: "amount must be a non-negative number" };
  }

  const baseTotal = Math.round(
    Number(orderRow.final_price ?? orderRow.estimated_price ?? 0) * 100
  ) / 100;
  const calc = calculateCleanerPayout({
    orderTotal: baseTotal,
    payoutPercent,
    adjustmentAmount,
    manualAmount: manualAmountProvided ? manualAmount : null,
  });

  const status =
    input.status === undefined
      ? (payoutRow.status as CleanerPayoutRecordStatus)
      : normalizeStatus(input.status);
  if (!status) return { payout: null, error: "Invalid payout status" };

  const note =
    input.note === undefined
      ? (payoutRow.note as string | null)
      : typeof input.note === "string"
        ? input.note.trim() || null
        : null;
  const adjustmentReason =
    input.adjustmentReason === undefined
      ? (payoutRow.adjustment_reason as string | null)
      : typeof input.adjustmentReason === "string"
        ? input.adjustmentReason.trim() || null
        : null;

  const { data: updated, error: updateError } = await supabase
    .from("cleaner_payouts")
    .update({
      amount: calc.finalAmount,
      status,
      payout_percent: calc.payoutPercent,
      base_amount: calc.baseAmount,
      adjustment_amount: calc.adjustmentAmount,
      adjustment_reason: adjustmentReason,
      is_manual_override: calc.isManualOverride,
      note,
    })
    .eq("id", payoutRowId)
    .eq("order_id", id)
    .select("id, order_id, cleaner_id, amount, currency, status, payout_percent, base_amount, adjustment_amount, adjustment_reason, is_manual_override, note, recorded_by, created_at")
    .maybeSingle();
  if (updateError) return { payout: null, error: updateError.message };
  if (!updated?.id) return { payout: null, error: "Failed to update payout", notFound: true };

  const payout: CleanerPayoutRecord = {
    id: String((updated as any).id),
    orderId: String((updated as any).order_id),
    cleanerId: String((updated as any).cleaner_id),
    amount: Number((updated as any).amount),
    currency: String((updated as any).currency ?? "EUR"),
    status: (updated as any).status as CleanerPayoutRecordStatus,
    payoutPercent:
      (updated as any).payout_percent === null || (updated as any).payout_percent === undefined
        ? null
        : Number((updated as any).payout_percent),
    baseAmount:
      (updated as any).base_amount === null || (updated as any).base_amount === undefined
        ? null
        : Number((updated as any).base_amount),
    adjustmentAmount: Number((updated as any).adjustment_amount ?? 0),
    adjustmentReason: ((updated as any).adjustment_reason as string | null) ?? null,
    isManualOverride: Boolean((updated as any).is_manual_override),
    note: ((updated as any).note as string | null) ?? null,
    recordedBy: ((updated as any).recorded_by as string | null) ?? null,
    createdAt: String((updated as any).created_at),
  };

  return { payout, error: null };
}
