import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminComplaints } from "@/server/queries/complaints/getAdminComplaints";

export async function GET() {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { complaints, error } = await getAdminComplaints();

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: complaints, error: null }, { status: 200 });
}
