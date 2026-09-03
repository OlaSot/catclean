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
import { StepVisitDetails } from "./components/StepVisitDetails";
import {
  BOOKING_PRODUCT_MOVE_OUT,
  MOVE_OUT_ORDER_SERVICE_TYPE,
  MOVE_OUT_SIZE_MIN_M2,
  MOVE_OUT_TOTAL_STEPS,
} from "./move-out-wizard.constants";
import { INITIAL_MOVE_OUT_STATE } from "./move-out-wizard.state";
import type { ApartmentCondition, MoveOutWizardState } from "./move-out-wizard.types";
import {
  buildServiceDetails,
  getMoveOutEstimate,
  packageForCondition,
  serializeMoveOutComment,
} from "./move-out-wizard.utils";
import type { RepeatBookingPrefill } from "@/lib/booking/repeat-booking-prefill";
import {
  applyAddressPrefill,
  applyContactPrefill,
} from "@/lib/booking/repeat-booking-prefill";

type ValidationErrors = Record<string, string>;

type MoveOutWizardProps = {
  repeatPrefill?: RepeatBookingPrefill;
  returnHref?: string;
};

function buildInitialState(repeatPrefill?: RepeatBookingPrefill): MoveOutWizardState {
  if (!repeatPrefill) return INITIAL_MOVE_OUT_STATE;
  const withAddress = applyAddressPrefill(INITIAL_MOVE_OUT_STATE, repeatPrefill);
  const withContact = applyContactPrefill(withAddress, repeatPrefill);
  const details = repeatPrefill.serviceDetails?.type === "move_in_out"
    ? repeatPrefill.serviceDetails.data
    : null;
  const comment = repeatPrefill.customerComment ?? "";
  const conditionRaw = comment.match(/^Condition:\s*(.+)$/im)?.[1]?.trim() ?? "";
  const validConditions = ["well_maintained", "normal_wear", "heavy_grease_limescale", "not_sure"];
  const apartmentCondition = validConditions.includes(conditionRaw)
    ? conditionRaw as MoveOutWizardState["apartmentCondition"]
    : null;
  const customerComment = comment.match(/^Customer comment:\s*(.+)$/im)?.[1]?.trim() ?? "";
  return {
    ...withContact,
    package: details?.packageType === "standard" || details?.packageType === "premium"
      ? details.packageType
      : withContact.package,
    apartmentCondition,
    propertySizeM2: details?.propertySizeM2 && details.propertySizeM2 > 0
      ? details.propertySizeM2
      : withContact.propertySizeM2,
    extras: {
      emptyApartment: Boolean(details?.emptyApartment),
      heavyLimescale: Boolean(details?.heavyLimescale),
      heavyDirt: Boolean(details?.heavyDirt),
      insideCabinets: Boolean(details?.insideCabinets),
      fridgeCleaning: Boolean(details?.fridgeCleaning),
      ovenCleaning: Boolean(details?.ovenCleaning),
      windowsInside: Boolean(details?.windowsInside),
      balconyIncluded: Boolean(details?.balconyIncluded),
    },
    visitNotes: {
      ...withContact.visitNotes,
      accessNotes: repeatPrefill.address.accessNotes || withContact.visitNotes.accessNotes,
      petsInfo: repeatPrefill.petsInfo ?? withContact.visitNotes.petsInfo,
      suppliesNote: repeatPrefill.suppliesNote || withContact.visitNotes.suppliesNote,
      equipmentNote: repeatPrefill.equipmentNote || withContact.visitNotes.equipmentNote,
    },
    contact: {
      ...withContact.contact,
      customerComment,
    },
    schedule: { date: "", time: "" },
  };
}

export function MoveOutWizard({ repeatPrefill, returnHref = "/" }: MoveOutWizardProps = {}) {
  const { t } = usePublicT();
  const router = useRouter();
  const { progressStep, displayStep, phase, goToStep, handleStepAnimationEnd } =
    useHomeResetStepTransition(1);
  const [state, setState] = useState<MoveOutWizardState>(() => buildInitialState(repeatPrefill));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { submit } = usePublicBookingSubmit({ returnToPortal: returnHref === "/app/client" });

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
      else if (!state.address.serviceAreaValidated) {
        nextErrors.street = t("public.validation.regionHannoverAddress");
      }
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (step === 6) {
      if (!state.schedule.date) nextErrors.date = t("public.validation.chooseDate");
      if (!state.schedule.time) nextErrors.time = t("public.validation.chooseTime");
      else if (state.schedule.date && isPublicBookingSlotTooSoon(state.schedule.date, state.schedule.time)) {
        nextErrors.time = t("public.validation.slotTooSoon");
      }
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

    if (displayStep < MOVE_OUT_TOTAL_STEPS) {
      goToStep(displayStep + 1);
      setErrors({});
      setSubmitError(null);
    }
  }

  async function handleSubmit() {
    if (phase === "exit" || submitting) return;

    if (!validateStep(6)) {
      goToStep(6);
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
      repeatFromOrderId: repeatPrefill?.orderId || undefined,
    };

    try {
      const result = await submit(payload);
      if (!result.ok && !("blocked" in result && result.blocked)) {
        if (result.error === "public.validation.slotTooSoon") {
          setErrors({ time: t("public.validation.slotTooSoon") });
          goToStep(6);
        }
        setSubmitError(translatePublicBookingError(t, result.error));
      }
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
            durationMinutes={estimate.durationMinutes}
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

  const sidebar = (
    <MoveOutSummarySidebar state={state} estimatePrice={estimate.price} />
  );

  const nextLabel = isConfirm
    ? undefined
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
