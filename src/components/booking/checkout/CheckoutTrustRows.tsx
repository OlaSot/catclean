"use client";

import { BadgeCheck, Mail, ShieldCheck, Users } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

type TrustKey = "email" | "insured" | "cleaners" | "cancellation";

const TRUST_ITEMS: Array<{ key: TrustKey; icon: typeof Mail }> = [
  { key: "email", icon: Mail },
  { key: "insured", icon: ShieldCheck },
  { key: "cleaners", icon: Users },
  { key: "cancellation", icon: BadgeCheck },
] as const;

export function CheckoutTrustRows() {
  const { t } = usePublicT();

  return (
    <section
      className="rounded-2xl border border-stone-200/70 bg-stone-50/50 px-4 py-1 sm:px-5"
      aria-label={t("public.checkout.trust.aria")}
    >
      <ul className="divide-y divide-stone-200/60">
        {TRUST_ITEMS.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-center gap-3 py-3.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#34597E] shadow-sm ring-1 ring-stone-200/80">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-sm font-medium text-slate-700">
              {t(`public.checkout.trust.${key}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
