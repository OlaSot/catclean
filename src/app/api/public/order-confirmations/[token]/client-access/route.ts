import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { sendClientAccessEmail } from "@/lib/email/send-client-access-email";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return NextResponse.json({ data: null, error: "Token is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { data: tokenRow, error: tokenError } = await admin.supabase
    .from("order_confirmation_tokens")
    .select("expires_at, order_id")
    .eq("token", normalizedToken)
    .maybeSingle();
  if (tokenError || !tokenRow) {
    return NextResponse.json({ data: null, error: tokenError?.message ?? "Token not found" }, { status: tokenError ? 500 : 404 });
  }
  if (new Date(String(tokenRow.expires_at)).getTime() <= Date.now()) {
    return NextResponse.json({ data: null, error: "Token expired" }, { status: 410 });
  }

  const { data: order, error: orderError } = await admin.supabase
    .from("orders")
    .select("client_id, status")
    .eq("id", tokenRow.order_id)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ data: null, error: orderError?.message ?? "Order not found" }, { status: orderError ? 500 : 404 });
  }
  if (String(order.status).toLowerCase() !== "confirmed") {
    return NextResponse.json({ data: null, error: "Confirm the order first" }, { status: 409 });
  }

  const { data: profile, error: profileError } = await admin.supabase
    .from("profiles")
    .select("email, role")
    .eq("id", order.client_id)
    .maybeSingle();
  const email = profile?.email?.trim().toLowerCase();
  if (profileError || !email || profile?.role !== "client") {
    return NextResponse.json({ data: null, error: profileError?.message ?? "Client account is unavailable" }, { status: profileError ? 500 : 409 });
  }

  const origin = new URL(request.url).origin;
  const { data: linkData, error: linkError } = await admin.supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return NextResponse.json({ data: null, error: linkError?.message ?? "Could not create access link" }, { status: 500 });
  }

  const accessUrl = new URL("/auth/confirm", origin);
  accessUrl.searchParams.set("token_hash", tokenHash);
  accessUrl.searchParams.set("type", "magiclink");
  accessUrl.searchParams.set("next", "/app/client");
  const sent = await sendClientAccessEmail({ to: email, accessUrl: accessUrl.toString() });
  if (!sent.sent) {
    return NextResponse.json({ data: null, error: sent.error }, { status: 502 });
  }

  return NextResponse.json({ data: { sent: true }, error: null });
}
