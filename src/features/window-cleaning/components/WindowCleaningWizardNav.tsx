import { ArrowLeft, ArrowRight } from "lucide-react";

type Props = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  showNext?: boolean;
};

export function WindowCleaningWizardNav({
  onBack,
  onNext,
  nextLabel = "Next step",
  showNext = true,
}: Props) {
  return (
    <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#34597E] hover:text-[#34597E]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {showNext ? (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34597E] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.28)] transition hover:bg-[#2d4d6f]"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
