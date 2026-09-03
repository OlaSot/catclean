import type { SupabaseClient } from "@supabase/supabase-js";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";

const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;

const CANCELLED_STATUSES = new Set([
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "canceled",
  "refunded",
]);

type DuplicateHit = {
  orderId: string;
  status: string;
};

export async function findRecentDuplicatePublicBooking(
  supabase: SupabaseClient,
  input: {
    email: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceType: string;
  }
): Promise<{ duplicate: DuplicateHit | null; error: string | null }> {
  const email = input.email.trim().toLowerCase();
  const slotTime = input.scheduledTime.trim().slice(0, 5);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    return { duplicate: null, error: profileError.message };
  }
  if (!profile?.id) return { duplicate: null, error: null };

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, order_number, status, scheduled_time, created_at")
    .eq("client_id", profile.id)
    .eq("scheduled_date", input.scheduledDate)
    .eq("service_type", input.serviceType)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { duplicate: null, error: error.message };
  }

  const match = (rows ?? []).find((row) => {
    const status = typeof row.status === "string" ? row.status : "";
    if (CANCELLED_STATUSES.has(status)) return false;
    const time = String(row.scheduled_time ?? "").slice(0, 5);
    return time === slotTime;
  });

  if (!match) return { duplicate: null, error: null };

  return {
    duplicate: {
      orderId: formatOrderDisplayId(match.id, match.order_number as string | null),
      status: String(match.status ?? ""),
    },
    error: null,
  };
}
