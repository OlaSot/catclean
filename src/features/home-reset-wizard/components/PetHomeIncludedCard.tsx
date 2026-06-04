"use client";

import { PawPrint } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { getPetHomeUpgradeCard } from "../home-reset-wizard.i18n";
import { UpgradeOptionCard } from "./UpgradeOptionCard";

export function PetHomeIncludedCard() {
  const { t } = usePublicT();
  const pet = getPetHomeUpgradeCard(t);

  return (
    <UpgradeOptionCard
      icon={PawPrint}
      title={pet.title}
      description={pet.cardDescription}
      benefits={pet.cardBenefits}
      priceEur={0}
      priceLabel={pet.includedBadge}
      selected
      locked
    />
  );
}
