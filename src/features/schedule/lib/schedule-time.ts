export const SCHEDULE_DEFAULT_DURATION_MINUTES = 180;
export const SCHEDULE_DAY_START_HOUR = 8;
export const SCHEDULE_DAY_END_HOUR = 20;

export function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseScheduleDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return trimmed;
}

export function addDaysIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

/** Parses HH:MM or HH:MM:SS to minutes from midnight. */
export function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const parts = value.trim().split(":");
  const h = Number(parts[0]);
  const min = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function scheduleTimelineHours(): number[] {
  const hours: number[] = [];
  for (let h = SCHEDULE_DAY_START_HOUR; h <= SCHEDULE_DAY_END_HOUR; h++) {
    hours.push(h);
  }
  return hours;
}

export function minutesToTimelinePercent(
  startMinutes: number,
  durationMinutes: number
): { left: number; width: number } {
  const dayStart = SCHEDULE_DAY_START_HOUR * 60;
  const dayEnd = SCHEDULE_DAY_END_HOUR * 60;
  const span = dayEnd - dayStart;

  const clampedStart = Math.max(startMinutes, dayStart);
  const clampedEnd = Math.min(startMinutes + durationMinutes, dayEnd);
  const visibleDuration = Math.max(clampedEnd - clampedStart, 0);

  const left = ((clampedStart - dayStart) / span) * 100;
  const width = (visibleDuration / span) * 100;

  return {
    left: Math.min(Math.max(left, 0), 100),
    width: Math.min(Math.max(width, 2), 100 - left),
  };
}

export type ScheduleInterval = {
  startMinutes: number;
  endMinutes: number;
};

export function detectScheduleOverlap(intervals: ScheduleInterval[]): boolean {
  if (intervals.length < 2) return false;
  const sorted = [...intervals].sort((a, b) => a.startMinutes - b.startMinutes);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].endMinutes > sorted[i + 1].startMinutes) {
      return true;
    }
  }
  return false;
}
