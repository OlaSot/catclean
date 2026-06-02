import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { getClientOrderById } from "@/server/queries/orders/getClientOrderById";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  const { order, error, forbidden } = await getClientOrderById(
    orderId,
    auth.userId
  );

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order, error: null }, { status: 200 });
}
