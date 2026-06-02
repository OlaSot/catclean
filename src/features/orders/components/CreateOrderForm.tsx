"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduleTimeSelect } from "@/components/orders/ScheduleTimeSelect";
import { FormField, inputClassName, textareaClassName } from "@/components/ui/FormField";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import { supportsAutoPricing } from "@/lib/pricing/pricing.constants";
import CreateOrderServiceFields from "@/features/orders/components/CreateOrderServiceFields";
import {
  clearCreateOrderDraft,
  EMPTY_CREATE_ORDER_FORM_VALUES,
  loadCreateOrderDraft,
  saveCreateOrderDraft,
} from "@/features/orders/lib/create-order-draft";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import {
  PHONE_FORM_EXAMPLE,
  PHONE_FORM_HINT,
} from "@/lib/phone/profile-phone";
import {
  CREATE_ORDER_INITIAL_STATE,
  type CreateOrderFormValues,
  type CreateOrderActionState,
} from "@/features/orders/types/create-order.types";
import { useT } from "@/i18n/useT";

const DRAFT_SAVE_DEBOUNCE_MS = 400;

const fieldNames: Record<keyof CreateOrderFormValues, string> = {
  clientEmail: "clientEmail",
  clientName: "clientName",
  clientPhone: "clientPhone",
  serviceType: "serviceType",
  scheduledDate: "scheduledDate",
  scheduledTime: "scheduledTime",
  street: "street",
  city: "city",
  houseNumber: "houseNumber",
  floor: "floor",
  doorbellName: "doorbellName",
  estimatedPrice: "estimatedPrice",
  finalPrice: "finalPrice",
  useManualPrice: "useManualPrice",
  serviceDetails: "serviceDetails",
  customerComment: "customerComment",
};

function formatEuro(value: number): string {
  return value.toFixed(2);
}

