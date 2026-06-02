import { mapRawDetailRowToServiceDetails } from "@/entities/order/map-order-service-details";
import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import { resolveDetailTableName } from "@/entities/order/map-order-service-details";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchOrderServiceDetails(
  supabase: SupabaseClient,
  orderId: string,
  serviceType: string | null | undefined
): Promise<AdminOrderServiceDetails | null> {
  const id = orderId.trim();
  const table = resolveDetailTableName(serviceType);

  if (!id || !table) {
    return null;
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("order_id", id)
    .maybeSingle();

  if (error) {
    console.error(`fetchOrderServiceDetails ${table}:`, error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapRawDetailRowToServiceDetails(
    serviceType,
    data as Record<string, unknown>
  );
}
