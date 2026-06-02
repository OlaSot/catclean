import { NextResponse } from "next/server";
import { requireCleanerApiAuth } from "@/lib/api/cleaner-api-auth";
import { getCleanerOrderById } from "@/server/queries/orders/getCleanerOrderById";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCleanerApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const { order, error, forbidden } = await getCleanerOrderById(
    id,
    auth.userId
  );

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (error) {
    return NextResponse.json(
      { data: null, error },
      { status: 500 }
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
