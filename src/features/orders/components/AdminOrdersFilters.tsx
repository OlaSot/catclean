"use client";

import { ORDER_STATUSES } from "@/lib/constants/order-status";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import { StyledSelect } from "@/components/ui/StyledSelect";
import type { AdminOrdersAssignedFilter } from "@/server/queries/orders/admin-orders-filters";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/i18n/useT";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10";

const labelClassName =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export type AdminOrdersFilterState = {
  search: string;
  status: string;
  payment_status: string;
  service_type: string;
  city: string;
  assigned: AdminOrdersAssignedFilter;
  cleaner_id: string;
  date_from: string;
  date_to: string;
};

export const EMPTY_ADMIN_ORDERS_FILTERS: AdminOrdersFilterState = {
  search: "",
  status: "all",
  payment_status: "all",
  service_type: "all",
  city: "",
  assigned: "all",
  cleaner_id: "",
  date_from: "",
  date_to: "",
};

export function buildOrdersQueryString(filters: AdminOrdersFilterState): string {
  const params = new URLSearchParams();

  const search = filters.search.trim();
  if (search) params.set("search", search);

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.payment_status && filters.payment_status !== "all") {
    params.set("payment_status", filters.payment_status);
  }

  if (filters.service_type && filters.service_type !== "all") {
    params.set("service_type", filters.service_type);
  }

  const city = filters.city.trim();
  if (city) params.set("city", city);

  if (filters.assigned && filters.assigned !== "all") {
    params.set("assigned", filters.assigned);
  }

  if (filters.cleaner_id.trim()) {
    params.set("cleaner_id", filters.cleaner_id.trim());
  }

  if (filters.date_from.trim()) {
    params.set("date_from", filters.date_from.trim());
  }

  if (filters.date_to.trim()) {
    params.set("date_to", filters.date_to.trim());
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function parseOrdersFilterStateFromSearchParams(
  searchParams: URLSearchParams
): AdminOrdersFilterState {
  return {
    search: searchParams.get("search")?.trim() ?? "",
    status: searchParams.get("status")?.trim() || "all",
    payment_status: searchParams.get("payment_status")?.trim() || "all",
    service_type: searchParams.get("service_type")?.trim() || "all",
    city: searchParams.get("city")?.trim() ?? "",
    assigned:
      (searchParams.get("assigned")?.trim().toLowerCase() as AdminOrdersAssignedFilter) ||
      "all",
    cleaner_id: searchParams.get("cleaner_id")?.trim() ?? "",
    date_from: searchParams.get("date_from")?.trim() ?? "",
    date_to: searchParams.get("date_to")?.trim() ?? "",
  };
}

export function hasActiveOrdersFilters(filters: AdminOrdersFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.payment_status !== "all" ||
    filters.service_type !== "all" ||
    filters.city.trim() !== "" ||
    filters.assigned !== "all" ||
    filters.cleaner_id.trim() !== "" ||
    filters.date_from.trim() !== "" ||
    filters.date_to.trim() !== ""
  );
}

type AdminOrdersFiltersProps = {
  filters: AdminOrdersFilterState;
  onChange: (filters: AdminOrdersFilterState) => void;
  onReset: () => void;
};

export default function AdminOrdersFilters({
  filters,
  onChange,
  onReset,
}: AdminOrdersFiltersProps) {
  const { t, orderStatusLabel, paymentLabel } = useT();
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCleaners() {
      try {
        const res = await fetch("/api/admin/cleaners?status=active", {
          credentials: "include",
        });
        const json = (await res.json()) as AdminCleanersApiResponse;
        if (!cancelled && res.ok && !json.error) {
          setCleaners(json.data ?? []);
        }
      } catch {
        if (!cancelled) setCleaners([]);
      }
    }

    void loadCleaners();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: t("common.status") },
      ...ORDER_STATUSES.map((option) => ({
        value: option.value,
        label: orderStatusLabel(option.value),
      })),
    ],
    [orderStatusLabel, t]
  );

  const paymentOptions = useMemo(
    () => [
      { value: "all", label: "All payments" },
      { value: "unpaid", label: paymentLabel("unpaid") },
      { value: "paid", label: paymentLabel("paid") },
      { value: "card_hold", label: paymentLabel("card_hold") },
    ],
    [paymentLabel]
  );

  const serviceOptions = useMemo(
    () => [
      { value: "all", label: t("common.service") },
      ...ORDER_SERVICE_TYPES.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    ],
    [t]
  );

  const assignedOptions = useMemo(
    () => [
      { value: "all", label: t("nav.orders") },
      { value: "assigned", label: t("common.assignment") },
      { value: "unassigned", label: t("common.unassignedOrders") },
    ],
    [t]
  );

  const cleanerOptions = useMemo(
    () => [
      { value: "", label: t("common.cleaner") },
      ...cleaners.map((cleaner) => ({
        value: cleaner.id,
        label: `${cleaner.name}${cleaner.baseCity ? ` · ${cleaner.baseCity}` : ""}`,
      })),
    ],
    [cleaners, t]
  );

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-5 sm:py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">{t("orders.filters")}</p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          {t("orders.resetFilters")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <label className="block sm:col-span-2 lg:col-span-2">
          <span className={labelClassName}>{t("common.search")}</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Client, order #, phone, address…"
            className={fieldClassName}
          />
        </label>

        <div className="block">
          <span className={labelClassName}>{t("common.status")}</span>
          <StyledSelect
            value={filters.status}
            options={statusOptions}
            onChange={(status) => onChange({ ...filters, status })}
          />
        </div>

        <div className="block">
          <span className={labelClassName}>{t("common.payment")}</span>
          <StyledSelect
            value={filters.payment_status}
            options={paymentOptions}
            onChange={(payment_status) =>
              onChange({ ...filters, payment_status })
            }
          />
        </div>

        <div className="block">
          <span className={labelClassName}>{t("common.service")}</span>
          <StyledSelect
            value={filters.service_type}
            options={serviceOptions}
            onChange={(service_type) =>
              onChange({ ...filters, service_type })
            }
          />
        </div>

        <label className="block">
          <span className={labelClassName}>{t("common.city")}</span>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            placeholder="e.g. Hannover"
            className={fieldClassName}
          />
        </label>

        <div className="block">
          <span className={labelClassName}>{t("common.assignment")}</span>
          <StyledSelect
            value={filters.assigned}
            options={assignedOptions}
            onChange={(assigned) =>
              onChange({
                ...filters,
                assigned: assigned as AdminOrdersAssignedFilter,
              })
            }
          />
        </div>

        <div className="block sm:col-span-2">
          <span className={labelClassName}>{t("common.cleaner")}</span>
          <StyledSelect
            value={filters.cleaner_id}
            options={cleanerOptions}
            onChange={(cleaner_id) => onChange({ ...filters, cleaner_id })}
          />
        </div>

        <label className="block">
          <span className={labelClassName}>{t("common.from")}</span>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) =>
              onChange({ ...filters, date_from: e.target.value })
            }
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>{t("common.to")}</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
            className={fieldClassName}
          />
        </label>
      </div>
    </div>
  );
}
