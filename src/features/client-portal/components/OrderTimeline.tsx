import type { PortalTimelineStep } from "../types/portal.types";
import { Check } from "lucide-react";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";

type OrderTimelineProps = {
  steps: PortalTimelineStep[];
};

export default function OrderTimeline({ steps }: OrderTimelineProps) {
  return (
    <div className={`${PORTAL_CARD_CLASS} p-5 sm:p-6`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Timeline
      </h3>
      <ol className="mt-5 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const dotClass =
            step.state === "done"
              ? "bg-[#34597E] text-white"
              : step.state === "current"
                ? "bg-white text-[#34597E] ring-2 ring-[#34597E]"
                : "bg-slate-100 text-slate-400";

          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className={`absolute left-[1.125rem] top-9 h-[calc(100%-1.5rem)] w-px ${
                    step.state === "done" ? "bg-[#34597E]/40" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              ) : null}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${dotClass}`}
              >
                {step.state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <p
                  className={`text-sm font-semibold ${
                    step.state === "upcoming" ? "text-slate-400" : "text-slate-800"
                  }`}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>
                ) : null}
                {step.at ? (
                  <p className="mt-1 text-xs text-slate-400">{step.at}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
