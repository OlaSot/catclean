"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";
import { WizardNav } from "@/components/ui/WizardNav";
import { StepConfirm as HomeCareStepConfirm } from "@/features/home-care-wizard/components/StepConfirm";
import { StepConfirm as HomeResetStepConfirm } from "@/features/home-reset-wizard/components/StepConfirm";
import { StepConfirm as MoveOutStepConfirm } from "@/features/move-out-wizard/components/StepConfirm";
import { StepWindowSummary } from "@/features/window-cleaning/components/StepWindowSummary";
import {
  BOOKING_CONFIRM_PREVIEW_SERVICES,
  getBookingConfirmPreviewEstimate,
  getWindowCleaningPreviewDuration,
  HOME_CARE_CONFIRM_PREVIEW_STATE,
  HOME_RESET_CONFIRM_PREVIEW_STATE,
  MOVE_OUT_CONFIRM_PREVIEW_STATE,
  resolveBookingConfirmPreviewService,
  WINDOW_CLEANING_CONFIRM_PREVIEW_STATE,
} from "@/lib/booking/booking-confirm-preview.fixtures";

const SERVICE_LABELS: Record<(typeof BOOKING_CONFIRM_PREVIEW_SERVICES)[number], string> = {
  home_reset: "Home Reset",
  home_care: "Home Care",
  move_out: "Move Out",
  window_cleaning: "Window Cleaning",
};

export function BookingConfirmPreviewView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = resolveBookingConfirmPreviewService(searchParams.get("service") ?? undefined);
  const estimate = getBookingConfirmPreviewEstimate(service);

  function renderConfirmStep() {
    switch (service) {
      case "home_care":
        return (
          <HomeCareStepConfirm state={HOME_CARE_CONFIRM_PREVIEW_STATE} estimatePrice={estimate} />
        );
      case "move_out":
        return (
          <MoveOutStepConfirm state={MOVE_OUT_CONFIRM_PREVIEW_STATE} estimatePrice={estimate} />
        );
      case "window_cleaning":
        return (
          <StepWindowSummary
            state={WINDOW_CLEANING_CONFIRM_PREVIEW_STATE}
            estimatePrice={estimate}
            estimateDurationMinutes={getWindowCleaningPreviewDuration()}
          />
        );
      default:
        return (
          <HomeResetStepConfirm state={HOME_RESET_CONFIRM_PREVIEW_STATE} estimatePrice={estimate} />
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 sm:px-5">
        <p className="font-semibold">Dev preview — confirm step only</p>
        <p className="mt-1 text-amber-900/85">
          Demo data is pre-filled. The confirm button does not submit a real booking.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BOOKING_CONFIRM_PREVIEW_SERVICES.map((id) => (
            <Link
              key={id}
              href={`/booking/preview?service=${id}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                service === id
                  ? "bg-[#34597E] text-white"
                  : "bg-white text-[#34597E] ring-1 ring-[#34597E]/20 hover:bg-[#34597E]/5"
              }`}
            >
              {SERVICE_LABELS[id]}
            </Link>
          ))}
        </div>
      </div>

      <WizardContentPanel>
        {renderConfirmStep()}
        <WizardNav
          mode="checkout"
          onBack={() => router.push("/booking")}
          onNext={() => undefined}
          showBack
          i18n
        />
      </WizardContentPanel>
    </div>
  );
}
