"use client";

import { useEffect, useMemo, useState } from "react";
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

export function BookingWizard({ initialService }: BookingWizardProps) {
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

    const mapped = initialService as BookingServicePreset;
    setState((prev) => ({
      ...prev,
      service: mapped,
    }));
    setStep(mapped === "home_reset" ? "propertyType" : "propertySize");
  }, [initialService, state.service]);

  function setFieldError(key: string, message: string): ValidationErrors {
    return { ...errors, [key]: message };
  }

  function validateCurrentStep(): boolean {
    let nextErrors: ValidationErrors = {};

    if (currentStep === "service" && !state.service) {
      nextErrors = setFieldError("service", "Please choose a service");
    }

    if (currentStep === "propertyType" && state.service === "home_reset" && !state.propertyType) {
      nextErrors = setFieldError("propertyType", "Please choose property type");
    }

    if (currentStep === "propertySize") {
      if (!Number.isFinite(state.propertySizeM2) || state.propertySizeM2 <= 0) {
        nextErrors = setFieldError("propertySizeM2", "Enter valid size in m²");
      }
    }

    if (currentStep === "address") {
      if (!state.address.street.trim()) nextErrors.street = "Street is required";
      if (!state.address.houseNumber.trim()) nextErrors.houseNumber = "House number is required";
      if (!state.address.zip.trim()) nextErrors.zip = "ZIP is required";
      if (!state.address.city.trim()) nextErrors.city = "City is required";
    }

    if (currentStep === "schedule") {
      if (!state.schedule.date) nextErrors.date = "Date is required";
      if (!state.schedule.time) nextErrors.time = "Time is required";
    }

    if (currentStep === "contact") {
      if (!state.contact.name.trim()) nextErrors.name = "Name is required";
      const normalized = normalizePhone(state.contact.phone);
      if (!normalized) nextErrors.phone = "Use valid phone format, e.g. +49 178 1234567";
      const email = state.contact.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email";
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
      setSubmitError("Please complete all required fields.");
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
        setSubmitError(body.error ?? "Failed to create booking");
        return;
      }
      setSubmitSuccess(body.data);
    } catch {
      setSubmitError("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/70 bg-white/75 p-8 backdrop-blur-md">
        <h2 className="text-3xl font-semibold text-slate-700">Booking created successfully.</h2>
        <p className="text-slate-600">Order ID: <span className="font-semibold text-slate-800">{submitSuccess.orderId}</span></p>
        <p className="text-slate-600">Confirmation pending</p>
        <p className="text-slate-600">
          Please confirm your booking using the confirmation link sent by our team.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>{stepDefs[currentIndex]?.label ?? "Step"}</span>
          <span>
            Step {currentIndex + 1} of {stepDefs.length}
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
            deepPriceHint={state.condition === "deep" ? "Deep reset uses higher intensity pricing." : null}
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
            Back
          </button>
          {isSummary ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-[#34597E] px-6 py-3 font-semibold text-white transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create booking"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-[#34597E] px-6 py-3 font-semibold text-white transition hover:bg-[#2d4d6f]"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
