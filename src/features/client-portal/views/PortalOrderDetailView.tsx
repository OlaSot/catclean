"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { COMPLAINT_REASONS } from "@/lib/constants/complaint";
import {
  cancelClientOrder,
  fetchClientOrderDetail,
  requestOrderReschedule,
  submitOrderComplaint,
  submitOrderReview,
} from "../api/client-portal-api";
import { mapClientOrderDetailToPortal } from "../lib/portal-order.mapper";
import { buildRepeatBookingHref } from "../lib/repeat-booking";
import { formatPortalMoney } from "../lib/portal-utils";
import { PORTAL_SERVICE_BY_ID } from "../lib/service-catalog";
import {
  PORTAL_CARD_CLASS,
  PORTAL_DESKTOP_GRID_CLASS,
  PORTAL_DESKTOP_MAIN_CLASS,
  PORTAL_DESKTOP_SIDEBAR_CLASS,
  PORTAL_GREETING_CLASS,
  PORTAL_SECONDARY_BUTTON_CLASS,
} from "../lib/portal-styles";
import type { PortalOrderDetail } from "../types/portal.types";
import PortalStatusBadge from "../components/PortalStatusBadge";
import PortalPrimaryButton from "../components/PortalPrimaryButton";
import PortalDetailRow from "../components/PortalDetailRow";
import OrderTimeline from "../components/OrderTimeline";
import CleanerProfileCard from "../components/CleanerProfileCard";
import SupportCard from "../components/SupportCard";

type PortalOrderDetailViewProps = {
  orderId: string;
};

