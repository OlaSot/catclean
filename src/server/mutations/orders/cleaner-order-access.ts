import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type CleanerOrderRow = {
  id: string | number;
  status: string | null;
  assigned_cleaner_id: string | null;
};

export async function fetchCleanerOwnedOrder(
  supabase: SupabaseClient,
  orderId: string,
  cleanerId: string
): Promise<
  | { ok: true; order: CleanerOrderRow }
  | { ok: false; error: string; notFound?: boolean; forbidden?: boolean }
> {
  const id = orderId.trim();
  const cleaner = cleanerId.trim();

  if (!id) {
    return { ok: false, error: "Invalid order id" };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, assigned_cleaner_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchCleanerOwnedOrder:", error);
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Order not found", notFound: true };
  }

  const order = data as CleanerOrderRow;

  if (order.assigned_cleaner_id !== cleaner) {
    return { ok: false, error: "Forbidden", forbidden: true };
  }

  return { ok: true, order };
}

export function getNormalizedOrderStatus(
  status: string | null | undefined
): OrderStatus {
  return normalizeOrderStatus(status);
}
