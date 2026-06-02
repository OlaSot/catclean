import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Records an internal client request in order_status_history without changing order status.
 * Used for reschedule requests (ORDER_RULES.md §4).
 */
export async function recordOrderClientRequest(
  supabase: SupabaseClient,
  params: {
    orderId: string;
    currentStatus: string | null | undefined;
    changedBy: string;
    prefix: string;
    message: string;
  }
): Promise<string | null> {
  const status = normalizeOrderStatus(params.currentStatus);
  const body = params.message.trim();
  if (!body) {
    return "Message is required";
  }

  const comment = `${params.prefix} ${body}`.trim();

  const { error } = await supabase.from("order_status_history").insert({
    order_id: params.orderId,
    old_status: status,
    new_status: status,
    changed_by: params.changedBy,
    comment,
  });

  if (error) {
    console.error("recordOrderClientRequest:", error);
    return error.message;
  }

  return null;
}
