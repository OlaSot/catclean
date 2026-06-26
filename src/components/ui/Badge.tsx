import type { ReactNode } from "react";
import { badgeClass, type BadgeTone } from "@/lib/design-system/badge-variants";
import { badgeSizes } from "@/lib/design-system/tokens";

type BadgeSize = keyof typeof badgeSizes;

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
};

export function Badge({ children, tone = "brand", size = "sm", className = "" }: BadgeProps) {
  return (
    <span className={`${badgeClass(tone, size)} ${className}`.trim()}>{children}</span>
  );
}
