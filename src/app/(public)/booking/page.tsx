import { Suspense } from "react";
import { LegacyBookingIntro } from "@/components/booking/LegacyBookingIntro";
import { BookingServiceSelection } from "@/components/booking/BookingServiceSelection";
import { SitePageShell } from "@/components/layout/SitePageShell";
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
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const repeatPrefill = await loadBookingPrefill({
    repeatFrom: params?.repeatFrom,
    addressId: params?.addressId,
  });
  const service = resolveBookingServiceParam(params?.service);

  if (service === "home_care") {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeCareWizard repeatPrefill={repeatPrefill} />
      </SitePageShell>
    );
  }

  if (service === "move_out") {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <MoveOutWizard repeatPrefill={repeatPrefill} />
      </SitePageShell>
    );
  }

  if (service === "home_reset") {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeResetWizard repeatPrefill={repeatPrefill} />
      </SitePageShell>
    );
  }

  if (service === "upholstery") {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <UpholsteryWizard repeatPrefill={repeatPrefill} />
      </SitePageShell>
    );
  }

  if (service === "window_cleaning") {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <WindowCleaningWizard repeatPrefill={repeatPrefill} />
      </SitePageShell>
    );
  }

  if (params?.service?.trim().toLowerCase() === "office_cleaning") {
    return (
      <SitePageShell contentClassName="py-6 sm:py-8">
        <BookingWizard initialService="office_cleaning" />
      </SitePageShell>
    );
  }

  if (service === "legacy") {
    return (
      <SitePageShell contentClassName="py-6 sm:py-8">
        <LegacyBookingIntro />
        <BookingWizard />
      </SitePageShell>
    );
  }

  return (
    <SitePageShell contentClassName="py-6 sm:py-10 md:py-12">
      <Suspense fallback={null}>
        <BookingServiceSelection />
      </Suspense>
    </SitePageShell>
  );
}
