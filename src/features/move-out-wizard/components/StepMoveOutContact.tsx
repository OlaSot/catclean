"use client";

import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { MoveOutContact } from "../move-out-wizard.types";

type Props = {
  value: MoveOutContact;
  onChange: (next: MoveOutContact) => void;
  errors: { name?: string; phone?: string; email?: string };
};

export function StepMoveOutContact({ value, onChange, errors }: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-6">
      <WizardStepHeader
        eyebrow={t("public.wizard.contact.eyebrow")}
        title={t("public.wizard.contact.title")}
        subtitle={t("public.wizard.contact.subtitle")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            {t("public.wizard.field.name")}
          </span>
          <input
            type="text"
            autoComplete="name"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#34597E]"
          />
          {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            {t("public.wizard.field.phone")}
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder={t("public.wizard.placeholder.phone")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#34597E]"
          />
          {errors.phone ? <p className="mt-1 text-sm text-rose-600">{errors.phone}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            {t("public.wizard.field.email")}
          </span>
          <input
            type="email"
            autoComplete="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder={t("public.wizard.placeholder.email")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#34597E]"
          />
          {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            {t("public.moveOut.contact.commentLabel")}
          </span>
          <textarea
            rows={3}
            value={value.customerComment}
            onChange={(e) => onChange({ ...value, customerComment: e.target.value })}
            placeholder={t("public.moveOut.contact.commentPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#34597E]"
          />
        </label>
      </div>
    </div>
  );
}
