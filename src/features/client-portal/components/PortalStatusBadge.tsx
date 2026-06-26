import { Badge } from "@/components/ui/Badge";
import { portalStatusTone } from "@/lib/design-system/badge-variants";
import type { PortalOrderStatus } from "../types/portal.types";

type PortalStatusBadgeProps = {
  label: string;
  status?: PortalOrderStatus;
  size?: "sm" | "md";
};

export default function PortalStatusBadge({
  label,
  status = "confirmed",
  size = "md",
}: PortalStatusBadgeProps) {
  return (
    <Badge tone={portalStatusTone(status)} size={size === "sm" ? "sm" : "md"}>
      {label}
    </Badge>
  );
}
