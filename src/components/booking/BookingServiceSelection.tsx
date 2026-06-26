"use client";

import { useSearchParams } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { BOOKING_SERVICE_OPTIONS } from "@/lib/booking/booking-services";
import { BookingServiceCard } from "./BookingServiceCard";

export function BookingServiceSelection() {
  const { t } = usePublicT();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId") ?? undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 text-center sm:mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B8DB8]">
          {t("public.booking.selection.eyebrow")}
        </p>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl md:text-4xl">
          {t("public.booking.selection.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("public.booking.selection.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
        {BOOKING_SERVICE_OPTIONS.map((service) => (
          <BookingServiceCard
            key={service.param}
            service={service}
            addressId={addressId}
          />
        ))}
      </div>
    </div>
  );
}
