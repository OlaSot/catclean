import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import { devLog } from "@/lib/dev-log";
import { ORDER_STATUS_CLEANER_ASSIGNED } from "@/lib/constants/order-status";
import { resolveCleanerProfileId } from "@/lib/cleaners/resolve-cleaner-profile-id";
import { canAssignCleanerToOrder } from "@/lib/orders/can-assign-cleaner";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";

const ASSIGNMENT_STATUS_ACCEPTED = "accepted";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function validateActiveCleaner(
  supabase: SupabaseClient,
  cleanerId: string
): Promise<
  | { ok: true; profileId: string; resolvedFrom: string }
  | { ok: false; error: string }
> {
  const resolved = await resolveCleanerProfileId(supabase, cleanerId);
  if ("error" in resolved) {
    return { ok: false, error: resolved.error };
  }

  const { data: cleanerProfile, error } = await supabase
    .from("cleaner_profiles")
    .select("status")
    .eq("profile_id", resolved.profileId)
    .maybeSingle();

  if (error) {
    console.error("validateActiveCleaner cleaner_profiles:", error);
    return { ok: false, error: error.message };
  }

  if (!cleanerProfile) {
    return { ok: false, error: "Cleaner profile not found" };
  }

  if ((cleanerProfile.status ?? "").toLowerCase() !== "active") {
    return { ok: false, error: "Cleaner is not active" };
  }

  return {
    ok: true,
    profileId: resolved.profileId,
    resolvedFrom: resolved.resolvedFrom,
  };
}

export async function assignAdminOrderCleaner(
  supabase: SupabaseClient,
  orderId: string,
  cleanerId: string,
  changedBy: string
): Promise<{ order: AdminOrderDetail | null; error: string | null }> {
  const id = orderId.trim();
  const cleaner = cleanerId.trim();

  if (!id) {
    return { order: null, error: "Invalid order id" };
  }

  if (!cleaner || !isValidUuid(cleaner)) {
    return { order: null, error: "Invalid cleaner id" };
  }

  const validation = await validateActiveCleaner(supabase, cleaner);
  if (!validation.ok) {
    return { order: null, error: validation.error };
  }

  const profileId = validation.profileId;
  devLog("[assignAdminOrderCleaner] resolved cleaner", {
    inputCleanerId: cleaner,
    profilesId: profileId,
    resolvedFrom: validation.resolvedFrom,
  });

  // Assignment is gated by orders.status only — payment_status is never read.
  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, assigned_cleaner_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("assignAdminOrderCleaner fetch order:", fetchError);
    return { order: null, error: fetchError.message };
  }

  if (!currentOrder) {
    return { order: null, error: null };
  }

  const oldStatus = (currentOrder as { status: string | null }).status;

  if (!canAssignCleanerToOrder(oldStatus)) {
    return {
      order: null,
      error: "Cannot assign a cleaner for the current order status",
    };
  }

  const newStatus = ORDER_STATUS_CLEANER_ASSIGNED;

  const { data: existingAssignment, error: assignmentFetchError } =
    await supabase
      .from("order_assignments")
      .select("id")
      .eq("order_id", id)
      .maybeSingle();

  if (assignmentFetchError) {
    console.error(
      "assignAdminOrderCleaner fetch assignment:",
      assignmentFetchError
    );
    return { order: null, error: assignmentFetchError.message };
  }

  if (existingAssignment?.id) {
    const { error: assignmentUpdateError } = await supabase
      .from("order_assignments")
      .update({
        cleaner_id: profileId,
        status: ASSIGNMENT_STATUS_ACCEPTED,
      })
      .eq("id", existingAssignment.id);

    if (assignmentUpdateError) {
      console.error(
        "assignAdminOrderCleaner update assignment:",
        assignmentUpdateError
      );
      return { order: null, error: assignmentUpdateError.message };
    }
  } else {
    const { error: assignmentInsertError } = await supabase
      .from("order_assignments")
      .insert({
        order_id: id,
        cleaner_id: profileId,
        status: ASSIGNMENT_STATUS_ACCEPTED,
      });

    if (assignmentInsertError) {
      console.error(
        "assignAdminOrderCleaner insert assignment:",
        assignmentInsertError
      );
      return { order: null, error: assignmentInsertError.message };
    }
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      assigned_cleaner_id: profileId,
      status: newStatus,
    })
    .eq("id", id);

  if (orderUpdateError) {
    console.error("assignAdminOrderCleaner update order:", orderUpdateError);
    return { order: null, error: orderUpdateError.message };
  }

  const historyError = await recordOrderStatusHistory(supabase, {
    orderId: id,
    oldStatus,
    newStatus,
    changedBy,
    comment: "Cleaner assigned",
  });

  if (historyError) {
    await supabase
      .from("orders")
      .update({
        assigned_cleaner_id: (currentOrder as { assigned_cleaner_id: string | null })
          .assigned_cleaner_id,
        status: oldStatus,
      })
      .eq("id", id);
    return { order: null, error: historyError };
  }

  return getAdminOrderById(id);
}
