import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { AdminCreatePaymentRequestBody } from "@/features/finance/types/admin-order-finance.types";
import { createAdminOrderPayment } from "@/server/mutations/finance/createAdminOrderPayment";
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

  let body: AdminCreatePaymentRequestBody = {};
  try {
    body = (await request.json()) as AdminCreatePaymentRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { payment, error, notFound } = await createAdminOrderPayment(
    auth.supabase,
    id,
    auth.userId,
    {
      amount: body.amount,
      currency: body.currency,
      method: body.method,
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
      error.includes("Invalid payment method") ||
      error.includes("Invalid payment status");
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

  return NextResponse.json({ data: { finance: finance.data, payment }, error: null }, { status: 201 });
}

