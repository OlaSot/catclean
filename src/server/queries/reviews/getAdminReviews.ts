import type { AdminReviewListItem } from "@/entities/review/admin-review.types";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

type ReviewRow = {
  id: string;
  order_id: string;
  client_id: string;
  cleaner_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type OrderRow = {
  id: string;
  order_number: string | null;
};

export async function getAdminReviews(): Promise<{
  reviews: AdminReviewListItem[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("reviews")
    .select(
      "id, order_id, client_id, cleaner_id, rating, comment, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminReviews:", error);
    return { reviews: [], error: error.message };
  }

  const reviewRows = (rows ?? []) as ReviewRow[];
  const profileIds = [
    ...new Set(
      reviewRows
        .flatMap((r) => [r.client_id, r.cleaner_id])
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const orderIds = [...new Set(reviewRows.map((r) => r.order_id))];

  const profileMap = new Map<string, ProfileRow>();
  const orderMap = new Map<string, OrderRow>();

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", profileIds);

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile as ProfileRow);
    }
  }

  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("id", orderIds);

    for (const order of orders ?? []) {
      orderMap.set(order.id, order as OrderRow);
    }
  }

  const reviews: AdminReviewListItem[] = reviewRows.map((row) => {
    const client = profileMap.get(row.client_id);
    const cleaner = row.cleaner_id
      ? profileMap.get(row.cleaner_id)
      : null;
    const order = orderMap.get(row.order_id);

    return {
      id: row.id,
      orderId: row.order_id,
      orderDisplayId: formatOrderDisplayId(row.order_id, order?.order_number),
      clientId: row.client_id,
      clientName: client?.full_name?.trim() || "—",
      clientEmail: client?.email?.trim() || "—",
      cleanerId: row.cleaner_id,
      cleanerName: cleaner?.full_name?.trim() || null,
      rating: row.rating,
      comment: row.comment?.trim() || null,
      createdAt: row.created_at,
    };
  });

  return { reviews, error: null };
}
