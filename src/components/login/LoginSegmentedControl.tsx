"use client";

import { motion } from "framer-motion";

type LoginTab = "staff" | "phone";

type LoginSegmentedControlProps = {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
  variant?: "default" | "subtle";
};

const TABS: { id: LoginTab; label: string }[] = [
  { id: "staff", label: "Staff Login" },
  { id: "phone", label: "Phone Login" },
];

export function LoginSegmentedControl({
  activeTab,
  onTabChange,
  variant = "default",
}: LoginSegmentedControlProps) {
  const isSubtle = variant === "subtle";

  return (
    <div
      className={
        isSubtle
          ? "relative grid grid-cols-2 rounded-xl bg-slate-50 p-1"
          : "relative grid grid-cols-2 rounded-2xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60"
      }
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
            className={`relative z-10 rounded-lg px-3 transition-colors sm:py-3 sm:text-[0.9375rem] ${
              isSubtle
                ? `py-2.5 text-[0.8125rem] font-medium ${
                    isActive ? "text-[#34597E]" : "text-slate-400"
                  }`
                : `rounded-xl py-3 text-sm font-semibold max-md:min-h-[44px] ${
                    isActive ? "text-[#34597E]" : "text-slate-500 hover:text-slate-700"
                  }`
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId={isSubtle ? "login-tab-pill-mobile" : "login-tab-pill"}
                className={
                  isSubtle
                    ? "absolute inset-0 rounded-lg bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
                    : "absolute inset-0 rounded-xl bg-white shadow-[0_4px_16px_rgba(52,89,126,0.12)]"
                }
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
