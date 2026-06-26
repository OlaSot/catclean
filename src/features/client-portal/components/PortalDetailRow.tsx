import type { LucideIcon } from "lucide-react";
import { PORTAL_CARD_SOFT_CLASS } from "../lib/portal-styles";

type PortalDetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export default function PortalDetailRow({
  icon: Icon,
  label,
  value,
}: PortalDetailRowProps) {
  return (
    <div className={`${PORTAL_CARD_SOFT_CLASS} flex gap-4 p-4`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#34597E] shadow-sm ring-1 ring-slate-200/60">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
