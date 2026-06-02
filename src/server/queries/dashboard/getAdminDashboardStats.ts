import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import type {
  AdminDashboardActivityItem,
  AdminDashboardData,
  AdminDashboardOrderRow,
} from "@/features/dashboard/types/admin-dashboard.types";
import { getOrderStatusLabel } from "@/lib/constants/order-status";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateCleanerWorkload } from "@/lib/schedule/calculate-cleaner-workload";

const DASHBOARD_ORDER_SELECT = `
  id,
  order_number,
  status,
  payment_status,
  scheduled_date,
  scheduled_time,
  service_type,
  assigned_cleaner_id,
  estimated_price,
  final_price,
  currency,
  client:profiles!orders_client_id_fkey (
    full_name,
    email
  ),
  assigned_cleaner:profiles!orders_assigned_cleaner_id_fkey (
    full_name,
    email
  )
`;

const TERMINAL_STATUSES = new Set([
  "problem",
  "completed",
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
  "cancelled",
]);

type DashboardOrderRow = {
  id: string | number;
  order_number?: string | null;
  status: string | null;
  payment_status?: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  service_type: string | null;
  assigned_cleaner_id: string | null;
  estimated_price: number | null;
  final_price?: number | null;
  currency: string | null;
  client:
    | { full_name: string | null; email: string | null }
    | { full_name: string | null; email: string | null }[]
    | null;
  assigned_cleaner:
    | { full_name: string | null; email: string | null }
    | { full_name: string | null; email: string | null }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function weekBoundsLocal(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  return { from: fmt(monday), to: fmt(sunday) };
}

function serviceLabel(serviceType: string | null | undefined): string {
  const key = serviceType?.trim() ?? "";
  const match = ORDER_SERVICE_TYPES.find((item) => item.value === key);
  return match?.label ?? (key || "Cleaning");
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function orderPrice(row: DashboardOrderRow): number {
  if (typeof row.final_price === "number" && Number.isFinite(row.final_price)) {
    return row.final_price;
  }
  if (typeof row.estimated_price === "number" && Number.isFinite(row.estimated_price)) {
    return row.estimated_price;
  }
  return 0;
}

function mapDashboardOrder(
  row: DashboardOrderRow,
  attentionReason: string | null = null
): AdminDashboardOrderRow {
  const client = unwrapRelation(row.client);
  const cleaner = unwrapRelation(row.assigned_cleaner);
  const status = row.status?.trim() || "new";

  const clientName =
    client?.full_name?.trim() ||
    client?.email?.trim() ||
    "Unknown client";

  const cleanerName =
    cleaner?.full_name?.trim() || cleaner?.email?.trim() || null;

  return {
    orderId: String(row.id),
    displayId: formatOrderDisplayId(row.id, row.order_number),
    status,
    statusLabel: getOrderStatusLabel(status),
    scheduledDate: row.scheduled_date?.slice(0, 10) ?? "",
    scheduledTime: formatTime(row.scheduled_time),
    serviceType: row.service_type?.trim() || "",
    serviceLabel: serviceLabel(row.service_type),
    clientName,
    cleanerName,
    attentionReason,
  };
}

function attentionReasonFor(row: DashboardOrderRow): string | null {
  const status = (row.status ?? "").toLowerCase().replace(/-/g, "_");
  const reasons: string[] = [];

  if (status === "searching_cleaner") {
    reasons.push("Searching cleaner");
  }
  if (status === "problem") {
    reasons.push("Problem reported");
  }
  if (status === "completed" && row.payment_status?.toLowerCase() !== "paid") {
    reasons.push("Completed with outstanding balance");
  }
  if (!row.assigned_cleaner_id) {
    const normalized = normalizeOrderStatus(status);
    if (!TERMINAL_STATUSES.has(normalized) && normalized !== "searching_cleaner") {
      reasons.push("No cleaner assigned");
    }
  }

  return reasons.length > 0 ? reasons.join(" · ") : null;
}

function needsAttention(row: DashboardOrderRow): boolean {
  return attentionReasonFor(row) !== null;
}

function compareSchedule(a: DashboardOrderRow, b: DashboardOrderRow): number {
  const timeA = formatTime(a.scheduled_time);
  const timeB = formatTime(b.scheduled_time);
  if (timeA === "—" && timeB === "—") return 0;
  if (timeA === "—") return 1;
  if (timeB === "—") return -1;
  return timeA.localeCompare(timeB);
}

export async function getAdminDashboardStats(
  supabase: SupabaseClient
): Promise<{ data: AdminDashboardData | null; error: string | null }> {
  const today = todayIsoLocal();
  const week = weekBoundsLocal();
  const awaitingThresholdHours = 6;
  const nowIso = new Date().toISOString();

  const [
    totalResult,
    todayResult,
    searchingResult,
    inProgressResult,
    completedWeekResult,
    ordersForAttention,
    completedOutstandingResult,
    awaitingConfirmResult,
    expiredTokensResult,
    todayScheduleResult,
    recentHistoryResult,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("scheduled_date", today),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "searching_cleaner"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("orders")
      .select("estimated_price, final_price, currency")
      .eq("status", "completed")
      .gte("scheduled_date", week.from)
      .lte("scheduled_date", week.to),
    supabase
      .from("orders")
      .select(DASHBOARD_ORDER_SELECT)
      .or(
        "status.eq.searching_cleaner,status.eq.problem,assigned_cleaner_id.is.null"
      )
      .limit(40),
    supabase
      .from("orders")
      .select(DASHBOARD_ORDER_SELECT)
      .eq("status", "completed")
      .neq("payment_status", "paid")
      .limit(30),
    supabase
      .from("orders")
      .select(DASHBOARD_ORDER_SELECT)
      .eq("status", "awaiting_confirmation")
      .lt("created_at", isoHoursAgo(awaitingThresholdHours))
      .limit(40),
    supabase
      .from("order_confirmation_tokens")
      .select("order_id")
      .is("used_at", null)
      .lt("expires_at", nowIso)
      .limit(100),
    supabase
      .from("orders")
      .select(DASHBOARD_ORDER_SELECT)
      .eq("scheduled_date", today)
      .order("scheduled_time", { ascending: true, nullsFirst: false }),
    supabase
      .from("order_status_history")
      .select(
        `
        id,
        order_id,
        old_status,
        new_status,
        comment,
        created_at,
        changed_by
      `
      )
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const firstError =
    totalResult.error ??
    todayResult.error ??
    searchingResult.error ??
    inProgressResult.error ??
    completedWeekResult.error ??
    ordersForAttention.error ??
    completedOutstandingResult.error ??
    awaitingConfirmResult.error ??
    expiredTokensResult.error ??
    todayScheduleResult.error ??
    recentHistoryResult.error;

  if (firstError) {
    console.error("getAdminDashboardStats:", firstError);
    return { data: null, error: firstError.message };
  }

  const completedWeekRows = (completedWeekResult.data ?? []) as Pick<
    DashboardOrderRow,
    "estimated_price" | "final_price" | "currency"
  >[];

  let revenueThisWeek = 0;
  let currency = "EUR";
  for (const row of completedWeekRows) {
    revenueThisWeek += orderPrice(row as DashboardOrderRow);
    if (row.currency?.trim()) {
      currency = row.currency.toUpperCase();
    }
  }

  const expiredOrderIds = [
    ...new Set(
      (expiredTokensResult.data ?? [])
        .map((row) => (row as { order_id?: string | null }).order_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  let expiredOrderRows: DashboardOrderRow[] = [];
  if (expiredOrderIds.length > 0) {
    const { data: rows, error: expiredOrdersError } = await supabase
      .from("orders")
      .select(DASHBOARD_ORDER_SELECT)
      .in("id", expiredOrderIds)
      .limit(100);
    if (expiredOrdersError) {
      console.error("getAdminDashboardStats expired orders:", expiredOrdersError);
    } else {
      expiredOrderRows = (rows ?? []) as DashboardOrderRow[];
    }
  }

  const attentionSource = [
    ...((ordersForAttention.data ?? []) as DashboardOrderRow[]),
    ...((completedOutstandingResult.data ?? []) as DashboardOrderRow[]),
    ...((awaitingConfirmResult.data ?? []) as DashboardOrderRow[]),
    ...expiredOrderRows,
    ...((todayScheduleResult.data ?? []) as DashboardOrderRow[]),
  ];
  const dedupedAttentionRows = Array.from(
    new Map(attentionSource.map((row) => [String(row.id), row])).values()
  );
  const extraReasonMap = new Map<string, string[]>();
  for (const row of ((awaitingConfirmResult.data ?? []) as DashboardOrderRow[])) {
    const key = String(row.id);
    const list = extraReasonMap.get(key) ?? [];
    list.push("Client has not confirmed order");
    extraReasonMap.set(key, list);
  }
  for (const row of expiredOrderRows) {
    const key = String(row.id);
    const list = extraReasonMap.get(key) ?? [];
    list.push("Confirmation link expired");
    extraReasonMap.set(key, list);
  }

  const todayAssignedOrders = ((todayScheduleResult.data ?? []) as DashboardOrderRow[]).filter(
    (row) => Boolean(row.assigned_cleaner_id)
  );
  const cleanerIdsToday = [
    ...new Set(todayAssignedOrders.map((row) => row.assigned_cleaner_id).filter((id): id is string => Boolean(id))),
  ];
  if (cleanerIdsToday.length > 0) {
    const [{ data: cleanerProfiles }, { data: availabilityRows }] = await Promise.all([
      supabase
        .from("cleaner_profiles")
        .select("profile_id, max_daily_hours, max_orders_per_day, is_accepting_orders")
        .in("profile_id", cleanerIdsToday),
      supabase
        .from("cleaner_availability")
        .select("cleaner_id, status")
        .in("cleaner_id", cleanerIdsToday)
        .eq("date", today),
    ]);

    const profileMap = new Map<
      string,
      { maxDailyHours: number; maxOrdersPerDay: number; isAcceptingOrders: boolean }
    >();
    for (const row of cleanerProfiles ?? []) {
      const cleanerId = (row as { profile_id?: string | null }).profile_id;
      if (!cleanerId) continue;
      profileMap.set(cleanerId, {
        maxDailyHours: Math.max(1, Number((row as { max_daily_hours?: number | null }).max_daily_hours ?? 8)),
        maxOrdersPerDay: Math.max(1, Number((row as { max_orders_per_day?: number | null }).max_orders_per_day ?? 4)),
        isAcceptingOrders: (row as { is_accepting_orders?: boolean | null }).is_accepting_orders !== false,
      });
    }

    const availabilityMap = new Map<string, string>();
    for (const row of availabilityRows ?? []) {
      const cleanerId = (row as { cleaner_id?: string | null }).cleaner_id;
      const status = (row as { status?: string | null }).status;
      if (cleanerId && status) availabilityMap.set(cleanerId, status);
    }

    const ordersByCleaner = new Map<string, DashboardOrderRow[]>();
    for (const row of todayAssignedOrders) {
      const cleanerId = row.assigned_cleaner_id as string;
      const list = ordersByCleaner.get(cleanerId) ?? [];
      list.push(row);
      ordersByCleaner.set(cleanerId, list);
    }

    for (const [cleanerId, rows] of ordersByCleaner) {
      const settings = profileMap.get(cleanerId) ?? {
        maxDailyHours: 8,
        maxOrdersPerDay: 4,
        isAcceptingOrders: true,
      };
      const workload = calculateCleanerWorkload({
        orders: rows.map((row) => ({
          scheduled_time: row.scheduled_time,
          estimated_duration_minutes: 180,
        })),
        maxDailyHours: settings.maxDailyHours,
        maxOrdersPerDay: settings.maxOrdersPerDay,
      });
      const unavailableStatus = availabilityMap.get(cleanerId);

      for (const row of rows) {
        const key = String(row.id);
        const list = extraReasonMap.get(key) ?? [];
        if (workload.overlaps > 0) list.push("Cleaner with overlaps");
        if (workload.exceedsMaxHours || workload.exceedsMaxOrders) {
          list.push("Overloaded cleaner");
        }
        if (
          unavailableStatus &&
          unavailableStatus !== "available" &&
          unavailableStatus !== "preferred_day_off"
        ) {
          list.push("Unavailable cleaner assigned");
        }
        if (!settings.isAcceptingOrders) {
          list.push("Cleaner not accepting orders");
        }
        if (list.length > 0) extraReasonMap.set(key, list);
      }
    }
  }

  const attentionOrders = dedupedAttentionRows
    .filter((row) => {
      if (needsAttention(row)) return true;
      return (extraReasonMap.get(String(row.id))?.length ?? 0) > 0;
    })
    .map((row) => {
      const base = attentionReasonFor(row);
      const extras = extraReasonMap.get(String(row.id)) ?? [];
      const parts = [base, ...extras].filter(Boolean) as string[];
      return mapDashboardOrder(row, parts.length > 0 ? parts.join(" · ") : null);
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 12);

  const todaySchedule = ((todayScheduleResult.data ?? []) as DashboardOrderRow[])
    .sort(compareSchedule)
    .map((row) => mapDashboardOrder(row))
    .slice(0, 20);

  const historyRows = recentHistoryResult.data ?? [];
  const historyOrderIds = [
    ...new Set(
      historyRows
        .map((row) => String((row as { order_id: string }).order_id))
        .filter(Boolean)
    ),
  ];

  const orderDisplayMap = new Map<string, string>();
  if (historyOrderIds.length > 0) {
    const { data: orderRefs, error: orderRefsError } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("id", historyOrderIds);

    if (orderRefsError) {
      console.error("getAdminDashboardStats order refs:", orderRefsError);
    } else {
      for (const ref of orderRefs ?? []) {
        orderDisplayMap.set(
          String(ref.id),
          formatOrderDisplayId(ref.id, ref.order_number)
        );
      }
    }
  }

  const profileIds = [
    ...new Set(
      historyRows
        .map((row) => (row as { changed_by: string | null }).changed_by)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const profileMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", profileIds);

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile);
    }
  }

  const recentActivity: AdminDashboardActivityItem[] = historyRows.map((row) => {
    const record = row as {
      id: string;
      order_id: string;
      old_status: string | null;
      new_status: string | null;
      comment: string | null;
      created_at: string;
      changed_by: string | null;
    };

    const oldStatus = normalizeOrderStatus(record.old_status);
    const newStatus = normalizeOrderStatus(record.new_status);
    const profile = record.changed_by
      ? profileMap.get(record.changed_by)
      : null;
    const actorName =
      profile?.full_name?.trim() ||
      profile?.email?.trim() ||
      "System";

    return {
      id: String(record.id),
      orderId: String(record.order_id),
      orderDisplayId:
        orderDisplayMap.get(String(record.order_id)) ??
        formatOrderDisplayId(record.order_id),
      oldStatus,
      newStatus,
      oldStatusLabel: getOrderStatusLabel(oldStatus),
      newStatusLabel: getOrderStatusLabel(newStatus),
      isNote: oldStatus === newStatus,
      actorName,
      comment: record.comment?.trim() || null,
      createdAt: record.created_at,
    };
  });

  return {
    data: {
      kpis: {
        totalOrders: totalResult.count ?? 0,
        todayOrders: todayResult.count ?? 0,
        searchingCleaner: searchingResult.count ?? 0,
        inProgress: inProgressResult.count ?? 0,
        completedThisWeek: completedWeekRows.length,
        revenueThisWeek,
        currency,
      },
      attentionOrders,
      todaySchedule,
      recentActivity,
    },
    error: null,
  };
}
