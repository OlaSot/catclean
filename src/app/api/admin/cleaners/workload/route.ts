import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { calculateCleanerWorkload } from "@/lib/schedule/calculate-cleaner-workload";

export async function GET(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const cleanerId = searchParams.get("cleaner_id")?.trim() ?? "";
  const date = searchParams.get("date")?.trim() ?? "";

  if (!cleanerId || !date) {
    return NextResponse.json(
      { data: null, error: "cleaner_id and date are required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const [{ data: profileRow, error: profileError }, { data: orders, error: ordersError }, { data: availability, error: availabilityError }] =
    await Promise.all([
      admin.supabase
        .from("cleaner_profiles")
        .select("max_daily_hours, max_orders_per_day, is_accepting_orders")
        .eq("profile_id", cleanerId)
        .maybeSingle(),
      admin.supabase
        .from("orders")
        .select("scheduled_time, estimated_duration_minutes")
        .eq("assigned_cleaner_id", cleanerId)
        .eq("scheduled_date", date),
      admin.supabase
        .from("cleaner_availability")
        .select("status, note")
        .eq("cleaner_id", cleanerId)
        .eq("date", date)
        .maybeSingle(),
    ]);

  const firstError = profileError ?? ordersError ?? availabilityError;
  if (firstError) {
    return NextResponse.json({ data: null, error: firstError.message }, { status: 500 });
  }

  const workload = calculateCleanerWorkload({
    orders: (orders ?? []) as { scheduled_time: string | null; estimated_duration_minutes: number | null }[],
    maxDailyHours: profileRow?.max_daily_hours ?? 8,
    maxOrdersPerDay: profileRow?.max_orders_per_day ?? 4,
  });

  return NextResponse.json(
    {
      data: {
        workload,
        availabilityStatus: availability?.status ?? null,
        availabilityNote: availability?.note?.trim() || null,
        isAcceptingOrders: profileRow?.is_accepting_orders !== false,
        maxDailyHours: Math.max(1, Number(profileRow?.max_daily_hours ?? 8)),
        maxOrdersPerDay: Math.max(1, Number(profileRow?.max_orders_per_day ?? 4)),
      },
      error: null,
    },
    { status: 200 }
  );
}
