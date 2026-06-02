"use client";

import { useEffect, useState } from "react";
import { textareaClassName } from "@/components/ui/FormField";
import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { OrderStatus } from "@/entities/order/order.types";
import { ORDER_STATUSES } from "@/lib/constants/order-status";
import type { UpdateOrderStatusApiResponse } from "@/features/orders/types/update-order-status-api.types";
import { useT } from "@/i18n/useT";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

type OrderStatusChangeFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdated: (order: AdminOrderDetail) => void;
};

export default function OrderStatusChangeForm({
  orderId,
  currentStatus,
  onStatusUpdated,
}: OrderStatusChangeFormProps) {
  const { t, orderStatusLabel } = useT();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
    setSaveError(null);
    setSaveSuccess(false);
  }, [currentStatus]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        }),
      });

      const json = (await response.json()) as UpdateOrderStatusApiResponse;

      if (!response.ok || json.error || !json.data) {
        setSaveError(json.error ?? t("common.error"));
        return;
      }

      onStatusUpdated(json.data);
      setComment("");
      setSaveSuccess(true);
    } catch {
      setSaveError(t("common.error"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("forms.newStatus")}
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          disabled={isSaving}
          className={`mt-2 ${selectClassName}`}
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {orderStatusLabel(item.value)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("forms.commentOptional")}
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSaving}
          rows={3}
          placeholder={t("forms.statusChangeReasonPlaceholder")}
          className={`mt-2 ${textareaClassName}`}
        />
      </label>

      {saveError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {saveError}
        </p>
      ) : null}

      {saveSuccess ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("forms.statusUpdated")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? t("forms.saving") : t("forms.saveStatus")}
      </button>
    </form>
  );
}
