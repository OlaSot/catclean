import type { SupabaseClient } from "@supabase/supabase-js";

/** Undo a public booking that lost the last-slot race after insert. */
export async function rollbackPublicBookingOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ error: string | null }> {
  const id = orderId.trim();
  if (!id) return { error: "Order id is required" };

  const { data: row, error: fetchError } = await supabase
    .from("orders")
    .select("id, address_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }
  if (!row?.id) {
    return { error: null };
  }

  const addressId =
    typeof row.address_id === "string" && row.address_id.trim()
      ? row.address_id.trim()
      : null;

  const { error: deleteOrderError } = await supabase.from("orders").delete().eq("id", id);
  if (deleteOrderError) {
    return { error: deleteOrderError.message };
  }

  if (addressId) {
    const { error: deleteAddressError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);
    if (deleteAddressError) {
      console.error("rollbackPublicBookingOrder address:", deleteAddressError.message);
    }
  }

  return { error: null };
}
