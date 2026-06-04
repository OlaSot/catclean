"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { normalizePhone } from "@/lib/phone/normalize-phone";
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
import { StepSuccess } from "./components/StepSuccess";
import { HOME_CARE_TOTAL_STEPS } from "./home-care-wizard.constants";
import { INITIAL_HOME_CARE_STATE } from "./home-care-wizard.state";
import type { HomeCareWizardState, SubmitResult } from "./home-care-wizard.types";
import { BOOKING_PRODUCT_HOME_CARE } from "./home-care-wizard.constants";
import {
  buildServiceDetails,
  calculateHomeCareEstimate,
  HOME_CARE_ORDER_SERVICE_TYPE,
  serializeHomeCareComment,
} from "./home-care-wizard.utils";

type ValidationErrors = Record<string, string>;

export function HomeCareWizard() {
  const { t } = usePublicT();
  const router = useRouter();
  const { progressStep, displayStep, phase, goToStep, handleStepAnimationEnd } =
    useHomeResetStepTransition(1);
  const [state, setState] = useState<HomeCareWizardState>(INITIAL_HOME_CARE_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmitResult | null>(null);

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
    }

    if (step === 6) {
      if (!state.address.street.trim()) nextErrors.street = t("public.validation.required");
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (step === 7) {
      if (!state.contact.name.trim()) nextErrors.name = t("public.validation.required");
      const normalized = normalizePhone(state.contact.phone);
      if (!normalized) nextErrors.phone = t("public.validation.invalidPhone");
      const email = state.contact.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = t("public.validation.invalidEmail");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleBack() {
    if (phase === "exit") return;
    if (displayStep === 1) {
      router.push("/");
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
    if (phase === "exit") return;

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
    };

    try {
      const response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as {
        data: SubmitResult | null;
        error: string | null;
      };
      if (!response.ok || body.error || !body.data) {
        setSubmitError(body.error ?? "Failed to create booking");
        return;
      }
      setSubmitSuccess(body.data);
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
            estimatePrice={estimate.price}
            onPropertyTypeChange={(propertyType) =>
              setState((prev) => ({ ...prev, propertyType }))
            }
            onSizeChange={(propertySizeM2) =>
              setState((prev) => ({ ...prev, propertySizeM2 }))
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

  if (submitSuccess) {
    return (
      <div className="space-y-10">
        <HomeCareProgress currentStep={HOME_CARE_TOTAL_STEPS} />
        <WizardContentPanel>
          <div className="hr-wizard-step-enter">
            <StepSuccess result={submitSuccess} />
          </div>
        </WizardContentPanel>
        <TrustStrip />
      </div>
    );
  }

  const sidebar = (
    <HomeCareSummarySidebar
      state={state}
      estimatePrice={estimate.price}
      estimateDurationMinutes={estimate.durationMinutes}
    />
  );

  const nextLabel = isConfirm
    ? t("public.homeCare.bookHomeCare")
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
          />
        </WizardContentPanel>
      )}

      {progressStep > 1 ? <TrustStrip /> : null}
    </div>
  );
}
