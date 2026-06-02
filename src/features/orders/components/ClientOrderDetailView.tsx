"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ClientOrderDetail } from "@/entities/order/client-order.types";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { COMPLAINT_REASONS } from "@/lib/constants/complaint";
import type {
  ClientCancelOrderApiResponse,
  ClientOrderDetailApiResponse,
  ClientRescheduleApiResponse,
} from "@/features/orders/types/client-orders-api.types";
import type {
  ClientComplaintApiResponse,
  ClientReviewApiResponse,
} from "@/features/orders/types/client-review-complaint-api.types";
import {
  displayValue,
  formatOrderDate,
  formatOrderMoney,
} from "@/features/orders/lib/format-order-display";
import { inputClassName } from "@/components/ui/FormField";
import OrderServiceDetailsCard from "@/features/orders/components/OrderServiceDetailsCard";

type LoadState = "loading" | "idle";

type ClientOrderDetailViewProps = {
  orderId: string;
};

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ClientOrderDetailView({
  orderId,
}: ClientOrderDetailViewProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [order, setOrder] = useState<ClientOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [complaintReason, setComplaintReason] = useState("quality");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch(`/api/client/orders/${orderId}`, {
        credentials: "include",
      });
      const json = (await response.json()) as ClientOrderDetailApiResponse;

      if (!response.ok || json.error) {
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

  async function handleRescheduleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canReschedule) return;

    setRescheduleSubmitting(true);
    setRescheduleError(null);
    setRescheduleSuccess(false);

    try {
      const response = await fetch(
        `/api/client/orders/${orderId}/reschedule-request`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: rescheduleMessage }),
        }
      );
      const json = (await response.json()) as ClientRescheduleApiResponse;

      if (!response.ok || json.error) {
        setRescheduleError(json.error ?? "Failed to submit request");
        return;
      }

      setRescheduleSuccess(true);
      setRescheduleMessage("");
    } catch {
      setRescheduleError("Failed to submit request");
    } finally {
      setRescheduleSubmitting(false);
    }
  }

  async function handleCancelConfirm() {
    if (!order?.canCancel) return;

    setCancelSubmitting(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const response = await fetch(`/api/client/orders/${orderId}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = (await response.json()) as ClientCancelOrderApiResponse;

      if (!response.ok || json.error) {
        setCancelError(json.error ?? "Failed to cancel order");
        return;
      }

      if (json.data) {
        setOrder(json.data.order);
        setCancelSuccess(
          `${json.data.cancellation.policyLabel}. ${json.data.cancellation.message}`
        );
        setShowCancelConfirm(false);
      }
    } catch {
      setCancelError("Failed to cancel order");
    } finally {
      setCancelSubmitting(false);
    }
  }

  async function handleReviewSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canLeaveReview) return;

    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const response = await fetch(`/api/client/orders/${orderId}/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      const json = (await response.json()) as ClientReviewApiResponse;

      if (!response.ok || json.error) {
        setReviewError(json.error ?? "Failed to submit review");
        return;
      }

      if (json.data) {
        setOrder(json.data.order);
        setReviewSuccess(true);
        setReviewComment("");
      }
    } catch {
      setReviewError("Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleComplaintSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canOpenComplaint) return;

    setComplaintSubmitting(true);
    setComplaintError(null);
    setComplaintSuccess(false);

    try {
      const response = await fetch(`/api/client/orders/${orderId}/complaint`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: complaintReason,
          description: complaintDescription.trim(),
        }),
      });
      const json = (await response.json()) as ClientComplaintApiResponse;

      if (!response.ok || json.error) {
        setComplaintError(json.error ?? "Failed to submit complaint");
        return;
      }

      if (json.data) {
        setOrder(json.data.order);
        setComplaintSuccess(true);
        setComplaintDescription("");
      }
    } catch {
      setComplaintError("Failed to submit complaint");
    } finally {
      setComplaintSubmitting(false);
    }
  }

  const isLoading = loadState === "loading";
  const complaintReasonOptions = COMPLAINT_REASONS.map((item) => ({
    value: item.value,
    label: item.label,
  }));
  const preview = order?.cancellationPreview;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] px-6 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <div>
          <Link
            href="/app/client"
            className="text-sm font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
          >
            ← Back to my orders
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            Loading order...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && !order ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-base font-medium text-slate-700">Order not found</p>
          </div>
        ) : null}

        {!isLoading && !error && order ? (
          <>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Order #{order.id}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
                    {order.serviceTypeLabel}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatOrderDate(order.scheduledDate)} · {order.scheduledTime}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                    order.isProblemStatus
                      ? "bg-rose-50 text-rose-800 ring-rose-200"
                      : "bg-[#EEF4FA] text-[#34597E] ring-[#C5D9EB]"
                  }`}
                >
                  {order.statusLabel}
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DetailCard title="Schedule & address">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatOrderDate(order.scheduledDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {order.scheduledTime}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {order.address.line}
                    </dd>
                  </div>
                </dl>
              </DetailCard>

              <DetailCard title="Payment & cleaner">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Price
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatOrderMoney(order.estimatedPrice, order.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment status
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {order.paymentStatusLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Paid / Outstanding
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatOrderMoney(order.paidAmount, order.currency)}
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="text-slate-600">
                        {formatOrderMoney(order.outstandingAmount, order.currency)}
                      </span>
                    </dd>
                    <p className="mt-1 text-xs text-slate-400">
                      Online payments are not available yet.
                    </p>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cleaner
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {order.assignedCleaner
                        ? displayValue(order.assignedCleaner.name)
                        : "Not assigned yet"}
                    </dd>
                    {order.assignedCleaner ? (
                      <dd className="mt-1 text-sm text-slate-500">
                        {order.assignedCleaner.phone}
                      </dd>
                    ) : null}
                  </div>
                </dl>
              </DetailCard>
            </div>

            <OrderServiceDetailsCard
              serviceLabel={order.serviceTypeLabel}
              serviceDetails={order.serviceDetails}
              operationalNotes={order.operationalNotes}
              audience="client"
            />

            <DetailCard title="Your comment">
              <p className="text-sm leading-relaxed text-slate-700">
                {displayValue(order.customerComment)}
              </p>
            </DetailCard>

            {order.isProblemStatus || order.hasActiveComplaint ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-800">
                  Problem reported
                </h2>
                <p className="mt-2 text-sm text-rose-900">
                  {order.hasActiveComplaint
                    ? "Your complaint is open. Our team is reviewing it and will follow up shortly."
                    : "This order is marked as a problem. Contact support if you need help."}
                </p>
                {order.activeComplaint ? (
                  <dl className="mt-4 space-y-2 text-sm text-rose-900">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                        Reason
                      </dt>
                      <dd className="mt-0.5 font-medium">
                        {order.activeComplaint.reasonLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                        Details
                      </dt>
                      <dd className="mt-0.5 leading-relaxed">
                        {order.activeComplaint.description}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </div>
            ) : null}

            <DetailCard title="Actions">
              <div className="space-y-6">
                {order.canCancel && preview?.allowed ? (
                  <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Cancel order
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{preview.message}</p>
                    {preview.feePercent > 0 ? (
                      <p className="mt-2 text-sm font-medium text-amber-800">
                        Estimated fee:{" "}
                        {formatOrderMoney(preview.feeAmount, order.currency)} (
                        {preview.feePercent}%)
                      </p>
                    ) : null}

                    {!showCancelConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="mt-4 inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Cancel this order
                      </button>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-slate-600">
                          Confirm cancellation? This cannot be undone online.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={cancelSubmitting}
                            onClick={() => void handleCancelConfirm()}
                            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                          >
                            {cancelSubmitting ? "Cancelling..." : "Yes, cancel"}
                          </button>
                          <button
                            type="button"
                            disabled={cancelSubmitting}
                            onClick={() => setShowCancelConfirm(false)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                          >
                            Keep order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {!order.canCancel && preview && !preview.allowed ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {preview.message}
                  </p>
                ) : null}

                {cancelError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {cancelError}
                  </p>
                ) : null}

                {cancelSuccess ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Order cancelled. {cancelSuccess}
                  </p>
                ) : null}

                {order.canReschedule ? (
                  <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Request reschedule
                    </p>
                    <p className="text-sm text-slate-500">
                      Your request is sent to our team. The order status will not
                      change until confirmed.
                    </p>
                    <textarea
                      value={rescheduleMessage}
                      onChange={(e) => setRescheduleMessage(e.target.value)}
                      rows={3}
                      placeholder="Preferred date, time, or notes..."
                      className={inputClassName}
                      required
                    />
                    <button
                      type="submit"
                      disabled={rescheduleSubmitting}
                      className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
                    >
                      {rescheduleSubmitting ? "Sending..." : "Send request"}
                    </button>
                    {rescheduleError ? (
                      <p className="text-sm text-rose-700">{rescheduleError}</p>
                    ) : null}
                    {rescheduleSuccess ? (
                      <p className="text-sm text-emerald-700">
                        Reschedule request submitted. We will contact you soon.
                      </p>
                    ) : null}
                  </form>
                ) : null}

                {order.hasReview ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Thank you — your review has been submitted.
                  </p>
                ) : null}

                {order.canLeaveReview ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Leave a review
                    </p>
                    <p className="text-sm text-slate-500">
                      Rate your cleaning after completion (1–5 stars).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                            reviewRating >= star
                              ? "bg-[#34597E] text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-500 hover:border-[#5B8DB8]/40"
                          }`}
                          aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Optional comment..."
                      className={inputClassName}
                    />
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit review"}
                    </button>
                    {reviewError ? (
                      <p className="text-sm text-rose-700">{reviewError}</p>
                    ) : null}
                    {reviewSuccess ? (
                      <p className="text-sm text-emerald-700">
                        Review submitted. Thank you for your feedback.
                      </p>
                    ) : null}
                  </form>
                ) : null}

                {order.canOpenComplaint ? (
                  <form onSubmit={handleComplaintSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Open a complaint
                    </p>
                    <p className="text-sm text-slate-500">
                      Report an issue with service quality, access, or billing.
                    </p>
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Reason
                      </span>
                      <StyledSelect
                        value={complaintReason}
                        options={complaintReasonOptions}
                        onChange={setComplaintReason}
                        className="mt-1.5"
                      />
                    </label>
                    <textarea
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe the issue..."
                      className={inputClassName}
                      required
                    />
                    <button
                      type="submit"
                      disabled={complaintSubmitting}
                      className="inline-flex items-center justify-center rounded-full border border-[#34597E] bg-white px-4 py-2 text-sm font-semibold text-[#34597E] transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {complaintSubmitting ? "Submitting..." : "Submit complaint"}
                    </button>
                    {complaintError ? (
                      <p className="text-sm text-rose-700">{complaintError}</p>
                    ) : null}
                    {complaintSuccess ? (
                      <p className="text-sm text-emerald-700">
                        Complaint submitted. We will review it as soon as possible.
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </div>
            </DetailCard>
          </>
        ) : null}
      </div>
    </div>
  );
}
