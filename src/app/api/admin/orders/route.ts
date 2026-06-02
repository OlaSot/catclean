import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminOrders } from "@/server/queries/orders/getAdminOrders";
import { parseAdminOrdersQuery } from "@/server/queries/orders/parse-admin-orders-query";
import type { AdminCreateOrderRequestBody } from "@/features/orders/types/admin-create-order-api.types";
import { createAdminOrder } from "@/server/mutations/orders/createAdminOrder";

export async function GET(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const filters = parseAdminOrdersQuery(searchParams);
  const { orders, error } = await getAdminOrders(filters);

  if (error) {
    return NextResponse.json(
      { data: null, error },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: orders, error: null }, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  let body: AdminCreateOrderRequestBody;
  try {
    body = (await request.json()) as AdminCreateOrderRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { order, error, fieldErrors, code, createdClient, clientId } =
    await createAdminOrder(
    auth.supabase,
    auth.userId,
    body
  );

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { data: null, error: error ?? "Validation error", fieldErrors },
      { status: 400 }
    );
  }

  if (error) {
    const status = code === "server" ? 500 : 400;
    return NextResponse.json({ data: null, error }, { status });
  }

  if (!order) {
    return NextResponse.json(
      { data: null, error: "Order was not created" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: order, error: null, createdClient: Boolean(createdClient), clientId },
    { status: 201 }
  );
}
