import { parseScheduleTimeToMinutes } from "@/lib/schedule/slot-overlap";

export const BOOKING_START_MINUTES = 7 * 60 + 30;
export const BOOKING_END_MINUTES = 20 * 60;
export const BOOKING_TIME_STEP_MINUTES = 30;

export function buildBookingStartTimes(): string[] {
  const times: string[] = [];
  for (
    let minutes = BOOKING_START_MINUTES;
    minutes <= BOOKING_END_MINUTES;
    minutes += BOOKING_TIME_STEP_MINUTES
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    times.push(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }
  return times;
}

export const BOOKING_START_TIMES = buildBookingStartTimes();

export function isBookingStartTime(value: string): boolean {
  return BOOKING_START_TIMES.includes(value);
}

/** Public jobs must finish by the last operating hour (20:00). */
export function bookingJobFitsOperatingDay(
  startTime: string,
  durationMinutes: number
): boolean {
  const start = parseScheduleTimeToMinutes(startTime);
  if (start == null) return false;
  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration) || duration <= 0) return false;
  return start + Math.round(duration) <= BOOKING_END_MINUTES;
}
