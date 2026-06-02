import { mapOrderToCard } from "@/entities/order/order.mapper";
import type {
  ClientOrderStats,
  SupabaseOrderRow,
} from "@/entities/order/order.supabase.types";
import type { Order } from "@/entities/order/order.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import {
  applyAdminOrdersRowFilters,
  type AdminOrdersFilters,
} from "@/server/queries/orders/admin-orders-filters";
import { fetchOrdersServiceDetailsBatch } from "@/server/queries/orders/fetch-orders-service-details-batch";
import { buildClientOrderStats } from "@/server/queries/orders/order-client-stats";
import { ADMIN_ORDER_SELECT } from "@/server/queries/orders/order-select";

export async function getAdminOrders(
  filters: AdminOrdersFilters = {}
): Promise<{
  orders: Order[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("orders").select(ADMIN_ORDER_SELECT);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.payment_status) {
    query = query.eq("payment_status", filters.payment_status);
  }

  if (filters.service_type) {
    query = query.eq("service_type", filters.service_type);
  }

  if (filters.assigned === "assigned") {
    query = query.not("assigned_cleaner_id", "is", null);
  } else if (filters.assigned === "unassigned") {
    query = query.is("assigned_cleaner_id", null);
  }

  if (filters.cleaner_id) {
    query = query.eq("assigned_cleaner_id", filters.cleaner_id);
  }

  if (filters.date_from) {
    query = query.gte("scheduled_date", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("scheduled_date", filters.date_to);
  }

  const { data: rows, error } = await query
    .order("scheduled_date", { ascending: false, nullsFirst: false })
    .order("scheduled_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminOrders:", error);
    return { orders: [], error: error.message };
  }

  const orderRows = applyAdminOrdersRowFilters(
    (rows ?? []) as unknown as SupabaseOrderRow[],
    filters
  );

  const clientIds = [
    ...new Set(
      orderRows
        .map((row) => row.client_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  let clientStatsMap = new Map<string, ClientOrderStats>();

  if (clientIds.length > 0) {
    const { data: statsRows, error: statsError } = await supabase
      .from("orders")
      .select("client_id, scheduled_date")
      .in("client_id", clientIds);

    if (statsError) {
      console.error("getAdminOrders client stats:", statsError);
    } else {
      clientStatsMap = buildClientOrderStats(statsRows ?? []);
    }
  }

  const serviceDetailsMap = await fetchOrdersServiceDetailsBatch(
    supabase,
    orderRows.map((row) => ({
      id: String(row.id),
      service_type: row.service_type,
    }))
  );

  const orderIds = orderRows.map((row) => String(row.id));
  const activeTokenOrderIds = new Set<string>();
  if (orderIds.length > 0) {
    const { data: tokenRows, error: tokenError } = await supabase
      .from("order_confirmation_tokens")
      .select("order_id")
      .in("order_id", orderIds)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString());

    if (tokenError) {
      console.error("getAdminOrders confirmation tokens:", tokenError);
    } else {
      for (const row of tokenRows ?? []) {
        const id = (row as { order_id?: string | null }).order_id;
        if (id) activeTokenOrderIds.add(String(id));
      }
    }
  }

  const orders = orderRows.map((row) =>
    mapOrderToCard(
      row,
      row.client_id ? clientStatsMap.get(row.client_id) : undefined,
      serviceDetailsMap.get(String(row.id)) ?? null,
      { hasActiveConfirmationToken: activeTokenOrderIds.has(String(row.id)) }
    )
  );

  return { orders, error: null };
}

/** @deprecated Use getAdminOrders */
export const fetchAdminOrders = getAdminOrders;
