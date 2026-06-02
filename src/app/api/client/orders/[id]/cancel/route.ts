import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { cancelClientOrder } from "@/server/mutations/orders/cancelClientOrder";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
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

  const { result, error, notFound, forbidden, conflict } = await cancelClientOrder(
    auth.supabase,
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
    return NextResponse.json(
      { data: null, error: error ?? "Failed to cancel order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: result, error: null }, { status: 200 });
}
