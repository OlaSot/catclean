import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import {
  isOrderStatus,
  normalizeOrderStatus,
} from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";

export type UpdateAdminOrderStatusInput = {
  status: OrderStatus;
  comment?: string | null;
};

function trimComment(comment: string | null | undefined): string | null {
  const trimmed = comment?.trim();
  return trimmed ? trimmed : null;
}

export async function updateAdminOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  input: UpdateAdminOrderStatusInput,
  changedBy: string
): Promise<{ order: AdminOrderDetail | null; error: string | null }> {
  const id = orderId.trim();
  if (!id) {
    return { order: null, error: "Invalid order id" };
  }

  if (!isOrderStatus(input.status)) {
    return { order: null, error: "Invalid status" };
  }

  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("updateAdminOrderStatus fetch:", fetchError);
    return { order: null, error: fetchError.message };
  }

  if (!current) {
    return { order: null, error: null };
  }

  const oldStatus = normalizeOrderStatus(
    (current as { status: string | null }).status
  );
  const newStatus = input.status;
  const comment = trimComment(input.comment);

  if (oldStatus === newStatus) {
    return { order: null, error: "Status is already set to this value" };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id);

  if (updateError) {
    console.error("updateAdminOrderStatus update:", updateError);
    return { order: null, error: updateError.message };
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId: id,
    oldStatus,
    newStatus,
    changedBy,
    comment,
  });

  if (historyError) {
    await supabase
      .from("orders")
      .update({ status: oldStatus })
      .eq("id", id);
    return { order: null, error: historyError };
  }

  return getAdminOrderById(id);
}
