import { mapOrderToCleanerOrderDetail } from "@/entities/order/cleaner-order.mapper";
import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";
import { mapOrderOperationalNotesPublic } from "@/entities/order/map-order-operational-notes";
import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { CLEANER_ORDER_DETAIL_SELECT } from "@/server/queries/orders/cleaner-order-select";
import { getCleanerOrderPayouts } from "@/server/queries/finance/getCleanerOrderPayouts";
import { fetchOrderServiceDetails } from "@/server/queries/orders/fetch-order-service-detail";

export async function getCleanerOrderById(
  orderId: string,
  cleanerId: string
): Promise<{
  order: CleanerOrderDetail | null;
  error: string | null;
  forbidden: boolean;
}> {
  const id = orderId.trim();
  const cleaner = cleanerId.trim();

  if (!id || !cleaner) {
    return { order: null, error: "Invalid order id", forbidden: false };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("orders")
    .select(CLEANER_ORDER_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCleanerOrderById:", error);
    return { order: null, error: error.message, forbidden: false };
  }

  if (!row) {
    return { order: null, error: null, forbidden: false };
  }

  const orderRow = row as unknown as SupabaseOrderRow;

  if (orderRow.assigned_cleaner_id !== cleaner) {
    return { order: null, error: "Forbidden", forbidden: true };
  }

  const [payouts, serviceDetails] = await Promise.all([
    getCleanerOrderPayouts(supabase, id, cleaner),
    fetchOrderServiceDetails(supabase, id, orderRow.service_type),
  ]);

  if (payouts.error) {
    // Non-blocking for order detail; show order even if payouts query fails.
    console.error("getCleanerOrderById payouts:", payouts.error);
  }

  return {
    order: {
      ...mapOrderToCleanerOrderDetail(orderRow, cleaner),
      serviceDetails,
      operationalNotes: mapOrderOperationalNotesPublic(orderRow),
      expectedPayout: payouts.expectedPayout ?? 0,
      payoutStatus: payouts.payoutStatus ?? null,
      payoutNote: payouts.payoutNote ?? null,
    } as CleanerOrderDetail,
    error: null,
    forbidden: false,
  };
}
