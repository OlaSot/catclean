import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import type { ClientComplaintRequestBody } from "@/features/orders/types/client-review-complaint-api.types";
import { createClientOrderComplaint } from "@/server/mutations/complaints/createClientOrderComplaint";
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

  let body: ClientComplaintRequestBody = {};
  try {
    body = (await request.json()) as ClientComplaintRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { result, error, notFound, forbidden, conflict } =
    await createClientOrderComplaint(
      auth.supabase,
      orderId,
      auth.userId,
      body.reason,
      body.description
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
      { data: null, error: error ?? "Complaint not allowed" },
      { status: 409 }
    );
  }

  if (error || !result) {
    return NextResponse.json(
      { data: null, error: error ?? "Failed to save complaint" },
      { status: 400 }
    );
  }

  try {
    await createStaffNotifications({
      type: "complaint_created",
      title: "New complaint",
      message: `A new complaint was created for order #${result.order.id}.`,
      orderId,
      roleTarget: "admin",
    });
  } catch (e) {
    console.error("[api/client/orders/complaint] notification error", e);
  }

  return NextResponse.json({ data: result, error: null }, { status: 201 });
}
