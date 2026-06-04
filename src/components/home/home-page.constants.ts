import {
  Droplets,
  Globe,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const HOME_RESET_SIGNATURE_BADGE = "Signature Service";

/** Trust & value chips below the booking CTA — single row, Lucide icons only. */
export const HOME_TRUST_BADGES: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Deep refresh", icon: Sparkles },
  { label: "Pet-friendly", icon: PawPrint },
  { label: "Steam cleaning", icon: Droplets },
  { label: "Reliable", icon: ShieldCheck },
  { label: "Fast & easy", icon: Zap },
  { label: "100% online · No calls", icon: Globe },
];
