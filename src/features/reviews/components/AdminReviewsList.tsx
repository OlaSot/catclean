"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminReviewListItem } from "@/entities/review/admin-review.types";
import type { AdminReviewsApiResponse } from "@/features/reviews/types/admin-reviews-api.types";
import {
  ADMIN_PAGE_STACK_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
} from "@/lib/admin-styles";

type LoadState = "loading" | "idle";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-[#34597E]">
      {rating}
      <span className="text-amber-500" aria-hidden>
        ★
      </span>
    </span>
  );
}

function ReviewMobileCard({ review }: { review: AdminReviewListItem }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{review.clientName}</p>
          <p className="truncate text-xs text-slate-500">{review.clientEmail}</p>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <p className="text-slate-600">
          <span className="font-medium text-slate-500">Order </span>
          <Link
            href={`/app/admin/orders/${review.orderId}`}
            className="font-semibold text-[#34597E] hover:underline"
          >
            #{review.orderDisplayId}
          </Link>
        </p>
        <p className="text-slate-600">
          <span className="font-medium text-slate-500">Cleaner </span>
          {review.cleanerName ?? "—"}
        </p>
        <p className="text-slate-600">
          <span className="font-medium text-slate-500">Comment </span>
          {review.comment?.trim() || "—"}
        </p>
        <p className="text-xs text-slate-400">{formatDateTime(review.createdAt)}</p>
      </div>
    </article>
  );
}

export default function AdminReviewsList() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/reviews", {
        credentials: "include",
      });
      const json = (await response.json()) as AdminReviewsApiResponse;

      if (!response.ok || json.error) {
        setReviews([]);
        setError(json.error ?? "Failed to load reviews");
        return;
      }

      setReviews(json.data ?? []);
    } catch {
      setReviews([]);
      setError("Failed to load reviews");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const isLoading = loadState === "loading";

  return (
    <div className={ADMIN_PAGE_STACK_CLASS}>
      <div className="max-w-2xl">
        <h1 className={ADMIN_PAGE_TITLE_CLASS}>Reviews</h1>
        <p className={ADMIN_PAGE_SUBTITLE_CLASS}>
          Client ratings and feedback after completed orders.
        </p>
        {!isLoading && !error ? (
          <p className="mt-3 text-xs font-medium text-slate-400">
            {reviews.length === 0
              ? "No reviews yet"
              : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Loading reviews...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && reviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">No reviews yet</p>
        </div>
      ) : null}

      {!isLoading && !error && reviews.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {reviews.map((review) => (
              <ReviewMobileCard key={review.id} review={review} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F6F8FB]/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Comment</th>
                    <th className="px-5 py-3">Cleaner</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-[#F6F8FB]/40">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {review.clientName}
                        </p>
                        <p className="text-xs text-slate-500">{review.clientEmail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/app/admin/orders/${review.orderId}`}
                          className="font-semibold text-[#34597E] hover:underline"
                        >
                          #{review.orderDisplayId}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <RatingStars rating={review.rating} />
                      </td>
                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {review.comment?.trim() || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {review.cleanerName ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDateTime(review.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
