"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CleanerOrder } from "@/entities/order/cleaner-order.types";
import CleanerOrderCard from "@/features/orders/components/CleanerOrderCard";
import type { CleanerOrdersApiResponse } from "@/features/orders/types/cleaner-orders-api.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

type LoadState = "loading" | "idle";

export default function CleanerOrdersList() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [orders, setOrders] = useState<CleanerOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (cancelled) return;
      setCurrentUserId(data.user?.id ?? null);
      if (userError) {
        setRawError((prev) => prev ?? userError.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isDev, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadState("loading");
      setError(null);
      setRawError(null);

      try {
        const response = await fetch("/api/cleaner/orders", {
          credentials: "include",
        });

        const json = (await response.json()) as CleanerOrdersApiResponse;

        if (cancelled) return;

        if (!response.ok || json.error) {
          setOrders([]);
          const message = json.error ?? "Failed to load orders";
          setError(message);
          setRawError(
            `HTTP ${response.status}: ${message}`
          );
          return;
        }

        setOrders(json.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError("Failed to load orders");
          setRawError(
            err instanceof Error ? err.message : "Failed to load orders"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadState("idle");
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const isLoading = loadState === "loading";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
              My orders
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isLoading
                ? "Loading your assignments..."
                : orders.length === 0
                  ? "No assigned orders yet"
                  : `${orders.length} assigned order${orders.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
          >
            Log out
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
            Loading orders...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <p className="text-base font-medium text-slate-700">
              No assigned orders yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              When an admin assigns you to a job, it will appear here.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <div className="mt-8 flex flex-col gap-5">
            {orders.map((order) => (
              <CleanerOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : null}

        {isDev ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
            <p>currentUserId: {currentUserId ?? "(unknown)"}</p>
            <p>orders count: {orders.length}</p>
            <p>raw error: {rawError ?? "(none)"}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
