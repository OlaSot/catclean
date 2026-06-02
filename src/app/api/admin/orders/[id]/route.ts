import { NextResponse } from "next/server";
import { isStaffApiRole } from "@/lib/permissions/staff-api";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";
import { updateAdminOrder } from "@/server/mutations/orders/updateAdminOrder";
import type { AdminUpdateOrderRequestBody } from "@/features/orders/types/admin-update-order-api.types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !isStaffApiRole(profile?.role)) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { order, error } = await getAdminOrderById(id);

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

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const orderId = id?.trim();

  if (!orderId) {
    return NextResponse.json(
      { data: null, error: "Order id is required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !isStaffApiRole(profile?.role)) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  let body: AdminUpdateOrderRequestBody;
  try {
    body = (await request.json()) as AdminUpdateOrderRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { order, error, notFound } = await updateAdminOrder(
    supabase,
    orderId,
    body
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json(
      { data: null, error: "Order was not updated" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: order, error: null }, { status: 200 });
}
