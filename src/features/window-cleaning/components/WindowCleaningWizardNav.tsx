import { WizardNav } from "@/components/ui/WizardNav";

type Props = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  showNext?: boolean;
  submitting?: boolean;
  mode?: "default" | "checkout";
};

export function WindowCleaningWizardNav(props: Props) {
  return <WizardNav {...props} i18n={props.mode === "checkout"} />;
}
