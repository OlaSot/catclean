import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import type { ClientReviewRequestBody } from "@/features/orders/types/client-review-complaint-api.types";
import { createClientOrderReview } from "@/server/mutations/reviews/createClientOrderReview";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireClientApiAuth();
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

  let body: ClientReviewRequestBody = {};
  try {
    body = (await request.json()) as ClientReviewRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { result, error, notFound, forbidden, conflict } =
    await createClientOrderReview(
      auth.supabase,
      orderId,
      auth.userId,
      body.rating,
      body.comment
    );

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (conflict) {
    return NextResponse.json(
      { data: null, error: error ?? "Review not allowed" },
      { status: 409 }
    );
  }

  if (error || !result) {
    return NextResponse.json(
      { data: null, error: error ?? "Failed to save review" },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: result, error: null }, { status: 201 });
}
