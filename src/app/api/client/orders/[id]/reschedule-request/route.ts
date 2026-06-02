import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import type { ClientRescheduleRequestBody } from "@/features/orders/types/client-orders-api.types";
import { requestClientOrderReschedule } from "@/server/mutations/orders/requestClientOrderReschedule";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { createStaffNotifications } from "@/server/services/notifications/createNotification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  let body: ClientRescheduleRequestBody = {};
  try {
    body = (await request.json()) as ClientRescheduleRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const message = typeof body.message === "string" ? body.message : "";

  const { ok, error, notFound, forbidden, conflict } =
    await requestClientOrderReschedule(
      auth.supabase,
      orderId,
      auth.userId,
      message
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
      { data: null, error: error ?? "Reschedule not allowed" },
      { status: 409 }
    );
  }

  if (!ok || error) {
    return NextResponse.json(
      { data: null, error: error ?? "Failed to submit reschedule request" },
      { status: 400 }
    );
  }

  try {
    await createStaffNotifications({
      type: "reschedule_requested",
      title: "Reschedule requested",
      message: `Reschedule requested for order #${formatOrderDisplayId(orderId)}.`,
      orderId,
      roleTarget: "admin",
    });
  } catch (e) {
    console.error("[api/client/orders/reschedule-request] notification error", e);
  }

  return NextResponse.json({ data: { ok: true }, error: null }, { status: 200 });
}
