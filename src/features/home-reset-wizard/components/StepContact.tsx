"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { WizardStepHeader } from "./WizardStepHeader";
import type { HomeResetContact } from "../home-reset-wizard.types";

type Props = {
  value: HomeResetContact;
  onChange: (next: HomeResetContact) => void;
  errors?: Partial<Record<keyof HomeResetContact, string>>;
};

export function StepContact({ value, onChange, errors }: Props) {
  const { t } = usePublicT();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <WizardStepHeader
        eyebrow={t("public.wizard.contact.eyebrow")}
        title={t("public.wizard.contact.title")}
        subtitle={t("public.wizard.contact.subtitle")}
      />

      <div className="space-y-4 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-8">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">{t("public.wizard.field.name")}</span>
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#34597E]"
          />
          {errors?.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">{t("public.wizard.field.phone")}</span>
          <input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+49 178 1234567"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#34597E]"
          />
          {errors?.phone ? <p className="mt-1 text-sm text-rose-600">{errors.phone}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">{t("public.wizard.field.email")}</span>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder={t("public.wizard.placeholder.email")}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#34597E]"
          />
          {errors?.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">{t("public.wizard.field.comment")}</span>
          <textarea
            rows={4}
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder={t("public.wizard.placeholder.contactNotes")}
            className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#34597E]"
          />
        </label>
      </div>
    </div>
  );
}
