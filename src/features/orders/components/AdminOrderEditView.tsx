"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import { SERVICE_DETAIL_DISPLAY } from "@/entities/order/service-detail-display-config";
import type { OrderServiceType } from "@/lib/constants/orders";
import type { AdminOrderDetailApiResponse } from "@/features/orders/types/admin-order-detail-api.types";
import type {
  AdminUpdateOrderApiResponse,
  AdminUpdateOrderRequestBody,
} from "@/features/orders/types/admin-update-order-api.types";
import { ScheduleTimeSelect } from "@/components/orders/ScheduleTimeSelect";
import { FormField, inputClassName, textareaClassName } from "@/components/ui/FormField";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import { useT } from "@/i18n/useT";
import {
  CUSTOMIZE_UPGRADE_OPTIONS,
  ENHANCEMENT_OPTIONS,
  PETS_OPTIONS,
} from "@/features/home-reset-wizard/home-reset-wizard.constants";

type LoadState = "loading" | "idle";

type HomeResetEnhancementId = "oven_refresh" | "fridge_refresh" | "balcony_cleaning";
type HomeResetUpgradeId =
  | "standard_home_reset"
  | "bathroom_upgrade"
  | "kitchen_upgrade";
type HomeResetPetsId = "no_pets" | "cat" | "dog" | "multiple";

type HomeResetEditState = {
  propertyType: string;
  upgrade: HomeResetUpgradeId;
  petsOption: HomeResetPetsId;
  ovenRefresh: boolean;
  fridgeRefresh: boolean;
  balconyCleaning: boolean;
  specialRequest: string;
  accessNotes: string;
  additionalNotes: string;
};

const HOME_RESET_ENHANCEMENT_BY_LABEL: Record<string, HomeResetEnhancementId> = {
  "inside oven": "oven_refresh",
  "inside fridge": "fridge_refresh",
  "balcony cleaning": "balcony_cleaning",
};

function defaultHomeResetState(): HomeResetEditState {
  return {
    propertyType: "",
    upgrade: "standard_home_reset",
    petsOption: "no_pets",
    ovenRefresh: false,
    fridgeRefresh: false,
    balconyCleaning: false,
    specialRequest: "",
    accessNotes: "",
    additionalNotes: "",
  };
}

function parseHomeResetUpgrade(value: string): HomeResetUpgradeId {
  const lower = value.toLowerCase();
  if (lower.includes("kitchen deep reset")) return "kitchen_upgrade";
  if (lower.includes("bathroom deep reset")) return "bathroom_upgrade";
  return "standard_home_reset";
}

function parseHomeResetPets(value: string): HomeResetPetsId {
  const lower = value.toLowerCase();
  if (lower.includes("multiple")) return "multiple";
  if (lower.includes("cat")) return "cat";
  if (lower.includes("dog")) return "dog";
  return "no_pets";
}

function parseHomeResetComment(
  comment: string | null | undefined,
  serviceData: Record<string, unknown>
): HomeResetEditState {
  const initial = defaultHomeResetState();
  initial.propertyType =
    typeof serviceData.propertyType === "string" ? serviceData.propertyType : "";
  initial.ovenRefresh = serviceData.ovenCleaning === true;
  initial.fridgeRefresh = serviceData.fridgeCleaning === true;
  initial.balconyCleaning = serviceData.balconyIncluded === true;

  if (!comment) return initial;

  const lines = comment
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    if (!rawKey || rest.length === 0) continue;
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "property type") {
      initial.propertyType = value;
    } else if (key === "selected home reset option") {
      initial.upgrade = parseHomeResetUpgrade(value);
    } else if (key === "pets") {
      initial.petsOption = parseHomeResetPets(value);
    } else if (key === "enhancements") {
      const tokens = value.split(",").map((item) => item.trim().toLowerCase());
      for (const token of tokens) {
        const mapped = HOME_RESET_ENHANCEMENT_BY_LABEL[token];
        if (mapped === "oven_refresh") initial.ovenRefresh = true;
        if (mapped === "fridge_refresh") initial.fridgeRefresh = true;
        if (mapped === "balcony_cleaning") initial.balconyCleaning = true;
      }
    } else if (key === "special requests") {
      initial.specialRequest = value;
    } else if (key === "access notes") {
      initial.accessNotes = value;
    } else if (key === "additional notes") {
      initial.additionalNotes = value;
    }
  }

  return initial;
}

