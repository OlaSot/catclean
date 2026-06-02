import { NextResponse } from "next/server";
import { isOrderStatus } from "@/entities/order/order-status.utils";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { UpdateOrderStatusRequestBody } from "@/features/orders/types/update-order-status-api.types";
import { updateAdminOrderStatus } from "@/server/mutations/orders/updateAdminOrderStatus";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: UpdateOrderStatusRequestBody;
  try {
    body = (await request.json()) as UpdateOrderStatusRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!isOrderStatus(status)) {
    return NextResponse.json(
      { data: null, error: "Invalid status value" },
      { status: 400 }
    );
  }

  const comment =
    typeof body.comment === "string" ? body.comment : undefined;

  const { order, error } = await updateAdminOrderStatus(
    auth.supabase,
    id,
    { status, comment },
    auth.userId
  );

  if (error) {
    const isConflict = error === "Status is already set to this value";
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
