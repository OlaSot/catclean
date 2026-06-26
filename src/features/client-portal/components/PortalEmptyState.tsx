import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";

type PortalEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function PortalEmptyState({
  title,
  description,
  action,
}: PortalEmptyStateProps) {
  return (
    <div className={`${PORTAL_CARD_CLASS} px-6 py-12 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EEF4FA] text-[#34597E] ring-1 ring-[#C5D9EB]">
        <Sparkles className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
