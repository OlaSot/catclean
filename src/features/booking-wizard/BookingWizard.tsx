"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicT } from "@/i18n/public/usePublicT";
import { normalizePhone } from "@/lib/phone/normalize-phone";
import { HOME_RESET_STEPS, SIMPLE_STEPS, EMPTY_BOOKING_STATE, SIZE_PRESETS } from "./booking-wizard.constants";
import {
  buildServiceDetailsForPricing,
  calculateBookingEstimate,
  mapServicePresetToOrderService,
  serializeVisitDetails,
} from "./booking-wizard.utils";
import type { BookingServicePreset, BookingWizardState, StepDef, StepId } from "./booking-wizard.types";
import { StepAddress } from "./steps/StepAddress";
import { StepCondition } from "./steps/StepCondition";
import { StepContact } from "./steps/StepContact";
import { StepExtras } from "./steps/StepExtras";
import { StepPets } from "./steps/StepPets";
import { StepPropertySize } from "./steps/StepPropertySize";
import { StepPropertyType } from "./steps/StepPropertyType";
import { StepRooms } from "./steps/StepRooms";
import { StepSchedule } from "./steps/StepSchedule";
import { StepService } from "./steps/StepService";
import { StepSummary } from "./steps/StepSummary";
import { StepSupplies } from "./steps/StepSupplies";
import { StepVisitDetails } from "./steps/StepVisitDetails";

type SubmitResult = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
};

type ValidationErrors = Record<string, string>;
type BookingWizardProps = {
  initialService?: string;
};

