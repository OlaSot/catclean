"use client";

import { CheckCircle2 } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { SubmitResult } from "../move-out-wizard.types";

type Props = {
  result: SubmitResult;
};

export function StepSuccess({ result }: Props) {
  const { t } = usePublicT();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          {t("public.moveOut.success.title")}
        </h1>
        <p className="text-base leading-relaxed text-slate-500">
          {t("public.moveOut.success.subtitle")}
        </p>
      </div>
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 text-left shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-400">{t("public.moveOut.success.orderRef")}</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{result.orderId}</p>
      </div>
    </div>
  );
}
