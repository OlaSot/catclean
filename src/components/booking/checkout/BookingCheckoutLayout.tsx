"use client";

import type { ReactNode } from "react";

type Props = {
  summary: ReactNode;
  visual: ReactNode;
};

export function BookingCheckoutLayout({ summary, visual }: Props) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] lg:gap-10 xl:gap-12">
      <div className="min-w-0 space-y-6 sm:space-y-7">{summary}</div>
      <div className="min-w-0">{visual}</div>
    </div>
  );
}
