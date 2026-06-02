import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCleanerOwnedOrder } from "@/server/mutations/orders/cleaner-order-access";
import type { CleanerPayoutRecord, CleanerPayoutRecordStatus } from "@/features/finance/types/admin-order-finance.types";

function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function normalizeCurrency(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : "EUR";
}

export async function getCleanerOrderPayouts(
  supabase: SupabaseClient,
  orderId: string,
  cleanerId: string
): Promise<{
  payouts: CleanerPayoutRecord[];
  expectedPayout: number;
  payoutStatus: CleanerPayoutRecordStatus | null;
  payoutNote: string | null;
  currency: string;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
}> {
  const access = await fetchCleanerOwnedOrder(supabase, orderId, cleanerId);
  if (!access.ok) {
    return {
      payouts: [],
      expectedPayout: 0,
      payoutStatus: null,
      payoutNote: null,
      currency: "EUR",
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const { data: rows, error } = await supabase
    .from("cleaner_payouts")
    .select(
      "id, order_id, cleaner_id, amount, currency, status, payout_percent, base_amount, adjustment_amount, adjustment_reason, is_manual_override, note, recorded_by, created_at"
    )
    .eq("order_id", orderId.trim())
    .eq("cleaner_id", cleanerId.trim())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCleanerOrderPayouts:", error);
    return {
      payouts: [],
      expectedPayout: 0,
      payoutStatus: null,
      payoutNote: null,
      currency: "EUR",
      error: error.message,
    };
  }

  const payouts: CleanerPayoutRecord[] = (rows ?? []).map((row) => ({
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

  const expectedPayout = parseMoney(
    payouts
      .filter((p) => p.status !== "cancelled")
      .reduce((sum, p) => sum + p.amount, 0)
  );

  const payoutStatus = payouts.length > 0 ? payouts[0].status : null;
  const payoutNote = payouts.length > 0 ? payouts[0].note : null;
  const currency = payouts[0]?.currency ?? "EUR";

  return {
    payouts,
    expectedPayout,
    payoutStatus,
    payoutNote,
    currency,
    error: null,
  };
}

