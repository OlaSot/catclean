import type { ClientOrderCancelResult } from "@/entities/order/client-order.types";
import {
  evaluateClientCancellation,
  policyLabel,
} from "@/lib/orders/client-cancellation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchClientOwnedOrder } from "@/server/mutations/orders/client-order-access";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { getClientOrderById } from "@/server/queries/orders/getClientOrderById";

const CANCELLED_BY_CLIENT = "cancelled_by_client" as const;

export async function cancelClientOrder(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string
): Promise<{
  result: ClientOrderCancelResult | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const access = await fetchClientOwnedOrder(supabase, orderId, clientId);
  if (!access.ok) {
    return {
      result: null,
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const evaluation = evaluateClientCancellation({
    status: access.order.status,
    scheduledDate: access.order.scheduled_date,
    scheduledTime: access.order.scheduled_time,
    estimatedPrice: access.order.estimated_price,
  });

  if (!evaluation.allowed) {
    return {
      result: null,
      error: evaluation.message,
      conflict: true,
    };
  }

  const oldStatus = access.order.status;
  const newStatus = CANCELLED_BY_CLIENT;

  const historyComment = [
    `Client cancellation (${evaluation.policy})`,
    evaluation.feePercent > 0
      ? `Fee: ${evaluation.feePercent}% (${evaluation.feeAmount} EUR)`
      : "No cancellation fee",
  ].join(". ");

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    console.error("cancelClientOrder update:", updateError);
    return { result: null, error: updateError.message };
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId,
    oldStatus,
    newStatus,
    changedBy: clientId,
    comment: historyComment,
  });

  if (historyError) {
    await supabase
      .from("orders")
      .update({ status: oldStatus })
      .eq("id", orderId);
    return { result: null, error: historyError };
  }

  const loaded = await getClientOrderById(orderId, clientId);
  if (!loaded.order) {
    return {
      result: null,
      error: loaded.error ?? "Order not found after cancellation",
      forbidden: loaded.forbidden,
    };
  }

  return {
    result: {
      order: loaded.order,
      cancellation: {
        policy: evaluation.policy,
        feePercent: evaluation.feePercent,
        feeAmount: evaluation.feeAmount,
        policyLabel: policyLabel(evaluation.policy),
        message: evaluation.message,
      },
    },
    error: null,
  };
}
