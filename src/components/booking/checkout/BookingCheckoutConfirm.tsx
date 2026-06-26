"use client";

import "./booking-checkout.css";
import { BookingCheckoutLayout } from "./BookingCheckoutLayout";
import { BookingCheckoutPrice } from "./BookingCheckoutPrice";
import { BookingConfirmHero } from "./BookingConfirmHero";
import { BookingOverviewCard } from "./BookingOverviewCard";
import { BookingVisualPanel } from "./BookingVisualPanel";
import { CheckoutTrustRows } from "./CheckoutTrustRows";
import { CollapsibleScopeSections } from "./CollapsibleScopeSections";
import type { BookingCheckoutConfirmProps } from "./booking-checkout.types";

export function BookingCheckoutConfirm({
  overviewRows,
  scopeSections,
  detailRows,
  price,
  isEstimate = true,
  imageSrc,
  imageAlt,
  footerNote,
  extraContent,
}: BookingCheckoutConfirmProps) {
  return (
    <BookingCheckoutLayout
      summary={
        <>
          <BookingConfirmHero />
          <BookingOverviewCard rows={overviewRows} detailRows={detailRows} />
          {scopeSections && scopeSections.length > 0 ? (
            <CollapsibleScopeSections sections={scopeSections} />
          ) : null}
          {extraContent}
          <BookingCheckoutPrice price={price} isEstimate={isEstimate} />
          <CheckoutTrustRows />
          {footerNote ? (
            <p className="text-sm leading-relaxed text-slate-400">{footerNote}</p>
          ) : null}
        </>
      }
      visual={<BookingVisualPanel imageSrc={imageSrc} imageAlt={imageAlt} />}
    />
  );
}
