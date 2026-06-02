"use client";

import { BOOKING_WIZARD_STEPS, type BookingWizardStep } from "./types";

type WizardProgressProps = {
  step: BookingWizardStep;
};

export function WizardProgress({ step }: WizardProgressProps) {
  const currentIndex = Math.max(0, BOOKING_WIZARD_STEPS.indexOf(step));
  const percent = ((currentIndex + 1) / BOOKING_WIZARD_STEPS.length) * 100;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
        <span>Booking progress</span>
        <span>
          Step {currentIndex + 1} of {BOOKING_WIZARD_STEPS.length}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200/70">
        <div
          className="h-full rounded-full bg-[#34597E] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
