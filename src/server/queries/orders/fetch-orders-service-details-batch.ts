import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import {
  mapRawDetailRowToServiceDetails,
  resolveDetailTableName,
} from "@/entities/order/map-order-service-details";
import type { SupabaseClient } from "@supabase/supabase-js";

type OrderRef = { id: string; service_type: string | null };

export async function fetchOrdersServiceDetailsBatch(
  supabase: SupabaseClient,
  orders: OrderRef[]
): Promise<Map<string, AdminOrderServiceDetails>> {
  const result = new Map<string, AdminOrderServiceDetails>();
  const byTable = new Map<string, { orderId: string; serviceType: string }[]>();

  for (const order of orders) {
    const table = resolveDetailTableName(order.service_type);
    if (!table) continue;
    const orderId = String(order.id);
    const list = byTable.get(table) ?? [];
    list.push({ orderId, serviceType: order.service_type ?? "" });
    byTable.set(table, list);
  }

  for (const [table, items] of byTable) {
    const orderIds = items.map((item) => item.orderId);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .in("order_id", orderIds);

    if (error) {
      console.error(`fetchOrdersServiceDetailsBatch ${table}:`, error);
      continue;
    }

    for (const row of data ?? []) {
      const record = row as Record<string, unknown> & { order_id: string };
      const orderId = String(record.order_id);
      const item = items.find((entry) => entry.orderId === orderId);
      if (!item) continue;

      const details = mapRawDetailRowToServiceDetails(
        item.serviceType,
        record
      );
      if (details) result.set(orderId, details);
    }
  }

  return result;
}
