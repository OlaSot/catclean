import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const cleanerId = id?.trim();
  if (!cleanerId) {
    return NextResponse.json({ data: null, error: "Cleaner id is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const { data, error } = await admin.supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, cleaner_profiles(id, status, base_city, max_daily_hours, max_orders_per_day, preferred_work_cities, is_accepting_orders)"
    )
    .eq("id", cleanerId)
    .eq("role", "cleaner")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ data: null, error: "Cleaner not found" }, { status: 404 });
  }

  const cleanerProfile = Array.isArray(data.cleaner_profiles)
    ? data.cleaner_profiles[0]
    : data.cleaner_profiles;

  return NextResponse.json(
    {
      data: {
        id: data.id,
        fullName: data.full_name ?? data.email ?? data.phone ?? "Cleaner",
        email: data.email ?? "—",
        phone: data.phone ?? "—",
        status: cleanerProfile?.status ?? "pending",
        baseCity: cleanerProfile?.base_city ?? null,
        maxDailyHours: Math.max(1, Number(cleanerProfile?.max_daily_hours ?? 8)),
        maxOrdersPerDay: Math.max(1, Number(cleanerProfile?.max_orders_per_day ?? 4)),
        preferredWorkCities: Array.isArray(cleanerProfile?.preferred_work_cities)
          ? cleanerProfile?.preferred_work_cities
          : [],
        isAcceptingOrders: cleanerProfile?.is_accepting_orders !== false,
      },
      error: null,
    },
    { status: 200 }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const cleanerId = id?.trim();
  if (!cleanerId) {
    return NextResponse.json({ data: null, error: "Cleaner id is required" }, { status: 400 });
  }

  let body: {
    maxDailyHours?: number;
    maxOrdersPerDay?: number;
    preferredWorkCities?: string[];
    isAcceptingOrders?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
  }

  const updatePayload = {
    max_daily_hours: Math.max(1, Number(body.maxDailyHours ?? 8)),
    max_orders_per_day: Math.max(1, Number(body.maxOrdersPerDay ?? 4)),
    preferred_work_cities: Array.isArray(body.preferredWorkCities)
      ? body.preferredWorkCities.filter((city) => typeof city === "string")
      : [],
    is_accepting_orders: body.isAcceptingOrders !== false,
  };

  const { error } = await admin.supabase
    .from("cleaner_profiles")
    .update(updatePayload)
    .eq("profile_id", cleanerId);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return GET(request, context);
}
