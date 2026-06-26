import { WizardStepper } from "@/components/ui/WizardStepper";
import { WINDOW_CLEANING_WIZARD_STEPS } from "../window-cleaning.constants";

type Props = {
  currentStep: number;
};

export function WindowCleaningWizardStepper({ currentStep }: Props) {
  return <WizardStepper steps={WINDOW_CLEANING_WIZARD_STEPS} currentStep={currentStep} />;
}