/** @deprecated Product wizards: `/booking?service=home_care` and `home_reset`. TODO: send `bookingProduct` when this legacy flow books Home Care/Reset. */
export function BookingWizard({ initialService }: BookingWizardProps) {
  const { t } = usePublicT();
  const router = useRouter();
  const [step, setStep] = useState<StepId>("service");
  const [state, setState] = useState(EMPTY_BOOKING_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmitResult | null>(null);

  const estimate = useMemo(() => calculateBookingEstimate(state), [state]);
  const isHomeResetFlow = state.service === "home_reset";
  const stepDefs: StepDef[] = isHomeResetFlow ? HOME_RESET_STEPS : SIMPLE_STEPS;
  const currentIndex = Math.max(0, stepDefs.findIndex((item) => item.id === step));
  const currentStep = stepDefs[currentIndex]?.id ?? "service";
  const isSummary = currentStep === "summary";

  useEffect(() => {
    if (initialService === "home_reset") {
      router.replace("/booking?service=home_reset");
      return;
    }
    if (initialService === "regular_cleaning" || initialService === "home_care") {
      router.replace("/booking?service=home_care");
    }
  }, [initialService, router]);

  useEffect(() => {
    if (!initialService) return;
    if (state.service) return;

    const allowed = new Set([
      "home_reset",
      "move_out",
      "regular_cleaning",
      "dry_cleaning",
      "office_cleaning",
      "window_cleaning",
    ]);
    if (!allowed.has(initialService)) return;

    if (
      initialService === "home_reset" ||
      initialService === "dry_cleaning" ||
      initialService === "window_cleaning"
    ) {
      return;
    }

    const mapped = initialService as BookingServicePreset;
    setState((prev) => ({
      ...prev,
      service: mapped,
    }));
    setStep("propertySize");
  }, [initialService, state.service]);

  function setFieldError(key: string, message: string): ValidationErrors {
    return { ...errors, [key]: message };
  }

  function validateCurrentStep(): boolean {
    let nextErrors: ValidationErrors = {};

    if (currentStep === "service" && !state.service) {
      nextErrors = setFieldError("service", t("public.bookingLegacy.chooseService"));
    }

    if (currentStep === "propertyType" && state.service === "home_reset" && !state.propertyType) {
      nextErrors = setFieldError("propertyType", t("public.validation.selectOption"));
    }

    if (currentStep === "propertySize") {
      if (!Number.isFinite(state.propertySizeM2) || state.propertySizeM2 <= 0) {
        nextErrors = setFieldError("propertySizeM2", t("public.bookingLegacy.invalidSize"));
      }
    }

    if (currentStep === "address") {
      if (!state.address.street.trim()) nextErrors.street = t("public.validation.required");
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = t("public.validation.required");
      if (!state.address.zip.trim()) nextErrors.zip = t("public.validation.required");
      if (!state.address.city.trim()) nextErrors.city = t("public.validation.required");
    }

    if (currentStep === "schedule") {
      if (!state.schedule.date) nextErrors.date = t("public.validation.chooseDate");
      if (!state.schedule.time) nextErrors.time = t("public.validation.chooseTime");
    }

    if (currentStep === "contact") {
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

  function handleNext() {
    if (!validateCurrentStep()) return;
    const next = stepDefs[currentIndex + 1]?.id;
    if (next) setStep(next);
  }

  function handleBack() {
    const prev = stepDefs[currentIndex - 1]?.id;
    if (prev) setStep(prev);
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    setSubmitError(null);

    const serviceType = mapServicePresetToOrderService(state.service);
    const serviceDetails = buildServiceDetailsForPricing(state);
    const normalizedPhone = normalizePhone(state.contact.phone);

    if (!serviceType || !serviceDetails || !normalizedPhone || estimate.price == null) {
      setSubmitting(false);
      setSubmitError(t("public.validation.completeFields"));
      return;
    }

    const payload = {
      servicePreset: state.service,
      serviceType,
      serviceDetails,
      propertySizeM2: state.propertySizeM2,
      extras: state.extras,
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
      estimatedPrice: estimate.price,
      customerComment: serializeVisitDetails(state),
      floor: state.address.floor.trim(),
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
        setSubmitError(body.error ?? t("public.bookingLegacy.submitFailed"));
        return;
      }
      setSubmitSuccess(body.data);
    } catch {
      setSubmitError(t("public.bookingLegacy.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/70 bg-white/75 p-8 backdrop-blur-md">
        <h2 className="text-3xl font-semibold text-slate-700">{t("public.bookingLegacy.successTitle")}</h2>
        <p className="text-slate-600">
          {t("public.bookingLegacy.orderId")}:{" "}
          <span className="font-semibold text-slate-800">{submitSuccess.orderId}</span>
        </p>
        <p className="text-slate-600">{t("public.bookingLegacy.confirmPending")}</p>
        <p className="text-slate-600">{t("public.bookingLegacy.confirmHint")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>{stepDefs[currentIndex]?.label ?? t("public.bookingLegacy.step")}</span>
          <span>
            {t("public.bookingLegacy.stepOf")
              .replace("{current}", String(currentIndex + 1))
              .replace("{total}", String(stepDefs.length))}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200/70">
          <div
            className="h-full rounded-full bg-[#34597E] transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / stepDefs.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-md sm:p-8">
        {currentStep === "service" ? (
          <StepService
            value={state.service}
            onChange={(service) => {
              setState((prev) => ({ ...prev, service }));
              setStep(service === "home_reset" ? "propertyType" : "propertySize");
            }}
            error={errors.service}
          />
        ) : null}
        {currentStep === "propertyType" ? (
          <StepPropertyType
            value={state.propertyType}
            onChange={(propertyType) => setState((prev) => ({ ...prev, propertyType }))}
            error={errors.propertyType}
          />
        ) : null}
        {currentStep === "propertySize" ? (
          <StepPropertySize
            value={state.propertySizeM2}
            onChange={(propertySizeM2) => setState((prev) => ({ ...prev, propertySizeM2 }))}
            presets={SIZE_PRESETS}
            estimatePrice={estimate.price}
            estimateDurationMinutes={estimate.durationMinutes}
            error={errors.propertySizeM2}
          />
        ) : null}
        {currentStep === "rooms" ? (
          <StepRooms
            roomsCount={state.roomsCount}
            bathroomsCount={state.bathroomsCount}
            kitchenCount={state.kitchenCount}
            hallwayCount={state.hallwayCount}
            onChange={({ roomsCount, bathroomsCount, kitchenCount, hallwayCount }) =>
              setState((prev) => ({
                ...prev,
                roomsCount,
                bathroomsCount,
                kitchenCount,
                hallwayCount,
              }))
            }
          />
        ) : null}
        {currentStep === "condition" ? (
          <StepCondition
            value={state.condition}
            onChange={(condition) => setState((prev) => ({ ...prev, condition }))}
            deepPriceHint={state.condition === "deep" ? t("public.bookingLegacy.deepHint") : null}
          />
        ) : null}
        {currentStep === "pets" ? (
          <StepPets
            petsOption={state.petsOption}
            petHairLevel={state.petHairLevel}
            petsInfo={state.petsInfo}
            onChange={({ petsOption, petHairLevel, petsInfo }) =>
              setState((prev) => ({ ...prev, petsOption, petHairLevel, petsInfo }))
            }
          />
        ) : null}
        {currentStep === "extras" ? (
          <StepExtras
            value={state.extras}
            onChange={(extras) => setState((prev) => ({ ...prev, extras }))}
          />
        ) : null}
        {currentStep === "supplies" ? (
          <StepSupplies
            suppliesChoice={state.suppliesChoice}
            vacuumChoice={state.vacuumChoice}
            onChange={({ suppliesChoice, vacuumChoice }) =>
              setState((prev) => ({ ...prev, suppliesChoice, vacuumChoice }))
            }
          />
        ) : null}
        {currentStep === "visitDetails" ? (
          <StepVisitDetails
            accessInstructions={state.accessInstructions}
            parkingElevatorNote={state.parkingElevatorNote}
            additionalComment={state.additionalComment}
            onChange={({ accessInstructions, parkingElevatorNote, additionalComment }) =>
              setState((prev) => ({
                ...prev,
                accessInstructions,
                parkingElevatorNote,
                additionalComment,
              }))
            }
          />
        ) : null}
        {currentStep === "address" ? (
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
        ) : null}
        {currentStep === "schedule" ? (
          <StepSchedule
            value={state.schedule}
            onChange={(schedule) => setState((prev) => ({ ...prev, schedule }))}
            errors={{ date: errors.date, time: errors.time }}
          />
        ) : null}
        {currentStep === "contact" ? (
          <StepContact
            value={state.contact}
            onChange={(contact) => setState((prev) => ({ ...prev, contact }))}
            errors={{ name: errors.name, phone: errors.phone, email: errors.email }}
          />
        ) : null}
        {isSummary ? (
          <StepSummary
            state={state}
            estimatePrice={estimate.price}
            estimateDurationMinutes={estimate.durationMinutes}
            isHomeResetFlow={isHomeResetFlow}
          />
        ) : null}

        {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0 || submitting}
            className="rounded-full border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:border-[#34597E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("public.bookingLegacy.back")}
          </button>
          {isSummary ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-[#34597E] px-6 py-3 font-semibold text-white transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("public.bookingLegacy.creating") : t("public.bookingLegacy.createBooking")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-[#34597E] px-6 py-3 font-semibold text-white transition hover:bg-[#2d4d6f]"
            >
              {t("public.bookingLegacy.next")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
