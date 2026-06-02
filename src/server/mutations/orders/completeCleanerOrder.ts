import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchCleanerOwnedOrder,
  getNormalizedOrderStatus,
} from "@/server/mutations/orders/cleaner-order-access";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { getCleanerOrderById } from "@/server/queries/orders/getCleanerOrderById";

const ASSIGNMENT_STATUS_COMPLETED = "completed";
const ORDER_STATUS_COMPLETED = "completed";

export async function completeCleanerOrder(
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

  if (oldStatus !== "in_progress") {
    return {
      order: null,
      error: `Cannot complete cleaning from status "${oldStatus}"`,
      conflict: true,
    };
  }

  const completedAt = new Date().toISOString();

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({ status: ORDER_STATUS_COMPLETED })
    .eq("id", orderId);

  if (orderUpdateError) {
    console.error("completeCleanerOrder order update:", orderUpdateError);
    return { order: null, error: orderUpdateError.message };
  }

  const { data: assignment, error: assignmentFetchError } = await supabase
    .from("order_assignments")
    .select("id")
    .eq("order_id", orderId)
    .eq("cleaner_id", cleanerId)
    .maybeSingle();

  if (assignmentFetchError) {
    console.error("completeCleanerOrder assignment fetch:", assignmentFetchError);
    await supabase
      .from("orders")
      .update({ status: access.order.status })
      .eq("id", orderId);
    return { order: null, error: assignmentFetchError.message };
  }

  if (assignment?.id) {
    const { error: assignmentUpdateError } = await supabase
      .from("order_assignments")
      .update({
        status: ASSIGNMENT_STATUS_COMPLETED,
        completed_at: completedAt,
      })
      .eq("id", assignment.id);

    if (assignmentUpdateError) {
      console.error(
        "completeCleanerOrder assignment update:",
        assignmentUpdateError
      );
      await supabase
        .from("orders")
        .update({ status: access.order.status })
        .eq("id", orderId);
      return { order: null, error: assignmentUpdateError.message };
    }
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId,
    oldStatus: access.order.status,
    newStatus: ORDER_STATUS_COMPLETED,
    changedBy: cleanerId,
    comment: "Cleaning completed",
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
