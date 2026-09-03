import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { cancelClientOrder } from "@/server/mutations/orders/cancelClientOrder";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { createStaffNotifications } from "@/server/services/notifications/createNotification";
import { sendOrderCancelledTelegramNotification } from "@/lib/telegram/send-order-event-notification";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireClientApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const orderId = id?.trim();

  if (!orderId) {
    return NextResponse.json(
      { data: null, error: "Order id is required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json(
      { data: null, error: "Cancellation is temporarily unavailable" },
      { status: 503 }
    );
  }

  const { result, error, notFound, forbidden, conflict } = await cancelClientOrder(
    admin.supabase,
    orderId,
    auth.userId
  );

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (conflict) {
    return NextResponse.json(
      { data: null, error: error ?? "Cancellation not allowed" },
      { status: 409 }
    );
  }

  if (error || !result) {
    console.error("PATCH /api/client/orders/[id]/cancel:", error);
    return NextResponse.json(
      { data: null, error: "Failed to cancel order. Please try again." },
      { status: 500 }
    );
  }

  await createStaffNotifications({
    roleTarget: "admin",
    type: "order_cancelled_by_client",
    title: "Booking cancelled by client",
    message: `Cancellation policy: ${result.cancellation.policyLabel}`,
    orderId,
  });

  await sendOrderCancelledTelegramNotification({
    orderNumber: formatOrderDisplayId(orderId),
    policyLabel: result.cancellation.policyLabel,
    feeAmount: result.cancellation.feeAmount,
    currency: result.order.currency,
    adminUrl: `${new URL(request.url).origin}/app/admin/orders/${orderId}`,
  });

  return NextResponse.json({ data: result, error: null }, { status: 200 });
}
