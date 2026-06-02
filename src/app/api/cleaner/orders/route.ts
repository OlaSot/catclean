import { devLog } from "@/lib/dev-log";
import { NextResponse } from "next/server";
import { requireCleanerApiAuth } from "@/lib/api/cleaner-api-auth";
import { getCleanerOrders } from "@/server/queries/orders/getCleanerOrders";

export async function GET() {
  const auth = await requireCleanerApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { orders, error } = await getCleanerOrders(auth.userId);

  devLog("[api/cleaner/orders]", {
    currentUserId: auth.userId,
    ordersCount: orders.length,
    error,
    filter: "orders.assigned_cleaner_id = profiles.id",
  });

  if (error) {
    return NextResponse.json(
      { data: null, error },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: orders, error: null }, { status: 200 });
}
