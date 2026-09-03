export function parseScheduleTimeToMinutes(
  value: string | null | undefined
): number | null {
  const raw = value?.trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function normalizeJobDurationMinutes(
  value: number | null | undefined,
  fallback = 180
): number {
  const raw = Number(value ?? fallback);
  if (!Number.isFinite(raw) || raw <= 0) return Math.max(15, fallback);
  return Math.max(15, Math.round(raw));
}

/** Half-open intervals [start, end). */
export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}

export function jobOverlapsSlot(params: {
  slotStart: number;
  slotDuration: number;
  jobTime: string | null | undefined;
  jobDurationMinutes: number | null | undefined;
}): boolean {
  const jobStart = parseScheduleTimeToMinutes(params.jobTime);
  if (jobStart == null) return false;
  const jobDuration = normalizeJobDurationMinutes(params.jobDurationMinutes);
  return intervalsOverlap(
    params.slotStart,
    params.slotStart + params.slotDuration,
    jobStart,
    jobStart + jobDuration
  );
}
