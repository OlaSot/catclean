"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";
import { BookingSummarySidebar } from "./components/BookingSummarySidebar";
import { StepSelectItems } from "./components/StepSelectItems";
import { StepWindowAddress } from "./components/StepWindowAddress";
import { StepWindowContact } from "./components/StepWindowContact";
import { StepWindowDetails } from "./components/StepWindowDetails";
import { StepWindowExtras } from "./components/StepWindowExtras";
import { StepWindowSchedule } from "./components/StepWindowSchedule";
import { StepWindowSummary } from "./components/StepWindowSummary";
import { TrustStrip } from "./components/TrustStrip";
import { WindowCleaningWizardNav } from "./components/WindowCleaningWizardNav";
import { WindowCleaningWizardStepper } from "./components/WindowCleaningWizardStepper";
import { INITIAL_WINDOW_CLEANING_STATE } from "./window-cleaning.state";
import type { WindowCleaningWizardState, WindowItemId } from "./window-cleaning.types";
import { calculateWindowCleaningEstimate, getSelectedWindowItems } from "./window-cleaning.utils";
import type { RepeatBookingPrefill } from "@/lib/booking/repeat-booking-prefill";
import {
  applyAddressPrefill,
  applyContactPrefill,
} from "@/lib/booking/repeat-booking-prefill";

type ValidationErrors = Record<string, string>;

type WindowCleaningWizardProps = {
  repeatPrefill?: RepeatBookingPrefill;
};

function buildInitialState(repeatPrefill?: RepeatBookingPrefill): WindowCleaningWizardState {
  if (!repeatPrefill) return INITIAL_WINDOW_CLEANING_STATE;
  return applyContactPrefill(
    applyAddressPrefill(INITIAL_WINDOW_CLEANING_STATE, repeatPrefill),
    repeatPrefill,
  );
  // TODO: map window quantities and extras from serviceDetails
}

export function WindowCleaningWizard({ repeatPrefill }: WindowCleaningWizardProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WindowCleaningWizardState>(() =>
    buildInitialState(repeatPrefill),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const estimate = useMemo(() => calculateWindowCleaningEstimate(state), [state]);
  const isSummaryStep = currentStep === 7;

  function updateQuantity(id: WindowItemId, quantity: number) {
    setState((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: quantity },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.items;
      return next;
    });
  }

  function validateStep(step: number): boolean {
    const nextErrors: ValidationErrors = {};

    if (step === 1) {
      const hasItems = getSelectedWindowItems(state.quantities).length > 0;
      if (!hasItems) nextErrors.items = "Please select at least one window or door.";
    }

    if (step === 2) {
      if (state.details.insideOnly == null) nextErrors.insideOnly = "Please choose an option.";
      if (state.details.outsideRequired == null) {
        nextErrors.outsideRequired = "Please choose an option.";
      }
      if (!state.details.access) nextErrors.access = "Please choose accessibility.";
    }

    if (step === 4) {
      if (!state.address.street.trim()) nextErrors.street = "Street is required";
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = "House number is required";
      if (!state.address.zip.trim()) nextErrors.zip = "ZIP is required";
      if (!state.address.city.trim()) nextErrors.city = "City is required";
    }

    if (step === 5) {
      if (!state.schedule.date) nextErrors.date = "Date is required";
      if (!state.schedule.time) nextErrors.time = "Time is required";
    }

    if (step === 6) {
      if (!state.contact.name.trim()) nextErrors.name = "Name is required";
      if (!state.contact.phone.trim()) nextErrors.phone = "Phone is required";
      const email = state.contact.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
      setErrors({});
      return;
    }
    router.push("/");
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;

    if (currentStep < 7) {
      setCurrentStep((step) => step + 1);
      setErrors({});
      return;
    }

    setErrors({ submit: "Online booking is not available yet. Your summary is ready for review." });
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <StepSelectItems
            quantities={state.quantities}
            onQuantityChange={updateQuantity}
            error={errors.items}
          />
        );
      case 2:
        return (
          <StepWindowDetails
            value={state.details}
            onChange={(details) => setState((prev) => ({ ...prev, details }))}
            errors={{
              insideOnly: errors.insideOnly,
              outsideRequired: errors.outsideRequired,
              access: errors.access,
            }}
          />
        );
      case 3:
        return (
          <StepWindowExtras
            value={state.extras}
            onChange={(extras) => setState((prev) => ({ ...prev, extras }))}
          />
        );
      case 4:
        return (
          <StepWindowAddress
            value={state.address}
            onChange={(address) => setState((prev) => ({ ...prev, address }))}
            errors={{
              street: errors.street,
              houseNumber: errors.houseNumber,
              zip: errors.zip,
              city: errors.city,
            }}
          />
        );
      case 5:
        return (
          <StepWindowSchedule
            value={state.schedule}
            onChange={(schedule) => setState((prev) => ({ ...prev, schedule }))}
            errors={{ date: errors.date, time: errors.time }}
          />
        );
      case 6:
        return (
          <StepWindowContact
            value={state.contact}
            onChange={(contact) => setState((prev) => ({ ...prev, contact }))}
            errors={{ name: errors.name, phone: errors.phone, email: errors.email }}
          />
        );
      case 7:
        return (
          <StepWindowSummary
            state={state}
            estimatePrice={estimate.price}
            estimateDurationMinutes={estimate.durationMinutes}
          />
        );
      default:
        return null;
    }
  }

  const sidebar = (
    <BookingSummarySidebar
      state={state}
      estimatePrice={estimate.price}
      estimateDurationMinutes={estimate.durationMinutes}
    />
  );

  const layoutWithSidebar = !isSummaryStep;

  return (
    <div className="space-y-6 sm:space-y-8">
      <WindowCleaningWizardStepper currentStep={currentStep} />

      {layoutWithSidebar ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="lg:hidden">{sidebar}</div>

            <WizardContentPanel>
              {renderStep()}

              {errors.submit ? <p className="text-sm text-rose-600">{errors.submit}</p> : null}

              <WindowCleaningWizardNav
                onBack={handleBack}
                onNext={handleNext}
                nextLabel="Next step"
              />
            </WizardContentPanel>
          </div>

          <div className="sticky top-6 hidden lg:block">{sidebar}</div>
        </div>
      ) : (
        <WizardContentPanel>
          {renderStep()}

          {errors.submit ? <p className="text-sm text-rose-600">{errors.submit}</p> : null}

          <WindowCleaningWizardNav
            onBack={handleBack}
            onNext={handleNext}
            mode="checkout"
          />
        </WizardContentPanel>
      )}

      {!isSummaryStep ? <TrustStrip /> : null}
    </div>
  );
}
