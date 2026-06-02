import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OrderPaymentMethod,
  OrderPaymentRecord,
  OrderPaymentRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";
import {
  getAdminOrderFinance,
  updateOrderPaymentStatusFromFinance,
} from "@/server/queries/finance/getAdminOrderFinance";

function parseMoney(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n * 100) / 100;
  if (rounded <= 0) return null;
  return rounded;
}

function normalizeCurrency(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text.toUpperCase() : "EUR";
}

function normalizeMethod(value: unknown): OrderPaymentMethod | null {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowed: OrderPaymentMethod[] = ["cash", "card", "bank_transfer", "manual", "other"];
  return (allowed as string[]).includes(key) ? (key as OrderPaymentMethod) : null;
}

function normalizeStatus(value: unknown): OrderPaymentRecordStatus | null {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowed: OrderPaymentRecordStatus[] = ["pending", "paid", "failed", "refunded"];
  return (allowed as string[]).includes(key) ? (key as OrderPaymentRecordStatus) : null;
}

export async function createAdminOrderPayment(
  supabase: SupabaseClient,
  orderId: string,
  recordedBy: string,
  input: {
    amount: unknown;
    currency?: unknown;
    method: unknown;
    status: unknown;
    note?: unknown;
  }
): Promise<{
  payment: OrderPaymentRecord | null;
  error: string | null;
  notFound?: boolean;
}> {
  const id = orderId.trim();
  if (!id) return { payment: null, error: "Invalid order id" };

  const amount = parseMoney(input.amount);
  if (amount === null) {
    return { payment: null, error: "amount must be a positive number" };
  }

  const method = normalizeMethod(input.method);
  if (!method) {
    return { payment: null, error: "Invalid payment method" };
  }

  const status = normalizeStatus(input.status);
  if (!status) {
    return { payment: null, error: "Invalid payment status" };
  }

  const currency = normalizeCurrency(input.currency);
  const note = typeof input.note === "string" ? input.note.trim() || null : null;

  const { data: inserted, error: insertError } = await supabase
    .from("order_payments")
    .insert({
      order_id: id,
      amount,
      currency,
      method,
      status,
      note,
      recorded_by: recordedBy,
    })
    .select("id, order_id, amount, currency, method, status, note, recorded_by, created_at")
    .maybeSingle();

  if (insertError) {
    console.error("createAdminOrderPayment:", insertError);
    return { payment: null, error: insertError.message };
  }

  if (!inserted?.id) {
    return { payment: null, error: "Failed to create payment record" };
  }

  const payment: OrderPaymentRecord = {
    id: (inserted as any).id,
    orderId: (inserted as any).order_id,
    amount: Number((inserted as any).amount),
    currency: String((inserted as any).currency ?? "EUR"),
    method: (inserted as any).method as OrderPaymentMethod,
    status: (inserted as any).status as OrderPaymentRecordStatus,
    note: ((inserted as any).note as string | null) ?? null,
    recordedBy: ((inserted as any).recorded_by as string | null) ?? null,
    createdAt: (inserted as any).created_at as string,
  };

  const finance = await getAdminOrderFinance(supabase, id);
  if (finance.notFound) return { payment, error: null, notFound: true };
  if (finance.error || !finance.data) return { payment, error: finance.error };

  const updated = await updateOrderPaymentStatusFromFinance(supabase, id, finance.data.summary);
  if (!updated.ok) return { payment, error: updated.error ?? null };

  return { payment, error: null };
}

