"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

type Props = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  submitting?: boolean;
};

export function HomeResetWizardNav({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
  showNext = true,
  submitting = false,
}: Props) {
  const { t } = usePublicT();
  const resolvedNext = nextLabel ?? t("public.common.continue");

  return (
    <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="hr-wizard-btn-secondary inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-[#34597E]/30 hover:text-[#34597E] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("public.common.back")}
        </button>
      ) : (
        <span />
      )}

      {showNext ? (
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="hr-wizard-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-[#34597E] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("public.common.booking") : resolvedNext}
          {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </button>
      ) : null}
    </div>
  );
}