export default function CreateOrderForm() {
  const { t } = useT();
  const router = useRouter();
  const [state, setState] = useState<CreateOrderActionState>(
    CREATE_ORDER_INITIAL_STATE
  );
  const [isPending, setIsPending] = useState(false);

  const [values, setValues] = useState<CreateOrderFormValues>(
    EMPTY_CREATE_ORDER_FORM_VALUES
  );
  const [hydrated, setHydrated] = useState(false);
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    const draft = loadCreateOrderDraft();
    if (draft) setValues(draft);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = window.setTimeout(() => {
      saveCreateOrderDraft(values);
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [values, hydrated]);

  const updateField = <K extends keyof CreateOrderFormValues>(
    key: K,
    value: CreateOrderFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateServiceDetails = (
    patch: Partial<CreateOrderFormValues["serviceDetails"]>
  ) => {
    setValues((prev) => ({
      ...prev,
      serviceDetails: { ...prev.serviceDetails, ...patch },
    }));
  };

  const pricingPreview = useMemo(() => {
    if (!supportsAutoPricing(values.serviceType)) return null;
    return tryCalculateOrderPrice(values.serviceType, values.serviceDetails);
  }, [values.serviceType, values.serviceDetails]);

  useEffect(() => {
    if (!pricingPreview || values.useManualPrice) return;
    const next = formatEuro(pricingPreview.estimatedPrice);
    if (values.estimatedPrice !== next) {
      setValues((prev) => ({ ...prev, estimatedPrice: next }));
    }
  }, [
    pricingPreview,
    values.useManualPrice,
    values.estimatedPrice,
  ]);

  const handleSubmit = () => {
    clearCreateOrderDraft();
  };

  const payload = useMemo(() => {
    return {
      clientEmail: values.clientEmail,
      clientName: values.clientName,
      clientPhone: values.clientPhone,
      serviceType: values.serviceType,
      scheduledDate: values.scheduledDate,
      scheduledTime: values.scheduledTime,
      street: values.street,
      city: values.city,
      houseNumber: values.houseNumber,
      floor: values.floor,
      doorbellName: values.doorbellName,
      estimatedPrice: values.estimatedPrice,
      finalPrice: values.finalPrice || undefined,
      useManualPrice: values.useManualPrice,
      serviceDetails: values.serviceDetails,
      customerComment: values.customerComment,
    };
  }, [values]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
    setIsPending(true);
    setState(CREATE_ORDER_INITIAL_STATE);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as
        | {
            data: unknown;
            error: string | null;
            fieldErrors?: Record<string, string>;
            createdClient?: boolean;
            clientId?: string;
          }
        | null;

      if (!res.ok) {
        const error = json?.error ?? t("common.error");
        const fieldErrorsRaw = json?.fieldErrors ?? {};
        setState({
          error,
          fieldErrors: fieldErrorsRaw as Partial<
            Record<keyof CreateOrderFormValues | string, string>
          >,
        });
        return;
      }

      const clientCreated = Boolean(json?.createdClient);
      router.push(`/app/admin/orders${clientCreated ? "?clientCreated=1" : ""}`);
      router.refresh();
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : t("common.error"),
        fieldErrors: {},
      });
    } finally {
      setIsPending(false);
    }
  };

  const autoPricing = supportsAutoPricing(values.serviceType);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{t("forms.client")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("forms.clientHelp")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("forms.clientEmail")}
            htmlFor={fieldNames.clientEmail}
            error={fieldErrors.clientEmail}
          >
            <input
              id={fieldNames.clientEmail}
              name={fieldNames.clientEmail}
              type="email"
              autoComplete="email"
              className={inputClassName}
              placeholder="client@example.com"
              value={values.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.clientName")}
            htmlFor={fieldNames.clientName}
            error={fieldErrors.clientName}
          >
            <input
              id={fieldNames.clientName}
              name={fieldNames.clientName}
              type="text"
              className={inputClassName}
              placeholder="Full name"
              value={values.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.phone")}
            htmlFor={fieldNames.clientPhone}
            error={fieldErrors.clientPhone}
            hint={`${PHONE_FORM_HINT}. Example: ${PHONE_FORM_EXAMPLE}`}
          >
            <input
              id={fieldNames.clientPhone}
              name={fieldNames.clientPhone}
              type="tel"
              className={inputClassName}
              placeholder={PHONE_FORM_EXAMPLE}
              value={values.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{t("forms.service")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("forms.serviceHelp")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("orders.serviceType")}
            htmlFor={fieldNames.serviceType}
            error={fieldErrors.serviceType}
          >
            <select
              id={fieldNames.serviceType}
              name={fieldNames.serviceType}
              className={inputClassName}
              value={values.serviceType}
              onChange={(e) => {
                updateField("serviceType", e.target.value);
                updateField("useManualPrice", false);
              }}
            >
              <option value="" disabled>
                {t("forms.selectService")}
              </option>
              {ORDER_SERVICE_TYPES.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("forms.scheduledDate")}
            htmlFor={fieldNames.scheduledDate}
            error={fieldErrors.scheduledDate}
          >
            <input
              id={fieldNames.scheduledDate}
              name={fieldNames.scheduledDate}
              type="date"
              className={inputClassName}
              value={values.scheduledDate}
              onChange={(e) => updateField("scheduledDate", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.scheduledTime")}
            htmlFor={fieldNames.scheduledTime}
            error={fieldErrors.scheduledTime}
          >
            <ScheduleTimeSelect
              id={fieldNames.scheduledTime}
              name={fieldNames.scheduledTime}
              className={inputClassName}
              value={
                normalizeScheduleTime(values.scheduledTime) ?? "09:00"
              }
              onChange={(v) => updateField("scheduledTime", v)}
            />
          </FormField>
        </div>

        {values.serviceType ? (
          <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-5">
            <h3 className="text-sm font-semibold text-[#34597E]">
              {t("forms.serviceParameters")}
            </h3>
            <div className="mt-4">
              <CreateOrderServiceFields
                serviceType={values.serviceType}
                details={values.serviceDetails}
                fieldErrors={fieldErrors}
                onChange={updateServiceDetails}
              />
            </div>
          </div>
        ) : null}

        {pricingPreview ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">
              Auto-estimated: €{formatEuro(pricingPreview.estimatedPrice)}
              {pricingPreview.priceBreakdown.minimumApplied ? (
                <span className="ml-2 font-normal text-amber-800">
                  (minimum order applied)
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-emerald-800/90">
              Duration: ~{pricingPreview.estimatedDurationMinutes} min
            </p>
            <ul className="mt-2 space-y-0.5 text-xs text-emerald-800/80">
              {pricingPreview.priceBreakdown.lines.map((line) => (
                <li key={line.key}>
                  {line.label}: €{formatEuro(line.amount)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("forms.estimatedPriceEur")}
            htmlFor={fieldNames.estimatedPrice}
            error={fieldErrors.estimatedPrice}
            hint={
              autoPricing
                ? t("forms.autoFilledHint")
                : t("forms.requiredForManualServices")
            }
          >
            <input
              id={fieldNames.estimatedPrice}
              name={fieldNames.estimatedPrice}
              type="number"
              min="0"
              step="0.01"
              className={inputClassName}
              placeholder="0.00"
              value={values.estimatedPrice}
              readOnly={autoPricing && !values.useManualPrice}
              onChange={(e) => {
                updateField("estimatedPrice", e.target.value);
                updateField("useManualPrice", true);
              }}
            />
          </FormField>

          {autoPricing ? (
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={values.useManualPrice}
                  onChange={(e) => {
                    const manual = e.target.checked;
                    updateField("useManualPrice", manual);
                    if (!manual && pricingPreview) {
                      updateField(
                        "estimatedPrice",
                        formatEuro(pricingPreview.estimatedPrice)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {t("forms.manualPriceOverride")}
              </label>
            </div>
          ) : null}

          <FormField
            label={t("forms.finalPriceOptional")}
            htmlFor={fieldNames.finalPrice}
            hint={t("forms.finalPriceHint")}
          >
            <input
              id={fieldNames.finalPrice}
              name={fieldNames.finalPrice}
              type="number"
              min="0"
              step="0.01"
              className={inputClassName}
              placeholder="Optional"
              value={values.finalPrice}
              onChange={(e) => updateField("finalPrice", e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{t("forms.address")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("forms.addressHelp")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("common.city")}
            htmlFor={fieldNames.city}
            error={fieldErrors.city}
          >
            <input
              id={fieldNames.city}
              name={fieldNames.city}
              type="text"
              className={inputClassName}
              placeholder="Hannover"
              value={values.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.street")}
            htmlFor={fieldNames.street}
            error={fieldErrors.street}
          >
            <input
              id={fieldNames.street}
              name={fieldNames.street}
              type="text"
              className={inputClassName}
              placeholder="Street name"
              value={values.street}
              onChange={(e) => updateField("street", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.houseNumber")}
            htmlFor={fieldNames.houseNumber}
            error={fieldErrors.houseNumber}
          >
            <input
              id={fieldNames.houseNumber}
              name={fieldNames.houseNumber}
              type="text"
              className={inputClassName}
              placeholder="12A"
              value={values.houseNumber}
              onChange={(e) => updateField("houseNumber", e.target.value)}
            />
          </FormField>

          <FormField label={t("forms.floor")} htmlFor={fieldNames.floor}>
            <input
              id={fieldNames.floor}
              name={fieldNames.floor}
              type="text"
              className={inputClassName}
              placeholder="EG"
              value={values.floor}
              onChange={(e) => updateField("floor", e.target.value)}
            />
          </FormField>

          <FormField
            label={t("forms.doorbellName")}
            htmlFor={fieldNames.doorbellName}
            hint={t("forms.doorbellHint")}
          >
            <input
              id={fieldNames.doorbellName}
              name={fieldNames.doorbellName}
              type="text"
              className={inputClassName}
              placeholder="Weisser"
              value={values.doorbellName}
              onChange={(e) => updateField("doorbellName", e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <FormField label={t("forms.customerComment")} htmlFor={fieldNames.customerComment}>
          <textarea
            id={fieldNames.customerComment}
            name={fieldNames.customerComment}
            rows={4}
            className={textareaClassName}
            placeholder={t("forms.customerCommentPlaceholder")}
            value={values.customerComment}
            onChange={(e) => updateField("customerComment", e.target.value)}
          />
        </FormField>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? t("forms.creating") : t("forms.createOrder")}
        </button>

        <Link
          href="/app/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
        >
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
