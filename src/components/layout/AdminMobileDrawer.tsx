"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AdminSidebarNav } from "@/components/layout/AdminSidebarNav";

type AdminMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  userEmail: string;
};

export function AdminMobileDrawer({
  open,
  onClose,
  userEmail,
}: AdminMobileDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100%,18.5rem)] flex-col border-r border-[#E5EDF5] bg-white shadow-2xl">
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="-mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
          <AdminSidebarNav
            userEmail={userEmail}
            onNavigate={onClose}
            compactLogo
          />
        </div>
      </aside>
    </div>
  );
}
