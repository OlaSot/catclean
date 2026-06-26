"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { normalizePhone } from "@/lib/phone/normalize-phone";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";
import { HomeResetProgress } from "./components/HomeResetProgress";
import { HomeResetSummarySidebar } from "./components/HomeResetSummarySidebar";
import { HomeResetWizardNav } from "./components/HomeResetWizardNav";
import { WizardStepTransition } from "./components/WizardStepTransition";
import { StepAddress } from "./components/StepAddress";
import { StepConfirm } from "./components/StepConfirm";
import { StepContact } from "./components/StepContact";
import { StepEnhancements } from "./components/StepEnhancements";
import { StepCustomize } from "./components/StepCustomize";
import { StepHomeDetails } from "./components/StepHomeDetails";
import { StepPets } from "./components/StepPets";
import { StepSchedule } from "./components/StepSchedule";
import { StepSpecialRequests } from "./components/StepSpecialRequests";
import { StepSuccess } from "./components/StepSuccess";
import { StepWelcome } from "./components/StepWelcome";
import { TrustStrip } from "./components/TrustStrip";
import { useHomeResetStepTransition } from "./hooks/useHomeResetStepTransition";
import {
  BOOKING_PRODUCT_HOME_RESET,
  HOME_RESET_TOTAL_STEPS,
} from "./home-reset-wizard.constants";
import { INITIAL_HOME_RESET_STATE } from "./home-reset-wizard.state";
import type { HomeResetWizardState, SubmitResult } from "./home-reset-wizard.types";
import {
  buildServiceDetails,
  calculateHomeResetEstimate,
  HOME_RESET_ORDER_SERVICE_TYPE,
  serializeHomeResetComment,
  stripKitchenIncludedEnhancements,
} from "./home-reset-wizard.utils";
import { serializeHomeResetUpgradeIds } from "@/lib/orders/home-reset-upgrade";
import "./home-reset-motion.css";
import type { RepeatBookingPrefill } from "@/lib/booking/repeat-booking-prefill";
import {
  applyAddressPrefill,
  applyContactPrefill,
} from "@/lib/booking/repeat-booking-prefill";

type ValidationErrors = Record<string, string>;

type HomeResetWizardProps = {
  repeatPrefill?: RepeatBookingPrefill;
};

function buildInitialState(repeatPrefill?: RepeatBookingPrefill): HomeResetWizardState {
  if (!repeatPrefill) return INITIAL_HOME_RESET_STATE;
  const withAddress = applyAddressPrefill(INITIAL_HOME_RESET_STATE, repeatPrefill);
  const withContact = applyContactPrefill(withAddress, repeatPrefill);
  return {
    ...withContact,
    specialRequest: repeatPrefill.customerComment ?? withContact.specialRequest,
  };
  // TODO: map propertyType, propertySizeM2, enhancements, petsOption from serviceDetails
}

