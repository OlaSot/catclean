import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { AdminUpdatePayoutRequestBody } from "@/features/finance/types/admin-order-finance.types";
import { updateAdminCleanerPayout } from "@/server/mutations/finance/updateAdminCleanerPayout";
import { getAdminOrderFinance } from "@/server/queries/finance/getAdminOrderFinance";

type RouteContext = {
  params: Promise<{ id: string; payoutId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id, payoutId } = await context.params;
  let body: AdminUpdatePayoutRequestBody = {};
  try {
    body = (await request.json()) as AdminUpdatePayoutRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { payout, error, notFound } = await updateAdminCleanerPayout(
    auth.supabase,
    id,
    payoutId,
    body
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Payout not found" },
      { status: 404 }
    );
  }
  if (error) {
    const isClient =
      error.includes("amount") ||
      error.includes("payoutPercent") ||
      error.includes("adjustmentAmount") ||
      error.includes("Invalid payout status");
    return NextResponse.json({ data: null, error }, { status: isClient ? 400 : 500 });
  }

  const finance = await getAdminOrderFinance(auth.supabase, id);
  if (finance.error || !finance.data) {
    return NextResponse.json(
      { data: null, error: finance.error ?? "Failed to load finance" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: { finance: finance.data, payout }, error: null },
    { status: 200 }
  );
}
