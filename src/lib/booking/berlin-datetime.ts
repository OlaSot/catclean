export const BERLIN_TIME_ZONE = "Europe/Berlin";

/** Public bookings must start at least this far from "now". */
export const PUBLIC_BOOKING_MIN_LEAD_MINUTES = 3 * 60;

function berlinParts(now: Date): { dateKey: string; timeHm: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BERLIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    dateKey: `${read("year")}-${read("month")}-${read("day")}`,
    timeHm: `${read("hour")}:${read("minute")}`,
  };
}

export function berlinTodayDateKey(now = new Date()): string {
  return berlinParts(now).dateKey;
}

export function berlinNowTimeHm(now = new Date()): string {
  return berlinParts(now).timeHm;
}

export function earliestPublicBookingBerlin(now = new Date()): {
  dateKey: string;
  timeHm: string;
} {
  return berlinParts(
    new Date(now.getTime() + PUBLIC_BOOKING_MIN_LEAD_MINUTES * 60 * 1000)
  );
}

/** True when the slot is before or equal to current Berlin wall-clock time. */
export function isScheduledSlotInPast(
  dateKey: string,
  timeHm: string,
  now = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const time = timeHm.trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(time)) return false;

  const { dateKey: today, timeHm: nowHm } = berlinParts(now);
  if (dateKey < today) return true;
  if (dateKey > today) return false;
  return time <= nowHm;
}

/**
 * True when the slot starts sooner than now + 3 hours (Berlin).
 * Exactly 3 hours later is allowed: 16:00 → first slot 19:00.
 */
export function isPublicBookingSlotTooSoon(
  dateKey: string,
  timeHm: string,
  now = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const time = timeHm.trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(time)) return false;

  const earliest = earliestPublicBookingBerlin(now);
  if (dateKey < earliest.dateKey) return true;
  if (dateKey > earliest.dateKey) return false;
  return time < earliest.timeHm;
}
