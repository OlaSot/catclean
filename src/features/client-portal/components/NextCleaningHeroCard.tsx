"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import type { PortalOrder } from "../types/portal.types";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";
import PortalPrimaryButton from "./PortalPrimaryButton";
import PortalStatusBadge from "./PortalStatusBadge";

type NextCleaningHeroCardProps = {
  order: PortalOrder;
  imageUrl: string;
};

export default function NextCleaningHeroCard({
  order,
  imageUrl,
}: NextCleaningHeroCardProps) {
  return (
    <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
      <div className="lg:hidden">
        <div className="relative aspect-[16/10] bg-[#EEF4FA]">
          <Image
            src={imageUrl}
            alt={order.serviceName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-semibold text-white">
              {order.serviceName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-lg font-medium text-white/95">{order.dayLabel}</p>
              <span className="text-white/50">·</span>
              <p className="text-lg font-medium text-white/95">
                {order.timeRange}
              </p>
            </div>
            {order.cleaner ? (
              <p className="mt-2 text-sm text-white/85">
                <User className="mr-1 inline h-4 w-4" aria-hidden />
                {order.cleaner.name}
              </p>
            ) : null}
            <div className="mt-4">
              <PortalStatusBadge
                label={order.statusLabel}
                status={order.status}
              />
            </div>
          </div>
        </div>
        <div className="p-5">
          <PortalPrimaryButton href={`/app/client/orders/${order.id}`}>
            View Order
          </PortalPrimaryButton>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,44%)] lg:items-stretch">
        <div className="flex flex-col justify-between p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Your next cleaning
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
              {order.serviceName}
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className="text-lg font-medium text-slate-700">{order.dayLabel}</p>
              <span className="text-slate-300">·</span>
              <p className="text-lg font-medium text-slate-700">
                {order.timeRange}
              </p>
            </div>
            {order.cleaner ? (
              <p className="mt-3 text-sm text-slate-600">
                Cleaner: <span className="font-semibold">{order.cleaner.name}</span>
              </p>
            ) : null}
            <div className="mt-6">
              <PortalStatusBadge
                label={order.statusLabel}
                status={order.status}
              />
            </div>
          </div>
          <div className="mt-8">
            <PortalPrimaryButton
              href={`/app/client/orders/${order.id}`}
              className="min-w-[200px]"
            >
              View Order
            </PortalPrimaryButton>
          </div>
        </div>

        <div className="relative min-h-[300px] bg-[#EEF4FA]">
          <Image
            src={imageUrl}
            alt={order.serviceName}
            fill
            className="object-cover"
            sizes="480px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10" />
        </div>
      </div>
    </div>
  );
}
