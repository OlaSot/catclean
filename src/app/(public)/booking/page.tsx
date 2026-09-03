import { Suspense } from "react";
import { LegacyBookingIntro } from "@/components/booking/LegacyBookingIntro";
import { BookingServiceSelection } from "@/components/booking/BookingServiceSelection";
import { BookingFlowShell } from "@/components/booking/BookingFlowShell";
import { BookingWizard } from "@/features/booking-wizard";
import { HomeCareWizard } from "@/features/home-care-wizard";
import { HomeResetWizard } from "@/features/home-reset-wizard";
import { MoveOutWizard } from "@/features/move-out-wizard";
import { UpholsteryWizard } from "@/features/upholstery-wizard";
import { WindowCleaningWizard } from "@/features/window-cleaning";
import { resolveBookingServiceParam } from "@/lib/booking/booking-services";
import { loadBookingPrefill } from "@/server/queries/orders/loadBookingPrefill";

type BookingPageProps = {
  searchParams?: Promise<{
    service?: string;
    repeatFrom?: string;
    addressId?: string;
    from?: string;
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const repeatPrefill = await loadBookingPrefill({
    repeatFrom: params?.repeatFrom,
    addressId: params?.addressId,
  });
  const service = resolveBookingServiceParam(params?.service);
  const portalMode = params?.from === "client-portal";
  const returnHref = portalMode ? "/app/client" : "/";

  if (service === "home_care") {
    return (
      <BookingFlowShell portalMode={portalMode}
        backgroundClassName="min-h-screen bg-white text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeCareWizard repeatPrefill={repeatPrefill} returnHref={returnHref} />
      </BookingFlowShell>
    );
  }

  if (service === "move_out") {
    return (
      <BookingFlowShell portalMode={portalMode}
        backgroundClassName="min-h-screen bg-white text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <MoveOutWizard repeatPrefill={repeatPrefill} returnHref={returnHref} />
      </BookingFlowShell>
    );
  }

  if (service === "home_reset") {
    return (
      <BookingFlowShell portalMode={portalMode}
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeResetWizard repeatPrefill={repeatPrefill} returnHref={returnHref} />
      </BookingFlowShell>
    );
  }

  if (service === "upholstery") {
    return (
      <BookingFlowShell portalMode={portalMode}
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <UpholsteryWizard repeatPrefill={repeatPrefill} />
      </BookingFlowShell>
    );
  }

  if (service === "window_cleaning") {
    return (
      <BookingFlowShell portalMode={portalMode}
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <WindowCleaningWizard repeatPrefill={repeatPrefill} />
      </BookingFlowShell>
    );
  }

  if (params?.service?.trim().toLowerCase() === "office_cleaning") {
    return (
      <BookingFlowShell portalMode={portalMode} contentClassName="py-6 sm:py-8">
        <BookingWizard initialService="office_cleaning" />
      </BookingFlowShell>
    );
  }

  if (service === "legacy") {
    return (
      <BookingFlowShell portalMode={portalMode} contentClassName="py-6 sm:py-8">
        <LegacyBookingIntro />
        <BookingWizard />
      </BookingFlowShell>
    );
  }

  return (
    <BookingFlowShell portalMode={portalMode} contentClassName="py-6 sm:py-10 md:py-12">
      <Suspense fallback={null}>
        <BookingServiceSelection />
      </Suspense>
    </BookingFlowShell>
  );
}
