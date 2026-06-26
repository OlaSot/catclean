import Image from "next/image";
import Link from "next/link";
import type { PortalOrder } from "../types/portal.types";
import { formatPortalMoney } from "../lib/portal-utils";
import { buildRepeatBookingHref } from "../lib/repeat-booking";
import { PORTAL_SERVICE_BY_ID } from "../lib/service-catalog";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";
import PortalStatusBadge from "./PortalStatusBadge";

type PortalOrderCardProps = {
  order: PortalOrder;
  variant?: "compact" | "full" | "list";
  showRepeatBooking?: boolean;
};

function OrderCardHero({
  order,
  imageUrl,
}: {
  order: PortalOrder;
  imageUrl: string;
}) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEF4FA]">
      <Image
        src={imageUrl}
        alt={order.serviceName}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{order.serviceName}</h3>
        <PortalStatusBadge
          label={order.statusLabel}
          status={order.status}
          size="sm"
        />
      </div>
    </div>
  );
}

export default function PortalOrderCard({
  order,
  variant = "full",
  showRepeatBooking = false,
}: PortalOrderCardProps) {
  const service = PORTAL_SERVICE_BY_ID[order.serviceId];
  const imageUrl = service?.imageUrl ?? "/wizard/wizard_main.png";
  const repeatHref = buildRepeatBookingHref(order);
  const canRepeat = showRepeatBooking || order.status === "completed";

  if (variant === "list") {
    return (
      <article className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
        <div className="lg:hidden">
          <OrderCardHero order={order} imageUrl={imageUrl} />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{order.dayLabel}</p>
                <p className="text-base font-semibold text-slate-800">
                  {order.timeRange}
                </p>
              </div>
              <p className="text-lg font-semibold text-slate-800">
                {formatPortalMoney(order.price, order.currency)}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              {order.address.line}, {order.address.city}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/app/client/orders/${order.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-[#34597E] transition hover:border-[#C5D9EB] hover:bg-[#f9fcff]"
              >
                View Details
              </Link>
              {canRepeat ? (
                <Link
                  href={repeatHref}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f]"
                >
                  Repeat Booking
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`${PORTAL_CARD_CLASS} hidden overflow-hidden transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:flex`}>
          <div className="relative min-h-[160px] w-48 shrink-0 self-stretch overflow-hidden bg-[#EEF4FA] xl:w-56">
            <Image
              src={imageUrl}
              alt={order.serviceName}
              fill
              className="object-cover"
              sizes="224px"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {order.serviceName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {order.dayLabel} · {order.timeRange}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {order.address.line}, {order.address.city}
                </p>
              </div>
              <PortalStatusBadge
                label={order.statusLabel}
                status={order.status}
                size="sm"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-800">
                {formatPortalMoney(order.price, order.currency)}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/app/client/orders/${order.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-[#34597E] transition hover:border-[#C5D9EB] hover:bg-[#f9fcff]"
                >
                  View details
                </Link>
                {canRepeat ? (
                  <Link
                    href={repeatHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f]"
                  >
                    Repeat Booking
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
      <OrderCardHero order={order} imageUrl={imageUrl} />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{order.dayLabel}</p>
            <p className="text-base font-semibold text-slate-800">
              {order.timeRange}
            </p>
          </div>
          <p className="text-lg font-semibold text-slate-800">
            {formatPortalMoney(order.price, order.currency)}
          </p>
        </div>

        {variant === "full" ? (
          <p className="text-sm text-slate-600">
            {order.address.line}, {order.address.city}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/app/client/orders/${order.id}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-[#34597E] transition hover:border-[#C5D9EB] hover:bg-[#f9fcff] sm:flex-1 lg:w-auto"
          >
            View Details
          </Link>
          {canRepeat ? (
            <Link
              href={repeatHref}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] sm:flex-1 lg:w-auto"
            >
              Repeat Booking
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
