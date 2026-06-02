export const SCHEDULE_TIME_STEP_MINUTES = 15;
export const SCHEDULE_TIME_STEP_SECONDS = SCHEDULE_TIME_STEP_MINUTES * 60;

/** Normalize "HH:mm" (or with seconds) to the nearest 15-minute slot. */
export function normalizeScheduleTime(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const totalMinutes = hours * 60 + minutes;
  const snapped =
    Math.round(totalMinutes / SCHEDULE_TIME_STEP_MINUTES) *
    SCHEDULE_TIME_STEP_MINUTES;

  if (snapped < 0 || snapped >= 24 * 60) return null;

  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isScheduleTimeOnStep(value: string): boolean {
  const normalized = normalizeScheduleTime(value);
  if (!normalized) return false;
  return normalized === value.trim().slice(0, 5);
}

export function buildScheduleTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += SCHEDULE_TIME_STEP_MINUTES) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}
