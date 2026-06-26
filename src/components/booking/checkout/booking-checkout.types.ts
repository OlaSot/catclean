import type { ReactNode } from "react";

import type { CheckoutOverviewIconId } from "./booking-checkout.icons";

export type CheckoutOverviewRow = {
  id: string;
  icon: CheckoutOverviewIconId;
  label: string;
  value: string;
};

export type CheckoutScopeSection = {
  title: string;
  items: string[];
};

export type CheckoutDetailRow = {
  id: string;
  label: string;
  value: string;
};

export type BookingCheckoutConfirmProps = {
  overviewRows: CheckoutOverviewRow[];
  scopeSections?: CheckoutScopeSection[];
  detailRows?: CheckoutDetailRow[];
  price: string;
  isEstimate?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  footerNote?: string;
  extraContent?: ReactNode;
};
