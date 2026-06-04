"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Flag,
  UserCheck,
} from "lucide-react";
import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { OrderPaymentStatus } from "@/entities/order/order.types";
import AdminOrderServiceDetailsCard from "@/features/orders/components/AdminOrderServiceDetailsCard";
import CleanerAssignmentForm from "@/features/orders/components/CleanerAssignmentForm";
import AdminOrderFilesCard from "@/features/orders/components/AdminOrderFilesCard";
import AdminOrderTimeline from "@/features/orders/components/AdminOrderTimeline";
import OrderStatusChangeForm from "@/features/orders/components/OrderStatusChangeForm";
import AdminOrderFinanceCard from "@/features/finance/components/AdminOrderFinanceCard";
import {
  displayValue,
  formatOrderDate,
  formatOrderMoney,
} from "@/features/orders/lib/format-order-display";
import type { AdminOrderDetailApiResponse } from "@/features/orders/types/admin-order-detail-api.types";
import { useT } from "@/i18n/useT";
type LoadState = "loading" | "idle";

const PAYMENT_LABELS: Record<OrderPaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  card_hold: "Partial / pending",
};

function statusPillClass(status: AdminOrderDetail["status"]): string {
  const map: Partial<Record<AdminOrderDetail["status"], string>> = {
    awaiting_confirmation: "bg-amber-50 text-amber-800 ring-amber-200",
    new: "bg-sky-50 text-sky-700 ring-sky-200",
    waiting_for_payment: "bg-amber-50 text-amber-800 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    searching_cleaner: "bg-violet-50 text-violet-700 ring-violet-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cleaner_assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    in_progress: "bg-amber-50 text-amber-800 ring-amber-200",
    problem: "bg-rose-50 text-rose-800 ring-rose-200",
    completed: "bg-slate-100 text-slate-700 ring-slate-200",
    canceled: "bg-rose-50 text-rose-700 ring-rose-200",
    cancelled_by_client: "bg-rose-50 text-rose-700 ring-rose-200",
    cancelled_by_cleaner: "bg-rose-50 text-rose-700 ring-rose-200",
    cancelled_by_admin: "bg-rose-50 text-rose-700 ring-rose-200",
    refunded: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return map[status] ?? "bg-sky-50 text-sky-700 ring-sky-200";
}

function StatusPill({ label, status }: { label: string; status: AdminOrderDetail["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass(status)}`}
    >
      {label}
    </span>
  );
}

function PaymentPill({ status }: { status: OrderPaymentStatus }) {
  const map: Record<OrderPaymentStatus, string> = {
    unpaid: "bg-rose-50 text-rose-700 ring-rose-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    card_hold: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${map[status]}`}
    >
      {PAYMENT_LABELS[status]}
    </span>
  );
}

function DetailCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {subtitle ? <p className="text-[11px] text-slate-400">{subtitle}</p> : null}
      </div>
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

type AdminOrderDetailViewProps = {
  orderId: string;
};

type OperationalWarning = {
  text: string;
  className: string;
  icon: ReactNode;
};

function isTerminalStatus(status: AdminOrderDetail["status"]): boolean {
  return (
    status === "completed" ||
    status === "cancelled_by_admin" ||
    status === "cancelled_by_client" ||
    status === "cancelled_by_cleaner" ||
    status === "canceled" ||
    status === "refunded"
  );
}

export default function AdminOrderDetailView({ orderId }: AdminOrderDetailViewProps) {
  const { t, paymentLabel, serviceTypeLabel, bookingProductLabel } = useT();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationLink, setConfirmationLink] = useState<string | null>(null);
  const [confirmationExpiresAt, setConfirmationExpiresAt] = useState<string | null>(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latestToken, setLatestToken] = useState<{
    token: string;
    createdAt: string;
    expiresAt: string;
    usedAt: string | null;
    isExpired: boolean;
    confirmationUrl: string;
  } | null>(null);

  const loadOrder = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: "include",
      });

      const json = (await response.json()) as AdminOrderDetailApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? t("common.error"));
        return;
      }

      setOrder(json.data);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoadState("idle");
    }
  }, [orderId]);

  const loadLatestToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/confirmation-link`, {
        credentials: "include",
      });
      const json = (await response.json()) as {
        data:
          | {
              token: string;
              createdAt: string;
              expiresAt: string;
              usedAt: string | null;
              isExpired: boolean;
              confirmationUrl: string;
            }
          | null;
        error: string | null;
      };
      if (!response.ok) return;
      setLatestToken(json.data);
      if (json.data) {
        setConfirmationLink(json.data.confirmationUrl);
        setConfirmationExpiresAt(json.data.expiresAt);
      }
    } catch {
      // best-effort
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
    void loadLatestToken();
  }, [loadLatestToken, loadOrder]);

  const handleOrderUpdated = useCallback((updated: AdminOrderDetail) => {
    setOrder(updated);
  }, []);

  const quickStatusUpdate = useCallback(
    async (status: AdminOrderDetail["status"]) => {
      if (!order) return;
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = (await response.json()) as AdminOrderDetailApiResponse;
        if (!response.ok || json.error || !json.data) {
          setError(json.error ?? t("common.error"));
          return;
        }
        setOrder(json.data);
      } catch {
        setError(t("common.error"));
      }
    },
    [order, orderId]
  );

  const jumpToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const isLoading = loadState === "loading";
  const hasOutstanding = order ? order.paymentStatus !== "paid" : false;
  const assignedCleanerName =
    order?.assignment.cleaners.find((c) => c.id === order.assignment.assignedCleanerId)?.name ??
    order?.assignment.cleaners[0]?.name ??
    null;
  const quickActions = order
    ? (() => {
        const actions: {
          label: string;
          variant: "primary" | "secondary";
          icon: React.ReactNode;
          onClick: () => void;
        }[] = [];
        if (
          [
            "awaiting_confirmation",
            "new",
            "waiting_for_payment",
            "paid",
            "searching_cleaner",
          ].includes(order.status)
        ) {
          actions.push({
            label: t("orders.assignCleaner"),
            variant: "secondary",
            icon: <UserCheck className="h-4 w-4" />,
            onClick: () => jumpToSection("assignment"),
          });
          actions.push({
            label: t("orders.actionMarkConfirmed"),
            variant: "primary",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("confirmed"),
          });
        } else if (order.status === "cleaner_assigned") {
          actions.push({
            label: t("orders.actionConfirmOrder"),
            variant: "primary",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("confirmed"),
          });
          actions.push({
            label: t("orders.actionChangeCleaner"),
            variant: "secondary",
            icon: <UserCheck className="h-4 w-4" />,
            onClick: () => jumpToSection("assignment"),
          });
          actions.push({
            label: t("orders.actionMarkProblem"),
            variant: "secondary",
            icon: <Flag className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("problem"),
          });
        } else if (order.status === "confirmed") {
          actions.push({
            label: t("orders.actionMarkInProgress"),
            variant: "primary",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("in_progress"),
          });
          actions.push({
            label: t("orders.actionChangeCleaner"),
            variant: "secondary",
            icon: <UserCheck className="h-4 w-4" />,
            onClick: () => jumpToSection("assignment"),
          });
          actions.push({
            label: t("orders.actionMarkProblem"),
            variant: "secondary",
            icon: <Flag className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("problem"),
          });
        } else if (order.status === "in_progress") {
          actions.push({
            label: t("orders.actionCompleteOrder"),
            variant: "primary",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("completed"),
          });
          actions.push({
            label: t("orders.actionMarkProblem"),
            variant: "secondary",
            icon: <Flag className="h-4 w-4" />,
            onClick: () => void quickStatusUpdate("problem"),
          });
        } else if (order.status === "completed") {
          actions.push({
            label: t("orders.addPayment"),
            variant: "primary",
            icon: <CreditCard className="h-4 w-4" />,
            onClick: () => jumpToSection("finance"),
          });
          actions.push({
            label: t("orders.addPayout"),
            variant: "secondary",
            icon: <UserCheck className="h-4 w-4" />,
            onClick: () => jumpToSection("finance"),
          });
          actions.push({
            label: t("orders.timeline"),
            variant: "secondary",
            icon: <Flag className="h-4 w-4" />,
            onClick: () => jumpToSection("timeline"),
          });
        } else if (order.status === "problem") {
          actions.push({
            label: t("orders.actionOpenTimeline"),
            variant: "secondary",
            icon: <Flag className="h-4 w-4" />,
            onClick: () => jumpToSection("timeline"),
          });
          actions.push({
            label: t("orders.actionOpenAttachments"),
            variant: "secondary",
            icon: <AlertTriangle className="h-4 w-4" />,
            onClick: () => jumpToSection("attachments"),
          });
          actions.push({
            label: t("orders.actionResolveViaStatus"),
            variant: "primary",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => jumpToSection("operations"),
          });
        }
        return actions.slice(0, 4);
      })()
    : [];

  const warnings: OperationalWarning[] = order
    ? ([
        order.paymentStatus !== "paid" &&
        (order.status === "in_progress" || order.status === "completed")
          ? {
              text: t("warnings.paymentNotSettled"),
              className: "border-amber-200 bg-amber-50 text-amber-900",
              icon: <CreditCard className="h-4 w-4 shrink-0" />,
            }
          : null,
        !order.assignment.assignedCleanerId && !isTerminalStatus(order.status)
          ? {
              text: t("warnings.noCleanerAssigned"),
              className: "border-blue-200 bg-blue-50 text-blue-900",
              icon: <UserCheck className="h-4 w-4 shrink-0" />,
            }
          : null,
        order.status === "problem"
          ? {
              text: t("warnings.problemReported"),
              className: "border-rose-200 bg-rose-50 text-rose-800",
              icon: <Flag className="h-4 w-4 shrink-0" />,
            }
          : null,
      ].filter(Boolean) as OperationalWarning[])
    : [];

  const generateConfirmationLink = useCallback(async () => {
    setConfirmationLoading(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/confirmation-link`, {
        method: "POST",
        credentials: "include",
      });
      const json = (await response.json()) as {
        data: { confirmationUrl: string; expiresAt: string } | null;
        error: string | null;
      };
      if (!response.ok || !json.data) {
        setError(json.error ?? t("orders.failedGenerateConfirmationLink"));
        return;
      }
      setConfirmationLink(json.data.confirmationUrl);
      setConfirmationExpiresAt(json.data.expiresAt);
      await loadLatestToken();
    } catch {
      setError(t("orders.failedGenerateConfirmationLink"));
    } finally {
      setConfirmationLoading(false);
    }
  }, [loadLatestToken, orderId, t]);

  const copyConfirmationLink = useCallback(async () => {
    if (!confirmationLink) return;
    try {
      await navigator.clipboard.writeText(confirmationLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  }, [confirmationLink]);

  const confirmationState = (() => {
    if (latestToken?.usedAt) return "used";
    if (order?.status === "confirmed") return "confirmed";
    if (latestToken?.isExpired) return "expired";
    if (order?.status === "awaiting_confirmation" || latestToken) return "awaiting";
    return null;
  })();

  const productLabel = order
    ? (order.service.productLabel ??
      bookingProductLabel({
        bookingProduct: order.service.bookingProduct,
        serviceType: order.service.type,
        customerComment: order.service.comment,
      }))
    : "";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/app/admin/orders"
          className="text-sm font-medium text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          ← {t("common.backToOrders")}
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          {t("common.loading")}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !order ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">{t("orders.orderNotFound")}</p>
        </div>
      ) : null}

      {!isLoading && !error && order ? (
        <>
          <header className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("orders.orderControlCenter")}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                  #{order.displayId}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-700">{productLabel}</p>
                {order.service.bookingProduct || order.service.productKey !== order.service.type ? (
                  <p className="text-xs text-slate-500">
                    {t("orders.serviceType")}: {serviceTypeLabel(order.service.type)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label={order.statusLabel} status={order.status} />
                <PaymentPill status={order.paymentStatus} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{t("orders.schedule")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatOrderDate(order.scheduledDate)} · {order.scheduledTime}
                </p>
                <p className="text-xs text-slate-500">{t("forms.duration")}: TBD</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{t("orders.client")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{order.client.name}</p>
                <p className="text-xs text-slate-500">{order.client.phone}</p>
                {order.client.id ? (
                  <Link
                    href={`/app/admin/clients/${order.client.id}`}
                    className="mt-1 inline-flex text-xs font-medium text-[#34597E] hover:underline"
                  >
                    {t("common.viewDetails")}
                  </Link>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{t("orders.address")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {order.address.city}, {order.address.street} {order.address.house}
                </p>
                <p className="text-xs text-slate-500">
                  {displayValue(order.address.apartment)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{t("orders.assignedCleaner")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {assignedCleanerName ?? t("orders.notAssigned")}
                </p>
                <p className="text-xs text-slate-500">
                  Total: {formatOrderMoney(order.service.finalPrice ?? order.service.estimatedPrice, order.service.currency)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {confirmationState === "confirmed" ? (
                <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {t("orders.orderConfirmed")}
                </p>
              ) : null}
              {confirmationState === "awaiting" ? (
                <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  {t("orders.awaitingClientConfirmation")}
                </p>
              ) : null}
              {confirmationState === "expired" ? (
                <p className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {t("orders.confirmationLinkExpired")}
                </p>
              ) : null}
              {confirmationState === "used" && latestToken?.usedAt ? (
                <p className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {t("orders.confirmedAt")}: {new Date(latestToken.usedAt).toLocaleTimeString()}
                </p>
              ) : null}
              {hasOutstanding ? (
                <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {t("warnings.outstandingMayExist")}
                </p>
              ) : null}
              {order.status === "problem" ? (
                <p className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {t("warnings.problemActionRequired")}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/app/admin/orders/${orderId}/edit`}
                className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f]"
              >
                {t("orders.editOrder")}
              </Link>
              <a
                href="#operations"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("orders.changeStatus")}
              </a>
              <a
                href="#assignment"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("orders.assignCleaner")}
              </a>
              <a
                href="#finance"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("orders.openFinance")}
              </a>
              <button
                type="button"
                onClick={() => void generateConfirmationLink()}
                disabled={confirmationLoading}
                className="inline-flex items-center justify-center rounded-full border border-[#34597E]/30 bg-[#EEF4FA] px-4 py-2 text-sm font-semibold text-[#34597E] transition hover:bg-[#E2EDF8] disabled:opacity-60"
              >
                {confirmationLoading
                  ? t("orders.generatingConfirmationLink")
                  : latestToken
                    ? t("orders.regenerateConfirmationLink")
                    : t("orders.generateConfirmationLink")}
              </button>
            </div>
            {confirmationLink ? (
              <div className="mt-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("orders.confirmationLinkReady")}
                </p>
                <p className="mt-1 break-all text-xs text-slate-700">{confirmationLink}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyConfirmationLink()}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {copied ? t("orders.linkCopied") : t("orders.copyLink")}
                  </button>
                  {confirmationExpiresAt ? (
                    <p className="text-xs text-slate-500">
                      {t("orders.confirmationExpiresAt")}:{" "}
                      {new Date(confirmationExpiresAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              <DetailCard title={t("orders.operations")} subtitle="Status, assignment, urgent actions">
                <div id="operations" className="space-y-4">
                  {warnings.length > 0 ? (
                    <div className="space-y-2">
                      {warnings.map((warning) => (
                        <p
                          key={warning.text}
                          className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${warning.className}`}
                        >
                          {warning.icon}
                          {warning.text}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t("orders.currentOrderStatus")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill label={order.statusLabel} status={order.status} />
                      <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {t("common.payment")}: {paymentLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                  {quickActions.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {t("orders.quickActions")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quickActions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className={
                              action.variant === "primary"
                                ? "inline-flex items-center gap-1.5 rounded-full bg-[#34597E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2d4d6f]"
                                : "inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            }
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                    <OrderStatusChangeForm
                      orderId={orderId}
                      currentStatus={order.status}
                      onStatusUpdated={handleOrderUpdated}
                    />
                  </div>
                </div>
              </DetailCard>

              <DetailCard title={t("orders.cleanerAssignment")} subtitle="Execution owner">
                <div id="assignment">
                  <CleanerAssignmentForm
                    orderId={orderId}
                    scheduledDate={order.scheduledDate}
                    assignment={order.assignment}
                    canAssignCleaner={order.canAssignCleaner}
                    paymentStatus={order.paymentStatus}
                    orderStatusRaw={order.statusRaw}
                    orderStatusLabel={order.statusLabel}
                    onAssigned={handleOrderUpdated}
                  />
                </div>
              </DetailCard>

              <DetailCard title={t("orders.serviceDetails")} subtitle="Scope, notes, customer context">
                <div id="service" className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
                    <dl className="space-y-3">
                      <DetailRow label={t("orders.product")} value={productLabel} />
                      <DetailRow label={t("orders.serviceType")} value={serviceTypeLabel(order.service.type)} />
                      <DetailRow
                        label={t("orders.estimatedPrice")}
                        value={formatOrderMoney(order.service.estimatedPrice, order.service.currency)}
                      />
                      <div>
                        <dt className="text-sm text-slate-500">{t("orders.clientComment")}</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-800">
                          {displayValue(order.service.comment)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <AdminOrderServiceDetailsCard
                    serviceLabel={productLabel}
                    serviceDetails={order.serviceDetails}
                    operationalNotes={order.operationalNotes}
                  />
                </div>
              </DetailCard>

              <DetailCard title={t("orders.finance")} subtitle="Payments, payouts, margin">
                <div id="finance">
                  <AdminOrderFinanceCard
                    orderId={orderId}
                    assignedCleanerId={order.assignment.assignedCleanerId}
                    assignedCleaners={order.assignment.cleaners.map((c) => ({
                      id: c.id,
                      name: c.name,
                      email: c.email,
                      city: null,
                    }))}
                    neededCleanersCount={order.assignment.cleanersNeeded}
                    orderStatus={order.status}
                    currencyFallback={order.service.currency}
                  />
                </div>
              </DetailCard>
            </div>

            <aside className="space-y-6">
              <DetailCard title={t("orders.client")} subtitle="Contact">
                <dl className="space-y-3">
                  <DetailRow label="Name" value={order.client.name} />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <dt className="text-sm text-slate-500">Email</dt>
                    <dd className="text-sm font-medium sm:text-right">
                      <a className="text-[#34597E] hover:underline" href={`mailto:${order.client.email}`}>
                        {order.client.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <dt className="text-sm text-slate-500">Phone</dt>
                    <dd className="text-sm font-medium sm:text-right">
                      <a className="text-[#34597E] hover:underline" href={`tel:${order.client.phone}`}>
                        {order.client.phone}
                      </a>
                    </dd>
                  </div>
                  <DetailRow label={t("common.ordersCount")} value={String(order.client.ordersCount)} />
                </dl>
                {order.client.id ? (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <Link
                      href={`/app/admin/clients/${order.client.id}`}
                      className="text-sm font-medium text-[#34597E] hover:underline"
                    >
                      {t("common.viewDetails")}
                    </Link>
                  </div>
                ) : null}
              </DetailCard>

              <DetailCard title={t("orders.address")} subtitle="Visit location">
                <dl className="space-y-3">
                  <DetailRow label="City" value={order.address.city} />
                  <DetailRow label="Street" value={order.address.street} />
                  <DetailRow label="House" value={order.address.house} />
                  <DetailRow label="Floor" value={displayValue(order.address.floor)} />
                  <DetailRow label="Apartment" value={displayValue(order.address.apartment)} />
                  <DetailRow label="Doorbell" value={displayValue(order.address.doorbell)} />
                </dl>
              </DetailCard>

              <DetailCard title={t("orders.timeline")} subtitle="Recent activity">
                <div id="timeline">
                  <AdminOrderTimeline items={order.statusHistory ?? []} compact maxItems={5} />
                </div>
              </DetailCard>

              <DetailCard title={t("orders.attachments")} subtitle="Files and photos">
                <details id="attachments">
                  <summary className="cursor-pointer list-none rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-2 text-sm font-semibold text-slate-700">
                    {t("orders.openAttachmentsManager")}
                  </summary>
                  <div className="mt-3">
                    <AdminOrderFilesCard orderId={orderId} compact />
                  </div>
                </details>
              </DetailCard>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
