import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCleanerOrderById } from "@/server/queries/orders/getCleanerOrderById";
import { transitionCleanerOrderStatus } from "@/server/mutations/orders/transitionCleanerOrderStatus";

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
  const transition = await transitionCleanerOrderStatus(
    supabase,
    orderId,
    "in_progress"
  );
  if (!transition.ok) {
    return {
      order: null,
      error: transition.error,
      notFound: transition.notFound,
      forbidden: transition.forbidden,
      conflict: transition.conflict,
    };
  }

  const result = await getCleanerOrderById(orderId, cleanerId);
  return {
    order: result.order,
    error: result.error,
    forbidden: result.forbidden,
    notFound: !result.order && !result.error && !result.forbidden,
  };
}
