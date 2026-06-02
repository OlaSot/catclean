import {
  mapOrderStatusHistoryRows,
  type SupabaseOrderStatusHistoryRow,
} from "@/entities/order/map-order-status-history";
import type { OrderStatusHistoryItem } from "@/entities/order/order-status-history.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchOrderStatusHistory(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ items: OrderStatusHistoryItem[]; error: string | null }> {
  const id = orderId.trim();
  if (!id) {
    return { items: [], error: "Invalid order id" };
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("order_status_history")
    .select("id, old_status, new_status, changed_by, comment, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (historyError) {
    console.error("fetchOrderStatusHistory:", historyError);
    return { items: [], error: historyError.message };
  }

  const rows = (historyRows ?? []) as SupabaseOrderStatusHistoryRow[];
  if (rows.length === 0) {
    return { items: [], error: null };
  }

  const profileIds = [
    ...new Set(
      rows
        .map((row) => row.changed_by)
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const profileMap = new Map<
    string,
    { id: string; email: string | null; full_name: string | null; role: string | null }
  >();

  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .in("id", profileIds);

    if (profilesError) {
      console.error("fetchOrderStatusHistory profiles:", profilesError);
    } else {
      for (const profile of profiles ?? []) {
        profileMap.set(profile.id, profile);
      }
    }
  }

  return {
    items: mapOrderStatusHistoryRows(rows, profileMap),
    error: null,
  };
}
