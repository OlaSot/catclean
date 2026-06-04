import { Check } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  emoji?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function PremiumSelectCard({
  selected,
  onClick,
  title,
  subtitle,
  description,
  emoji,
  icon,
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`hr-wizard-card group relative w-full rounded-3xl border p-5 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "hr-wizard-card--selected border-[#34597E]/40 bg-[#34597E]/[0.04] shadow-[0_0_0_1px_rgba(52,89,126,0.12),0_12px_32px_rgba(52,89,126,0.10)]"
          : "border-stone-200/90 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:border-stone-300 hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)]"
      } ${className}`.trim()}
    >
      {selected ? (
        <span className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#34597E] text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        </span>
      ) : null}

      <div className="flex items-start gap-4">
        {icon ? <div className="shrink-0">{icon}</div> : null}
        {emoji && !icon ? (
          <span className="shrink-0 text-2xl" aria-hidden>
            {emoji}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 pr-8">
          <p className="text-lg font-semibold text-slate-800">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
