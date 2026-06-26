"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { CARD_CLASS } from "@/components/ui/Card";
import type { BookingServiceOption } from "@/lib/booking/booking-services";
import { bookingServiceHref } from "@/lib/booking/booking-services";

type BookingServiceCardProps = {
  service: BookingServiceOption;
  addressId?: string;
};

export function BookingServiceCard({ service, addressId }: BookingServiceCardProps) {
  const { t } = usePublicT();

  return (
    <Link
      href={bookingServiceHref(service.param, { addressId })}
      className={`${CARD_CLASS} group block overflow-hidden transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:-translate-y-0.5`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF4FA] sm:aspect-[16/10]">
        <Image
          src={service.imageUrl}
          alt={t(service.titleKey)}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/15 to-transparent transition group-hover:from-slate-900/70" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {t(service.titleKey)}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">
            {t(service.subtitleKey)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <span className="text-sm font-semibold text-[#34597E]">
          {t("public.booking.selection.startCta")}
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-[#34597E] transition group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}
