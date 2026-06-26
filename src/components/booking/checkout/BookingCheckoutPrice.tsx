"use client";

import { usePublicT } from "@/i18n/public/usePublicT";

type Props = {
  price: string;
  isEstimate?: boolean;
};

export function BookingCheckoutPrice({ price, isEstimate = true }: Props) {
  const { t } = usePublicT();

  return (
    <section className="rounded-3xl border border-[#34597E]/12 bg-gradient-to-br from-[#34597E]/[0.06] via-white to-[#EEF4FA]/80 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {isEstimate ? t("public.checkout.price.estimatedTotal") : t("public.checkout.price.total")}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("public.checkout.price.vatIncluded")}</p>
        </div>
        <p
          key={price}
          className="checkout-price-animate text-4xl font-semibold tracking-tight text-[#34597E] sm:text-5xl"
        >
          {price}
        </p>
      </div>
    </section>
  );
}
