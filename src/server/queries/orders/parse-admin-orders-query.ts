import { ORDER_STATUSES } from "@/lib/constants/order-status";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import type {
  AdminOrdersAssignedFilter,
  AdminOrdersFilters,
} from "@/server/queries/orders/admin-orders-filters";

const STATUS_SET = new Set<string>(ORDER_STATUSES.map((item) => item.value));
const PAYMENT_STATUS_SET = new Set(["unpaid", "paid", "card_hold"]);
const SERVICE_TYPE_SET = new Set<string>(
  ORDER_SERVICE_TYPES.map((item) => item.value)
);
const ASSIGNED_SET = new Set<AdminOrdersAssignedFilter>([
  "all",
  "assigned",
  "unassigned",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !ISO_DATE.test(trimmed)) return undefined;
  return trimmed;
}

export function parseAdminOrdersQuery(
  searchParams: URLSearchParams
): AdminOrdersFilters {
  const filters: AdminOrdersFilters = {};

  const search = searchParams.get("search")?.trim();
  if (search) filters.search = search;

  const status = searchParams.get("status")?.trim().toLowerCase().replace(/-/g, "_");
  if (status && status !== "all" && STATUS_SET.has(status)) {
    filters.status = status;
  }

  const paymentStatus = searchParams
    .get("payment_status")
    ?.trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (paymentStatus && paymentStatus !== "all" && PAYMENT_STATUS_SET.has(paymentStatus)) {
    filters.payment_status = paymentStatus;
  }

  const serviceType = searchParams.get("service_type")?.trim();
  if (serviceType && serviceType !== "all" && SERVICE_TYPE_SET.has(serviceType)) {
    filters.service_type = serviceType;
  }

  const city = searchParams.get("city")?.trim();
  if (city) filters.city = city;

  const assigned = searchParams.get("assigned")?.trim().toLowerCase() as
    | AdminOrdersAssignedFilter
    | undefined;
  if (assigned && ASSIGNED_SET.has(assigned) && assigned !== "all") {
    filters.assigned = assigned;
  }

  const cleanerId = searchParams.get("cleaner_id")?.trim();
  if (cleanerId) filters.cleaner_id = cleanerId;

  const dateFrom = parseIsoDate(searchParams.get("date_from"));
  if (dateFrom) filters.date_from = dateFrom;

  const dateTo = parseIsoDate(searchParams.get("date_to"));
  if (dateTo) filters.date_to = dateTo;

  return filters;
}
