"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { WizardStepHeader } from "./WizardStepHeader";
import { getSpecialRequestExamples } from "../home-reset-wizard.i18n";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function StepSpecialRequests({ value, onChange }: Props) {
  const { t } = usePublicT();
  const examples = getSpecialRequestExamples(t);

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeReset.requests.eyebrow")}
        title={t("public.homeReset.requests.title")}
        subtitle={t("public.homeReset.requests.subtitle")}
      />

      <div className="rounded-3xl border border-[#34597E]/12 bg-[#34597E]/[0.04] px-5 py-4 text-sm leading-relaxed text-slate-600">
        {t("public.homeReset.requests.guidance")}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-600">{t("public.homeReset.requests.examplesLabel")}</p>
        <ul className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => {
                  const trimmed = value.trim();
                  const next = trimmed ? `${trimmed}\n${example}` : example;
                  onChange(next);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#34597E]/30 hover:text-[#34597E]"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <label htmlFor="home-reset-special-request" className="text-sm font-medium text-slate-600">
          {t("public.homeReset.requests.notesLabel")}
        </label>
        <textarea
          id="home-reset-special-request"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={t("public.homeReset.requests.placeholder")}
          className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-[#34597E]/40 focus:ring-2 focus:ring-[#34597E]/15 focus:outline-none"
        />
      </div>
    </div>
  );
}
