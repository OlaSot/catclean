import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { AdminCreatePayoutRequestBody } from "@/features/finance/types/admin-order-finance.types";
import { createAdminCleanerPayout } from "@/server/mutations/finance/createAdminCleanerPayout";
import { getAdminOrderFinance } from "@/server/queries/finance/getAdminOrderFinance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: AdminCreatePayoutRequestBody = {};
  try {
    body = (await request.json()) as AdminCreatePayoutRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { payout, error, notFound } = await createAdminCleanerPayout(
    auth.supabase,
    id,
    auth.userId,
    {
      cleanerId: body.cleanerId,
      amount: body.amount,
      payoutPercent: body.payoutPercent,
      adjustmentAmount: body.adjustmentAmount,
      adjustmentReason: body.adjustmentReason,
      currency: body.currency,
      status: body.status,
      note: body.note,
    }
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (error) {
    const isClient =
      error.includes("amount") ||
      error.includes("Invalid cleanerId") ||
      error.includes("Invalid payout status") ||
      error.includes("payoutPercent") ||
      error.includes("adjustmentAmount") ||
      error.includes("role=cleaner");
    return NextResponse.json({ data: null, error }, { status: isClient ? 400 : 500 });
  }

  const finance = await getAdminOrderFinance(auth.supabase, id);
  if (finance.notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }
  if (finance.error || !finance.data) {
    return NextResponse.json(
      { data: null, error: finance.error ?? "Failed to load finance" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { finance: finance.data, payout }, error: null }, { status: 201 });
}

