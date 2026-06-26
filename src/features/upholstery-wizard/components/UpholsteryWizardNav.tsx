import { WizardNav } from "@/components/ui/WizardNav";

type Props = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  showNext?: boolean;
};

export function UpholsteryWizardNav(props: Props) {
  return <WizardNav {...props} i18n={false} />;
}
