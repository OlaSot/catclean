import { Suspense } from "react";
import { SitePageShell } from "@/components/layout/SitePageShell";
import { BookingConfirmPreviewView } from "@/components/booking/checkout/BookingConfirmPreviewView";

export default function BookingConfirmPreviewPage() {
  return (
    <SitePageShell
      backgroundClassName="min-h-screen bg-white text-slate-700"
      contentClassName="py-4 sm:py-6 lg:py-8"
    >
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-slate-500">Loading preview…</div>
        }
      >
        <BookingConfirmPreviewView />
      </Suspense>
    </SitePageShell>
  );
}
