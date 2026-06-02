import { mapOrderToCleanerOrder } from "@/entities/order/cleaner-order.mapper";
import { devLog } from "@/lib/dev-log";
import type { CleanerOrder } from "@/entities/order/cleaner-order.types";
import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { CLEANER_ORDER_SELECT } from "@/server/queries/orders/cleaner-order-select";

export async function getCleanerOrders(cleanerId: string): Promise<{
  orders: CleanerOrder[];
  error: string | null;
}> {
  const id = cleanerId.trim();
  if (!id) {
    return { orders: [], error: "Invalid cleaner id" };
  }

  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("orders")
    .select(CLEANER_ORDER_SELECT)
    .eq("assigned_cleaner_id", id)
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("scheduled_time", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getCleanerOrders:", error);
    return { orders: [], error: error.message };
  }

  const orderRows = (rows ?? []) as unknown as SupabaseOrderRow[];

  const orders = orderRows.map((row) => mapOrderToCleanerOrder(row, id));

  if (orderRows.length > 0) {
    devLog("[getCleanerOrders] sample assigned_cleaner_id", {
      cleanerId: id,
      sample: orderRows.slice(0, 3).map((row) => ({
        orderId: row.id,
        assigned_cleaner_id: row.assigned_cleaner_id,
      })),
    });
  }

  return { orders, error: null };
}
