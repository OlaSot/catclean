import { WizardStepper } from "@/components/ui/WizardStepper";
import { UPHOLSTERY_WIZARD_STEPS } from "../upholstery-wizard.constants";

type Props = {
  currentStep: number;
};

export function UpholsteryWizardStepper({ currentStep }: Props) {
  return <WizardStepper steps={UPHOLSTERY_WIZARD_STEPS} currentStep={currentStep} />;
}
