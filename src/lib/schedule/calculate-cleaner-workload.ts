export type WorkloadInputOrder = {
  scheduled_time: string | null | undefined;
  estimated_duration_minutes: number | null | undefined;
};

export type CleanerWorkload = {
  totalOrders: number;
  totalMinutes: number;
  totalHours: number;
  overlaps: number;
  exceedsMaxHours: boolean;
  exceedsMaxOrders: boolean;
};

function parseTimeToMinutes(value: string | null | undefined): number | null {
  const raw = value?.trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

export function calculateCleanerWorkload(params: {
  orders: WorkloadInputOrder[];
  maxDailyHours?: number | null;
  maxOrdersPerDay?: number | null;
  defaultDurationMinutes?: number;
}): CleanerWorkload {
  const defaultDuration = Math.max(15, params.defaultDurationMinutes ?? 180);
  const normalizedOrders = params.orders.map((order) => {
    const durationRaw = Number(order.estimated_duration_minutes ?? defaultDuration);
    const duration =
      Number.isFinite(durationRaw) && durationRaw > 0
        ? Math.round(durationRaw)
        : defaultDuration;
    return {
      start: parseTimeToMinutes(order.scheduled_time),
      duration,
    };
  });

  const totalOrders = normalizedOrders.length;
  const totalMinutes = normalizedOrders.reduce((sum, item) => sum + item.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const timed = normalizedOrders
    .filter((item) => item.start != null)
    .map((item) => ({
      start: item.start as number,
      end: (item.start as number) + item.duration,
    }))
    .sort((a, b) => a.start - b.start);

  let overlaps = 0;
  let lastEnd = -1;
  for (const item of timed) {
    if (item.start < lastEnd) overlaps += 1;
    lastEnd = Math.max(lastEnd, item.end);
  }

  const maxDailyHours = Math.max(1, Number(params.maxDailyHours ?? 8));
  const maxOrdersPerDay = Math.max(1, Number(params.maxOrdersPerDay ?? 4));

  return {
    totalOrders,
    totalMinutes,
    totalHours,
    overlaps,
    exceedsMaxHours: totalMinutes > maxDailyHours * 60,
    exceedsMaxOrders: totalOrders > maxOrdersPerDay,
  };
}
