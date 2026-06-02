import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

export async function GET(_request: Request, context: RouteContext) {
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

  const { data, error } = await admin.supabase
    .from("order_confirmation_tokens")
    .select(
      "id, token, expires_at, used_at, order:orders(id, order_number, status, service_type, scheduled_date, scheduled_time, estimated_price, final_price, currency, address:addresses(city, street, house_number))"
    )
    .eq("token", normalizedToken)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  const orderRaw = Array.isArray(data?.order) ? data?.order[0] : data?.order;

  if (!data || !orderRaw) {
    return NextResponse.json({ data: null, error: "Token not found" }, { status: 404 });
  }

  const order = orderRaw as {
    id: string;
    order_number: string | null;
    status: string | null;
    service_type: string | null;
    scheduled_date: string | null;
    scheduled_time: string | null;
    estimated_price: number | null;
    final_price: number | null;
    currency: string | null;
    address:
      | {
          city: string | null;
          street: string | null;
          house_number: string | null;
        }
      | {
          city: string | null;
          street: string | null;
          house_number: string | null;
        }[]
      | null;
  };
  const addressRaw = Array.isArray(order.address) ? order.address[0] : order.address;

  const orderStatus = (order.status ?? "new").toLowerCase();
  const expired = isTokenExpired(data.expires_at as string);
  const used = Boolean(data.used_at);
  const terminal =
    orderStatus === "completed" ||
    orderStatus === "cancelled_by_admin" ||
    orderStatus === "cancelled_by_client" ||
    orderStatus === "cancelled_by_cleaner" ||
    orderStatus === "canceled" ||
    orderStatus === "refunded";

  const canConfirm = !expired && !used && !terminal;

  return NextResponse.json(
    {
      data: {
        token: normalizedToken,
        expiresAt: data.expires_at as string,
        usedAt: (data.used_at as string | null) ?? null,
        canConfirm,
        statusReason: !canConfirm
          ? used
            ? "used"
            : expired
              ? "expired"
              : "terminal_order_status"
          : null,
        order: {
          id: order.id,
          displayId: order.order_number ?? order.id.slice(0, 8),
          status: orderStatus,
          serviceType: order.service_type ?? "",
          scheduledDate: order.scheduled_date,
          scheduledTime: order.scheduled_time,
          total: order.final_price ?? order.estimated_price ?? 0,
          currency: order.currency ?? "EUR",
          addressLine: [
            addressRaw?.city ?? null,
            [addressRaw?.street, addressRaw?.house_number].filter(Boolean).join(" "),
          ]
            .filter(Boolean)
            .join(", "),
        },
      },
      error: null,
    },
    { status: 200 }
  );
}
