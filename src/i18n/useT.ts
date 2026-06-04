"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { orderStatusTranslationKey } from "@/i18n/translate";
import type { TranslationKey } from "@/i18n/i18n.types";
import {
  getBookingProductI18nKey,
  resolveBookingProductKey,
  type ResolveBookingProductInput,
} from "@/lib/orders/booking-product-label";

export function useT() {
  const { t, locale, setLocale } = useI18n();

  const orderStatusLabel = (status: string | null | undefined) =>
    t(orderStatusTranslationKey(status) as TranslationKey);

  const paymentLabel = (status: "paid" | "unpaid" | "card_hold") => {
    if (status === "paid") return t("payment.paid");
    if (status === "card_hold") return t("payment.partialPending");
    return t("payment.unpaid");
  };

  const serviceTypeLabel = (serviceType: string) =>
    t(`serviceType.${serviceType}` as TranslationKey);

  const bookingProductLabel = (input: ResolveBookingProductInput | string, serviceType?: string) => {
    const resolved =
      typeof input === "string"
        ? resolveBookingProductKey({ bookingProduct: input, serviceType })
        : resolveBookingProductKey(input);
    const i18nKey = getBookingProductI18nKey(resolved);
    if (i18nKey) return t(i18nKey);
    return serviceTypeLabel(serviceType ?? resolved);
  };

  const fileCategoryLabel = (category: string) =>
    t(`fileCategory.${category}` as TranslationKey);

  return {
    t,
    locale,
    setLocale,
    orderStatusLabel,
    paymentLabel,
    serviceTypeLabel,
    bookingProductLabel,
    fileCategoryLabel,
  };
}
