import Link from "next/link";
import type { CleanerOrder } from "@/entities/order/cleaner-order.types";
import {
  formatOrderDate,
  formatOrderMoney,
  displayValue,
} from "@/features/orders/lib/format-order-display";

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
      {label}
    </span>
  );
}

type CleanerOrderCardProps = {
  order: CleanerOrder;
};

export default function CleanerOrderCard({ order }: CleanerOrderCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Order <span className="font-semibold text-slate-800">#{order.id}</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">
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

      <div className="my-5 h-px w-full bg-slate-100" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Address
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">{order.address.line}</p>
          {order.address.floor ? (
            <p className="mt-1 text-sm text-slate-500">
              Floor: {order.address.floor}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Service
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {order.serviceTypeLabel}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {formatOrderMoney(order.estimatedPrice, order.currency)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Client
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-800">{order.client.name}</p>
        <p className="mt-1 text-sm text-slate-600">{order.client.email}</p>
        <p className="text-sm text-slate-600">{order.client.phone}</p>
      </div>

      {order.assignment?.status ? (
        <p className="mt-4 text-xs text-slate-500">
          Assignment:{" "}
          <span className="font-medium text-slate-700">
            {displayValue(order.assignment.status)}
          </span>
        </p>
      ) : null}

      <div className="mt-5">
        <Link
          href={`/app/cleaner/orders/${order.id}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#34597E] shadow-sm transition hover:border-[#5B8DB8]/40 hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