export default function PortalOrderDetailView({
  orderId,
}: PortalOrderDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PortalOrderDetail | null>(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintReason, setComplaintReason] = useState("quality");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientOrderDetail(orderId);
      if (!data) {
        setOrder(null);
        setError("Order not found");
        return;
      }
      setOrder(mapClientOrderDetailToPortal(data));
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function handleCancel() {
    if (!order?.canCancel) return;
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      const json = await cancelClientOrder(orderId);
      if (json.error || !json.data) {
        setCancelError(json.error ?? "Failed to cancel order");
        return;
      }
      setOrder(mapClientOrderDetailToPortal(json.data.order));
      setShowCancelConfirm(false);
    } catch {
      setCancelError("Failed to cancel order");
    } finally {
      setCancelSubmitting(false);
    }
  }

  async function handleReschedule(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canReschedule) return;
    setRescheduleSubmitting(true);
    try {
      const json = await requestOrderReschedule(orderId, rescheduleMessage);
      if (json.error) {
        setError(json.error);
        return;
      }
      setRescheduleSuccess(true);
      setRescheduleMessage("");
      setShowReschedule(false);
    } catch {
      setError("Failed to submit reschedule request");
    } finally {
      setRescheduleSubmitting(false);
    }
  }

  async function handleReview(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canLeaveReview) return;
    setReviewSubmitting(true);
    try {
      const json = await submitOrderReview(orderId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      if (json.error || !json.data) {
        setError(json.error ?? "Failed to submit review");
        return;
      }
      setOrder(mapClientOrderDetailToPortal(json.data.order));
      setShowReview(false);
    } catch {
      setError("Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleComplaint(event: React.FormEvent) {
    event.preventDefault();
    if (!order?.canOpenComplaint) return;
    setComplaintSubmitting(true);
    try {
      const json = await submitOrderComplaint(orderId, {
        reason: complaintReason,
        description: complaintDescription.trim(),
      });
      if (json.error || !json.data) {
        setError(json.error ?? "Failed to submit report");
        return;
      }
      setOrder(mapClientOrderDetailToPortal(json.data.order));
      setShowComplaint(false);
    } catch {
      setError("Failed to submit report");
    } finally {
      setComplaintSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading order…</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link
          href="/app/client/orders"
          className="inline-flex text-sm font-medium text-[#34597E] hover:underline"
        >
          ← Back to orders
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? "Order not found"}
        </div>
      </div>
    );
  }

  const heroImage = PORTAL_SERVICE_BY_ID[order.serviceId].imageUrl;
  const addressLine = [
    order.address.line,
    order.address.floor ? `Floor ${order.address.floor}` : null,
    order.address.apartment ? `Apt. ${order.address.apartment}` : null,
    order.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  const hasActions =
    order.canCancel ||
    order.canReschedule ||
    order.canLeaveReview ||
    order.canOpenComplaint;

  return (
    <div className="space-y-6">
      <Link
        href="/app/client/orders"
        className="inline-flex text-sm font-medium text-[#34597E] hover:underline"
      >
        ← Back to orders
      </Link>

      {rescheduleSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Reschedule request sent. Our team will contact you shortly.
        </div>
      ) : null}

      <div className={PORTAL_DESKTOP_GRID_CLASS}>
        <div className={`${PORTAL_DESKTOP_MAIN_CLASS} space-y-6`}>
          <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
            <div className="relative aspect-[16/10] bg-[#EEF4FA] lg:aspect-[21/9]">
              <Image
                src={heroImage}
                alt={order.serviceName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h1 className={`${PORTAL_GREETING_CLASS} text-white`}>
                  {order.serviceName}
                </h1>
                <div className="mt-3">
                  <PortalStatusBadge
                    label={order.statusLabel}
                    status={order.status}
                  />
                </div>
              </div>
            </div>
          </div>

          <OrderTimeline steps={order.timeline} />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Included
            </h2>
            <ul className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100 p-2`}>
              {order.included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 px-4 py-3 text-sm text-slate-700"
                >
                  <Sparkles
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#34597E]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {order.extras.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Extras
              </h2>
              <ul className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100 p-2`}>
                {order.extras.map((item) => (
                  <li key={item} className="px-4 py-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {order.customerComment ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Your notes
              </h2>
              <div className={`${PORTAL_CARD_CLASS} flex gap-3 p-5 text-sm text-slate-700`}>
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#34597E]" />
                {order.customerComment}
              </div>
            </section>
          ) : null}

          {hasActions ? (
            <section className={`${PORTAL_CARD_CLASS} space-y-3 p-5`}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {order.canCancel ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className={PORTAL_SECONDARY_BUTTON_CLASS}
                  >
                    Cancel
                  </button>
                ) : null}
                {order.canLeaveReview ? (
                  <button
                    type="button"
                    onClick={() => setShowReview(true)}
                    className={PORTAL_SECONDARY_BUTTON_CLASS}
                  >
                    Leave review
                  </button>
                ) : null}
                {order.canOpenComplaint ? (
                  <button
                    type="button"
                    onClick={() => setShowComplaint(true)}
                    className={PORTAL_SECONDARY_BUTTON_CLASS}
                  >
                    Report issue
                  </button>
                ) : null}
                {order.canReschedule ? (
                  <button
                    type="button"
                    onClick={() => setShowReschedule(true)}
                    className={PORTAL_SECONDARY_BUTTON_CLASS}
                  >
                    Request reschedule
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className={`${PORTAL_DESKTOP_SIDEBAR_CLASS} space-y-5`}>
          <div className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100 overflow-hidden`}>
            <p className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order summary
            </p>
            <PortalDetailRow icon={MapPin} label="Address" value={addressLine} />
            <PortalDetailRow
              icon={Calendar}
              label="Date"
              value={`${order.dayLabel}, ${order.scheduledDate}`}
            />
            <PortalDetailRow icon={Clock} label="Time" value={order.timeRange} />
            <PortalDetailRow
              icon={User}
              label="Cleaner"
              value={order.cleaner?.name ?? "To be assigned"}
            />
            <PortalDetailRow
              icon={Wallet}
              label="Price"
              value={formatPortalMoney(order.price, order.currency)}
            />
          </div>

          {order.cleaner ? (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your cleaner
              </h2>
              <CleanerProfileCard
                variant="compact"
                cleaner={{
                  id: order.cleaner.id,
                  name: order.cleaner.name,
                  avatarUrl: order.cleaner.avatarUrl ?? "",
                  completedOrders: 0,
                  averageRating: 0,
                  bio: "",
                }}
              />
            </section>
          ) : null}

          <SupportCard compact />

          <PortalPrimaryButton href={buildRepeatBookingHref(order)}>
            Repeat Booking
          </PortalPrimaryButton>
        </aside>
      </div>

      {showCancelConfirm ? (
        <ActionDialog title="Cancel this booking?" onClose={() => setShowCancelConfirm(false)}>
          {cancelError ? (
            <p className="text-sm text-rose-600">{cancelError}</p>
          ) : null}
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this order? Cancellation terms may apply.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={cancelSubmitting}
              onClick={() => void handleCancel()}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {cancelSubmitting ? "Cancelling…" : "Confirm cancel"}
            </button>
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className={PORTAL_SECONDARY_BUTTON_CLASS}
            >
              Keep booking
            </button>
          </div>
        </ActionDialog>
      ) : null}

      {showReschedule ? (
        <ActionDialog title="Request reschedule" onClose={() => setShowReschedule(false)}>
          <form onSubmit={handleReschedule} className="space-y-4">
            <textarea
              value={rescheduleMessage}
              onChange={(e) => setRescheduleMessage(e.target.value)}
              placeholder="Preferred dates or times…"
              rows={4}
              className="w-full rounded-2xl border border-slate-200/80 px-4 py-3 text-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
            />
            <button
              type="submit"
              disabled={rescheduleSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4d6f] disabled:opacity-60"
            >
              {rescheduleSubmitting ? "Sending…" : "Send request"}
            </button>
          </form>
        </ActionDialog>
      ) : null}

      {showReview ? (
        <ActionDialog title="Leave a review" onClose={() => setShowReview(false)}>
          <form onSubmit={handleReview} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Rating
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="mt-1 w-full rounded-2xl border border-slate-200/80 px-4 py-3 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us about your experience (optional)"
              rows={4}
              className="w-full rounded-2xl border border-slate-200/80 px-4 py-3 text-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
            />
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4d6f] disabled:opacity-60"
            >
              {reviewSubmitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </ActionDialog>
      ) : null}

      {showComplaint ? (
        <ActionDialog title="Report an issue" onClose={() => setShowComplaint(false)}>
          <form onSubmit={handleComplaint} className="space-y-4">
            <StyledSelect
              value={complaintReason}
              onChange={setComplaintReason}
              options={COMPLAINT_REASONS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />
            <textarea
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="Describe the issue"
              rows={4}
              required
              className="w-full rounded-2xl border border-slate-200/80 px-4 py-3 text-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10"
            />
            <button
              type="submit"
              disabled={complaintSubmitting || !complaintDescription.trim()}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4d6f] disabled:opacity-60"
            >
              {complaintSubmitting ? "Submitting…" : "Submit report"}
            </button>
          </form>
        </ActionDialog>
      ) : null}
    </div>
  );
}

function ActionDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:p-6">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
