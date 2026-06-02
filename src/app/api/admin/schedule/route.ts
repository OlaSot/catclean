import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminSchedule } from "@/server/queries/schedule/getAdminSchedule";

export async function GET(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const cleanerId = searchParams.get("cleaner_id");

  const { data, error } = await getAdminSchedule(auth.supabase, {
    date,
    cleanerId,
  });

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 200 });
}
