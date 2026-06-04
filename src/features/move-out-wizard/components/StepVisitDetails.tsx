"use client";

import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { MoveOutVisitNotes } from "../move-out-wizard.types";

type Props = {
  value: MoveOutVisitNotes;
  onChange: (next: MoveOutVisitNotes) => void;
};

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm outline-none focus:border-[#34597E]"
      />
    </label>
  );
}

export function StepVisitDetails({ value, onChange }: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-6">
      <WizardStepHeader
        eyebrow={t("public.moveOut.visit.eyebrow")}
        title={t("public.moveOut.visit.title")}
        subtitle={t("public.moveOut.visit.subtitle")}
      />
      <div className="space-y-4">
        <Field
          label={t("public.moveOut.visit.accessNotes")}
          placeholder={t("public.moveOut.visit.accessPlaceholder")}
          value={value.accessNotes}
          onChange={(accessNotes) => onChange({ ...value, accessNotes })}
        />
        <Field
          label={t("public.moveOut.visit.petsInfo")}
          placeholder={t("public.moveOut.visit.petsPlaceholder")}
          value={value.petsInfo}
          onChange={(petsInfo) => onChange({ ...value, petsInfo })}
        />
        <Field
          label={t("public.moveOut.visit.suppliesNote")}
          placeholder={t("public.moveOut.visit.suppliesPlaceholder")}
          value={value.suppliesNote}
          onChange={(suppliesNote) => onChange({ ...value, suppliesNote })}
        />
        <Field
          label={t("public.moveOut.visit.equipmentNote")}
          placeholder={t("public.moveOut.visit.equipmentPlaceholder")}
          value={value.equipmentNote}
          onChange={(equipmentNote) => onChange({ ...value, equipmentNote })}
        />
      </div>
    </div>
  );
}
