import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function WizardContentPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] sm:p-6 lg:p-7 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
