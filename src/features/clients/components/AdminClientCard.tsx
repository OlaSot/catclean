import Link from "next/link";
import type { AdminClient } from "@/entities/client/admin-client.types";
import AdminClientAvatar from "@/features/clients/components/AdminClientAvatar";
import { formatClientTypeLabel } from "@/lib/constants/client-type";
import {
  displayValue,
  formatOrderDate,
} from "@/features/orders/lib/format-order-display";

type AdminClientCardProps = {
  client: AdminClient;
};

function clientTypeBadgeClass(clientType: string | null): string {
  const base =
    "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 capitalize";
  if (clientType === "business") {
    return `${base} bg-violet-50 text-violet-700 ring-violet-200`;
  }
  if (clientType === "private") {
    return `${base} bg-sky-50 text-sky-700 ring-sky-200`;
  }
  return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
}

export default function AdminClientCard({ client }: AdminClientCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start gap-4">
        <AdminClientAvatar
          key={client.avatarUrl ?? client.id}
          name={client.name}
          avatarUrl={client.avatarUrl}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">
                {client.name}
              </h2>
              <p className="mt-1 truncate text-sm text-slate-600">{client.email}</p>
              <p className="truncate text-sm text-slate-600">{client.phone}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {client.clientType ? (
                <span className={clientTypeBadgeClass(client.clientType)}>
                  {formatClientTypeLabel(client.clientType)}
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full bg-[#EEF4FA] px-3 py-1 text-xs font-semibold text-[#34597E] ring-1 ring-[#C5D9EB]">
                {client.ordersCount} заказ(ов)
              </span>
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid flex-1 gap-4 sm:grid-cols-2">
        {client.companyName ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Компания
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {displayValue(client.companyName)}
            </dd>
          </div>
        ) : null}
        <div className={client.companyName ? "" : "sm:col-span-2"}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Последний заказ
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {client.lastOrderDate
              ? formatOrderDate(client.lastOrderDate)
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex justify-end border-t border-[#E5EDF5] pt-4">
        <Link
          href={`/app/admin/clients/${client.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f]"
        >
          Подробнее
        </Link>
      </div>
    </article>
  );
}
