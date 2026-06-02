import type { ClientOrderComplaintResult } from "@/entities/complaint/client-complaint.types";
import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { OrderStatus } from "@/entities/order/order.types";
import {
  getComplaintReasonLabel,
  isComplaintReason,
  type ComplaintReason,
} from "@/lib/constants/complaint";
import { canOpenComplaintForStatus } from "@/lib/orders/reviews-complaints-rules";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchClientOwnedOrder } from "@/server/mutations/orders/client-order-access";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { getClientOrderById } from "@/server/queries/orders/getClientOrderById";

const PROBLEM_STATUS: OrderStatus = "problem";

export async function createClientOrderComplaint(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string,
  reasonRaw: unknown,
  descriptionRaw: unknown
): Promise<{
  result: ClientOrderComplaintResult | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const reason =
    typeof reasonRaw === "string" ? reasonRaw.trim() : "";
  const description =
    typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";

  if (!isComplaintReason(reason)) {
    return { result: null, error: "Invalid complaint reason" };
  }

  if (!description) {
    return { result: null, error: "Description is required" };
  }

  const access = await fetchClientOwnedOrder(supabase, orderId, clientId);
  if (!access.ok) {
    return {
      result: null,
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const { data: existingOpen } = await supabase
    .from("complaints")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "open")
    .maybeSingle();

  if (existingOpen?.id) {
    return {
      result: null,
      error: "An open complaint already exists for this order",
      conflict: true,
    };
  }

  if (!canOpenComplaintForStatus(access.order.status)) {
    return {
      result: null,
      error:
        "Complaints are only allowed while cleaning is in progress, after completion, or when a problem is already reported",
      conflict: true,
    };
  }

  const oldStatus = normalizeOrderStatus(access.order.status);
  const reasonLabel = getComplaintReasonLabel(reason as ComplaintReason);
  const historyComment = `Complaint created: ${reasonLabel}`;

  const { data: inserted, error: insertError } = await supabase
    .from("complaints")
    .insert({
      order_id: orderId,
      client_id: clientId,
      status: "open",
      reason,
      description,
    })
    .select("id, reason, description, status, created_at")
    .single();

  if (insertError || !inserted) {
    console.error("createClientOrderComplaint:", insertError);
    const isDuplicate = insertError?.code === "23505";
    return {
      result: null,
      error: isDuplicate
        ? "An open complaint already exists for this order"
        : insertError?.message ?? "Failed to save complaint",
      conflict: isDuplicate,
    };
  }

  if (oldStatus !== PROBLEM_STATUS) {
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: PROBLEM_STATUS })
      .eq("id", orderId);

    if (updateError) {
      console.error("createClientOrderComplaint status update:", updateError);
      await supabase.from("complaints").delete().eq("id", inserted.id);
      return { result: null, error: updateError.message };
    }

    const historyError = await recordOrderStatusHistory(supabase, {
      orderId,
      oldStatus,
      newStatus: PROBLEM_STATUS,
      changedBy: clientId,
      comment: historyComment,
    });

    if (historyError) {
      await supabase.from("orders").update({ status: oldStatus }).eq("id", orderId);
      await supabase.from("complaints").delete().eq("id", inserted.id);
      return { result: null, error: historyError };
    }
  }

  const reload = await getClientOrderById(orderId, clientId);

  if (reload.forbidden || reload.error || !reload.order) {
    return {
      result: null,
      error: reload.error ?? "Failed to reload order",
    };
  }

  const complaintReason = inserted.reason as ComplaintReason;

  return {
    result: {
      complaint: {
        id: inserted.id as string,
        reason: complaintReason,
        reasonLabel: getComplaintReasonLabel(complaintReason),
        description: inserted.description as string,
        status: inserted.status as string,
        createdAt: inserted.created_at as string,
      },
      order: reload.order,
    },
    error: null,
  };
}
