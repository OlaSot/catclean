import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { createStaffNotifications } from "@/server/services/notifications/createNotification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildConfirmationUrl(baseUrl: string, token: string): string {
  return new URL(`/confirm-order/${token}`, baseUrl).toString();
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json(
      { data: null, error: "Order id is required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { data: latest, error } = await admin.supabase
    .from("order_confirmation_tokens")
    .select("token, created_at, expires_at, used_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  if (!latest) {
    return NextResponse.json({ data: null, error: null }, { status: 200 });
  }

  const expiresAt = latest.expires_at as string;
  const isExpired = new Date(expiresAt).getTime() <= Date.now();

  return NextResponse.json(
    {
      data: {
        token: latest.token as string,
        createdAt: latest.created_at as string,
        expiresAt,
        usedAt: (latest.used_at as string | null) ?? null,
        isExpired,
        confirmationUrl: buildConfirmationUrl(request.url, latest.token as string),
      },
      error: null,
    },
    { status: 200 }
  );
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json(
      { data: null, error: "Order id is required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { data: order, error: orderError } = await admin.supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json(
      { data: null, error: orderError.message },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Policy: only latest active token is valid. Invalidate previous active tokens.
  const { error: invalidateError } = await admin.supabase
    .from("order_confirmation_tokens")
    .update({ expires_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString());

  if (invalidateError) {
    return NextResponse.json(
      { data: null, error: invalidateError.message },
      { status: 500 }
    );
  }

  const { error: insertError } = await admin.supabase
    .from("order_confirmation_tokens")
    .insert({
      order_id: orderId,
      token,
      expires_at: expiresAt,
      created_by: auth.userId,
    });

  if (insertError) {
    return NextResponse.json(
      { data: null, error: insertError.message },
      { status: 500 }
    );
  }

  const confirmationUrl = buildConfirmationUrl(request.url, token);

  await createStaffNotifications({
    roleTarget: "admin",
    type: "confirmation_link_generated",
    title: "Confirmation link generated",
    message: `Order ${orderId} confirmation link was generated.`,
    orderId,
  });

  return NextResponse.json(
    {
      data: {
        confirmationUrl,
        token,
        expiresAt,
      },
      error: null,
    },
    { status: 201 }
  );
}
