"use client";

import { ShieldCheck } from "lucide-react";
import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { MoveOutAddress } from "../move-out-wizard.types";
import { GoogleAddressAutocomplete } from "@/components/booking/GoogleAddressAutocomplete";
import { GoogleAddressMap } from "@/components/booking/GoogleAddressMap";
import { addressAfterManualEdit } from "@/lib/booking/hannover-service-area";

type Props = {
  value: MoveOutAddress;
  onChange: (next: MoveOutAddress) => void;
  errors?: Partial<Record<"street" | "houseNumber" | "zip" | "city", string>>;
};

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#34597E]"
      />
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

export function StepMoveOutAddress({ value, onChange, errors }: Props) {
  const { t } = usePublicT();

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
      <div className="space-y-8">
        <WizardStepHeader
          eyebrow={t("public.wizard.address.eyebrow")}
          title={t("public.wizard.address.title")}
          subtitle={t("public.wizard.address.subtitle")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GoogleAddressAutocomplete
            label={t("public.wizard.field.street")}
            value={value.street}
            onInputChange={(street) =>
              onChange(addressAfterManualEdit(value, { street }))
            }
            onAddressSelected={(address) => onChange({ ...value, ...address })}
            error={errors?.street}
            className="sm:col-span-2"
            placeholder={t("public.wizard.placeholder.street")}
          />
          <Field
            label={t("public.wizard.field.house")}
            value={value.houseNumber}
            onChange={(houseNumber) => onChange({ ...value, houseNumber })}
            error={errors?.houseNumber}
            placeholder="12"
          />
          <Field
            label={t("public.wizard.field.apartment")}
            value={value.apartment}
            onChange={(apartment) => onChange({ ...value, apartment })}
            placeholder={t("public.wizard.placeholder.apartmentOptional")}
          />
          <Field
            label={t("public.wizard.field.floor")}
            value={value.floor}
            onChange={(floor) => onChange({ ...value, floor })}
            placeholder={t("public.wizard.placeholder.floorOptional")}
          />
          <Field
            label={t("public.wizard.field.zip")}
            value={value.zip}
            onChange={(zip) => onChange(addressAfterManualEdit(value, { zip }))}
            error={errors?.zip}
          />
          <Field
            label={t("public.wizard.field.city")}
            value={value.city}
            onChange={(city) => onChange(addressAfterManualEdit(value, { city }))}
            error={errors?.city}
          />
        </div>

        <div className="flex items-start gap-3 rounded-3xl border border-stone-200/80 bg-stone-50/80 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#34597E]" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-600">{t("public.wizard.address.privacy")}</p>
        </div>
      </div>

      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-50 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:block">
        <GoogleAddressMap
          latitude={value.latitude}
          longitude={value.longitude}
          placeholderTitle={t("public.wizard.mapPreview")}
          placeholderHint={t("public.wizard.mapPreviewHint")}
        />
      </div>
    </div>
  );
}
