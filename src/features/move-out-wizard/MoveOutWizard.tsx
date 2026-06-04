"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { normalizePhone } from "@/lib/phone/normalize-phone";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";
import { HomeResetWizardNav } from "@/features/home-reset-wizard/components/HomeResetWizardNav";
import { StepSchedule } from "@/features/home-reset-wizard/components/StepSchedule";
import { TrustStrip } from "@/features/home-reset-wizard/components/TrustStrip";
import { WizardStepTransition } from "@/features/home-reset-wizard/components/WizardStepTransition";
import { useHomeResetStepTransition } from "@/features/home-reset-wizard/hooks/useHomeResetStepTransition";
import "@/features/home-reset-wizard/home-reset-motion.css";
import { MoveOutProgress } from "./components/MoveOutProgress";
import { MoveOutSummarySidebar } from "./components/MoveOutSummarySidebar";
import { StepApartmentSize } from "./components/StepApartmentSize";
import { StepConfirm } from "./components/StepConfirm";
import { StepExtrasDetails } from "./components/StepExtrasDetails";
import { StepMoveOutAddress } from "./components/StepMoveOutAddress";
import { StepMoveOutContact } from "./components/StepMoveOutContact";
import { StepPackageSelection } from "./components/StepPackageSelection";
import { StepSuccess } from "./components/StepSuccess";
import { StepVisitDetails } from "./components/StepVisitDetails";
import {
  BOOKING_PRODUCT_MOVE_OUT,
  MOVE_OUT_ORDER_SERVICE_TYPE,
  MOVE_OUT_SIZE_MIN_M2,
  MOVE_OUT_TOTAL_STEPS,
} from "./move-out-wizard.constants";
import { INITIAL_MOVE_OUT_STATE } from "./move-out-wizard.state";
import type { ApartmentCondition, MoveOutWizardState, SubmitResult } from "./move-out-wizard.types";
import {
  buildServiceDetails,
  getMoveOutEstimate,
  packageForCondition,
  serializeMoveOutComment,
} from "./move-out-wizard.utils";

type ValidationErrors = Record<string, string>;

export function MoveOutWizard() {
  const { t } = usePublicT();
  const router = useRouter();
  const { progressStep, displayStep, phase, goToStep, handleStepAnimationEnd } =
    useHomeResetStepTransition(1);
  const [state, setState] = useState<MoveOutWizardState>(INITIAL_MOVE_OUT_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmitResult | null>(null);

  const estimate = useMemo(() => getMoveOutEstimate(state), [state]);
  const showSidebar = progressStep >= 2 && progressStep <= 7;
  const isConfirm = displayStep === MOVE_OUT_TOTAL_STEPS;

  function validateStep(step: number): boolean {
    const nextErrors: ValidationErrors = {};

    if (step === 1 && !state.package) {
      nextErrors.package = t("public.moveOut.error.package");
    }

    if (step === 2) {
      if (!Number.isFinite(state.propertySizeM2) || state.propertySizeM2 < MOVE_OUT_SIZE_MIN_M2) {
        nextErrors.propertySizeM2 = t("public.moveOut.error.size");
      }
    }

    if (step === 5) {
      if (!state.address.street.trim()) nextErrors.street = t("public.validation.required");
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (step === 6) {
      if (!state.schedule.date) nextErrors.date = t("public.validation.chooseDate");
      if (!state.schedule.time) nextErrors.time = t("public.validation.chooseTime");
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

    if (displayStep < MOVE_OUT_TOTAL_STEPS) {
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

    if (!serviceDetails || !normalizedPhone || estimate.price == null || !state.package) {
      setSubmitting(false);
      setSubmitError(t("public.validation.completeFields"));
      return;
    }

    const payload = {
      serviceType: MOVE_OUT_ORDER_SERVICE_TYPE,
      bookingProduct: BOOKING_PRODUCT_MOVE_OUT,
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
      customerComment: serializeMoveOutComment(state),
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
        setSubmitError(body.error ?? t("public.moveOut.submitError"));
        return;
      }
      setSubmitSuccess(body.data);
    } catch {
      setSubmitError(t("public.moveOut.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleConditionChange(condition: ApartmentCondition) {
    const suggested = packageForCondition(condition);
    setState((prev) => {
      const extras = { ...prev.extras };
      if (condition === "heavy_grease_limescale") {
        extras.heavyLimescale = true;
        extras.heavyDirt = true;
      }
      return {
        ...prev,
        apartmentCondition: condition,
        extras,
        ...(suggested ? { package: suggested } : {}),
      };
    });
  }

  function renderStep(step: number) {
    switch (step) {
      case 1:
        return (
          <StepPackageSelection
            selectedPackage={state.package}
            apartmentCondition={state.apartmentCondition}
            onPackageChange={(pkg) => setState((prev) => ({ ...prev, package: pkg }))}
            onConditionChange={handleConditionChange}
            packageError={errors.package}
          />
        );
      case 2:
        if (!state.package) return null;
        return (
          <StepApartmentSize
            selectedPackage={state.package}
            propertySizeM2={state.propertySizeM2}
            estimate={estimate}
            onSizeChange={(propertySizeM2) =>
              setState((prev) => ({ ...prev, propertySizeM2 }))
            }
          />
        );
      case 3:
        if (!state.package) return null;
        return (
          <StepExtrasDetails
            packageType={state.package}
            state={state}
            onExtrasChange={(extras) => setState((prev) => ({ ...prev, extras }))}
            onPackageChange={(pkg) => setState((prev) => ({ ...prev, package: pkg }))}
          />
        );
      case 4:
        return (
          <StepVisitDetails
            value={state.visitNotes}
            onChange={(visitNotes) => setState((prev) => ({ ...prev, visitNotes }))}
          />
        );
      case 5:
        return (
          <StepMoveOutAddress
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
      case 6:
        return (
          <StepSchedule
            value={state.schedule}
            onChange={(schedule) => setState((prev) => ({ ...prev, schedule }))}
            errors={{ date: errors.date, time: errors.time }}
          />
        );
      case 7:
        return (
          <StepMoveOutContact
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
        <MoveOutProgress currentStep={MOVE_OUT_TOTAL_STEPS} />
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
    <MoveOutSummarySidebar state={state} estimatePrice={estimate.price} />
  );

  const nextLabel = isConfirm
    ? t("public.moveOut.bookMoveOut")
    : displayStep === 7
      ? t("public.common.reviewSummary")
      : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <MoveOutProgress currentStep={progressStep} />

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
            onNext={handleNext}
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
