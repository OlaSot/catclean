"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { formatOrderMoney } from "@/features/orders/lib/format-order-display";
import {
  calculateCleanerPayout,
  DEFAULT_CLEANER_PAYOUT_PERCENT,
} from "@/lib/finance/calculate-cleaner-payout";
import type {
  AdminCreatePaymentRequestBody,
  AdminCreatePayoutRequestBody,
  AdminOrderFinanceApiResponse,
  CleanerPayoutRecordStatus,
  OrderPaymentMethod,
  OrderPaymentRecordStatus,
} from "@/features/finance/types/admin-order-finance.types";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import { useT } from "@/i18n/useT";

type LoadState = "loading" | "idle";

const PAYMENT_METHODS: { value: OrderPaymentMethod; key: string }[] = [
  { value: "cash", key: "payment.cash" },
  { value: "card", key: "payment.card" },
  { value: "bank_transfer", key: "payment.bankTransfer" },
  { value: "manual", key: "payment.manual" },
  { value: "other", key: "payment.other" },
];

const PAYMENT_STATUSES: { value: OrderPaymentRecordStatus; key: string }[] = [
  { value: "pending", key: "payment.pending" },
  { value: "paid", key: "payment.paid" },
  { value: "failed", key: "payment.failed" },
  { value: "refunded", key: "payment.refunded" },
];

