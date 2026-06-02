import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeStatus(value: string | null | undefined):
  | "available"
  | "unavailable"
  | "vacation"
  | "sick"
  | "preferred_day_off"
  | null {
  if (
    value === "available" ||
    value === "unavailable" ||
    value === "vacation" ||
    value === "sick" ||
    value === "preferred_day_off"
  ) {
    return value;
  }
  return null;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const cleanerId = id?.trim();
  if (!cleanerId) {
    return NextResponse.json({ data: null, error: "Cleaner id is required" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() ?? "";
  const to = searchParams.get("to")?.trim() ?? "";

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  let query = admin.supabase
    .from("cleaner_availability")
    .select("id, cleaner_id, date, status, note, created_at")
    .eq("cleaner_id", cleanerId)
    .order("date", { ascending: true })
    .limit(120);

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], error: null }, { status: 200 });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const cleanerId = id?.trim();
  if (!cleanerId) {
    return NextResponse.json({ data: null, error: "Cleaner id is required" }, { status: 400 });
  }

  let body: { date?: string; status?: string; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
  }

  const date = body.date?.trim() ?? "";
  const status = normalizeStatus(body.status);
  if (!date || !status) {
    return NextResponse.json({ data: null, error: "date and valid status are required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { error } = await admin.supabase
    .from("cleaner_availability")
    .upsert(
      {
        cleaner_id: cleanerId,
        date,
        status,
        note: body.note?.trim() || null,
      },
      { onConflict: "cleaner_id,date" }
    );

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { ok: true }, error: null }, { status: 200 });
}
