import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { getClientPreferredCleaners } from "@/lib/dispatch/get-client-preferred-cleaners";
import type { PortalPreferredCleaner } from "@/features/client-portal/types/portal.types";

export async function GET() {
  const auth = await requireClientApiAuth();
  if (!auth.ok) return auth.response;

  const { items, error } = await getClientPreferredCleaners(auth.supabase, auth.userId);
  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  const primary = items.find((item) => item.isPrimary) ?? items[0];
  if (!primary) {
    return NextResponse.json({ data: null, error: null }, { status: 200 });
  }

  const { data: cleanerProfile } = await auth.supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url")
    .eq("id", primary.cleanerId)
    .maybeSingle();

  const { count: completedOrders } = await auth.supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", auth.userId)
    .eq("assigned_cleaner_id", primary.cleanerId)
    .eq("status", "completed");

  const { data: clientOrders } = await auth.supabase
    .from("orders")
    .select("id")
    .eq("client_id", auth.userId)
    .eq("assigned_cleaner_id", primary.cleanerId);

  const orderIds = (clientOrders ?? []).map((row) => String((row as { id: number }).id));

  let averageRating: number | null = null;
  if (orderIds.length > 0) {
    const { data: reviewRows } = await auth.supabase
      .from("reviews")
      .select("rating")
      .in("order_id", orderIds);

    const ratings = (reviewRows ?? [])
      .map((row) => (row as { rating?: number }).rating)
      .filter((r): r is number => typeof r === "number" && Number.isFinite(r));

    if (ratings.length > 0) {
      averageRating =
        Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
    }
  }

  const name =
    cleanerProfile?.full_name?.trim() ||
    cleanerProfile?.email?.trim() ||
    "Preferred cleaner";

  const data: PortalPreferredCleaner = {
    id: primary.cleanerId,
    name,
    avatarUrl: cleanerProfile?.avatar_url?.trim() || null,
    completedOrders: completedOrders ?? 0,
    averageRating,
    bio: `Your trusted cleaner for repeat bookings.`,
  };

  return NextResponse.json({ data, error: null }, { status: 200 });
}
