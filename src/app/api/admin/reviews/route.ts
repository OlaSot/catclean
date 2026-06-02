import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminReviews } from "@/server/queries/reviews/getAdminReviews";

export async function GET() {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { reviews, error } = await getAdminReviews();

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: reviews, error: null }, { status: 200 });
}
