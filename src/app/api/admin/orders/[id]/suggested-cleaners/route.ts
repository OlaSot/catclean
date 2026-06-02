import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminCleaners } from "@/server/queries/cleaners/getAdminCleaners";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { calculateCleanerWorkload } from "@/lib/schedule/calculate-cleaner-workload";
import { calculateCleanerScore } from "@/lib/dispatch/calculate-cleaner-score";
import type { SuggestedCleanerCandidate } from "@/features/orders/types/suggested-cleaners-api.types";
import { getClientPreferredCleaners } from "@/lib/dispatch/get-client-preferred-cleaners";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseTimeToMinutes(value: string | null | undefined): number | null {
  const raw = value?.trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function hasOverlapWithOrder(params: {
  orderStart: number | null;
  orderDuration: number;
  cleanerOrders: { scheduled_time: string | null; estimated_duration_minutes: number | null }[];
}): boolean {
  if (params.orderStart == null) return false;
  const orderStart = params.orderStart;
  const orderEnd = orderStart + params.orderDuration;
  return params.cleanerOrders.some((existing) => {
    const existingStart = parseTimeToMinutes(existing.scheduled_time);
    if (existingStart == null) return false;
    const duration = Math.max(15, Number(existing.estimated_duration_minutes ?? 180));
    const existingEnd = existingStart + duration;
    return orderStart < existingEnd && existingStart < orderEnd;
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json({ data: null, error: "Order id is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, client_id, service_type, scheduled_date, scheduled_time, estimated_duration_minutes, pets_info, address:addresses(city)"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ data: null, error: orderError.message }, { status: 500 });
  }
  if (!orderRow) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const orderAddress = Array.isArray(orderRow.address)
    ? orderRow.address[0]
    : orderRow.address;
  const orderCity = orderAddress?.city?.trim().toLowerCase() ?? "";
  const orderDate = orderRow.scheduled_date?.slice(0, 10) ?? "";
  const orderStart = parseTimeToMinutes(orderRow.scheduled_time);
  const orderDuration = Math.max(
    15,
    Number(orderRow.estimated_duration_minutes ?? 180)
  );

  const { cleaners, error: cleanersError } = await getAdminCleaners({ status: "active" });
  if (cleanersError) {
    return NextResponse.json({ data: null, error: cleanersError }, { status: 500 });
  }
  if (cleaners.length === 0) {
    return NextResponse.json({ data: [], error: null }, { status: 200 });
  }

  const cleanerIds = cleaners.map((cleaner) => cleaner.id);
  const [ordersForDayRes, availabilityRes, completedRes, complaintsRes, clientHistoryRes, reliabilityRes, preferredRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, assigned_cleaner_id, scheduled_time, estimated_duration_minutes")
        .eq("scheduled_date", orderDate)
        .in("assigned_cleaner_id", cleanerIds),
      supabase
        .from("cleaner_availability")
        .select("cleaner_id, status")
        .eq("date", orderDate)
        .in("cleaner_id", cleanerIds),
      supabase
        .from("orders")
        .select("assigned_cleaner_id")
        .eq("status", "completed")
        .in("assigned_cleaner_id", cleanerIds),
      supabase
        .from("orders")
        .select("assigned_cleaner_id")
        .eq("status", "problem")
        .in("assigned_cleaner_id", cleanerIds),
      orderRow.client_id
        ? supabase
            .from("orders")
            .select("assigned_cleaner_id")
            .eq("client_id", orderRow.client_id)
            .in("assigned_cleaner_id", cleanerIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("cleaner_profiles")
        .select("profile_id, often_late, strong_move_out, good_with_pets")
        .in("profile_id", cleanerIds),
      orderRow.client_id
        ? getClientPreferredCleaners(supabase, String(orderRow.client_id))
        : Promise.resolve({ items: [], error: null }),
    ]);

  const firstError =
    ordersForDayRes.error ??
    availabilityRes.error ??
    completedRes.error ??
    complaintsRes.error ??
    clientHistoryRes.error ??
    reliabilityRes.error ??
    preferredRes.error;
  if (firstError) {
    const message = typeof firstError === "string" ? firstError : firstError.message;
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }

  const ordersByCleaner = new Map<
    string,
    { scheduled_time: string | null; estimated_duration_minutes: number | null }[]
  >();
  for (const row of ordersForDayRes.data ?? []) {
    const cleanerId = (row as { assigned_cleaner_id?: string | null }).assigned_cleaner_id;
    if (!cleanerId) continue;
    const list = ordersByCleaner.get(cleanerId) ?? [];
    list.push({
      scheduled_time: (row as { scheduled_time?: string | null }).scheduled_time ?? null,
      estimated_duration_minutes:
        (row as { estimated_duration_minutes?: number | null }).estimated_duration_minutes ?? null,
    });
    ordersByCleaner.set(cleanerId, list);
  }

  const availabilityByCleaner = new Map<string, string>();
  for (const row of availabilityRes.data ?? []) {
    const cleanerId = (row as { cleaner_id?: string | null }).cleaner_id;
    const status = (row as { status?: string | null }).status;
    if (cleanerId && status) availabilityByCleaner.set(cleanerId, status);
  }

  const completedCounts = new Map<string, number>();
  for (const row of completedRes.data ?? []) {
    const cleanerId = (row as { assigned_cleaner_id?: string | null }).assigned_cleaner_id;
    if (!cleanerId) continue;
    completedCounts.set(cleanerId, (completedCounts.get(cleanerId) ?? 0) + 1);
  }

  const complaintCounts = new Map<string, number>();
  for (const row of complaintsRes.data ?? []) {
    const cleanerId = (row as { assigned_cleaner_id?: string | null }).assigned_cleaner_id;
    if (!cleanerId) continue;
    complaintCounts.set(cleanerId, (complaintCounts.get(cleanerId) ?? 0) + 1);
  }

  const previousClientCounts = new Map<string, number>();
  for (const row of clientHistoryRes.data ?? []) {
    const cleanerId = (row as { assigned_cleaner_id?: string | null }).assigned_cleaner_id;
    if (!cleanerId) continue;
    previousClientCounts.set(cleanerId, (previousClientCounts.get(cleanerId) ?? 0) + 1);
  }

  const reliabilityByCleaner = new Map<
    string,
    { oftenLate: boolean; strongMoveOut: boolean; goodWithPets: boolean }
  >();
  for (const row of reliabilityRes.data ?? []) {
    const cleanerId = (row as { profile_id?: string | null }).profile_id;
    if (!cleanerId) continue;
    reliabilityByCleaner.set(cleanerId, {
      oftenLate: (row as { often_late?: boolean | null }).often_late === true,
      strongMoveOut:
        (row as { strong_move_out?: boolean | null }).strong_move_out === true,
      goodWithPets:
        (row as { good_with_pets?: boolean | null }).good_with_pets === true,
    });
  }

  const preferredCleanerMap = new Map<string, { isPrimary: boolean }>();
  for (const item of preferredRes.items ?? []) {
    preferredCleanerMap.set(item.cleanerId, { isPrimary: item.isPrimary });
  }
  const hasAnyPreferredForClient = preferredCleanerMap.size > 0;

  const candidates: SuggestedCleanerCandidate[] = cleaners.map((cleaner) => {
    const cleanerOrders = ordersByCleaner.get(cleaner.id) ?? [];
    const workload = calculateCleanerWorkload({
      orders: cleanerOrders,
      maxDailyHours: cleaner.maxDailyHours,
      maxOrdersPerDay: cleaner.maxOrdersPerDay,
    });
    const hasOverlap = hasOverlapWithOrder({
      orderStart,
      orderDuration,
      cleanerOrders,
    });

    const reliability = reliabilityByCleaner.get(cleaner.id) ?? {
      oftenLate: false,
      strongMoveOut: false,
      goodWithPets: cleaner.petFriendly,
    };

    const preferredMeta = preferredCleanerMap.get(cleaner.id);
    const preferredForClient = Boolean(preferredMeta);
    const preferredPrimary = preferredMeta?.isPrimary === true;

    const score = calculateCleanerScore({
      availabilityStatus: (availabilityByCleaner.get(cleaner.id) as
        | "available"
        | "unavailable"
        | "vacation"
        | "sick"
        | "preferred_day_off"
        | null) ?? null,
      isAcceptingOrders: cleaner.isAcceptingOrders,
      cityMatch:
        orderCity !== "" &&
        cleaner.preferredWorkCities.some(
          (city) => city.trim().toLowerCase() === orderCity
        ),
      hasOverlap,
      workload: {
        totalOrders: workload.totalOrders,
        totalHours: workload.totalHours,
        exceedsMaxHours: workload.exceedsMaxHours,
        exceedsMaxOrders: workload.exceedsMaxOrders,
      },
      order: {
        serviceType: orderRow.service_type ?? "",
        hasPets: Boolean(orderRow.pets_info?.trim()),
      },
      reliability: {
        complaintsCount: complaintCounts.get(cleaner.id) ?? 0,
        completedOrdersCount: completedCounts.get(cleaner.id) ?? 0,
        oftenLate: reliability.oftenLate,
        strongMoveOut: reliability.strongMoveOut,
        goodWithPets: reliability.goodWithPets,
        previousClientOrdersCount: previousClientCounts.get(cleaner.id) ?? 0,
        preferredForClient,
        hasAnyPreferredForClient,
      },
    });

    const reasons = [...score.reasons];
    if (
      orderCity !== "" &&
      cleaner.preferredWorkCities.some(
        (city) => city.trim().toLowerCase() === orderCity
      )
    ) {
      reasons.push(`Works in ${orderAddress?.city ?? "this city"}`);
    }

    if (preferredPrimary) {
      reasons.push("Primary preferred cleaner");
    }

    return {
      cleaner,
      score: score.score,
      reasons,
      warnings: score.warnings,
      workloadToday: {
        totalOrders: workload.totalOrders,
        totalHours: workload.totalHours,
        overlaps: workload.overlaps,
        exceedsMaxHours: workload.exceedsMaxHours,
        exceedsMaxOrders: workload.exceedsMaxOrders,
      },
      reliability: {
        complaintsCount: complaintCounts.get(cleaner.id) ?? 0,
        completedOrdersCount: completedCounts.get(cleaner.id) ?? 0,
        previousClientOrdersCount: previousClientCounts.get(cleaner.id) ?? 0,
        oftenLate: reliability.oftenLate,
        strongMoveOut: reliability.strongMoveOut,
        goodWithPets: reliability.goodWithPets,
      },
      preferredForClient,
      preferredPrimary,
    };
  });

  const sorted = candidates.sort((a, b) => b.score - a.score).slice(0, 5);
  return NextResponse.json({ data: sorted, error: null }, { status: 200 });
}
