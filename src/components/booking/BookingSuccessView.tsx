"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

type Props = {
  orderId: string | null;
  emailSent?: boolean;
  returnToPortal?: boolean;
};

export function BookingSuccessView({ orderId, emailSent = false, returnToPortal = false }: Props) {
  const { t } = usePublicT();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          {t("public.booking.success.title")}
        </h1>
        <p className="text-base leading-relaxed text-slate-500">
          {emailSent
            ? t("public.booking.success.subtitleWithEmail")
            : t("public.booking.success.subtitle")}
        </p>
      </div>
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 text-left">
        <p className="text-sm text-slate-400">{t("public.booking.success.orderRef")}</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">
          {orderId ?? t("public.booking.success.missing")}
        </p>
      </div>
      <Link
        href={returnToPortal ? "/app/client" : "/"}
        className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3a6288]"
      >
        {returnToPortal ? t("public.booking.success.portal") : t("public.booking.success.home")}
      </Link>
    </div>
  );
}
