"use client";

import "@/components/booking/checkout/booking-checkout.css";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { Button } from "./Button";
import { wizardNavDivider } from "@/lib/design-system/tokens";

type WizardNavProps = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  submitting?: boolean;
  /** Use i18n for back/continue labels (default: true) */
  i18n?: boolean;
  /** Premium checkout CTA — full-width confirm button */
  mode?: "default" | "checkout";
};

export function WizardNav({
  onBack,
  onNext,
  nextLabel,
  backLabel,
  showBack = true,
  showNext = true,
  submitting = false,
  i18n = true,
  mode = "default",
}: WizardNavProps) {
  const { t } = usePublicT();
  const resolvedBack = backLabel ?? (i18n ? t("public.common.back") : "Back");
  const resolvedNext =
    nextLabel ??
    (mode === "checkout"
      ? submitting
        ? t("public.checkout.confirmBookingLoading")
        : t("public.checkout.confirmBooking")
      : submitting && i18n
        ? t("public.common.booking")
        : i18n
          ? t("public.common.continue")
          : "Next step");

  if (mode === "checkout") {
    return (
      <div className={`mt-6 pt-2 sm:mt-8 ${wizardNavDivider}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {showBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={submitting}
              className="shrink-0 sm:min-w-[120px]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {resolvedBack}
            </Button>
          ) : null}
          {showNext ? (
            <Button
              type="button"
              variant="primary"
              size="xl"
              fullWidth
              onClick={onNext}
              disabled={submitting}
              className={`h-14 flex-1 text-base sm:text-lg ${
                submitting ? "checkout-confirm-btn-loading" : ""
              }`}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {resolvedNext}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-8 flex flex-col-reverse items-stretch justify-between gap-3 pt-6 sm:flex-row sm:items-center ${wizardNavDivider}`}
    >
      {showBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {resolvedBack}
        </Button>
      ) : (
        <span />
      )}

      {showNext ? (
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={submitting}
        >
          {resolvedNext}
          {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </Button>
      ) : null}
    </div>
  );
}
