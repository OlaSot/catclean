import { BOOKING_START_TIMES, bookingJobFitsOperatingDay } from "@/lib/booking/booking-time-slots";
import { calculateCleanerWorkload } from "@/lib/schedule/calculate-cleaner-workload";
import {
  jobOverlapsSlot,
  normalizeJobDurationMinutes,
  parseScheduleTimeToMinutes,
} from "@/lib/schedule/slot-overlap";

export type BookingCapacityCleaner = {
  id: string;
  maxDailyHours: number;
  maxOrdersPerDay: number;
};

export type BookingCapacityOrder = {
  assignedCleanerId: string | null;
  scheduledTime: string | null;
  estimatedDurationMinutes: number | null;
};

export const PUBLIC_UNAVAILABLE_DAY_STATUSES = new Set([
  "unavailable",
  "vacation",
  "sick",
  "preferred_day_off",
]);

export function orderStatusOccupiesBookingCapacity(
  status: string | null | undefined
): boolean {
  const key = (status ?? "").toLowerCase().replace(/-/g, "_");
  if (!key) return true;
  return !(
    key === "canceled" ||
    key === "cancelled" ||
    key.startsWith("cancelled_") ||
    key === "refunded"
  );
}

export function isSlotCoveredByCleanerPool(params: {
  slotTime: string;
  durationMinutes: number;
  cleaners: BookingCapacityCleaner[];
  orders: BookingCapacityOrder[];
  /** How many new jobs need a free cleaner in this interval. 1 = listing a new booking. */
  extraDemand?: number;
}): boolean {
  const slotStart = parseScheduleTimeToMinutes(params.slotTime);
  if (slotStart == null) return false;
  if (params.cleaners.length === 0) return false;

  const duration = normalizeJobDurationMinutes(params.durationMinutes);
  if (!bookingJobFitsOperatingDay(params.slotTime, duration)) return false;

  const extraDemand = Math.max(0, params.extraDemand ?? 1);
  const overlappingUnassigned = params.orders.filter(
    (order) =>
      !order.assignedCleanerId &&
      jobOverlapsSlot({
        slotStart,
        slotDuration: duration,
        jobTime: order.scheduledTime,
        jobDurationMinutes: order.estimatedDurationMinutes,
      })
  ).length;

  const freeCleaners = params.cleaners.filter((cleaner) => {
    const assigned = params.orders.filter(
      (order) => order.assignedCleanerId === cleaner.id
    );
    const hasOverlap = assigned.some((order) =>
      jobOverlapsSlot({
        slotStart,
        slotDuration: duration,
        jobTime: order.scheduledTime,
        jobDurationMinutes: order.estimatedDurationMinutes,
      })
    );
    if (hasOverlap) return false;

    const workload = calculateCleanerWorkload({
      orders: assigned.map((order) => ({
        scheduled_time: order.scheduledTime,
        estimated_duration_minutes: order.estimatedDurationMinutes,
      })),
      maxDailyHours: cleaner.maxDailyHours,
      maxOrdersPerDay: cleaner.maxOrdersPerDay,
    });
    if (workload.totalOrders + 1 > cleaner.maxOrdersPerDay) return false;
    if (workload.totalMinutes + duration > cleaner.maxDailyHours * 60) return false;
    return true;
  });

  return freeCleaners.length >= overlappingUnassigned + extraDemand;
}

export function listAvailableBookingStartTimes(params: {
  durationMinutes: number;
  cleaners: BookingCapacityCleaner[];
  orders: BookingCapacityOrder[];
  startTimes?: readonly string[];
  extraDemand?: number;
}): string[] {
  const startTimes = params.startTimes ?? BOOKING_START_TIMES;
  return startTimes.filter((slotTime) =>
    isSlotCoveredByCleanerPool({
      slotTime,
      durationMinutes: params.durationMinutes,
      cleaners: params.cleaners,
      orders: params.orders,
      extraDemand: params.extraDemand,
    })
  );
}
