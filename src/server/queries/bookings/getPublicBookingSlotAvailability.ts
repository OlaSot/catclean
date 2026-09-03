import type { SupabaseClient } from "@supabase/supabase-js";
import { isPublicBookingSlotTooSoon } from "@/lib/booking/berlin-datetime";
import {
  listAvailableBookingStartTimes,
  orderStatusOccupiesBookingCapacity,
  PUBLIC_UNAVAILABLE_DAY_STATUSES,
  type BookingCapacityCleaner,
  type BookingCapacityOrder,
} from "@/lib/booking/booking-slot-availability";
import { normalizeJobDurationMinutes } from "@/lib/schedule/slot-overlap";

type CleanerProfileRow = {
  profile_id?: string | null;
  status?: string | null;
  is_accepting_orders?: boolean | null;
  max_daily_hours?: number | null;
  max_orders_per_day?: number | null;
};

type DayOrderRow = {
  assigned_cleaner_id?: string | null;
  scheduled_time?: string | null;
  estimated_duration_minutes?: number | null;
  status?: string | null;
};

type AvailabilityRow = {
  cleaner_id?: string | null;
  status?: string | null;
};

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: string }).code === "42703";
}

async function loadActiveCleaners(
  supabase: SupabaseClient
): Promise<{ cleaners: BookingCapacityCleaner[]; error: string | null }> {
  const full = await supabase
    .from("cleaner_profiles")
    .select("profile_id, status, is_accepting_orders, max_daily_hours, max_orders_per_day")
    .eq("status", "active");

  let rows = full.data as CleanerProfileRow[] | null;
  let error = full.error;

  if (error && isMissingColumnError(error)) {
    const fallback = await supabase
      .from("cleaner_profiles")
      .select("profile_id, status")
      .eq("status", "active");
    rows = fallback.data as CleanerProfileRow[] | null;
    error = fallback.error;
  }

  if (error) {
    return { cleaners: [], error: error.message };
  }

  const cleaners: BookingCapacityCleaner[] = [];
  for (const row of rows ?? []) {
    const id = row.profile_id?.trim();
    if (!id) continue;
    if (row.is_accepting_orders === false) continue;
    cleaners.push({
      id,
      maxDailyHours: Math.max(1, Number(row.max_daily_hours ?? 8)),
      maxOrdersPerDay: Math.max(1, Number(row.max_orders_per_day ?? 4)),
    });
  }

  return { cleaners, error: null };
}

export async function getPublicBookingSlotAvailability(
  supabase: SupabaseClient,
  input: { date: string; durationMinutes: number; extraDemand?: number }
): Promise<{ availableTimes: string[]; error: string | null }> {
  const durationMinutes = normalizeJobDurationMinutes(input.durationMinutes);
  const { cleaners, error: cleanersError } = await loadActiveCleaners(supabase);
  if (cleanersError) {
    return { availableTimes: [], error: cleanersError };
  }
  if (cleaners.length === 0) {
    return { availableTimes: [], error: null };
  }

  const cleanerIds = cleaners.map((cleaner) => cleaner.id);
  const [ordersRes, availabilityRes] = await Promise.all([
    supabase
      .from("orders")
      .select("assigned_cleaner_id, scheduled_time, estimated_duration_minutes, status")
      .eq("scheduled_date", input.date),
    supabase
      .from("cleaner_availability")
      .select("cleaner_id, status")
      .eq("date", input.date)
      .in("cleaner_id", cleanerIds),
  ]);

  if (ordersRes.error) {
    return { availableTimes: [], error: ordersRes.error.message };
  }

  const blockedIds = new Set<string>();
  if (availabilityRes.error) {
    console.error(
      "getPublicBookingSlotAvailability cleaner_availability:",
      availabilityRes.error.message
    );
  } else {
    for (const row of (availabilityRes.data ?? []) as AvailabilityRow[]) {
      const cleanerId = row.cleaner_id?.trim();
      const status = (row.status ?? "").trim().toLowerCase();
      if (cleanerId && PUBLIC_UNAVAILABLE_DAY_STATUSES.has(status)) {
        blockedIds.add(cleanerId);
      }
    }
  }

  const eligibleCleaners = cleaners.filter((cleaner) => !blockedIds.has(cleaner.id));
  const orders: BookingCapacityOrder[] = [];
  for (const row of (ordersRes.data ?? []) as DayOrderRow[]) {
    if (!orderStatusOccupiesBookingCapacity(row.status ?? null)) continue;
    orders.push({
      assignedCleanerId: row.assigned_cleaner_id?.trim() || null,
      scheduledTime: row.scheduled_time ?? null,
      estimatedDurationMinutes: row.estimated_duration_minutes ?? null,
    });
  }

  const now = new Date();
  return {
    availableTimes: listAvailableBookingStartTimes({
      durationMinutes,
      cleaners: eligibleCleaners,
      orders,
      extraDemand: input.extraDemand,
    }).filter((slot) => !isPublicBookingSlotTooSoon(input.date, slot, now)),
    error: null,
  };
}
