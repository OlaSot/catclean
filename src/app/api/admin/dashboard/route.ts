import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminDashboardStats } from "@/server/queries/dashboard/getAdminDashboardStats";

export async function GET() {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await getAdminDashboardStats(auth.supabase);

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 200 });
}
