import type { SupabaseClient } from "@supabase/supabase-js";

type ClientOrderRow = {
  id: string | number;
  client_id: string | null;
  assigned_cleaner_id: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_price: number | null;
};

export async function fetchClientOwnedOrder(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string
): Promise<
  | { ok: true; order: ClientOrderRow }
  | { ok: false; error: string; notFound?: boolean; forbidden?: boolean }
> {
  const id = orderId.trim();
  const client = clientId.trim();

  if (!id) {
    return { ok: false, error: "Invalid order id" };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, client_id, assigned_cleaner_id, status, scheduled_date, scheduled_time, estimated_price"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchClientOwnedOrder:", error);
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Order not found", notFound: true };
  }

  const order = data as ClientOrderRow;

  if (order.client_id !== client) {
    return { ok: false, error: "Forbidden", forbidden: true };
  }

  return { ok: true, order };
}
