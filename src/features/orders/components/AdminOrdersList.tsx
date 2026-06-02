"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import OrderCard from "@/components/orders/OrdersCard";
import type { Order } from "@/entities/order/order.types";
import AdminOrdersFilters, {
  buildOrdersQueryString,
  EMPTY_ADMIN_ORDERS_FILTERS,
  hasActiveOrdersFilters,
  parseOrdersFilterStateFromSearchParams,
  type AdminOrdersFilterState,
} from "@/features/orders/components/AdminOrdersFilters";
import { normalizeOrdersFromApi } from "@/features/orders/lib/normalize-orders";
import type { AdminOrdersApiResponse } from "@/features/orders/types/admin-orders-api.types";
import { useT } from "@/i18n/useT";

type LoadState = "loading" | "idle";

export default function AdminOrdersList() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientCreatedBanner, setClientCreatedBanner] = useState(false);

  const filtersFromUrl = useMemo(
    () => parseOrdersFilterStateFromSearchParams(searchParams),
    [searchParams]
  );

  const [searchInput, setSearchInput] = useState(filtersFromUrl.search);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(filtersFromUrl.search);
  }, [filtersFromUrl.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput === filtersFromUrl.search) return;
      const next: AdminOrdersFilterState = {
        ...filtersFromUrl,
        search: searchInput,
      };
      router.replace(`/app/admin/orders${buildOrdersQueryString(next)}`, {
        scroll: false,
      });
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput, filtersFromUrl, router]);

  const loadOrders = useCallback(async (filters: AdminOrdersFilterState) => {
    setLoadState("loading");
    setError(null);

    try {
      const query = buildOrdersQueryString(filters);
      const response = await fetch(`/api/admin/orders${query}`, {
        credentials: "include",
      });

      const json = (await response.json()) as AdminOrdersApiResponse;

      if (!response.ok || json.error) {
        setOrders([]);
        setError(json.error ?? "Failed to load orders");
        return;
      }

      setOrders(normalizeOrdersFromApi(json.data));
    } catch {
      setOrders([]);
      setError("Failed to load orders");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    void loadOrders(filtersFromUrl);
  }, [filtersFromUrl, loadOrders]);

  useEffect(() => {
    const flag = searchParams.get("clientCreated");
    if (flag === "1") {
      setClientCreatedBanner(true);
      // Strip the flag from URL so refresh doesn't keep showing it.
      const next = new URLSearchParams(searchParams.toString());
      next.delete("clientCreated");
      const suffix = next.toString();
      router.replace(`/app/admin/orders${suffix ? `?${suffix}` : ""}`, {
        scroll: false,
      });
    }
  }, [searchParams, router]);

  const updateFilters = (next: AdminOrdersFilterState) => {
    router.replace(`/app/admin/orders${buildOrdersQueryString(next)}`, {
      scroll: false,
    });
  };

  const refreshOrders = () => loadOrders(filtersFromUrl);

  const isLoading = loadState === "loading";
  const activeFilters = hasActiveOrdersFilters(filtersFromUrl);

  const countLabel = useMemo(() => {
    if (isLoading) return null;
    if (orders.length === 0) {
      return activeFilters ? "No orders match filters" : "No orders yet";
    }
    return `${orders.length} order${orders.length === 1 ? "" : "s"} found`;
  }, [isLoading, orders.length, activeFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            {t("nav.orders")}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Manage bookings, assignments and order statuses.
          </p>
          {clientCreatedBanner ? (
            <div className="mt-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
              Client profile was created automatically.
            </div>
          ) : null}
          {countLabel ? (
            <p className="mt-2 text-xs font-medium text-slate-400">{countLabel}</p>
          ) : null}
        </div>

        <Link
          href="/app/admin/orders/new"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f]"
        >
          + {t("common.addOrder")}
        </Link>
      </div>

      <AdminOrdersFilters
        filters={{ ...filtersFromUrl, search: searchInput }}
        onChange={(next) => {
          if (next.search !== searchInput) {
            setSearchInput(next.search);
            return;
          }
          updateFilters(next);
        }}
        onReset={() => {
          setSearchInput("");
          router.replace("/app/admin/orders", { scroll: false });
        }}
      />

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          {t("common.loading")}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load orders: {error}
        </div>
      ) : null}

      {!isLoading && !error && orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">No orders found</p>
          <p className="mt-2 text-sm text-slate-500">
            {activeFilters
              ? "Try adjusting filters or reset them to see all orders."
              : "Create your first order to get started."}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && orders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.routeId}
              order={order}
              onChanged={refreshOrders}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
