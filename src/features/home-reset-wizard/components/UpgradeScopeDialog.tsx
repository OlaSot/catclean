"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePublicT } from "@/i18n/public/usePublicT";

type Props = {
  open: boolean;
  title: string;
  items: readonly string[];
  onClose: () => void;
};

export function UpgradeScopeDialog({ open, title, items, onClose }: Props) {
  const { t } = usePublicT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-scope-title"
    >
      <button
        type="button"
        className="hr-wizard-dialog-backdrop-enter absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
        aria-label={t("public.homeReset.dialog.close")}
        onClick={onClose}
      />
      <div className="hr-wizard-dialog-panel-enter relative z-10 w-full max-w-md rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#5B8DB8] uppercase">
              {t("public.homeReset.dialog.fullScope")}
            </p>
            <h2 id="upgrade-scope-title" className="mt-1 text-lg font-semibold text-slate-800">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-stone-100 hover:text-slate-600"
            aria-label={t("public.homeReset.dialog.close")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <ul className="mt-4 max-h-[min(60vh,320px)] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#5B8DB8]"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
