"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { OrderPaymentStatus } from "@/entities/order/order.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import type { AssignCleanerApiResponse } from "@/features/orders/types/assign-cleaner-api.types";
import type { SuggestedCleanersApiResponse, SuggestedCleanerCandidate } from "@/features/orders/types/suggested-cleaners-api.types";
import { displayValue } from "@/features/orders/lib/format-order-display";
import {
  canAssignCleanerToOrder,
} from "@/lib/orders/can-assign-cleaner";
import { useT } from "@/i18n/useT";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

type CleanerAssignmentFormProps = {
  orderId: string;
  scheduledDate: string;
  assignment: AdminOrderDetail["assignment"];
  canAssignCleaner: boolean;
  paymentStatus: OrderPaymentStatus;
  orderStatusRaw: string;
  orderStatusLabel: string;
  onAssigned: (order: AdminOrderDetail) => void;
};

export default function CleanerAssignmentForm({
  orderId,
  scheduledDate,
  assignment,
  canAssignCleaner,
  paymentStatus,
  orderStatusRaw,
  orderStatusLabel,
  onAssigned,
}: CleanerAssignmentFormProps) {
  const { t } = useT();
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);
  const [cleanersLoading, setCleanersLoading] = useState(true);
  const [cleanersError, setCleanersError] = useState<string | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [workloadInfo, setWorkloadInfo] = useState<{
    totalOrders: number;
    totalHours: number;
    overlaps: number;
    exceedsMaxHours: boolean;
    exceedsMaxOrders: boolean;
    availabilityStatus: string | null;
    availabilityNote: string | null;
    isAcceptingOrders: boolean;
  } | null>(null);
  const [suggestedCleaners, setSuggestedCleaners] = useState<SuggestedCleanerCandidate[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  const assignAllowed = useMemo(
    () => canAssignCleanerToOrder(orderStatusRaw),
    [orderStatusRaw]
  );

  const currentCleaner =
    assignment.cleaners.find((c) => c.id === assignment.assignedCleanerId) ??
    assignment.cleaners[0] ??
    null;

  useEffect(() => {
    let cancelled = false;

    async function loadCleaners() {
      setCleanersLoading(true);
      setCleanersError(null);

      try {
        const response = await fetch("/api/admin/cleaners?status=active", {
          credentials: "include",
        });
        const json = (await response.json()) as AdminCleanersApiResponse;

        if (cancelled) return;

        if (!response.ok || json.error) {
          setCleaners([]);
          setCleanersError(json.error ?? t("assignment.failedLoadCleaners"));
          return;
        }

        const list = json.data ?? [];
        setCleaners(list);

        if (assignment.assignedCleanerId) {
          setSelectedCleanerId(assignment.assignedCleanerId);
        } else if (list.length > 0) {
          setSelectedCleanerId(list[0].id);
        } else {
          setSelectedCleanerId("");
        }
      } catch {
        if (!cancelled) {
          setCleaners([]);
          setCleanersError(t("assignment.failedLoadCleaners"));
        }
      } finally {
        if (!cancelled) {
          setCleanersLoading(false);
        }
      }
    }

    loadCleaners();

    return () => {
      cancelled = true;
    };
  }, [assignment.assignedCleanerId]);

  useEffect(() => {
    let cancelled = false;
    async function loadWorkload() {
      if (!selectedCleanerId || !scheduledDate) {
        setWorkloadInfo(null);
        return;
      }
      try {
        const response = await fetch(
          `/api/admin/cleaners/workload?cleaner_id=${encodeURIComponent(selectedCleanerId)}&date=${encodeURIComponent(scheduledDate)}`,
          { credentials: "include" }
        );
        const json = (await response.json()) as {
          data:
            | {
                workload: {
                  totalOrders: number;
                  totalHours: number;
                  overlaps: number;
                  exceedsMaxHours: boolean;
                  exceedsMaxOrders: boolean;
                };
                availabilityStatus: string | null;
                availabilityNote: string | null;
                isAcceptingOrders: boolean;
              }
            | null;
        };
        if (cancelled || !response.ok || !json.data) return;
        setWorkloadInfo({
          ...json.data.workload,
          availabilityStatus: json.data.availabilityStatus,
          availabilityNote: json.data.availabilityNote,
          isAcceptingOrders: json.data.isAcceptingOrders,
        });
      } catch {
        if (!cancelled) setWorkloadInfo(null);
      }
    }
    void loadWorkload();
    return () => {
      cancelled = true;
    };
  }, [scheduledDate, selectedCleanerId]);

  useEffect(() => {
    if (assignment.assignedCleanerId) {
      setSelectedCleanerId(assignment.assignedCleanerId);
    }
  }, [assignment.assignedCleanerId]);

  async function assignCleaner(cleanerId: string) {
    if (!cleanerId || !assignAllowed) return;
    setIsAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/assign-cleaner`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cleanerId }),
        }
      );

      const json = (await response.json()) as AssignCleanerApiResponse;

      if (!response.ok || json.error || !json.data) {
        setAssignError(json.error ?? t("assignment.failedAssignCleaner"));
        return;
      }

      onAssigned(json.data);
      setAssignSuccess(true);
    } catch {
      setAssignError(t("assignment.failedAssignCleaner"));
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await assignCleaner(selectedCleanerId);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadSuggested() {
      setSuggestedLoading(true);
      try {
        const response = await fetch(
          `/api/admin/orders/${orderId}/suggested-cleaners`,
          { credentials: "include" }
        );
        const json = (await response.json()) as SuggestedCleanersApiResponse;
        if (cancelled) return;
        if (!response.ok || json.error || !json.data) {
          setSuggestedCleaners([]);
          return;
        }
        setSuggestedCleaners(json.data);
      } catch {
        if (!cancelled) setSuggestedCleaners([]);
      } finally {
        if (!cancelled) setSuggestedLoading(false);
      }
    }
    void loadSuggested();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("assignment.currentAssignedCleaner")}
        </p>
        {currentCleaner ? (
          <div className="mt-3 space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {currentCleaner.name}
            </p>
            <p className="text-sm text-slate-600">{currentCleaner.email}</p>
            <p className="text-sm text-slate-600">{currentCleaner.phone}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">{t("assignment.noCleanerAssignedYet")}</p>
        )}
      </div>

      {!assignAllowed ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("assignment.cannotAssignCleaner")} ({orderStatusLabel})
        </p>
      ) : null}

      {cleanersLoading ? (
        <p className="text-sm text-slate-500">{t("assignment.loadingActiveCleaners")}</p>
      ) : null}

      {cleanersError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {cleanersError}
        </p>
      ) : null}

      {assignAllowed &&
      !cleanersLoading &&
      !cleanersError &&
      cleaners.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-700">{t("assignment.noActiveCleanersFound")}</p>
          <p className="mt-2">
            {t("assignment.createCleanerHelper")}
          </p>
        </div>
      ) : null}

      {assignAllowed ? (
        <p className="text-xs text-slate-500">
          {t("assignment.helperDependsOnStatus")}
        </p>
      ) : null}

      {assignAllowed &&
      !cleanersLoading &&
      !cleanersError &&
      cleaners.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("assignment.suggestedCleaners")}
            </p>
            {suggestedLoading ? (
              <p className="text-xs text-slate-500">{t("common.loading")}</p>
            ) : suggestedCleaners.length === 0 ? (
              <p className="text-xs text-slate-500">{t("common.empty")}</p>
            ) : (
              <div className="space-y-2">
                {suggestedCleaners.map((candidate) => (
                  <div
                    key={candidate.cleaner.id}
                    className={`rounded-2xl border px-3 py-2.5 text-xs ${
                      candidate.preferredForClient
                        ? "border-indigo-200 bg-indigo-50/40"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {candidate.cleaner.name}
                          {candidate.cleaner.baseCity
                            ? ` · ${candidate.cleaner.baseCity}`
                            : ""}
                        </p>
                        <p className="text-slate-500">
                          score {candidate.score} · {candidate.workloadToday.totalOrders} orders ·{" "}
                          {candidate.workloadToday.totalHours}h
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isAssigning || !assignAllowed}
                        onClick={() => {
                          setSelectedCleanerId(candidate.cleaner.id);
                          void assignCleaner(candidate.cleaner.id);
                        }}
                        className="rounded-full bg-[#34597E] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Assign
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.preferredForClient ? (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                          {t("assignment.preferredCleaner")}
                        </span>
                      ) : null}
                      {candidate.reasons.slice(0, 4).map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                        >
                          {reason}
                        </span>
                      ))}
                      {candidate.warnings.slice(0, 3).map((warning) => (
                        <span
                          key={warning}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200"
                        >
                          {warning}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("assignment.selectCleaner")}
            </span>
            <select
              value={selectedCleanerId}
              onChange={(e) => setSelectedCleanerId(e.target.value)}
              disabled={isAssigning}
              className={`mt-2 ${selectClassName}`}
            >
              {cleaners.map((cleaner) => (
                <option
                  key={cleaner.id}
                  value={cleaner.id}
                  title={
                    cleaner.cleanerProfileId
                      ? `profiles.id=${cleaner.id}`
                      : cleaner.id
                  }
                >
                  {cleaner.name}
                  {cleaner.baseCity ? ` · ${cleaner.baseCity}` : ""}
                  {cleaner.rating != null ? ` · ★ ${cleaner.rating}` : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedCleanerId ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {(() => {
                const selected = cleaners.find((c) => c.id === selectedCleanerId);
                if (!selected) return null;
                return (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">Email</dt>
                      <dd>{selected.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Phone</dt>
                      <dd>{selected.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t("assignment.baseCity")}</dt>
                      <dd>{displayValue(selected.baseCity)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t("assignment.rating")}</dt>
                      <dd>
                        {selected.rating != null ? selected.rating : t("assignment.unknown")}
                      </dd>
                    </div>
                  </dl>
                );
              })()}
              {workloadInfo ? (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("assignment.workload")} ({scheduledDate})
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {workloadInfo.totalOrders} orders · {workloadInfo.totalHours}h
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {workloadInfo.overlaps > 0 ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
                        {t("assignment.overlapWarning")}
                      </span>
                    ) : null}
                    {workloadInfo.exceedsMaxHours || workloadInfo.exceedsMaxOrders ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                        {t("assignment.overloadWarning")}
                      </span>
                    ) : null}
                    {workloadInfo.availabilityStatus &&
                    workloadInfo.availabilityStatus !== "available" ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                        {t("assignment.unavailableWarning")}
                      </span>
                    ) : null}
                    {!workloadInfo.isAcceptingOrders ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {t("assignment.notAcceptingOrders")}
                      </span>
                    ) : null}
                  </div>
                  {workloadInfo.availabilityNote ? (
                    <p className="mt-2 text-xs text-slate-500">{workloadInfo.availabilityNote}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {assignError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {assignError}
            </p>
          ) : null}

          {assignSuccess ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t("assignment.assignedSuccessfully")}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isAssigning || !selectedCleanerId}
            className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAssigning ? t("assignment.assigningCleaner") : t("assignment.assignCleaner")}
          </button>
        </form>
      ) : null}

      {isDev ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
          <p>order.status: {orderStatusRaw}</p>
          <p>payment_status: {paymentStatus}</p>
          <p>canAssignCleaner (server): {String(canAssignCleaner)}</p>
          <p>assignAllowed (client): {String(assignAllowed)}</p>
          <p>cleaners count: {cleaners.length}</p>
          <p>selectedCleanerId (profiles.id): {selectedCleanerId || "(empty)"}</p>
        </div>
      ) : null}
    </div>
  );
}
