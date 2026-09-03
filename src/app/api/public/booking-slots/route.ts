import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { getPublicBookingSlotAvailability } from "@/server/queries/bookings/getPublicBookingSlotAvailability";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date")?.trim() ?? "";
  const durationRaw = Number(url.searchParams.get("durationMinutes") ?? 180);

  if (!DATE_RE.test(date)) {
    return NextResponse.json(
      { data: null, error: "public.validation.chooseDate" },
      { status: 400 }
    );
  }

  const durationMinutes =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? Math.min(12 * 60, Math.max(15, Math.round(durationRaw)))
      : 180;

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const result = await getPublicBookingSlotAvailability(admin.supabase, {
    date,
    durationMinutes,
  });

  if (result.error) {
    console.error("GET /api/public/booking-slots:", result.error);
    return NextResponse.json({ data: null, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: { availableTimes: result.availableTimes },
    error: null,
  });
}
