"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { normalizePhone } from "@/lib/phone/normalize-phone";
import { isPublicBookingSlotTooSoon } from "@/lib/booking/berlin-datetime";
import {
  translatePublicBookingError,
  usePublicBookingSubmit,
} from "@/lib/booking/submit-public-booking";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";
import { HomeResetWizardNav } from "@/features/home-reset-wizard/components/HomeResetWizardNav";
import { StepAddress } from "@/features/home-reset-wizard/components/StepAddress";
import { StepContact } from "@/features/home-reset-wizard/components/StepContact";
import { StepSchedule } from "@/features/home-reset-wizard/components/StepSchedule";
import { WizardStepTransition } from "@/features/home-reset-wizard/components/WizardStepTransition";
import { TrustStrip } from "@/features/home-reset-wizard/components/TrustStrip";
import { useHomeResetStepTransition } from "@/features/home-reset-wizard/hooks/useHomeResetStepTransition";
import "@/features/home-reset-wizard/home-reset-motion.css";
import { HomeCareProgress } from "./components/HomeCareProgress";
import { HomeCareSummarySidebar } from "./components/HomeCareSummarySidebar";
import { StepConfirm } from "./components/StepConfirm";
import { StepExtras } from "./components/StepExtras";
import { StepFrequency } from "./components/StepFrequency";
import { StepHomeDetails } from "./components/StepHomeDetails";
import { StepPets } from "./components/StepPets";
import { HOME_CARE_TOTAL_STEPS } from "./home-care-wizard.constants";
import { INITIAL_HOME_CARE_STATE } from "./home-care-wizard.state";
import type { HomeCareWizardState } from "./home-care-wizard.types";
import { BOOKING_PRODUCT_HOME_CARE } from "./home-care-wizard.constants";
import {
  buildServiceDetails,
  calculateHomeCareEstimate,
  HOME_CARE_ORDER_SERVICE_TYPE,
  serializeHomeCareComment,
} from "./home-care-wizard.utils";
import type { RepeatBookingPrefill } from "@/lib/booking/repeat-booking-prefill";
import {
  applyAddressPrefill,
  applyContactPrefill,
} from "@/lib/booking/repeat-booking-prefill";

type ValidationErrors = Record<string, string>;

type HomeCareWizardProps = {
  repeatPrefill?: RepeatBookingPrefill;
  returnHref?: string;
};

function buildInitialState(repeatPrefill?: RepeatBookingPrefill): HomeCareWizardState {
  if (!repeatPrefill) return INITIAL_HOME_CARE_STATE;
  const prefilled = applyContactPrefill(
    applyAddressPrefill(INITIAL_HOME_CARE_STATE, repeatPrefill),
    repeatPrefill,
  );
  const details = repeatPrefill.serviceDetails?.type === "regular_cleaning"
    ? repeatPrefill.serviceDetails.data
    : null;
  const propertyType = details?.propertyType === "house" || details?.propertyType === "apartment"
    ? details.propertyType
    : prefilled.propertyType;
  const frequency = ["one_time", "weekly", "biweekly", "monthly"].includes(details?.cleaningFrequency ?? "")
    ? details?.cleaningFrequency as HomeCareWizardState["frequency"]
    : prefilled.frequency;
  const petType = details?.petType;
  const petsOption = petType === "cat" || petType === "dog" || petType === "multiple"
    ? petType
    : "no_pets";
  return {
    ...prefilled,
    frequency,
    propertyType,
    propertySizeM2: details?.propertySizeM2 && details.propertySizeM2 > 0 ? details.propertySizeM2 : prefilled.propertySizeM2,
    floorsCount: details?.floorsCount && details.floorsCount > 0 ? details.floorsCount : prefilled.floorsCount,
    petsOption,
    enhancements: {
      oven_refresh: Boolean(details?.ovenCleaning),
      fridge_refresh: Boolean(details?.fridgeCleaning),
      inside_cabinets: Boolean(details?.insideCabinets),
      balcony_cleaning: Boolean(details?.balconyIncluded),
      window_cleaning: Boolean(details?.windowsInside),
    },
    schedule: { date: "", time: "" },
  };
}

