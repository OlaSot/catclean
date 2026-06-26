import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { surfaces } from "@/lib/design-system/tokens";

type CardVariant = "default" | "soft" | "panel" | "info";

const variantClasses: Record<CardVariant, string> = {
  default: surfaces.card,
  soft: surfaces.cardSoft,
  panel: surfaces.cardPanel,
  info: surfaces.infoCallout,
};

type CardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: CardVariant;
  children: ReactNode;
};

export function Card({ variant = "default", className = "", children, ...props }: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/** Legacy export */
export const CARD_CLASS = surfaces.card;
export const CARD_SOFT_CLASS = surfaces.cardSoft;
