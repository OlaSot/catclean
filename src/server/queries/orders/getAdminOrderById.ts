import { mapOrderToAdminDetail } from "@/entities/order/admin-order-detail.mapper";
import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { fetchOrderServiceDetails } from "@/server/queries/orders/fetch-order-service-detail";
import { fetchOrderStatusHistory } from "@/server/queries/orders/fetch-order-status-history";
import { buildClientOrderStats } from "@/server/queries/orders/order-client-stats";
import { ADMIN_ORDER_SELECT } from "@/server/queries/orders/order-select";

export async function getAdminOrderById(orderId: string): Promise<{
  order: AdminOrderDetail | null;
  error: string | null;
}> {
  const id = orderId.trim();
  if (!id) {
    return { order: null, error: "Invalid order id" };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("orders")
    .select(ADMIN_ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getAdminOrderById:", error);
    return { order: null, error: error.message };
  }

  if (!row) {
    return { order: null, error: null };
  }

  const orderRow = row as unknown as SupabaseOrderRow;
  let clientStats;

  if (orderRow.client_id) {
    const { data: statsRows, error: statsError } = await supabase
      .from("orders")
      .select("client_id, scheduled_date")
      .eq("client_id", orderRow.client_id);

    if (statsError) {
      console.error("getAdminOrderById client stats:", statsError);
    } else {
      clientStats = buildClientOrderStats(statsRows ?? []).get(
        orderRow.client_id
      );
    }
  }

  const [serviceDetails, statusHistoryResult] = await Promise.all([
    fetchOrderServiceDetails(supabase, id, orderRow.service_type),
    fetchOrderStatusHistory(supabase, id),
  ]);

  if (statusHistoryResult.error) {
    return { order: null, error: statusHistoryResult.error };
  }

  return {
    order: mapOrderToAdminDetail(
      orderRow,
      clientStats,
      serviceDetails,
      statusHistoryResult.items
    ),
    error: null,
  };
}
