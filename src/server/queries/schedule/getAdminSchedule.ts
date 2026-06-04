import type {
  AdminScheduleCleaner,
  AdminScheduleCleanerRow,
  AdminScheduleData,
  AdminScheduleOrder,
} from "@/features/schedule/types/admin-schedule.types";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import {
  detectScheduleOverlap,
  parseScheduleDate,
  parseTimeToMinutes,
  SCHEDULE_DEFAULT_DURATION_MINUTES,
  todayIsoLocal,
} from "@/features/schedule/lib/schedule-time";
import { getOrderStatusLabel } from "@/lib/constants/order-status";
import {
  getBookingProductLabelEn,
  resolveBookingProductKey,
} from "@/lib/orders/booking-product-label";
import { normalizeOrderStatus } from "@/entities/order/order-status.utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminCleaners } from "@/server/queries/cleaners/getAdminCleaners";
import { enrichCleanerAvatarUrls } from "@/server/queries/cleaners/enrichCleanerAvatarUrls";
import { calculateCleanerWorkload } from "@/lib/schedule/calculate-cleaner-workload";

const SCHEDULE_ORDER_SELECT = `
  id,
  order_number,
  status,
  scheduled_date,
  scheduled_time,
  service_type,
  booking_product,
  currency,
  estimated_price,
  final_price,
  estimated_duration_minutes,
  assigned_cleaner_id,
  address:addresses (
    city,
    street,
    house_number,
    apartment,
    floor
  ),
  client:profiles!orders_client_id_fkey (
    full_name,
    email,
    phone
  ),
  assigned_cleaner:profiles!orders_assigned_cleaner_id_fkey (
    id,
    full_name,
    avatar_url
  )
`;

type AssignedCleanerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ScheduleOrderRow = {
  id: string;
  order_number: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  service_type: string | null;
  booking_product: string | null;
  currency: string | null;
  estimated_price: number | null;
  final_price: number | null;
  estimated_duration_minutes: number | null;
  assigned_cleaner_id: string | null;
  assigned_cleaner:
    | AssignedCleanerProfile
    | AssignedCleanerProfile[]
    | null;
  address:
    | {
        city: string | null;
        street: string | null;
        house_number: string | null;
        apartment: string | null;
        floor: string | null;
      }
    | {
        city: string | null;
        street: string | null;
        house_number: string | null;
        apartment: string | null;
        floor: string | null;
      }[]
    | null;
  client:
    | { full_name: string | null; email: string | null; phone: string | null }
    | { full_name: string | null; email: string | null; phone: string | null }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function mapScheduleOrder(row: ScheduleOrderRow): AdminScheduleOrder {
  const address = unwrapRelation(row.address);
  const client = unwrapRelation(row.client);
  const statusRaw = row.status ?? "new";
  const status = normalizeOrderStatus(statusRaw);
  const startMinutes = parseTimeToMinutes(row.scheduled_time);
  const duration =
    row.estimated_duration_minutes != null &&
    Number.isFinite(row.estimated_duration_minutes) &&
    row.estimated_duration_minutes > 0
      ? Math.round(row.estimated_duration_minutes)
      : SCHEDULE_DEFAULT_DURATION_MINUTES;

  const street = address?.street?.trim() || "";
  const house = address?.house_number?.trim() || "";
  const city = address?.city?.trim() || "—";
  const line = [street, house].filter(Boolean).join(" ") || city;

  const price =
    row.final_price != null && Number.isFinite(row.final_price)
      ? row.final_price
      : row.estimated_price ?? 0;

  return {
    id: String(row.id),
    displayId: formatOrderDisplayId(row.id, row.order_number),
    status,
    statusLabel: getOrderStatusLabel(statusRaw),
    serviceType: row.service_type?.trim() || "—",
    bookingProduct: row.booking_product?.trim() || null,
    serviceTypeLabel: getBookingProductLabelEn(
      resolveBookingProductKey({
        bookingProduct: row.booking_product,
        serviceType: row.service_type,
      }),
      row.service_type
    ),
    scheduledDate: row.scheduled_date?.slice(0, 10) ?? "",
    scheduledTime: formatTime(row.scheduled_time),
    startMinutes,
    estimatedDurationMinutes: duration,
    address: { city, line },
    client: {
      name:
        client?.full_name?.trim() ||
        client?.email?.trim() ||
        client?.phone?.trim() ||
        "Unknown client",
      email: client?.email?.trim() || null,
      phone: client?.phone?.trim() || null,
    },
    price,
    currency: row.currency?.trim() || "EUR",
  };
}

function sortOrdersByTime(orders: AdminScheduleOrder[]): AdminScheduleOrder[] {
  return [...orders].sort((a, b) => {
    const ta = a.startMinutes ?? 24 * 60;
    const tb = b.startMinutes ?? 24 * 60;
    if (ta !== tb) return ta - tb;
    return a.displayId.localeCompare(b.displayId);
  });
}

function buildCleanerRow(
  cleaner: AdminScheduleCleaner,
  orders: AdminScheduleOrder[]
): AdminScheduleCleanerRow {
  const sorted = sortOrdersByTime(orders);
  const intervals = sorted
    .filter((o) => o.startMinutes != null)
    .map((o) => ({
      startMinutes: o.startMinutes!,
      endMinutes: o.startMinutes! + o.estimatedDurationMinutes,
    }));

  const workload = calculateCleanerWorkload({
    orders: sorted.map((o) => ({
      scheduled_time: o.scheduledTime,
      estimated_duration_minutes: o.estimatedDurationMinutes,
    })),
    maxDailyHours: cleaner.maxDailyHours,
    maxOrdersPerDay: cleaner.maxOrdersPerDay,
  });

  return {
    cleaner,
    orders: sorted,
    totalOrdersToday: workload.totalOrders,
    totalHoursToday: workload.totalHours,
    hasOverlap: detectScheduleOverlap(intervals),
    isFree: sorted.length === 0,
    exceedsMaxHours: workload.exceedsMaxHours,
    exceedsMaxOrders: workload.exceedsMaxOrders,
  };
}

export async function getAdminSchedule(
  supabase: SupabaseClient,
  options: {
    date?: string | null;
    cleanerId?: string | null;
  } = {}
): Promise<{ data: AdminScheduleData | null; error: string | null }> {
  const date =
    parseScheduleDate(options.date) ?? todayIsoLocal();
  const cleanerFilter = options.cleanerId?.trim() || null;

  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select(SCHEDULE_ORDER_SELECT)
    .eq("scheduled_date", date);

  if (ordersError) {
    console.error("getAdminSchedule orders:", ordersError);
    return { data: null, error: ordersError.message };
  }

  const typedRows = (orderRows ?? []) as ScheduleOrderRow[];
  const unassignedOrders: AdminScheduleOrder[] = [];
  const ordersByCleaner = new Map<string, AdminScheduleOrder[]>();

  for (const row of typedRows) {
    const order = mapScheduleOrder(row);
    const cleanerId = row.assigned_cleaner_id;
    if (!cleanerId) {
      unassignedOrders.push(order);
      continue;
    }
    const list = ordersByCleaner.get(cleanerId) ?? [];
    list.push(order);
    ordersByCleaner.set(cleanerId, list);
  }

  const unassignedSorted = sortOrdersByTime(unassignedOrders);

  const { cleaners: activeCleaners, error: cleanersError } = await getAdminCleaners({
    status: "active",
  });

  if (cleanersError) {
    console.error("getAdminSchedule cleaners:", cleanersError);
  }

  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("cleaner_availability")
    .select("cleaner_id, status, note")
    .eq("date", date);

  if (availabilityError) {
    console.error("getAdminSchedule cleaner_availability:", availabilityError);
  }

  const availabilityMap = new Map<
    string,
    { status: AdminScheduleCleaner["availabilityStatus"]; note: string | null }
  >();
  for (const row of availabilityRows ?? []) {
    const cleanerId = (row as { cleaner_id?: string | null }).cleaner_id;
    if (!cleanerId) continue;
    const status = (row as { status?: string | null }).status ?? null;
    const normalized =
      status === "available" ||
      status === "unavailable" ||
      status === "vacation" ||
      status === "sick" ||
      status === "preferred_day_off"
        ? status
        : null;
    availabilityMap.set(cleanerId, {
      status: normalized,
      note: ((row as { note?: string | null }).note ?? null)?.trim() || null,
    });
  }

  const enriched = await enrichCleanerAvatarUrls(activeCleaners);

  const cleanerMap = new Map<string, AdminScheduleCleaner>();

  for (const c of enriched) {
    cleanerMap.set(c.id, {
      id: c.id,
      fullName: c.name,
      avatarUrl: c.avatarUrl,
      city: c.baseCity,
      isAcceptingOrders: c.isAcceptingOrders,
      maxDailyHours: c.maxDailyHours,
      maxOrdersPerDay: c.maxOrdersPerDay,
      availabilityStatus: availabilityMap.get(c.id)?.status ?? null,
      availabilityNote: availabilityMap.get(c.id)?.note ?? null,
    });
  }

  for (const cleanerId of ordersByCleaner.keys()) {
    if (cleanerMap.has(cleanerId)) continue;
    const row = typedRows.find((r) => r.assigned_cleaner_id === cleanerId);
    const profile = unwrapRelation(
      row?.assigned_cleaner as
        | { id: string; full_name: string | null; avatar_url: string | null }
        | { id: string; full_name: string | null; avatar_url: string | null }[]
        | null
    );
    if (profile) {
      cleanerMap.set(cleanerId, {
        id: profile.id,
        fullName: profile.full_name?.trim() || "Cleaner",
        avatarUrl: profile.avatar_url,
        city: null,
        isAcceptingOrders: true,
        maxDailyHours: 8,
        maxOrdersPerDay: 4,
        availabilityStatus: availabilityMap.get(cleanerId)?.status ?? null,
        availabilityNote: availabilityMap.get(cleanerId)?.note ?? null,
      });
    }
  }

  let cleanerIds = [...cleanerMap.keys()].sort((a, b) => {
    const nameA = cleanerMap.get(a)?.fullName ?? "";
    const nameB = cleanerMap.get(b)?.fullName ?? "";
    return nameA.localeCompare(nameB);
  });

  if (cleanerFilter) {
    cleanerIds = cleanerIds.filter((id) => id === cleanerFilter);
    if (cleanerIds.length === 0 && ordersByCleaner.has(cleanerFilter)) {
      const row = typedRows.find((r) => r.assigned_cleaner_id === cleanerFilter);
      const profile = unwrapRelation(
        row?.assigned_cleaner as
          | { id: string; full_name: string | null; avatar_url: string | null }
          | { id: string; full_name: string | null; avatar_url: string | null }[]
          | null
      );
      cleanerMap.set(cleanerFilter, {
        id: cleanerFilter,
        fullName: profile?.full_name?.trim() || "Cleaner",
        avatarUrl: profile?.avatar_url ?? null,
        city: null,
        isAcceptingOrders: true,
        maxDailyHours: 8,
        maxOrdersPerDay: 4,
        availabilityStatus: availabilityMap.get(cleanerFilter)?.status ?? null,
        availabilityNote: availabilityMap.get(cleanerFilter)?.note ?? null,
      });
      cleanerIds = [cleanerFilter];
    }
  }

  const cleaners: AdminScheduleCleanerRow[] = cleanerIds.map((id) => {
    const cleaner = cleanerMap.get(id)!;
    const orders = ordersByCleaner.get(id) ?? [];
    return buildCleanerRow(cleaner, orders);
  });

  cleaners.sort((a, b) => {
    if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
    if (a.hasOverlap !== b.hasOverlap) return a.hasOverlap ? -1 : 1;
    return a.cleaner.fullName.localeCompare(b.cleaner.fullName);
  });

  return {
    data: {
      date,
      cleaners,
      unassignedOrders: unassignedSorted,
    },
    error: null,
  };
}
