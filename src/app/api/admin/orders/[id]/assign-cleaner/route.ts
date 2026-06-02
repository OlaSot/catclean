import { devLog } from "@/lib/dev-log";
import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { AssignCleanerRequestBody } from "@/features/orders/types/assign-cleaner-api.types";
import { assignAdminOrderCleaner } from "@/server/mutations/orders/assignAdminOrderCleaner";
import { createNotification } from "@/server/services/notifications/createNotification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: AssignCleanerRequestBody;
  try {
    body = (await request.json()) as AssignCleanerRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const cleanerId =
    typeof body.cleanerId === "string" ? body.cleanerId.trim() : "";

  if (!cleanerId) {
    return NextResponse.json(
      { data: null, error: "cleanerId is required" },
      { status: 400 }
    );
  }

  devLog("[api/admin/orders/assign-cleaner] request", {
    orderId: id,
    cleanerId,
    note: "cleanerId must be profiles.id (auth user id)",
  });

  // Cleaner assignment is allowed by orders.status only; payment_status is not checked.
  const { order, error } = await assignAdminOrderCleaner(
    auth.supabase,
    id,
    cleanerId,
    auth.userId
  );

  devLog("[api/admin/orders/assign-cleaner] result", {
    orderId: id,
    cleanerId,
    error,
    assignedCleanerId: order?.assignment.assignedCleanerId ?? null,
  });

  if (error) {
    const isClientError =
      error === "Cleaner not found" ||
      error === "Profile is not a cleaner" ||
      error === "Cleaner profile not found" ||
      error === "Cleaner is not active" ||
      error === "Invalid cleaner id";
    const isConflict =
      error === "Cannot assign a cleaner for the current order status";

    return NextResponse.json(
      { data: null, error },
      { status: isConflict ? 409 : isClientError ? 400 : 500 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  const assignedCleanerId = order.assignment.assignedCleanerId;
  if (assignedCleanerId) {
    try {
      const created = await createNotification({
        userId: assignedCleanerId,
        roleTarget: "cleaner",
        type: "order_assigned",
        title: "New order assigned",
        message: `You have been assigned to order #${order.displayId}.`,
        orderId: id,
      });
      if (!created.ok) {
        devLog("[api/admin/orders/assign-cleaner] notification failed", {
          orderId: id,
          cleanerId: assignedCleanerId,
          error: created.error,
        });
      }
    } catch (e) {
      devLog("[api/admin/orders/assign-cleaner] notification error", {
        orderId: id,
        cleanerId: assignedCleanerId,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ data: order, error: null }, { status: 200 });
}
