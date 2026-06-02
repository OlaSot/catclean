import type { ClientOrderStats } from "@/entities/order/order.supabase.types";

export function buildClientOrderStats(
  rows: { client_id: string | null; scheduled_date: string | null }[]
): Map<string, ClientOrderStats> {
  const stats = new Map<string, ClientOrderStats>();

  for (const row of rows) {
    if (!row.client_id) continue;

    const current = stats.get(row.client_id) ?? { ordersCount: 0 };
    current.ordersCount += 1;

    const dateISO = row.scheduled_date?.slice(0, 10);
    if (
      dateISO &&
      (!current.lastOrderDateISO || dateISO > current.lastOrderDateISO)
    ) {
      current.lastOrderDateISO = dateISO;
    }

    stats.set(row.client_id, current);
  }

  return stats;
}