function serializeHomeResetComment(state: HomeResetEditState): string {
  const lines: string[] = ["Home Reset booking"];
  lines.push(`Property type: ${state.propertyType || "—"}`);
  const selectedUpgrade =
    CUSTOMIZE_UPGRADE_OPTIONS.find((item) => item.id === state.upgrade) ??
    CUSTOMIZE_UPGRADE_OPTIONS[0];
  lines.push(`Selected Home Reset option: ${selectedUpgrade.title}`);
  const selectedPets = PETS_OPTIONS.find((item) => item.id === state.petsOption);
  lines.push(`Pets: ${selectedPets?.label ?? "No pets"}`);

  const enhancementLabels = ENHANCEMENT_OPTIONS.filter((option) => {
    if (option.id === "oven_refresh") return state.ovenRefresh;
    if (option.id === "fridge_refresh") return state.fridgeRefresh;
    if (option.id === "balcony_cleaning") return state.balconyCleaning;
    return false;
  }).map((option) => option.title);

  if (enhancementLabels.length > 0) {
    lines.push(`Enhancements: ${enhancementLabels.join(", ")}`);
  }
  if (state.specialRequest.trim()) {
    lines.push(`Special requests: ${state.specialRequest.trim()}`);
  }
  if (state.accessNotes.trim()) {
    lines.push(`Access notes: ${state.accessNotes.trim()}`);
  }
  if (state.additionalNotes.trim()) {
    lines.push(`Additional notes: ${state.additionalNotes.trim()}`);
  }
  return lines.join("\n");
}

function toInputNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return Number.isFinite(value) ? String(value) : "";
}

function toStringArrayInput(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "string") return value;
  return "";
}

