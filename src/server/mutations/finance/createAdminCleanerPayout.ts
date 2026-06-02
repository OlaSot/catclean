import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CleanerPayoutRecord,
  CleanerPayoutRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";
import {
  calculateCleanerPayout,
  DEFAULT_CLEANER_PAYOUT_PERCENT,
} from "@/lib/finance/calculate-cleaner-payout";

function parseMoney(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n * 100) / 100;
  if (rounded < 0) return null;
  return rounded;
}

function parseAnyMoney(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function normalizeCurrency(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text.toUpperCase() : "EUR";
}

function normalizeStatus(value: unknown): CleanerPayoutRecordStatus | null {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowed: CleanerPayoutRecordStatus[] = ["pending", "paid", "cancelled"];
  return (allowed as string[]).includes(key) ? (key as CleanerPayoutRecordStatus) : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function createAdminCleanerPayout(
  supabase: SupabaseClient,
  orderId: string,
  recordedBy: string,
  input: {
    cleanerId?: unknown;
    amount?: unknown;
    payoutPercent?: unknown;
    adjustmentAmount?: unknown;
    adjustmentReason?: unknown;
    currency?: unknown;
    status: unknown;
    note?: unknown;
  }
): Promise<{
  payout: CleanerPayoutRecord | null;
  error: string | null;
  notFound?: boolean;
}> {
  const id = orderId.trim();
  if (!id) return { payout: null, error: "Invalid order id" };

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, assigned_cleaner_id, estimated_price, final_price, currency")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    console.error("createAdminCleanerPayout order:", orderError);
    return { payout: null, error: orderError.message };
  }
  if (!orderRow?.id) {
    return { payout: null, error: null, notFound: true };
  }

  const cleanerIdRaw =
    typeof input.cleanerId === "string" ? input.cleanerId.trim() : "";
  const cleanerId =
    cleanerIdRaw ||
    (typeof orderRow.assigned_cleaner_id === "string"
      ? orderRow.assigned_cleaner_id
      : "");
  if (!cleanerId || !isUuid(cleanerId)) {
    return { payout: null, error: "Invalid cleanerId" };
  }

  const status = normalizeStatus(input.status);
  if (!status) {
    return { payout: null, error: "Invalid payout status" };
  }

  const { data: cleanerProfile, error: cleanerError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", cleanerId)
    .maybeSingle();
  if (cleanerError) {
    console.error("createAdminCleanerPayout cleaner:", cleanerError);
    return { payout: null, error: cleanerError.message };
  }
  if (!cleanerProfile?.id || cleanerProfile.role !== "cleaner") {
    return { payout: null, error: "cleanerId must belong to role=cleaner profile" };
  }

  const payoutPercentRaw =
    input.payoutPercent === undefined || input.payoutPercent === null || input.payoutPercent === ""
      ? DEFAULT_CLEANER_PAYOUT_PERCENT
      : Number(input.payoutPercent);
  if (!Number.isFinite(payoutPercentRaw) || payoutPercentRaw < 0 || payoutPercentRaw > 100) {
    return { payout: null, error: "payoutPercent must be between 0 and 100" };
  }

  const adjustmentAmountRaw =
    input.adjustmentAmount === undefined || input.adjustmentAmount === null || input.adjustmentAmount === ""
      ? 0
      : parseAnyMoney(input.adjustmentAmount);
  if (adjustmentAmountRaw === null) {
    return { payout: null, error: "Invalid adjustmentAmount" };
  }

  const manualAmount =
    input.amount === undefined || input.amount === null || input.amount === ""
      ? null
      : parseMoney(input.amount);
  if (input.amount !== undefined && input.amount !== null && input.amount !== "" && manualAmount === null) {
    return { payout: null, error: "amount must be a non-negative number" };
  }

  const orderTotal = Math.round(
    Number(orderRow.final_price ?? orderRow.estimated_price ?? 0) * 100
  ) / 100;
  const payoutCalc = calculateCleanerPayout({
    orderTotal,
    payoutPercent: payoutPercentRaw,
    adjustmentAmount: adjustmentAmountRaw,
    manualAmount,
  });

  const amount = payoutCalc.finalAmount;
  const currency = normalizeCurrency(input.currency ?? orderRow.currency);
  const adjustmentReason =
    typeof input.adjustmentReason === "string"
      ? input.adjustmentReason.trim() || null
      : null;
  const note = typeof input.note === "string" ? input.note.trim() || null : null;

  const { data: inserted, error: insertError } = await supabase
    .from("cleaner_payouts")
    .insert({
      order_id: id,
      cleaner_id: cleanerId,
      amount,
      currency,
      status,
      payout_percent: payoutCalc.payoutPercent,
      base_amount: payoutCalc.baseAmount,
      adjustment_amount: payoutCalc.adjustmentAmount,
      adjustment_reason: adjustmentReason,
      is_manual_override: payoutCalc.isManualOverride,
      note,
      recorded_by: recordedBy,
    })
    .select(
      "id, order_id, cleaner_id, amount, currency, status, payout_percent, base_amount, adjustment_amount, adjustment_reason, is_manual_override, note, recorded_by, created_at"
    )
    .maybeSingle();

  if (insertError) {
    console.error("createAdminCleanerPayout:", insertError);
    return { payout: null, error: insertError.message };
  }

  if (!inserted?.id) {
    return { payout: null, error: "Failed to create payout record" };
  }

  const payout: CleanerPayoutRecord = {
    id: (inserted as any).id,
    orderId: (inserted as any).order_id,
    cleanerId: (inserted as any).cleaner_id,
    amount: Number((inserted as any).amount),
    currency: String((inserted as any).currency ?? "EUR"),
    status: (inserted as any).status as CleanerPayoutRecordStatus,
    payoutPercent:
      (inserted as any).payout_percent === null ||
      (inserted as any).payout_percent === undefined
        ? null
        : Number((inserted as any).payout_percent),
    baseAmount:
      (inserted as any).base_amount === null ||
      (inserted as any).base_amount === undefined
        ? null
        : Number((inserted as any).base_amount),
    adjustmentAmount: Number((inserted as any).adjustment_amount ?? 0),
    adjustmentReason: ((inserted as any).adjustment_reason as string | null) ?? null,
    isManualOverride: Boolean((inserted as any).is_manual_override),
    note: ((inserted as any).note as string | null) ?? null,
    recordedBy: ((inserted as any).recorded_by as string | null) ?? null,
    createdAt: (inserted as any).created_at as string,
  };

  return { payout, error: null };
}