export function HomeCareWizard({ repeatPrefill, returnHref = "/" }: HomeCareWizardProps = {}) {
  const { t } = usePublicT();
  const router = useRouter();
  const { progressStep, displayStep, phase, goToStep, handleStepAnimationEnd } =
    useHomeResetStepTransition(1);
  const [state, setState] = useState<HomeCareWizardState>(() => buildInitialState(repeatPrefill));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { submit } = usePublicBookingSubmit({ returnToPortal: returnHref === "/app/client" });

  const estimate = useMemo(() => calculateHomeCareEstimate(state), [state]);
  const showSidebar = progressStep >= 2 && progressStep <= 7;
  const isConfirm = displayStep === HOME_CARE_TOTAL_STEPS;

  function validateStep(step: number): boolean {
    const nextErrors: ValidationErrors = {};

    if (step === 2 && !state.propertyType) {
      nextErrors.propertyType = t("public.validation.selectOption");
    }

    if (step === 5) {
      if (!state.schedule.date) nextErrors.date = t("public.validation.chooseDate");
      if (!state.schedule.time) nextErrors.time = t("public.validation.chooseTime");
      else if (state.schedule.date && isPublicBookingSlotTooSoon(state.schedule.date, state.schedule.time)) {
        nextErrors.time = t("public.validation.slotTooSoon");
      }
    }

    if (step === 6) {
      if (!state.address.street.trim()) nextErrors.street = t("public.validation.required");
      else if (!state.address.serviceAreaValidated) {
        nextErrors.street = t("public.validation.regionHannoverAddress");
      }
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (step === 7) {
      if (!state.contact.name.trim()) nextErrors.name = t("public.validation.required");
      const normalized = normalizePhone(state.contact.phone);
      if (!normalized) nextErrors.phone = t("public.validation.invalidPhone");
      const email = state.contact.email.trim();
      if (!email) nextErrors.email = t("public.validation.required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = t("public.validation.invalidEmail");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleBack() {
    if (phase === "exit") return;
    if (displayStep === 1) {
      router.push(returnHref);
      return;
    }
    goToStep(displayStep - 1);
    setErrors({});
    setSubmitError(null);
  }

  function handleNext() {
    if (phase === "exit") return;
    if (!validateStep(displayStep)) return;

    if (displayStep < HOME_CARE_TOTAL_STEPS) {
      goToStep(displayStep + 1);
      setErrors({});
      setSubmitError(null);
    }
  }

  async function handleSubmit() {
    if (phase === "exit" || submitting) return;

    if (!validateStep(5)) {
      goToStep(5);
      return;
    }
    if (!validateStep(7)) {
      goToStep(7);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const serviceDetails = buildServiceDetails(state);
    const normalizedPhone = normalizePhone(state.contact.phone);

    if (!serviceDetails || !normalizedPhone || estimate.price == null) {
      setSubmitting(false);
      setSubmitError(t("public.validation.completeFields"));
      return;
    }

    const payload = {
      serviceType: HOME_CARE_ORDER_SERVICE_TYPE,
      bookingProduct: BOOKING_PRODUCT_HOME_CARE,
      serviceDetails,
      clientName: state.contact.name.trim(),
      clientPhone: normalizedPhone,
      clientEmail: state.contact.email.trim(),
      scheduledDate: state.schedule.date,
      scheduledTime: state.schedule.time,
      street: state.address.street.trim(),
      houseNumber: state.address.houseNumber.trim(),
      apartment: state.address.apartment.trim(),
      zip: state.address.zip.trim(),
      city: state.address.city.trim(),
      floor: state.address.floor.trim(),
      estimatedPrice: estimate.price,
      customerComment: serializeHomeCareComment(state),
      repeatFromOrderId: repeatPrefill?.orderId || undefined,
    };

    try {
      const result = await submit(payload);
      if (!result.ok && !("blocked" in result && result.blocked)) {
        if (result.error === "public.validation.slotTooSoon") {
          setErrors({ time: t("public.validation.slotTooSoon") });
          goToStep(5);
        }
        setSubmitError(translatePublicBookingError(t, result.error));
      }
    } catch {
      setSubmitError(t("public.homeCare.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep(step: number) {
    switch (step) {
      case 1:
        return (
          <StepFrequency
            value={state.frequency}
            onChange={(frequency) => setState((prev) => ({ ...prev, frequency }))}
          />
        );
      case 2:
        return (
          <StepHomeDetails
            propertyType={state.propertyType}
            propertySizeM2={state.propertySizeM2}
            floorsCount={state.floorsCount}
            estimatePrice={state.propertyType ? estimate.price : null}
            onPropertyTypeChange={(propertyType) =>
              setState((prev) => ({ ...prev, propertyType }))
            }
            onSizeChange={(propertySizeM2) =>
              setState((prev) => ({ ...prev, propertySizeM2 }))
            }
            onFloorsCountChange={(floorsCount) =>
              setState((prev) => ({ ...prev, floorsCount }))
            }
            error={errors.propertyType}
          />
        );
      case 3:
        return (
          <StepPets
            value={state.petsOption}
            onChange={(petsOption) => setState((prev) => ({ ...prev, petsOption }))}
          />
        );
      case 4:
        return (
          <StepExtras
            value={state.enhancements}
            onChange={(enhancements) => setState((prev) => ({ ...prev, enhancements }))}
          />
        );
      case 5:
        return (
          <StepSchedule
            value={state.schedule}
            onChange={(schedule) => setState((prev) => ({ ...prev, schedule }))}
            errors={{ date: errors.date, time: errors.time }}
            durationMinutes={estimate.durationMinutes}
          />
        );
      case 6:
        return (
          <StepAddress
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
      case 7:
        return (
          <StepContact
            value={state.contact}
            onChange={(contact) => setState((prev) => ({ ...prev, contact }))}
            errors={{ name: errors.name, phone: errors.phone, email: errors.email }}
          />
        );
      case 8:
        return <StepConfirm state={state} estimatePrice={estimate.price} />;
      default:
        return null;
    }
  }

  const stepContent = (
    <WizardStepTransition phase={phase} onAnimationEnd={handleStepAnimationEnd}>
      {renderStep(displayStep)}
    </WizardStepTransition>
  );

  const sidebar = (
    <HomeCareSummarySidebar
      state={state}
      estimatePrice={state.propertyType ? estimate.price : null}
      estimateDurationMinutes={state.propertyType ? estimate.durationMinutes : null}
    />
  );

  const nextLabel = isConfirm
    ? undefined
    : displayStep === 7
      ? t("public.common.reviewSummary")
      : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <HomeCareProgress currentStep={progressStep} />

      {showSidebar ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="lg:hidden">{sidebar}</div>
            <WizardContentPanel>
              {stepContent}
              {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
              <HomeResetWizardNav
                onBack={handleBack}
                onNext={isConfirm ? handleSubmit : handleNext}
                nextLabel={nextLabel}
                submitting={submitting}
                showBack={displayStep > 1}
                mode={isConfirm ? "checkout" : "default"}
              />
            </WizardContentPanel>
          </div>
          <div className="sticky top-6 hidden lg:block">{sidebar}</div>
        </div>
      ) : (
        <WizardContentPanel>
          {stepContent}
          {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
          <HomeResetWizardNav
            onBack={handleBack}
            onNext={isConfirm ? handleSubmit : handleNext}
            nextLabel={nextLabel}
            submitting={submitting}
            showBack={displayStep > 1}
            mode={isConfirm ? "checkout" : "default"}
          />
        </WizardContentPanel>
      )}

      {progressStep > 1 && !isConfirm ? <TrustStrip /> : null}
    </div>
  );
}
