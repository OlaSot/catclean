import { Button } from "@/components/ui/Button";
import type { ComponentPropsWithoutRef } from "react";

type PortalPrimaryButtonProps = ComponentPropsWithoutRef<"button"> & {
  href?: string;
};

export default function PortalPrimaryButton({
  href,
  className = "",
  children,
  ...props
}: PortalPrimaryButtonProps) {
  if (href) {
    return (
      <Button variant="primary" size="lg" fullWidth href={href} className={className}>
        {children}
      </Button>
    );
  }

  return (
    <Button variant="primary" size="lg" fullWidth className={className} {...props}>
      {children}
    </Button>
  );
}
