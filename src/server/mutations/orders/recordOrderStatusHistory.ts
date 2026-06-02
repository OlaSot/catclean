import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function recordOrderStatusHistory(
  supabase: SupabaseClient,
  params: {
    orderId: string;
    oldStatus: string | null | undefined;
    newStatus: OrderStatus;
    changedBy: string;
    comment?: string | null;
  }
): Promise<string | null> {
  const oldNormalized = normalizeOrderStatus(params.oldStatus);
  const newNormalized = normalizeOrderStatus(params.newStatus);

  if (oldNormalized === newNormalized) {
    return null;
  }

  const trimmed = params.comment?.trim();
  const comment = trimmed ? trimmed : null;

  const { error } = await supabase.from("order_status_history").insert({
    order_id: params.orderId,
    old_status: oldNormalized,
    new_status: newNormalized,
    changed_by: params.changedBy,
    comment,
  });

  if (error) {
    console.error("recordOrderStatusHistory:", error);
    return error.message;
  }

  return null;
}
