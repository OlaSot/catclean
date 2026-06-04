"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UpholsteryItemId } from "./upholstery-wizard.types";
import { StepSelectItem } from "./components/StepSelectItem";
import { TrustStrip } from "./components/TrustStrip";
import { UpholsteryBookingSidebar } from "./components/UpholsteryBookingSidebar";
import { UpholsteryWizardNav } from "./components/UpholsteryWizardNav";
import { UpholsteryWizardStepper } from "./components/UpholsteryWizardStepper";
import { WizardContentPanel } from "@/components/booking/WizardContentPanel";

const ACTIVE_STEP = 1;

export function UpholsteryWizard() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<UpholsteryItemId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPlaceholderStep, setShowPlaceholderStep] = useState(false);

  function handleBack() {
    if (showPlaceholderStep) {
      setShowPlaceholderStep(false);
      setError(null);
      return;
    }
    router.push("/");
  }

  function handleNext() {
    if (!selectedId) {
      setError("Please choose an item to continue.");
      return;
    }
    setError(null);
    setShowPlaceholderStep(true);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <UpholsteryWizardStepper currentStep={showPlaceholderStep ? 2 : ACTIVE_STEP} />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <UpholsteryBookingSidebar selectedId={selectedId} className="lg:hidden" />

          <WizardContentPanel>
            {showPlaceholderStep ? (
              <div className="px-2 py-8 text-center sm:py-10">
                <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">Details — coming soon</h2>
                <p className="mt-2 text-sm text-slate-500">
                  The next steps of the upholstery booking flow will be added soon.
                </p>
              </div>
            ) : (
              <StepSelectItem
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setError(null);
                }}
                error={error ?? undefined}
              />
            )}

            <UpholsteryWizardNav
              onBack={handleBack}
              onNext={handleNext}
              showNext={!showPlaceholderStep}
            />
          </WizardContentPanel>
        </div>

        <UpholsteryBookingSidebar
          selectedId={selectedId}
          className="sticky top-6 hidden lg:block"
        />
      </div>

      <TrustStrip />
    </div>
  );
}
