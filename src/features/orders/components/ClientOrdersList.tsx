"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ClientOrder } from "@/entities/order/client-order.types";
import ClientOrderCard from "@/features/orders/components/ClientOrderCard";
import type { ClientOrdersApiResponse } from "@/features/orders/types/client-orders-api.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

type LoadState = "loading" | "idle";

export default function ClientOrdersList() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadState("loading");
      setError(null);

      try {
        const response = await fetch("/api/client/orders", {
          credentials: "include",
        });
        const json = (await response.json()) as ClientOrdersApiResponse;

        if (cancelled) return;

        if (!response.ok || json.error) {
          setOrders([]);
          setError(json.error ?? "Failed to load orders");
          return;
        }

        setOrders(json.data ?? []);
      } catch {
        if (!cancelled) {
          setOrders([]);
          setError("Failed to load orders");
        }
      } finally {
        if (!cancelled) {
          setLoadState("idle");
        }
      }
    }

    void loadOrders();

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
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
              My orders
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              View your cleaning bookings and manage them according to CatClean
              policies.
            </p>
            {!isLoading && !error ? (
              <p className="mt-3 text-xs font-medium text-slate-400">
                {orders.length === 0
                  ? "No orders yet"
                  : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
              </p>
            ) : null}
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
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            Loading orders...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to load orders: {error}
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-base font-medium text-slate-700">No orders yet</p>
            <p className="mt-2 text-sm text-slate-500">
              When you place a booking, it will appear here.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <ClientOrderCard key={order.routeId} order={order} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
