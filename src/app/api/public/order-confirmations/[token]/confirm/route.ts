import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { recordOrderStatusHistory } from "@/server/mutations/orders/recordOrderStatusHistory";
import { createStaffNotifications } from "@/server/services/notifications/createNotification";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

function isTerminalStatus(status: string): boolean {
  return (
    status === "completed" ||
    status === "cancelled_by_admin" ||
    status === "cancelled_by_client" ||
    status === "cancelled_by_cleaner" ||
    status === "canceled" ||
    status === "refunded"
  );
}

export async function POST(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return NextResponse.json(
      { data: null, error: "Token is required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { data: tokenRow, error: tokenError } = await admin.supabase
    .from("order_confirmation_tokens")
    .select("id, order_id, expires_at, used_at")
    .eq("token", normalizedToken)
    .maybeSingle();

  if (tokenError) {
    return NextResponse.json({ data: null, error: tokenError.message }, { status: 500 });
  }
  if (!tokenRow) {
    return NextResponse.json({ data: null, error: "Token not found" }, { status: 404 });
  }
  if (tokenRow.used_at) {
    return NextResponse.json({ data: null, error: "Token already used" }, { status: 409 });
  }
  if (isExpired(tokenRow.expires_at as string)) {
    return NextResponse.json({ data: null, error: "Token expired" }, { status: 410 });
  }

  const { data: orderRow, error: orderError } = await admin.supabase
    .from("orders")
    .select("id, status, client_id, order_number")
    .eq("id", tokenRow.order_id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ data: null, error: orderError.message }, { status: 500 });
  }
  if (!orderRow) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const oldStatus = String(orderRow.status ?? "new").toLowerCase();
  if (isTerminalStatus(oldStatus)) {
    return NextResponse.json(
      { data: null, error: "Order can no longer be confirmed" },
      { status: 409 }
    );
  }

  const { data: usedUpdate, error: tokenUpdateError } = await admin.supabase
    .from("order_confirmation_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenRow.id)
    .is("used_at", null)
    .select("id")
    .maybeSingle();

  if (tokenUpdateError) {
    return NextResponse.json(
      { data: null, error: tokenUpdateError.message },
      { status: 500 }
    );
  }
  if (!usedUpdate) {
    return NextResponse.json({ data: null, error: "Token already used" }, { status: 409 });
  }

  const { error: statusUpdateError } = await admin.supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", orderRow.id);

  if (statusUpdateError) {
    return NextResponse.json(
      { data: null, error: statusUpdateError.message },
      { status: 500 }
    );
  }

  const changedBy = String(orderRow.client_id ?? "").trim();
  if (changedBy) {
    await recordOrderStatusHistory(admin.supabase, {
      orderId: String(orderRow.id),
      oldStatus,
      newStatus: "confirmed",
      changedBy,
      comment: "Confirmed via public confirmation link",
    });
  }

  await createStaffNotifications({
    roleTarget: "admin",
    type: "order_confirmed",
    title: `Order #${orderRow.order_number ?? String(orderRow.id).slice(0, 8)} confirmed`,
    message: "Client confirmed order via confirmation link.",
    orderId: String(orderRow.id),
  });

  return NextResponse.json(
    {
      data: {
        ok: true,
        orderId: orderRow.id,
      },
      error: null,
    },
    { status: 200 }
  );
}