const PAYOUT_STATUSES: { value: CleanerPayoutRecordStatus; key: string }[] = [
  { value: "pending", key: "status.pending" },
  { value: "paid", key: "status.paid" },
  { value: "cancelled", key: "status.cancelled" },
];

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function parseInputNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AdminOrderFinanceCard({
  orderId,
  assignedCleanerId,
  assignedCleaners,
  neededCleanersCount,
  orderStatus,
  currencyFallback = "EUR",
}: {
  orderId: string;
  assignedCleanerId: string | null;
  assignedCleaners: { id: string; name: string; email?: string; city?: string | null }[];
  neededCleanersCount: number;
  orderStatus: string;
  currencyFallback?: string;
}) {
  const { t, paymentLabel } = useT();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [finance, setFinance] = useState<AdminOrderFinanceApiResponse["data"]>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("cash");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentRecordStatus>("paid");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPercent, setPayoutPercent] = useState(
    String(DEFAULT_CLEANER_PAYOUT_PERCENT)
  );
  const [payoutAdjustmentAmount, setPayoutAdjustmentAmount] = useState("0");
  const [payoutAdjustmentReason, setPayoutAdjustmentReason] = useState("");
  const [payoutCleanerId, setPayoutCleanerId] = useState<string>(assignedCleanerId ?? "");
  const [payoutStatus, setPayoutStatus] = useState<CleanerPayoutRecordStatus>("pending");
  const [payoutNote, setPayoutNote] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutFormError, setPayoutFormError] = useState<string | null>(null);
  const [activeCleaners, setActiveCleaners] = useState<ActiveCleaner[]>([]);
  const [payoutRowSavingId, setPayoutRowSavingId] = useState<string | null>(null);
  const [payoutEdits, setPayoutEdits] = useState<
    Record<
      string,
      {
        payoutPercent: string;
        adjustmentAmount: string;
        adjustmentReason: string;
        amount: string;
        status: CleanerPayoutRecordStatus;
        note: string;
      }
    >
  >({});

  const load = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/finance`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminOrderFinanceApiResponse;
      if (!response.ok || json.error) {
        setFinance(null);
        setError(json.error ?? "Failed to load finance");
        return;
      }
      setFinance(json.data);
      setPayoutEdits({});
    } catch {
      setFinance(null);
      setError("Failed to load finance");
    } finally {
      setLoadState("idle");
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!assignedCleanerId) return;
    setPayoutCleanerId(assignedCleanerId);
  }, [assignedCleanerId]);

  useEffect(() => {
    if (assignedCleaners.length > 0) return;
    let cancelled = false;
    const loadActiveCleaners = async () => {
      try {
        const response = await fetch("/api/admin/cleaners?status=active", {
          credentials: "include",
        });
        const json = (await response.json()) as AdminCleanersApiResponse;
        if (!response.ok || json.error || !json.data || cancelled) return;
        setActiveCleaners(json.data);
      } catch {
        // non-blocking: fallback remains manual empty selection
      }
    };
    void loadActiveCleaners();
    return () => {
      cancelled = true;
    };
  }, [assignedCleaners.length]);

  const summary = finance?.summary ?? null;
  const currency = summary?.currency ?? currencyFallback;

  const paymentMethodOptions = useMemo(
    () => PAYMENT_METHODS.map((item) => ({ value: item.value, label: t(item.key) })),
    [t]
  );
  const paymentStatusOptions = useMemo(
    () => PAYMENT_STATUSES.map((item) => ({ value: item.value, label: t(item.key) })),
    [t]
  );
  const payoutStatusOptions = useMemo(
    () => PAYOUT_STATUSES.map((item) => ({ value: item.value, label: t(item.key) })),
    [t]
  );
  const cleanerDirectory = useMemo(() => {
    const map = new Map<string, { name: string; email: string | null; city: string | null }>();
    for (const cleaner of assignedCleaners) {
      map.set(cleaner.id, {
        name: cleaner.name,
        email: cleaner.email ?? null,
        city: cleaner.city ?? null,
      });
    }
    for (const cleaner of activeCleaners) {
      if (!map.has(cleaner.id)) {
        map.set(cleaner.id, {
          name: cleaner.name,
          email: cleaner.email,
          city: cleaner.baseCity,
        });
      }
    }
    return map;
  }, [assignedCleaners, activeCleaners]);
  const cleanerOptions = useMemo(() => {
    const source = assignedCleaners.length > 0
      ? assignedCleaners.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email ?? null,
          city: c.city ?? null,
        }))
      : activeCleaners.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          city: c.baseCity,
        }));
    return source.map((c) => ({
      value: c.id,
      label: `${c.name}${c.email ? ` · ${c.email}` : ""}${c.city ? ` · ${c.city}` : ""}`,
    }));
  }, [assignedCleaners, activeCleaners]);
  const selectedCleanerMeta = payoutCleanerId ? cleanerDirectory.get(payoutCleanerId) : null;
  const selectedCleanerInitials = (selectedCleanerMeta?.name ?? "Cleaner")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "C";

  useEffect(() => {
    if (payoutCleanerId) return;
    if (assignedCleanerId) {
      setPayoutCleanerId(assignedCleanerId);
      return;
    }
    if (cleanerOptions.length === 1) {
      setPayoutCleanerId(cleanerOptions[0].value);
    }
  }, [assignedCleanerId, cleanerOptions, payoutCleanerId]);
  const payoutPreview = useMemo(() => {
    const percentParsed = parseInputNumber(payoutPercent);
    const adjustmentParsed = parseInputNumber(payoutAdjustmentAmount) ?? 0;
    const manualParsed = parseInputNumber(payoutAmount);
    return calculateCleanerPayout({
      orderTotal: summary?.orderTotal ?? 0,
      payoutPercent: percentParsed ?? DEFAULT_CLEANER_PAYOUT_PERCENT,
      adjustmentAmount: adjustmentParsed,
      manualAmount: manualParsed,
    });
  }, [payoutPercent, payoutAdjustmentAmount, payoutAmount, summary?.orderTotal]);

  const savePayment = async () => {
    setPaymentSaving(true);
    setError(null);
    const body: AdminCreatePaymentRequestBody = {
      amount: paymentAmount,
      currency,
      method: paymentMethod,
      status: paymentStatus,
      note: paymentNote,
    };
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as {
        data: { finance: AdminOrderFinanceApiResponse["data"]; payment: unknown } | null;
        error: string | null;
      };
      if (!response.ok || json.error || !json.data?.finance) {
        setError(json.error ?? "Failed to save payment");
        return;
      }
      setFinance(json.data.finance);
      setPaymentAmount("");
      setPaymentNote("");
    } catch {
      setError("Failed to save payment");
    } finally {
      setPaymentSaving(false);
    }
  };

  const savePayout = async () => {
    setPayoutSaving(true);
    setError(null);
    setPayoutFormError(null);
    if (!payoutCleanerId) {
      setPayoutFormError("Please select a cleaner");
      setPayoutSaving(false);
      return;
    }
    const body: AdminCreatePayoutRequestBody = {
      cleanerId: payoutCleanerId,
      amount: payoutAmount,
      payoutPercent,
      adjustmentAmount: payoutAdjustmentAmount,
      adjustmentReason: payoutAdjustmentReason,
      currency,
      status: payoutStatus,
      note: payoutNote,
    };
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payouts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as {
        data: { finance: AdminOrderFinanceApiResponse["data"]; payout: unknown } | null;
        error: string | null;
      };
      if (!response.ok || json.error || !json.data?.finance) {
        setError(json.error ?? "Failed to save payout");
        return;
      }
      setFinance(json.data.finance);
      setPayoutAmount("");
      setPayoutPercent(String(DEFAULT_CLEANER_PAYOUT_PERCENT));
      setPayoutAdjustmentAmount("0");
      setPayoutAdjustmentReason("");
      setPayoutNote("");
      setPayoutFormError(null);
    } catch {
      setError("Failed to save payout");
    } finally {
      setPayoutSaving(false);
    }
  };

  const getRowEdit = (payoutId: string) => {
    const current = payoutEdits[payoutId];
    if (current) return current;
    const row = finance?.payouts.find((p) => p.id === payoutId);
    return {
      payoutPercent: String(row?.payoutPercent ?? DEFAULT_CLEANER_PAYOUT_PERCENT),
      adjustmentAmount: String(row?.adjustmentAmount ?? 0),
      adjustmentReason: row?.adjustmentReason ?? "",
      amount: row?.isManualOverride ? String(row?.amount ?? "") : "",
      status: (row?.status ?? "pending") as CleanerPayoutRecordStatus,
      note: row?.note ?? "",
    };
  };

  const updateRowEdit = (
    payoutId: string,
    patch: Partial<ReturnType<typeof getRowEdit>>
  ) => {
    setPayoutEdits((prev) => ({
      ...prev,
      [payoutId]: { ...getRowEdit(payoutId), ...patch },
    }));
  };

  const savePayoutRow = async (payoutId: string) => {
    setPayoutRowSavingId(payoutId);
    setError(null);
    const edit = getRowEdit(payoutId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payouts/${payoutId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const json = (await response.json()) as {
        data: { finance: AdminOrderFinanceApiResponse["data"] } | null;
        error: string | null;
      };
      if (!response.ok || json.error || !json.data?.finance) {
        setError(json.error ?? "Failed to update payout");
        return;
      }
      setFinance(json.data.finance);
      setPayoutEdits((prev) => {
        const next = { ...prev };
        delete next[payoutId];
        return next;
      });
    } catch {
      setError("Failed to update payout");
    } finally {
      setPayoutRowSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {loadState === "loading" ? (
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.orderTotal")}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {formatOrderMoney(summary.orderTotal, summary.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.paidGross")}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {formatOrderMoney(summary.paidAmount, summary.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.refunded")}
            </p>
            <p className="mt-1 text-lg font-semibold text-rose-700">
              {formatOrderMoney(summary.refundedAmount, summary.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.netPaid")}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {formatOrderMoney(summary.netPaidAmount, summary.currency)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("finance.paymentStatus")}:{" "}
              <span className="font-semibold text-slate-700">
                {paymentLabel(summary.paymentStatus)}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.outstanding")}
            </p>
            <p className="mt-1 text-lg font-semibold text-amber-700">
              {formatOrderMoney(summary.outstandingAmount, summary.currency)}
            </p>
          </div>
          {summary.overpaidAmount > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("finance.overpaid")}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {formatOrderMoney(summary.overpaidAmount, summary.currency)}
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.payout")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatOrderMoney(summary.payoutAmount, summary.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("finance.margin")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatOrderMoney(summary.marginAmount, summary.currency)}
            </p>
          </div>
        </div>
      ) : null}

      {summary?.outstandingAmount && summary.outstandingAmount > 0 && orderStatus === "completed" ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("warnings.completedOutstanding")}
        </p>
      ) : null}

      {summary?.marginAmount !== undefined && summary.marginAmount < 0 ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {t("warnings.negativeMargin")}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold text-slate-800">{t("orders.addPayment")}</p>
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Amount ({currency})
              </span>
              <input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="e.g. 120.00"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Method
                </span>
                <StyledSelect
                  value={paymentMethod}
                  options={paymentMethodOptions}
                  onChange={(v) => setPaymentMethod(v as OrderPaymentMethod)}
                  className="mt-1.5"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </span>
                <StyledSelect
                  value={paymentStatus}
                  options={paymentStatusOptions}
                  onChange={(v) => setPaymentStatus(v as OrderPaymentRecordStatus)}
                  className="mt-1.5"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Note (optional)
              </span>
              <input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="Receipt, context, etc."
              />
            </label>
            <button
              type="button"
              onClick={() => void savePayment()}
              disabled={paymentSaving}
              className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
            >
              {paymentSaving ? t("forms.saving") : t("finance.recordPayment")}
            </button>
          </div>

          {finance?.payments?.length ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("finance.paymentHistory")}
              </p>
              <ul className="mt-3 space-y-2">
                {finance.payments.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/60 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {formatOrderMoney(p.amount, p.currency)} · {p.method} · {p.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(p.createdAt)}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">{t("finance.noPaymentsYet")}</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold text-slate-800">{t("orders.addPayout")}</p>
          <div className="mt-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4 text-xs text-slate-600">
            <p>
              Needed cleaners: <span className="font-semibold">{neededCleanersCount}</span>
            </p>
            <p className="mt-1">
              Assigned cleaners:{" "}
              <span className="font-semibold">
                {assignedCleaners.length > 0
                  ? assignedCleaners.map((c) => c.name).join(", ")
                  : "none"}
              </span>
            </p>
            <p className="mt-1">Default payout percent: <span className="font-semibold">50%</span></p>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cleaner
              </span>
              <StyledSelect
                value={payoutCleanerId}
                options={cleanerOptions}
                onChange={(v) => {
                  setPayoutCleanerId(v);
                  setPayoutFormError(null);
                }}
                placeholder={t("forms.selectCleaner")}
                className="mt-1.5"
                disabled={cleanerOptions.length === 0}
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("finance.payoutPercent")}
              </span>
              <input
                value={payoutPercent}
                onChange={(e) => setPayoutPercent(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="50"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Adjustment amount ({currency})
              </span>
              <input
                value={payoutAdjustmentAmount}
                onChange={(e) => setPayoutAdjustmentAmount(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="0.00 (can be negative)"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Adjustment reason (optional)
              </span>
              <input
                value={payoutAdjustmentReason}
                onChange={(e) => setPayoutAdjustmentReason(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="Reason for payout adjustment"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Manual amount override ({currency})
              </span>
              <input
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="Optional; leave empty for calculated final payout"
              />
            </label>
            <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4 text-sm">
              <p className="font-semibold text-slate-800">{t("finance.payoutPreview")}</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF4FA] text-[11px] font-semibold text-[#34597E]">
                  {selectedCleanerInitials}
                </span>
                <p className="text-xs font-medium text-slate-700">
                  {selectedCleanerMeta?.name ?? t("forms.selectCleaner")}
                </p>
              </div>
              <p className="mt-2 text-slate-600">
                Base: {formatOrderMoney(payoutPreview.baseAmount, currency)}
              </p>
              <p className="text-slate-600">
                Suggested ({payoutPreview.payoutPercent}%):{" "}
                {formatOrderMoney(payoutPreview.suggestedAmount, currency)}
              </p>
              <p className="text-slate-600">
                Adjustment: {formatOrderMoney(payoutPreview.adjustmentAmount, currency)}
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                Final payout: {formatOrderMoney(payoutPreview.finalAmount, currency)}
              </p>
            </div>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </span>
              <StyledSelect
                value={payoutStatus}
                options={payoutStatusOptions}
                onChange={(v) => setPayoutStatus(v as CleanerPayoutRecordStatus)}
                className="mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Note (optional)
              </span>
              <input
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
                placeholder="Transfer reference, etc."
              />
            </label>
            <button
              type="button"
              onClick={() => void savePayout()}
              disabled={payoutSaving || !payoutCleanerId}
              className="inline-flex items-center justify-center rounded-full border border-[#34597E] bg-white px-4 py-2 text-sm font-semibold text-[#34597E] transition hover:bg-slate-50 disabled:opacity-60"
            >
              {payoutSaving ? t("forms.saving") : t("finance.recordPayout")}
            </button>
            {payoutFormError ? (
              <p className="text-sm text-rose-700">{payoutFormError}</p>
            ) : null}
            {summary && summary.netPaidAmount < summary.payoutAmount + payoutPreview.finalAmount ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t("warnings.payoutExceedsNetPaid")}
              </p>
            ) : null}
            {Number(payoutPercent) > 60 ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t("warnings.higherThanDefaultPayout")}
              </p>
            ) : null}
          </div>

          {finance?.payouts?.length ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("finance.payoutHistory")}
              </p>
              <ul className="mt-3 space-y-2">
                {finance.payouts.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/60 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {formatOrderMoney(p.amount, p.currency)} · {p.status}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {cleanerDirectory.get(p.cleanerId)?.name ??
                        cleanerDirectory.get(p.cleanerId)?.email ??
                        "Cleaner"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {p.payoutPercent !== null
                        ? `${p.payoutPercent}% from ${formatOrderMoney(
                            p.baseAmount ?? 0,
                            p.currency
                          )} · `
                        : ""}
                      {formatDateTime(p.createdAt)}
                      {p.adjustmentAmount !== 0 ? ` · adj ${p.adjustmentAmount}` : ""}
                      {p.adjustmentReason ? ` · ${p.adjustmentReason}` : ""}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input
                        value={getRowEdit(p.id).payoutPercent}
                        onChange={(e) =>
                          updateRowEdit(p.id, { payoutPercent: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        placeholder="Percent"
                      />
                      <input
                        value={getRowEdit(p.id).adjustmentAmount}
                        onChange={(e) =>
                          updateRowEdit(p.id, { adjustmentAmount: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        placeholder="Adjustment"
                      />
                      <input
                        value={getRowEdit(p.id).amount}
                        onChange={(e) => updateRowEdit(p.id, { amount: e.target.value })}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        placeholder="Manual amount override"
                      />
                      <StyledSelect
                        value={getRowEdit(p.id).status}
                        options={payoutStatusOptions}
                        onChange={(v) =>
                          updateRowEdit(p.id, { status: v as CleanerPayoutRecordStatus })
                        }
                      />
                      <input
                        value={getRowEdit(p.id).adjustmentReason}
                        onChange={(e) =>
                          updateRowEdit(p.id, { adjustmentReason: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2"
                        placeholder="Adjustment reason"
                      />
                      <input
                        value={getRowEdit(p.id).note}
                        onChange={(e) => updateRowEdit(p.id, { note: e.target.value })}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2"
                        placeholder="Note"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void savePayoutRow(p.id)}
                        disabled={payoutRowSavingId === p.id}
                        className="rounded-full bg-[#34597E] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {payoutRowSavingId === p.id ? t("forms.saving") : t("common.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateRowEdit(p.id, {
                            status: "cancelled",
                          })
                        }
                        className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700"
                      >
                        Remove / cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">{t("finance.noPayoutsYet")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

