import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { buttonSizes, buttonVariants } from "@/lib/design-system/tokens";

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buildClassName({
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
}: Pick<ButtonBaseProps, "variant" | "size" | "className" | "fullWidth">) {
  const width = fullWidth ? "w-full lg:w-auto" : "";
  return `${buttonVariants[variant]} ${buttonSizes[size]} ${width} ${className}`.trim();
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const classes = buildClassName({ variant, size, className, fullWidth });

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

/** Legacy class exports for gradual migration */
export const PRIMARY_BUTTON_CLASS = buildClassName({ variant: "primary", size: "lg", fullWidth: true });
export const SECONDARY_BUTTON_CLASS = buildClassName({ variant: "secondary", size: "md", fullWidth: true });