export function HomeResetWizard({ repeatPrefill }: HomeResetWizardProps = {}) {
  const { t } = usePublicT();
  const router = useRouter();
  const {
    progressStep,
    displayStep,
    phase,
    goToStep,
    handleStepAnimationEnd,
  } = useHomeResetStepTransition(1);
  const [state, setState] = useState<HomeResetWizardState>(() => buildInitialState(repeatPrefill));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmitResult | null>(null);

  const estimate = useMemo(() => calculateHomeResetEstimate(state), [state]);

  const showSidebar = progressStep >= 3 && progressStep <= 9;
  const isWelcome = displayStep === 1;
  const isConfirm = displayStep === HOME_RESET_TOTAL_STEPS;

  function validateStep(step: number): boolean {
    const nextErrors: ValidationErrors = {};

    if (step === 2 && !state.propertyType) {
      nextErrors.propertyType = t("public.validation.selectOption");
    }

    if (step === 7) {
      if (!state.schedule.date) nextErrors.date = t("public.validation.chooseDate");
      if (!state.schedule.time) nextErrors.time = t("public.validation.chooseTime");
    }

    if (step === 8) {
      if (!state.address.street.trim()) nextErrors.street = t("public.validation.required");
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (step === 9) {
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

    if (displayStep === 1) {
      goToStep(2);
      return;
    }

    if (!validateStep(displayStep)) return;

    if (displayStep < HOME_RESET_TOTAL_STEPS) {
      goToStep(displayStep + 1);
      setErrors({});
      setSubmitError(null);
    }
  }

  async function handleSubmit() {
    if (phase === "exit") return;

    if (!validateStep(9)) {
      goToStep(9);
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
      serviceType: HOME_RESET_ORDER_SERVICE_TYPE,
      bookingProduct: BOOKING_PRODUCT_HOME_RESET,
      homeResetUpgrade: serializeHomeResetUpgradeIds(state.deepUpgrades),
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
      customerComment: serializeHomeResetComment(state),
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
      setSubmitError(t("public.homeReset.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep(step: number) {
    switch (step) {
      case 1:
        return <StepWelcome onStart={handleNext} />;
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
          <StepCustomize
            petsOption={state.petsOption}
            value={state.deepUpgrades}
            onChange={(deepUpgrades) =>
              setState((prev) => ({
                ...prev,
                deepUpgrades,
                enhancements:
                  deepUpgrades.kitchen && !prev.deepUpgrades.kitchen
                    ? stripKitchenIncludedEnhancements(prev.enhancements)
                    : prev.enhancements,
              }))
            }
          />
        );
      case 5:
        return (
          <StepEnhancements
            kitchenDeepResetSelected={state.deepUpgrades.kitchen}
            value={state.enhancements}
            onChange={(enhancements) => setState((prev) => ({ ...prev, enhancements }))}
          />
        );
      case 6:
        return (
          <StepSpecialRequests
            value={state.specialRequest}
            onChange={(specialRequest) => setState((prev) => ({ ...prev, specialRequest }))}
          />
        );
      case 7:
        return (
          <StepSchedule
            value={state.schedule}
            onChange={(schedule) => setState((prev) => ({ ...prev, schedule }))}
            errors={{ date: errors.date, time: errors.time }}
          />
        );
      case 8:
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
      case 9:
        return (
          <StepContact
            value={state.contact}
            onChange={(contact) => setState((prev) => ({ ...prev, contact }))}
            errors={{ name: errors.name, phone: errors.phone, email: errors.email }}
          />
        );
      case 10:
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
        <HomeResetProgress currentStep={HOME_RESET_TOTAL_STEPS} />
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
    <HomeResetSummarySidebar
      state={state}
      estimatePrice={estimate.price}
      estimateDurationMinutes={estimate.durationMinutes}
    />
  );

  const nextLabel = isConfirm
    ? undefined
    : displayStep === 9
      ? t("public.homeReset.reviewSummary")
      : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <HomeResetProgress currentStep={progressStep} />

      {showSidebar ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="lg:hidden">{sidebar}</div>
            <WizardContentPanel className={isWelcome ? "border-stone-200/80 bg-white" : ""}>
              {stepContent}
              {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
              {!isWelcome ? (
                <HomeResetWizardNav
                  onBack={handleBack}
                  onNext={isConfirm ? handleSubmit : handleNext}
                  nextLabel={nextLabel}
                  submitting={submitting}
                  showBack={displayStep > 1}
                  mode={isConfirm ? "checkout" : "default"}
                />
              ) : null}
            </WizardContentPanel>
          </div>
          <div className="sticky top-6 hidden lg:block">{sidebar}</div>
        </div>
      ) : (
        <WizardContentPanel className="border-stone-200/80 bg-white">
          {stepContent}
          {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
          {!isWelcome ? (
            <HomeResetWizardNav
              onBack={handleBack}
              onNext={isConfirm ? handleSubmit : handleNext}
              nextLabel={nextLabel}
              submitting={submitting}
              showBack={displayStep > 1}
              mode={isConfirm ? "checkout" : "default"}
            />
          ) : null}
        </WizardContentPanel>
      )}

      {progressStep > 1 && !isConfirm ? <TrustStrip /> : null}
    </div>
  );
}
