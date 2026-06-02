import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { unassignAdminOrderCleaner } from "@/server/mutations/orders/unassignAdminOrderCleaner";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  const { order, error } = await unassignAdminOrderCleaner(
    auth.supabase,
    id,
    auth.userId
  );

  if (error) {
    const isConflict =
      error === "Cannot unassign a cleaner for the current order status";
    return NextResponse.json(
      { data: null, error },
      { status: isConflict ? 409 : 500 }
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

