import { UPHOLSTERY_WIZARD_STEPS } from "../upholstery-wizard.constants";

type Props = {
  currentStep: number;
};

export function UpholsteryWizardStepper({ currentStep }: Props) {
  return (
    <nav aria-label="Booking progress" className="overflow-x-auto pb-1">
      <ol className="flex min-w-[640px] items-start justify-between gap-1 sm:min-w-0 sm:gap-2">
        {UPHOLSTERY_WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#34597E] text-white shadow-[0_6px_16px_rgba(52,89,126,0.28)]"
                    : isCompleted
                      ? "bg-[#34597E]/15 text-[#34597E]"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {step.id}
              </span>
              <span
                className={`max-w-[5.5rem] text-[11px] leading-tight font-medium sm:max-w-none sm:text-xs ${
                  isActive ? "text-[#34597E]" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
