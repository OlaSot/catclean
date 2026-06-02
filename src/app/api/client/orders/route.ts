import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { getClientOrders } from "@/server/queries/orders/getClientOrders";

export async function GET() {
  const auth = await requireClientApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { orders, error } = await getClientOrders(auth.userId);

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: orders, error: null }, { status: 200 });
}
