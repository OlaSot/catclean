import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminOrderFinance } from "@/server/queries/finance/getAdminOrderFinance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const { data, error, notFound } = await getAdminOrderFinance(auth.supabase, id);

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 200 });
}

