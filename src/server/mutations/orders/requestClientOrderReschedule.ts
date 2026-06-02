import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";
import { fetchClientOwnedOrder } from "@/server/mutations/orders/client-order-access";
import { recordOrderClientRequest } from "@/server/mutations/orders/recordOrderClientRequest";

const RESCHEDULE_FORBIDDEN_STATUSES: OrderStatus[] = [
  "in_progress",
  "problem",
  "completed",
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
];

export async function requestClientOrderReschedule(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string,
  message: string
): Promise<{
  ok: boolean;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const access = await fetchClientOwnedOrder(supabase, orderId, clientId);
  if (!access.ok) {
    return {
      ok: false,
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const status = normalizeOrderStatus(access.order.status);

  if (RESCHEDULE_FORBIDDEN_STATUSES.includes(status)) {
    return {
      ok: false,
      error: "Reschedule is not available for this order status.",
      conflict: true,
    };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "Please describe your preferred new date or time." };
  }

  const historyError = await recordOrderClientRequest(supabase, {
    orderId,
    currentStatus: access.order.status,
    changedBy: clientId,
    prefix: "[Reschedule request]",
    message: trimmed,
  });

  if (historyError) {
    return { ok: false, error: historyError };
  }

  return { ok: true, error: null };
}
