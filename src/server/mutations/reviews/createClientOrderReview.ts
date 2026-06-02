import type { ClientOrderReviewResult } from "@/entities/review/client-review.types";
import {
  canLeaveReviewForStatus,
} from "@/lib/orders/reviews-complaints-rules";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchClientOwnedOrder } from "@/server/mutations/orders/client-order-access";
import { getClientOrderById } from "@/server/queries/orders/getClientOrderById";

function parseRating(value: unknown): number | null {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export async function createClientOrderReview(
  supabase: SupabaseClient,
  orderId: string,
  clientId: string,
  ratingRaw: unknown,
  commentRaw: unknown
): Promise<{
  result: ClientOrderReviewResult | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const rating = parseRating(ratingRaw);
  if (rating === null) {
    return { result: null, error: "Rating must be an integer from 1 to 5" };
  }

  const comment =
    typeof commentRaw === "string" ? commentRaw.trim() || null : null;

  const access = await fetchClientOwnedOrder(supabase, orderId, clientId);
  if (!access.ok) {
    return {
      result: null,
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  if (!canLeaveReviewForStatus(access.order.status)) {
    return {
      result: null,
      error: "Reviews are only allowed for completed orders",
      conflict: true,
    };
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing?.id) {
    return {
      result: null,
      error: "A review already exists for this order",
      conflict: true,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("reviews")
    .insert({
      order_id: orderId,
      client_id: clientId,
      cleaner_id: access.order.assigned_cleaner_id,
      rating,
      comment,
    })
    .select("id, rating, comment, created_at")
    .single();

  if (insertError || !inserted) {
    console.error("createClientOrderReview:", insertError);
    const isDuplicate = insertError?.code === "23505";
    return {
      result: null,
      error: isDuplicate
        ? "A review already exists for this order"
        : insertError?.message ?? "Failed to save review",
      conflict: isDuplicate,
    };
  }

  const reload = await getClientOrderById(orderId, clientId);

  if (reload.forbidden || reload.error || !reload.order) {
    return {
      result: null,
      error: reload.error ?? "Failed to reload order",
    };
  }

  return {
    result: {
      review: {
        id: inserted.id as string,
        rating: inserted.rating as number,
        comment: (inserted.comment as string | null) ?? null,
        createdAt: inserted.created_at as string,
      },
      order: reload.order,
    },
    error: null,
  };
}
