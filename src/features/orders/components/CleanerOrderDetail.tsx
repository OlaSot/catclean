"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CleanerOrderDetail } from "@/entities/order/cleaner-order.types";
import {
  displayValue,
  formatOrderDate,
  formatOrderMoney,
} from "@/features/orders/lib/format-order-display";
import CleanerOrderFilesCard from "@/features/orders/components/CleanerOrderFilesCard";
import OrderServiceDetailsCard from "@/features/orders/components/OrderServiceDetailsCard";
import type { CleanerOrderDetailApiResponse } from "@/features/orders/types/cleaner-order-detail-api.types";

type LoadState = "loading" | "idle";

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 sm:text-right">{value}</dd>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
      {label}
    </span>
  );
}

type CleanerOrderDetailProps = {
  orderId: string;
};

export default function CleanerOrderDetailView({
  orderId,
}: CleanerOrderDetailProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [order, setOrder] = useState<CleanerOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"start" | "complete" | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch(`/api/cleaner/orders/${orderId}`, {
        credentials: "include",
      });
      const json = (await response.json()) as CleanerOrderDetailApiResponse;

      if (!response.ok || json.error || !json.data) {
        setOrder(null);
        setError(json.error ?? "Failed to load order");
        return;
      }

      setOrder(json.data);
    } catch {
      setOrder(null);
      setError("Failed to load order");
    } finally {
      setLoadState("idle");
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const runAction = async (action: "start" | "complete") => {
    setActionLoading(action);
    setActionError(null);
    setActionSuccess(null);

    const path =
      action === "start"
        ? `/api/cleaner/orders/${orderId}/start`
        : `/api/cleaner/orders/${orderId}/complete`;

    try {
      const response = await fetch(path, {
        method: "PATCH",
        credentials: "include",
      });
      const json = (await response.json()) as CleanerOrderDetailApiResponse;

      if (!response.ok || json.error || !json.data) {
        setActionError(json.error ?? "Action failed");
        return;
      }

      setOrder(json.data);
      setActionSuccess(
        action === "start"
          ? "Cleaning started."
          : "Cleaning completed."
      );
    } catch {
      setActionError("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const isLoading = loadState === "loading";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] px-6 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link
          href="/app/cleaner"
          className="text-sm font-medium text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          ← Back to my orders
        </Link>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
            Loading order...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && !order ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-base font-medium text-slate-700">Order not found</p>
          </div>
        ) : null}

        {!isLoading && !error && order ? (
          <>
            <header className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Order</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                    #{order.id}
                  </h1>
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {formatOrderDate(order.scheduledDate)}
                    </span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="font-semibold text-slate-800">
                      {order.scheduledTime}
                    </span>
                  </p>
                </div>
                <StatusPill label={order.statusLabel} />
              </div>
            </header>

            <DetailCard title="Address">
              <dl className="space-y-4">
                <DetailRow label="Address" value={order.address.line} />
                <DetailRow
                  label="Floor"
                  value={displayValue(order.address.floor)}
                />
                <DetailRow
                  label="Doorbell"
                  value={displayValue(order.doorbell)}
                />
              </dl>
            </DetailCard>

            <DetailCard title="Client">
              <dl className="space-y-4">
                <DetailRow label="Name" value={order.client.name} />
                <DetailRow label="Email" value={order.client.email} />
                <DetailRow label="Phone" value={order.client.phone} />
              </dl>
            </DetailCard>

            <DetailCard title="Service">
              <dl className="space-y-4">
                <DetailRow label="Service type" value={order.serviceTypeLabel} />
                <DetailRow
                  label="Estimated price"
                  value={formatOrderMoney(order.estimatedPrice, order.currency)}
                />
                <div>
                  <dt className="text-sm text-slate-500">Customer comment</dt>
                  <dd className="mt-2 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3 text-sm text-slate-700">
                    {displayValue(order.customerComment)}
                  </dd>
                </div>
              </dl>
            </DetailCard>

            <OrderServiceDetailsCard
              serviceLabel={order.serviceTypeLabel}
              serviceDetails={order.serviceDetails}
              operationalNotes={order.operationalNotes}
              audience="cleaner"
            />

            <DetailCard title="Assignment">
              <dl className="space-y-4">
                <DetailRow
                  label="Assignment status"
                  value={displayValue(order.assignment?.status)}
                />
                <DetailRow
                  label="Completed at"
                  value={
                    order.assignment?.completedAt
                      ? new Date(order.assignment.completedAt).toLocaleString()
                      : "—"
                  }
                />
              </dl>
            </DetailCard>

            <DetailCard title="Payout">
              <dl className="space-y-4">
                <DetailRow
                  label="Expected payout"
                  value={formatOrderMoney(order.expectedPayout, order.currency)}
                />
                <DetailRow
                  label="Payout status"
                  value={displayValue(order.payoutStatus)}
                />
                <DetailRow
                  label="Payout note"
                  value={displayValue(order.payoutNote)}
                />
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Payout records are managed by admin/operator.
              </p>
            </DetailCard>

            <DetailCard title="Cleaner photos">
              <CleanerOrderFilesCard orderId={orderId} />
            </DetailCard>

            <DetailCard title="Actions">
              {actionError ? (
                <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionError}
                </p>
              ) : null}

              {actionSuccess ? (
                <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {actionSuccess}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {order.canStart ? (
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => runAction("start")}
                    className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === "start"
                      ? "Starting..."
                      : "Start cleaning"}
                  </button>
                ) : null}

                {order.canComplete ? (
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => runAction("complete")}
                    className="inline-flex items-center justify-center rounded-full border border-[#34597E] bg-white px-5 py-2.5 text-sm font-semibold text-[#34597E] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === "complete"
                      ? "Completing..."
                      : "Complete cleaning"}
                  </button>
                ) : null}

                {!order.canStart && !order.canComplete ? (
                  <p className="text-sm text-slate-500">
                    No actions available for the current status.
                  </p>
                ) : null}
              </div>
            </DetailCard>
          </>
        ) : null}
      </div>
    </div>
  );
}
