import { mapOrderToClientOrder } from "@/entities/order/client-order.mapper";
import type { ClientOrder } from "@/entities/order/client-order.types";
import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { CLIENT_ORDER_SELECT } from "@/server/queries/orders/client-order-select";

export async function getClientOrders(clientId: string): Promise<{
  orders: ClientOrder[];
  error: string | null;
}> {
  const id = clientId.trim();
  if (!id) {
    return { orders: [], error: "Invalid client id" };
  }

  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("orders")
    .select(CLIENT_ORDER_SELECT)
    .eq("client_id", id)
    .order("scheduled_date", { ascending: false, nullsFirst: false })
    .order("scheduled_time", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("getClientOrders:", error);
    return { orders: [], error: error.message };
  }

  const orders = ((rows ?? []) as unknown as SupabaseOrderRow[]).map(
    mapOrderToClientOrder
  );

  return { orders, error: null };
}
