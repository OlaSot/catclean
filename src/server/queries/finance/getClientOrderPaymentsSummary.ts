import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchClientOwnedOrder } from "@/server/mutations/orders/client-order-access";

function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export async function getClientOrderPaymentsSummary(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string
): Promise<{
  paidAmount: number;
  refundedAmount: number;
  netPaidAmount: number;
  outstandingAmount: number;
  currency: string;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
}> {
  const access = await fetchClientOwnedOrder(supabase, orderId, clientId);
  if (!access.ok) {
    return {
      paidAmount: 0,
      refundedAmount: 0,
      netPaidAmount: 0,
      outstandingAmount: 0,
      currency: "EUR",
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, estimated_price, final_price, currency")
    .eq("id", orderId.trim())
    .maybeSingle();

  if (orderError) {
    console.error("getClientOrderPaymentsSummary order:", orderError);
    return {
      paidAmount: 0,
      refundedAmount: 0,
      netPaidAmount: 0,
      outstandingAmount: 0,
      currency: "EUR",
      error: orderError.message,
    };
  }

  const currency =
    typeof (orderRow as any)?.currency === "string" && String((orderRow as any).currency).trim()
      ? String((orderRow as any).currency).trim().toUpperCase()
      : "EUR";
  const total = parseMoney((orderRow as any)?.final_price ?? (orderRow as any)?.estimated_price ?? 0);

  const { data: rows, error } = await supabase
    .from("order_payments")
    .select("amount, status")
    .eq("order_id", orderId.trim());

  if (error) {
    console.error("getClientOrderPaymentsSummary payments:", error);
    return {
      paidAmount: 0,
      refundedAmount: 0,
      netPaidAmount: 0,
      outstandingAmount: 0,
      currency,
      error: error.message,
    };
  }

  const paidGrossAmount = parseMoney(
    (rows ?? [])
      .filter((r) => (r as any).status === "paid")
      .reduce((sum, r) => sum + parseMoney((r as any).amount), 0)
  );
  const refundedAmount = parseMoney(
    (rows ?? [])
      .filter((r) => (r as any).status === "refunded")
      .reduce((sum, r) => sum + parseMoney((r as any).amount), 0)
  );
  const netPaidAmount = parseMoney(paidGrossAmount - refundedAmount);

  const outstandingAmount = parseMoney(Math.max(total - netPaidAmount, 0));

  return {
    paidAmount: paidGrossAmount,
    refundedAmount,
    netPaidAmount,
    outstandingAmount,
    currency,
    error: null,
  };
}

