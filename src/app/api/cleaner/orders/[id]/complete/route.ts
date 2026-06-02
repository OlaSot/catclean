import { NextResponse } from "next/server";
import { requireCleanerApiAuth } from "@/lib/api/cleaner-api-auth";
import { completeCleanerOrder } from "@/server/mutations/orders/completeCleanerOrder";
import { createStaffNotifications } from "@/server/services/notifications/createNotification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireCleanerApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const result = await completeCleanerOrder(auth.supabase, id, auth.userId);

  if (result.forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (result.notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (result.conflict) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 409 }
    );
  }

  if (result.error) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 }
    );
  }

  if (!result.order) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  try {
    await createStaffNotifications({
      type: "order_completed",
      title: "Order completed",
      message: `Order #${result.order.id} has been completed.`,
      orderId: id,
      roleTarget: "admin",
    });
  } catch (e) {
    console.error("[api/cleaner/orders/complete] notification error", e);
  }

  return NextResponse.json({ data: result.order, error: null }, { status: 200 });
}