export default function AdminOrderEditView({ orderId }: { orderId: string }) {
  const { t, paymentLabel } = useT();
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [homeReset, setHomeReset] = useState<HomeResetEditState>(defaultHomeResetState());

  const [form, setForm] = useState({
    scheduled_date: "",
    scheduled_time: "",
    estimated_price: "",
    final_price: "",
    payment_status: "unpaid",
    customer_comment: "",
    internal_note: "",
    address_city: "",
    address_street: "",
    address_house_number: "",
    address_floor: "",
    address_doorbell_name: "",
    serviceData: {} as Record<string, unknown>,
  });

  const loadOrder = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminOrderDetailApiResponse;
      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to load order");
        return;
      }

      const loaded = json.data;
      const loadedServiceData =
        loaded.serviceDetails?.data
          ? ({ ...(loaded.serviceDetails.data as Record<string, unknown>) } as Record<
              string,
              unknown
            >)
          : ({} as Record<string, unknown>);
      setOrder(loaded);
      setForm({
        scheduled_date: loaded.scheduledDate,
        scheduled_time:
          loaded.scheduledTime === "—"
            ? ""
            : (normalizeScheduleTime(loaded.scheduledTime) ??
              loaded.scheduledTime),
        estimated_price: toInputNumber(loaded.service.estimatedPrice),
        final_price: toInputNumber(loaded.service.finalPrice),
        payment_status: loaded.paymentStatus,
        customer_comment: loaded.service.comment ?? "",
        internal_note: loaded.operationalNotes.internalNote ?? "",
        address_city: loaded.address.city ?? "",
        address_street: loaded.address.street ?? "",
        address_house_number: loaded.address.house ?? "",
        address_floor: loaded.address.floor ?? "",
        address_doorbell_name: loaded.address.doorbell ?? "",
        serviceData: loadedServiceData,
      });
      if (loaded.service.productKey === "home_reset") {
        setHomeReset(parseHomeResetComment(loaded.service.comment, loadedServiceData));
      } else {
        setHomeReset(defaultHomeResetState());
      }
    } catch {
      setError("Failed to load order");
    } finally {
      setLoadState("idle");
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const serviceType = (order?.service.type ?? "") as OrderServiceType;
  const serviceDetailsType = (order?.serviceDetails?.type ?? serviceType) as OrderServiceType;
  const isHomeReset = order?.service.productKey === "home_reset";

  const serviceFields = useMemo(() => {
    return SERVICE_DETAIL_DISPLAY[serviceDetailsType] ?? [];
  }, [serviceDetailsType]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateServiceField = (key: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      serviceData: { ...prev.serviceData, [key]: value },
    }));
  };

  const isLoading = loadState === "loading";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    setError(null);

    const nextServiceData = { ...form.serviceData };
    let nextCustomerComment = form.customer_comment || null;
    if (isHomeReset) {
      nextServiceData.propertyType = homeReset.propertyType || null;
      nextServiceData.cleaningIntensity = "standard";
      nextServiceData.ovenCleaning = homeReset.ovenRefresh;
      nextServiceData.fridgeCleaning = homeReset.fridgeRefresh;
      nextServiceData.balconyIncluded = homeReset.balconyCleaning;
      nextServiceData.hasPets = false;
      nextServiceData.petType =
        homeReset.petsOption === "no_pets" ? null : homeReset.petsOption;
      nextCustomerComment = serializeHomeResetComment(homeReset);
    }

    const body: AdminUpdateOrderRequestBody = {
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time,
      estimated_price: form.estimated_price ? Number(form.estimated_price) : undefined,
      final_price: form.final_price ? Number(form.final_price) : null,
      payment_status: form.payment_status,
      customer_comment: nextCustomerComment,
      internal_note: form.internal_note || null,
      address: {
        city: form.address_city,
        street: form.address_street,
        house_number: form.address_house_number,
        floor: form.address_floor || null,
        doorbell_name: form.address_doorbell_name || null,
      },
      serviceDetails: order.serviceDetails
        ? { type: order.serviceDetails.type, data: nextServiceData }
        : { type: serviceType, data: nextServiceData },
    };

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as AdminUpdateOrderApiResponse;
      if (!res.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to update order");
        return;
      }

      router.push(`/app/admin/orders/${orderId}`);
      router.refresh();
    } catch {
      setError("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/app/admin/orders/${orderId}`}
          className="text-sm font-medium text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          ← {t("common.backToOrder")}
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          {t("common.loading")}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !order ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">{t("orders.orderNotFound")}</p>
        </div>
      ) : null}

      {!isLoading && order ? (
        <form
          onSubmit={onSubmit}
          className="space-y-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8"
        >
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
              {t("orders.editOrder")} #{order.displayId}
            </h1>
            <p className="text-sm text-slate-500">
              Updates are applied via <code>/api/admin/orders/[id]</code>.
            </p>
          </header>

          <section className="grid gap-5 md:grid-cols-2">
            <FormField label={t("forms.scheduledDate")} htmlFor="scheduled_date">
              <input
                id="scheduled_date"
                type="date"
                className={inputClassName}
                value={form.scheduled_date}
                onChange={(e) => updateForm("scheduled_date", e.target.value)}
              />
            </FormField>

            <FormField label={t("forms.scheduledTime")} htmlFor="scheduled_time">
              <ScheduleTimeSelect
                id="scheduled_time"
                className={inputClassName}
                value={normalizeScheduleTime(form.scheduled_time) ?? "09:00"}
                onChange={(v) => updateForm("scheduled_time", v)}
              />
            </FormField>
          </section>

          {isHomeReset ? (
            <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Home Reset
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Тип жилья" htmlFor="home_reset_property_type">
                  <select
                    id="home_reset_property_type"
                    className={inputClassName}
                    value={homeReset.propertyType}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, propertyType: e.target.value }))
                    }
                  >
                    <option value="">—</option>
                    <option value="Apartment">Квартира</option>
                    <option value="House">Дом</option>
                  </select>
                </FormField>

                <FormField label="Пакет Home Reset" htmlFor="home_reset_upgrade">
                  <select
                    id="home_reset_upgrade"
                    className={inputClassName}
                    value={homeReset.upgrade}
                    onChange={(e) =>
                      setHomeReset((prev) => ({
                        ...prev,
                        upgrade: e.target.value as HomeResetUpgradeId,
                      }))
                    }
                  >
                    {CUSTOMIZE_UPGRADE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Питомцы" htmlFor="home_reset_pets">
                  <select
                    id="home_reset_pets"
                    className={inputClassName}
                    value={homeReset.petsOption}
                    onChange={(e) =>
                      setHomeReset((prev) => ({
                        ...prev,
                        petsOption: e.target.value as HomeResetPetsId,
                      }))
                    }
                  >
                    {PETS_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={homeReset.ovenRefresh}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, ovenRefresh: e.target.checked }))
                    }
                  />
                  Внутри духовки
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={homeReset.fridgeRefresh}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, fridgeRefresh: e.target.checked }))
                    }
                  />
                  Внутри холодильника
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={homeReset.balconyCleaning}
                    onChange={(e) =>
                      setHomeReset((prev) => ({
                        ...prev,
                        balconyCleaning: e.target.checked,
                      }))
                    }
                  />
                  Уборка балкона
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Особые пожелания" htmlFor="home_reset_special_requests">
                  <textarea
                    id="home_reset_special_requests"
                    rows={3}
                    className={textareaClassName}
                    value={homeReset.specialRequest}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, specialRequest: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Заметки по доступу" htmlFor="home_reset_access_notes">
                  <textarea
                    id="home_reset_access_notes"
                    rows={3}
                    className={textareaClassName}
                    value={homeReset.accessNotes}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, accessNotes: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Дополнительные заметки" htmlFor="home_reset_additional_notes">
                  <textarea
                    id="home_reset_additional_notes"
                    rows={3}
                    className={textareaClassName}
                    value={homeReset.additionalNotes}
                    onChange={(e) =>
                      setHomeReset((prev) => ({ ...prev, additionalNotes: e.target.value }))
                    }
                  />
                </FormField>
              </div>
            </section>
          ) : null}

          <section className="grid gap-5 md:grid-cols-2">
            <FormField label={t("forms.estimatedPriceEur")} htmlFor="estimated_price">
              <input
                id="estimated_price"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                value={form.estimated_price}
                onChange={(e) => updateForm("estimated_price", e.target.value)}
              />
            </FormField>

            <FormField label={t("forms.finalPriceOptional")} htmlFor="final_price">
              <input
                id="final_price"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                value={form.final_price}
                onChange={(e) => updateForm("final_price", e.target.value)}
              />
            </FormField>

            <FormField label={t("finance.paymentStatus")} htmlFor="payment_status">
              <select
                id="payment_status"
                className={inputClassName}
                value={form.payment_status}
                onChange={(e) => updateForm("payment_status", e.target.value)}
              >
                <option value="unpaid">{paymentLabel("unpaid")}</option>
                <option value="paid">{paymentLabel("paid")}</option>
                <option value="card_hold">{paymentLabel("card_hold")}</option>
              </select>
            </FormField>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <FormField label={t("common.city")} htmlFor="address_city">
              <input
                id="address_city"
                className={inputClassName}
                value={form.address_city}
                onChange={(e) => updateForm("address_city", e.target.value)}
              />
            </FormField>

            <FormField label={t("forms.street")} htmlFor="address_street">
              <input
                id="address_street"
                className={inputClassName}
                value={form.address_street}
                onChange={(e) => updateForm("address_street", e.target.value)}
              />
            </FormField>

            <FormField label={t("forms.houseNumber")} htmlFor="address_house_number">
              <input
                id="address_house_number"
                className={inputClassName}
                value={form.address_house_number}
                onChange={(e) =>
                  updateForm("address_house_number", e.target.value)
                }
              />
            </FormField>

            <FormField label={t("forms.floor")} htmlFor="address_floor">
              <input
                id="address_floor"
                className={inputClassName}
                value={form.address_floor}
                onChange={(e) => updateForm("address_floor", e.target.value)}
              />
            </FormField>

            <FormField label={t("forms.doorbellName")} htmlFor="address_doorbell_name">
              <input
                id="address_doorbell_name"
                className={inputClassName}
                value={form.address_doorbell_name}
                onChange={(e) =>
                  updateForm("address_doorbell_name", e.target.value)
                }
              />
            </FormField>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <FormField label={t("forms.customerComment")} htmlFor="customer_comment">
              <textarea
                id="customer_comment"
                rows={4}
                className={textareaClassName}
                value={form.customer_comment}
                onChange={(e) => updateForm("customer_comment", e.target.value)}
              />
            </FormField>

            <FormField label={t("common.notes")} htmlFor="internal_note">
              <textarea
                id="internal_note"
                rows={4}
                className={textareaClassName}
                value={form.internal_note}
                onChange={(e) => updateForm("internal_note", e.target.value)}
              />
            </FormField>
          </section>

          {serviceFields.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("orders.serviceDetails")} ({order.service.typeLabel})
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {serviceFields.map((field) => {
                  const value = (form.serviceData as Record<string, unknown>)[field.key];

                  if (field.valueType === "boolean") {
                    return (
                      <label
                        key={field.key}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                      >
                        <span className="text-sm text-slate-700">{field.label}</span>
                        <input
                          type="checkbox"
                          checked={typeof value === "boolean" ? value : false}
                          onChange={(e) =>
                            updateServiceField(field.key, e.target.checked)
                          }
                        />
                      </label>
                    );
                  }

                  if (field.valueType === "number") {
                    return (
                      <FormField key={field.key} label={field.label} htmlFor={field.key}>
                        <input
                          id={field.key}
                          type="number"
                          className={inputClassName}
                          value={typeof value === "number" ? String(value) : ""}
                          onChange={(e) =>
                            updateServiceField(
                              field.key,
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                        />
                      </FormField>
                    );
                  }

                  if (field.valueType === "stringArray") {
                    return (
                      <FormField key={field.key} label={field.label} htmlFor={field.key}>
                        <input
                          id={field.key}
                          className={inputClassName}
                          placeholder="comma,separated,values"
                          value={toStringArrayInput(value)}
                          onChange={(e) =>
                            updateServiceField(
                              field.key,
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </FormField>
                    );
                  }

                  return (
                    <FormField key={field.key} label={field.label} htmlFor={field.key}>
                      <input
                        id={field.key}
                        className={inputClassName}
                        value={typeof value === "string" ? value : ""}
                        onChange={(e) =>
                          updateServiceField(field.key, e.target.value)
                        }
                      />
                    </FormField>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t("forms.saving") : t("forms.saveChanges")}
            </button>
            <Link
              href={`/app/admin/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
            >
              {t("common.cancel")}
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}

