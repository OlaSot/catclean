import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCleanerOwnedOrder } from "@/server/mutations/orders/cleaner-order-access";
import type { CleanerPayoutRecord, CleanerPayoutRecordStatus } from "@/features/finance/types/admin-order-finance.types";
import {
  mapCleanerPayoutRow,
  type CleanerPayoutRow,
} from "@/server/queries/finance/map-finance-records";

function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
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

  const payouts: CleanerPayoutRecord[] = ((rows ?? []) as CleanerPayoutRow[]).map(
    mapCleanerPayoutRow
  );

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

