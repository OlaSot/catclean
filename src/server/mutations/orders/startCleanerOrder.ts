import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchCleanerOwnedOrder,
  getNormalizedOrderStatus,
} from "@/server/mutations/orders/cleaner-order-access";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { getCleanerOrderById } from "@/server/queries/orders/getCleanerOrderById";

const START_ALLOWED = new Set(["confirmed", "cleaner_assigned"]);

export async function startCleanerOrder(
  supabase: SupabaseClient,
  orderId: string,
  cleanerId: string
): Promise<{
  order: CleanerOrderDetail | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const access = await fetchCleanerOwnedOrder(supabase, orderId, cleanerId);
  if (!access.ok) {
    return {
      order: null,
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const oldStatus = getNormalizedOrderStatus(access.order.status);

  if (!START_ALLOWED.has(oldStatus)) {
    return {
      order: null,
      error: `Cannot start cleaning from status "${oldStatus}"`,
      conflict: true,
    };
  }

  const newStatus = "in_progress" as const;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    console.error("startCleanerOrder update:", updateError);
    return { order: null, error: updateError.message };
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId,
    oldStatus: access.order.status,
    newStatus,
    changedBy: cleanerId,
    comment: "Cleaning started",
  });

  if (historyError) {
    await supabase
      .from("orders")
      .update({ status: access.order.status })
      .eq("id", orderId);
    return { order: null, error: historyError };
  }

  const result = await getCleanerOrderById(orderId, cleanerId);
  return {
    order: result.order,
    error: result.error,
    forbidden: result.forbidden,
    notFound: !result.order && !result.error && !result.forbidden,
  };
}
