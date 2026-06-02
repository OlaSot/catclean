import { mapOrderToClientOrderDetail } from "@/entities/order/client-order.mapper";
import type { ClientOrderDetail } from "@/entities/order/client-order.types";
import { getComplaintReasonLabel } from "@/lib/constants/complaint";
import { mapOrderOperationalNotesPublic } from "@/entities/order/map-order-operational-notes";
import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { fetchOrderServiceDetails } from "@/server/queries/orders/fetch-order-service-detail";
import {
  canLeaveReviewForStatus,
  canOpenComplaintForStatus,
} from "@/lib/orders/reviews-complaints-rules";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { CLIENT_ORDER_SELECT } from "@/server/queries/orders/client-order-select";
import { getClientOrderPaymentsSummary } from "@/server/queries/finance/getClientOrderPaymentsSummary";

export async function getClientOrderById(
  orderId: string,
  clientId: string
): Promise<{
  order: ClientOrderDetail | null;
  error: string | null;
  forbidden: boolean;
}> {
  const id = orderId.trim();
  const client = clientId.trim();

  if (!id || !client) {
    return { order: null, error: "Invalid order id", forbidden: false };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("orders")
    .select(CLIENT_ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getClientOrderById:", error);
    return { order: null, error: error.message, forbidden: false };
  }

  if (!row) {
    return { order: null, error: null, forbidden: false };
  }

  const orderRow = row as unknown as SupabaseOrderRow;

  if (orderRow.client_id !== client) {
    return { order: null, error: "Forbidden", forbidden: true };
  }

  const [{ data: reviewRow }, { data: openComplaint }, serviceDetails] =
    await Promise.all([
      supabase.from("reviews").select("id").eq("order_id", id).maybeSingle(),
      supabase
        .from("complaints")
        .select("id, reason, description, created_at")
        .eq("order_id", id)
        .eq("status", "open")
        .maybeSingle(),
      fetchOrderServiceDetails(supabase, id, orderRow.service_type),
    ]);

  const payments = await getClientOrderPaymentsSummary(supabase, id, client);
  if (payments.error) {
    console.error("getClientOrderById payments:", payments.error);
  }

  const hasReview = Boolean(reviewRow?.id);
  const hasActiveComplaint = Boolean(openComplaint?.id);
  const isProblemStatus = normalizeOrderStatus(orderRow.status) === "problem";
  const base = mapOrderToClientOrderDetail(orderRow);

  const order: ClientOrderDetail = {
    ...base,
    serviceDetails,
    operationalNotes: mapOrderOperationalNotesPublic(orderRow),
    isProblemStatus,
    activeComplaint: openComplaint?.id
      ? {
          id: openComplaint.id as string,
          reason: openComplaint.reason as string,
          reasonLabel: getComplaintReasonLabel(openComplaint.reason as string),
          description: openComplaint.description as string,
          createdAt: openComplaint.created_at as string,
        }
      : null,
    hasReview,
    hasActiveComplaint,
    paidAmount: payments.netPaidAmount ?? 0,
    outstandingAmount: payments.outstandingAmount ?? 0,
    canLeaveReview:
      canLeaveReviewForStatus(orderRow.status) && !hasReview,
    canOpenComplaint:
      canOpenComplaintForStatus(orderRow.status) && !hasActiveComplaint,
  };

  return {
    order,
    error: null,
    forbidden: false,
  };
}
