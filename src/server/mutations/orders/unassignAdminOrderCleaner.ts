import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import { canAssignCleanerToOrder } from "@/lib/orders/can-assign-cleaner";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";

export async function unassignAdminOrderCleaner(
  supabase: SupabaseClient,
  orderId: string,
  changedBy: string
): Promise<{ order: AdminOrderDetail | null; error: string | null }> {
  const id = orderId.trim();
  if (!id) return { order: null, error: "Invalid order id" };

  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, assigned_cleaner_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("unassignAdminOrderCleaner fetch:", fetchError);
    return { order: null, error: fetchError.message };
  }

  if (!currentOrder) {
    return { order: null, error: null };
  }

  const oldStatus = (currentOrder as { status: string | null }).status;

  if (!canAssignCleanerToOrder(oldStatus)) {
    return {
      order: null,
      error: "Cannot unassign a cleaner for the current order status",
    };
  }

  // If already unassigned, return current admin detail.
  const assignedId = (currentOrder as { assigned_cleaner_id: string | null })
    .assigned_cleaner_id;
  if (!assignedId) {
    return getAdminOrderById(id);
  }

  const newStatus = "searching_cleaner" as const;

  // Remove assignment rows (single assignment model).
  const { error: deleteAssignmentError } = await supabase
    .from("order_assignments")
    .delete()
    .eq("order_id", id);

  if (deleteAssignmentError) {
    console.error("unassignAdminOrderCleaner delete assignments:", deleteAssignmentError);
    return { order: null, error: deleteAssignmentError.message };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      assigned_cleaner_id: null,
      status: newStatus,
    })
    .eq("id", id);

  if (updateError) {
    console.error("unassignAdminOrderCleaner update order:", updateError);
    return { order: null, error: updateError.message };
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId: id,
    oldStatus,
    newStatus,
    changedBy,
    comment: "Cleaner unassigned",
  });

  if (historyError) {
    // Best-effort rollback
    await supabase
      .from("orders")
      .update({ assigned_cleaner_id: assignedId, status: oldStatus })
      .eq("id", id);
    return { order: null, error: historyError };
  }

  return getAdminOrderById(id);
}

