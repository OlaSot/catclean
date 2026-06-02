import type { SupabaseOrderRow } from "@/entities/order/order.supabase.types";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";

export type AdminOrdersAssignedFilter = "all" | "assigned" | "unassigned";

export type AdminOrdersFilters = {
  search?: string;
  status?: string;
  payment_status?: string;
  service_type?: string;
  city?: string;
  assigned?: AdminOrdersAssignedFilter;
  cleaner_id?: string;
  date_from?: string;
  date_to?: string;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function applyAdminOrdersRowFilters(
  rows: SupabaseOrderRow[],
  filters: AdminOrdersFilters
): SupabaseOrderRow[] {
  let result = rows;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    result = result.filter((row) => {
      const client = unwrapRelation(row.client);
      const address = unwrapRelation(row.address);
      const displayId = formatOrderDisplayId(row.id, row.order_number);
      const haystack = [
        client?.full_name,
        client?.email,
        client?.phone,
        displayId,
        row.order_number,
        String(row.id),
        address?.city,
        address?.street,
        address?.house_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  const city = filters.city?.trim().toLowerCase();
  if (city) {
    result = result.filter((row) => {
      const address = unwrapRelation(row.address);
      return (address?.city ?? "").toLowerCase().includes(city);
    });
  }

  return result;
}

export function hasActiveAdminOrdersFilters(
  filters: AdminOrdersFilters
): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.payment_status ||
      filters.service_type ||
      filters.city?.trim() ||
      (filters.assigned && filters.assigned !== "all") ||
      filters.cleaner_id ||
      filters.date_from ||
      filters.date_to
  );
}
