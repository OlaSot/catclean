import { LegacyBookingIntro } from "@/components/booking/LegacyBookingIntro";
import { SitePageShell } from "@/components/layout/SitePageShell";
import { BookingWizard } from "@/features/booking-wizard";
import { HomeCareWizard, HOME_CARE_SERVICE_PARAM } from "@/features/home-care-wizard";
import { HomeResetWizard } from "@/features/home-reset-wizard";
import { MoveOutWizard, MOVE_OUT_SERVICE_PARAM } from "@/features/move-out-wizard";
import { UpholsteryWizard } from "@/features/upholstery-wizard";
import { WindowCleaningWizard, WINDOW_SERVICE_PARAM } from "@/features/window-cleaning";

type BookingPageProps = {
  searchParams?: Promise<{ service?: string }>;
};

const HOME_RESET_SERVICE_PARAM = "home_reset";
const MOVE_OUT_PARAM = MOVE_OUT_SERVICE_PARAM;
const UPHOLSTERY_SERVICE_PARAM = "dry_cleaning";
const LEGACY_REGULAR_CLEANING_PARAM = "regular_cleaning";

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const isHomeResetFlow = params?.service === HOME_RESET_SERVICE_PARAM;
  const isMoveOutFlow = params?.service === MOVE_OUT_PARAM;
  const isHomeCareFlow =
    params?.service === HOME_CARE_SERVICE_PARAM ||
    params?.service === LEGACY_REGULAR_CLEANING_PARAM;
  const isUpholsteryFlow = params?.service === UPHOLSTERY_SERVICE_PARAM;
  const isWindowCleaningFlow = params?.service === WINDOW_SERVICE_PARAM;

  if (isHomeCareFlow) {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        bookHref="/booking?service=home_care"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeCareWizard />
      </SitePageShell>
    );
  }

  if (isMoveOutFlow) {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        bookHref="/booking?service=move_out"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <MoveOutWizard />
      </SitePageShell>
    );
  }

  if (isHomeResetFlow) {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-white text-slate-700"
        bookHref="/booking?service=home_reset"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <HomeResetWizard />
      </SitePageShell>
    );
  }

  if (isUpholsteryFlow) {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        bookHref="/booking?service=dry_cleaning"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <UpholsteryWizard />
      </SitePageShell>
    );
  }

  if (isWindowCleaningFlow) {
    return (
      <SitePageShell
        backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
        bookHref="/booking?service=window_cleaning"
        contentClassName="py-4 sm:py-6 lg:py-8"
      >
        <WindowCleaningWizard />
      </SitePageShell>
    );
  }

  return (
    <SitePageShell contentClassName="py-6 sm:py-8">
      <LegacyBookingIntro />
      <BookingWizard initialService={params?.service} />
    </SitePageShell>
  );
}
