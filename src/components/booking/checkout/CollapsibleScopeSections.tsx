"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { CheckoutScopeSection } from "./booking-checkout.types";

type Props = {
  sections: CheckoutScopeSection[];
  title?: string;
  subtitle?: string;
};

function ScopeSection({ section }: { section: CheckoutScopeSection }) {
  const { t } = usePublicT();
  const [open, setOpen] = useState(false);
  const taskLabel = t("public.checkout.scope.tasksIncluded").replace(
    "{count}",
    String(section.items.length),
  );

  return (
    <div className="border-b border-stone-100/90 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[#34597E]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 sm:text-base">{section.title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{taskLabel}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="checkout-scope-content space-y-2 pb-4 pl-0.5">
            {section.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5B8DB8]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function CollapsibleScopeSections({ sections, title, subtitle }: Props) {
  const { t } = usePublicT();

  if (sections.length === 0) return null;

  return (
    <section className="checkout-card-hover rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <h2 className="text-base font-semibold text-slate-800">
        {title ?? t("public.checkout.scope.title")}
      </h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-2 divide-y divide-stone-100/90">
        {sections.map((section) => (
          <ScopeSection key={section.title} section={section} />
        ))}
      </div>
    </section>
  );
}
