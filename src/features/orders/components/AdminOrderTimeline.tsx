"use client";

import type { OrderStatusHistoryItem } from "@/entities/order/order-status-history.types";
import type { OrderStatus } from "@/entities/order/order.types";
import { ArrowRight, Circle, MessageSquare } from "lucide-react";
import { useT } from "@/i18n/useT";

function formatTimelineDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusPillClass(status: OrderStatus): string {
  const map: Partial<Record<OrderStatus, string>> = {
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

function StatusPill({ label, status }: { label: string; status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusPillClass(status)}`}
    >
      {label}
    </span>
  );
}

function formatActor(item: OrderStatusHistoryItem, t: (key: string) => string): string {
  const profile = item.changedBy;
  if (!profile) return t("timeline.system");
  const name = profile.fullName || profile.email || t("timeline.unknownUser");
  const role = profile.role ? ` · ${profile.role}` : "";
  return `${t("timeline.createdBy")}: ${name}${role}`;
}

function formatCommentText(item: OrderStatusHistoryItem): string | null {
  if (!item.comment) return null;
  if (item.noteKind === "request") {
    const stripped = item.comment.replace(/^\[Reschedule request\]\s*/i, "").trim();
    return stripped || item.comment;
  }
  return item.comment;
}

type AdminOrderTimelineProps = {
  items: OrderStatusHistoryItem[];
  compact?: boolean;
  maxItems?: number;
};

export default function AdminOrderTimeline({
  items,
  compact = false,
  maxItems,
}: AdminOrderTimelineProps) {
  const { t } = useT();
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">{t("timeline.noActivityYet")}</p>
    );
  }

  const source = compact ? [...items].reverse() : items;
  const visibleItems =
    typeof maxItems === "number" && maxItems > 0
      ? source.slice(0, maxItems)
      : source;

  return (
    <div className={compact ? "max-h-[420px] overflow-auto pr-1" : ""}>
      <ol className="relative space-y-0">
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        const commentText = formatCommentText(item);

        return (
          <li
            key={item.id}
            className={`relative flex gap-3 ${compact ? "pb-4" : "pb-6"} last:pb-0`}
          >
            {!isLast ? (
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-[#C5D9EB]"
                aria-hidden
              />
            ) : null}

              <span className="relative z-1 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EEF4FA] ring-2 ring-white">
              {item.isNote ? (
                <MessageSquare className="h-2.5 w-2.5 text-[#34597E]" aria-hidden />
              ) : (
                <Circle className="h-2 w-2 fill-[#5B8DB8] text-[#5B8DB8]" aria-hidden />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400">
                {formatTimelineDateTime(item.createdAt)}
              </p>

              <div className="mt-1.5">
                {item.isNote ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#EEF4FA] px-2 py-0.5 text-[11px] font-semibold text-[#34597E] ring-1 ring-[#C5D9EB]">
                      {item.noteKind === "request" ? t("timeline.request") : t("timeline.note")}
                    </span>
                    <StatusPill label={item.newStatusLabel} status={item.newStatus} />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {t("timeline.statusChanged")}
                    </span>
                    <StatusPill label={item.oldStatusLabel} status={item.oldStatus} />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
                    <StatusPill label={item.newStatusLabel} status={item.newStatus} />
                  </div>
                )}
              </div>

              <p className={`${compact ? "mt-1" : "mt-1.5"} text-xs text-slate-500`}>
                {formatActor(item, t)}
              </p>

              {commentText ? (
                <p
                  className={`rounded-xl border border-slate-200/80 bg-[#F6F8FB] text-sm leading-relaxed text-slate-700 ${
                    compact ? "mt-1.5 px-2.5 py-1.5" : "mt-2 px-3 py-2"
                  }`}
                >
                  {commentText}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
