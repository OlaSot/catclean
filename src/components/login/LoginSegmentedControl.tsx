"use client";

import { motion } from "framer-motion";

type LoginTab = "staff" | "phone";

type LoginSegmentedControlProps = {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
};

const TABS: { id: LoginTab; label: string }[] = [
  { id: "staff", label: "Staff Login" },
  { id: "phone", label: "Phone Login" },
];

export function LoginSegmentedControl({
  activeTab,
  onTabChange,
}: LoginSegmentedControlProps) {
  return (
    <div
      className="relative grid grid-cols-2 rounded-2xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60"
      role="tablist"
      aria-label="Sign in method"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors sm:py-3 sm:text-[0.9375rem] ${
              isActive ? "text-[#34597E]" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="login-tab-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_16px_rgba(52,89,126,0.12)]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
