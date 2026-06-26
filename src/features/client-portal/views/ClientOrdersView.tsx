"use client";

import { useEffect, useState } from "react";
import { fetchClientOrders } from "../api/client-portal-api";
import { mapClientOrderToPortal } from "../lib/portal-order.mapper";
import { PORTAL_GREETING_CLASS, PORTAL_MUTED_CLASS } from "../lib/portal-styles";
import PortalOrderCard from "../components/PortalOrderCard";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";

export default function ClientOrdersView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ReturnType<typeof mapClientOrderToPortal>[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClientOrders();
        if (!cancelled) {
          setOrders(data.map(mapClientOrderToPortal));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayOrders = orders;

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading orders…</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className={PORTAL_GREETING_CLASS}>My Orders</h1>
        <p className={`${PORTAL_MUTED_CLASS} mt-1`}>
          {orders.length} booking{orders.length === 1 ? "" : "s"} in your history
        </p>
      </header>

      {orders.length === 0 ? (
        <PortalEmptyState
          title="No orders yet"
          description="When you book a cleaning, your orders will show up here."
          action={
            <PortalPrimaryButton href="/booking">Book Cleaning</PortalPrimaryButton>
          }
        />
      ) : (
        <div className="space-y-5 lg:space-y-4">
          {displayOrders.map((order) => (
            <PortalOrderCard key={order.id} order={order} variant="list" showRepeatBooking />
          ))}
        </div>
      )}
    </div>
  );
}
