import Link from "next/link";
import type { ClientOrder } from "@/entities/order/client-order.types";
import {
  displayValue,
  formatOrderDate,
  formatOrderMoney,
} from "@/features/orders/lib/format-order-display";

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EEF4FA] px-3 py-1 text-xs font-semibold text-[#34597E] ring-1 ring-[#C5D9EB]">
      {label}
    </span>
  );
}

type ClientOrderCardProps = {
  order: ClientOrder;
};

export default function ClientOrderCard({ order }: ClientOrderCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
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
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Price
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {formatOrderMoney(order.estimatedPrice, order.currency)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Assigned cleaner
        </p>
        <p className="mt-2 text-sm font-medium text-slate-800">
          {order.assignedCleaner
            ? displayValue(order.assignedCleaner.name)
            : "Not assigned yet"}
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/app/client/orders/${order.routeId}`}
          className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f]"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
