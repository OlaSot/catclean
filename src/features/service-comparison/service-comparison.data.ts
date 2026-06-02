import type { ComparisonRow, ServiceId, ServiceProfile } from "./service-comparison.types";

export const SERVICE_IDS: ServiceId[] = ["home_reset", "move_out", "regular_cleaning"];

export const SERVICE_PROFILES: Record<ServiceId, ServiceProfile> = {
  home_reset: {
    id: "home_reset",
    title: "Home Reset",
    tagline: "Deep apartment refresh",
    shortDescription:
      "A full-home deep refresh for spaces that need more than maintenance — buildup, dust in corners, and high-touch areas get extra attention so your home feels new again.",
    cleaningAreas: [
      {
        key: "kitchen",
        title: "Kitchen",
        visualLabel: "Deep kitchen reset",
        visualAccent: "from-[#f5f9ff] via-[#e5f0fb] to-[#d7e6f4]",
        cta: "Add oven or fridge deep clean",
        items: [
          "Countertops, backsplash & reachable surfaces",
          "Sink & faucet descaling",
          "Outside of appliances + degrease hotspots",
          "Cabinet fronts & handles",
          "Floor vacuum, wash & edges",
        ],
      },
      {
        key: "bathroom",
        title: "Bathroom",
        visualLabel: "Bathroom deep detail",
        visualAccent: "from-[#f8fcff] via-[#eaf3fb] to-[#dbe9f6]",
        cta: "Add extra bathroom focus",
        items: [
          "Toilet inside & out",
          "Shower, tub & glass descaling",
          "Sink, fixtures & mirror polish",
          "Tile & grout wipe-down (reachable)",
          "Floor wash & detail edges",
        ],
      },
      {
        key: "living",
        title: "Living areas & bedrooms",
        visualLabel: "Whole-home refresh",
        visualAccent: "from-[#f6fbff] via-[#e7f1fa] to-[#d8e7f4]",
        cta: "Add pet hair intensive",
        items: [
          "Dusting all reachable surfaces & decor",
          "Vacuum carpets, rugs & upholstery (surface)",
          "Floor washing & skirting wipe",
          "Doors, switches & handles",
          "Bed making & light tidy",
        ],
      },
    ],
    included: [
      "Deep dusting & surface reset",
      "Kitchen & bathroom deep detail",
      "Floor vacuuming & washing",
      "Trash removal",
      "High-touch point sanitising",
      "Pet-friendly products on request",
    ],
    addOns: [
      {
        title: "Oven cleaning",
        description: "Full degrease of oven interior and racks.",
        price: "from 25 €",
      },
      {
        title: "Fridge cleaning",
        description: "Interior shelves, drawers and seals.",
        price: "from 20 €",
      },
      {
        title: "Inside cabinets",
        description: "Empty cabinets — interior wipe-down.",
        price: "from 30 €",
      },
      {
        title: "Window cleaning",
        description: "Interior window panels and frames.",
        price: "from 25 €",
      },
      {
        title: "Pet hair intensive",
        description: "Extra passes on fur-prone furniture & floors.",
        price: "from 20 €",
      },
    ],
  },
  move_out: {
    id: "move_out",
    title: "Move Out Cleaning",
    tagline: "Deposit-safe cleaning",
    shortDescription:
      "End-of-lease cleaning focused on handover standards — empty or nearly empty homes, inside appliances, cabinets and bathrooms prepared for inspection.",
    cleaningAreas: [
      {
        key: "kitchen",
        title: "Kitchen",
        visualLabel: "Handover-ready kitchen",
        visualAccent: "from-[#f4f9ff] via-[#e3eff9] to-[#d4e5f2]",
        cta: "Confirm appliance list at booking",
        items: [
          "All surfaces, backsplash & cabinets (inside if empty)",
          "Sink, taps & waste area",
          "Inside oven & fridge (if empty)",
          "Hob, hood & appliance exteriors",
          "Floor degrease, wash & corners",
        ],
      },
      {
        key: "bathroom",
        title: "Bathroom",
        visualLabel: "Inspection-grade bath",
        visualAccent: "from-[#f9fcff] via-[#ebf4fb] to-[#dceaf5]",
        cta: "Add lime-scale treatment",
        items: [
          "Toilet deep clean",
          "Shower, tub, tiles & silicone lines",
          "Sink, mirror & fixtures polish",
          "Exhaust fan grille (reachable)",
          "Floor & wall splash zones",
        ],
      },
      {
        key: "living",
        title: "Living areas & bedrooms",
        visualLabel: "Empty-home finish",
        visualAccent: "from-[#f7fbff] via-[#e8f2fa] to-[#d9e8f4]",
        cta: "Add balcony cleaning",
        items: [
          "All reachable surfaces & ledges",
          "Inside wardrobes & closets (if empty)",
          "Windowsills & interior window wipe",
          "Doors, frames & skirting boards",
          "Floors vacuumed and washed throughout",
        ],
      },
    ],
    included: [
      "Deposit-oriented deep checklist",
      "Kitchen & bathroom handover detail",
      "Inside empty cabinets & wardrobes",
      "Appliance interiors (when empty)",
      "Full floor wash in all rooms",
      "Trash removal & final walk-through tidy",
    ],
    addOns: [
      {
        title: "Balcony cleaning",
        description: "Floor, railing and reachable exterior surfaces.",
        price: "from 20 €",
      },
      {
        title: "Window cleaning",
        description: "Interior glass — ideal before key handover.",
        price: "from 25 €",
      },
      {
        title: "Oven cleaning",
        description: "Extra degrease if not included in base scope.",
        price: "from 25 €",
      },
      {
        title: "Post-renovation touch-up",
        description: "Light dust & residue only — not full renovation clean.",
        price: "on request",
      },
    ],
  },
  regular_cleaning: {
    id: "regular_cleaning",
    title: "Regular Cleaning",
    tagline: "Weekly or bi-weekly care",
    shortDescription:
      "Consistent upkeep for busy homes — our core checklist keeps kitchens, bathrooms and living spaces fresh between deeper visits.",
    cleaningAreas: [
      {
        key: "kitchen",
        title: "Kitchen",
        visualLabel: "Weekly kitchen care",
        visualAccent: "from-[#f6faff] via-[#eaf3fb] to-[#dceaf5]",
        cta: "Add oven or fridge monthly",
        items: [
          "Countertops & surfaces",
          "Sink cleaning",
          "Outside of appliances",
          "Floor vacuum & wash",
          "Trash removal",
        ],
      },
      {
        key: "bathroom",
        title: "Bathroom",
        visualLabel: "Routine bathroom care",
        visualAccent: "from-[#f8fbff] via-[#edf4fb] to-[#dfeaf4]",
        cta: "Add deep bathroom monthly",
        items: [
          "Toilet cleaning",
          "Shower & bathtub",
          "Sink & fixtures",
          "Mirror polishing",
          "Floor cleaning",
        ],
      },
      {
        key: "living",
        title: "Living areas & bedrooms",
        visualLabel: "Maintenance clean",
        visualAccent: "from-[#f7fbff] via-[#e9f2fa] to-[#dae8f3]",
        cta: "Add extras as needed",
        items: [
          "Dusting reachable surfaces",
          "Vacuum cleaning",
          "Floor washing",
          "Visible surface cleaning",
          "Bed making if requested",
        ],
      },
    ],
    included: [
      "Dusting",
      "Vacuum cleaning",
      "Bathroom cleaning",
      "Kitchen surfaces",
      "Floor washing",
      "Trash removal",
    ],
    addOns: [
      {
        title: "Oven cleaning",
        description: "Periodic degrease — popular as a monthly extra.",
        price: "from 25 €",
      },
      {
        title: "Fridge cleaning",
        description: "Quick interior refresh between grocery runs.",
        price: "from 20 €",
      },
      {
        title: "Laundry & ironing",
        description: "Light garment care during your visit slot.",
        price: "from 15 €",
      },
      {
        title: "Inside cabinets",
        description: "One-off or rotating cabinet focus.",
        price: "from 30 €",
      },
      {
        title: "Pet hair intensive",
        description: "Extra attention for pet-friendly households.",
        price: "from 20 €",
      },
      {
        title: "Window cleaning",
        description: "Interior panels on a schedule that suits you.",
        price: "from 25 €",
      },
    ],
  },
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Best for",
    home_reset: { kind: "text", label: "Full home refresh" },
    move_out: { kind: "text", label: "End of lease / handover" },
    regular_cleaning: { kind: "text", label: "Ongoing upkeep" },
  },
  {
    feature: "Cleaning depth",
    home_reset: { kind: "text", label: "Deep reset" },
    move_out: { kind: "text", label: "Deposit-level deep" },
    regular_cleaning: { kind: "text", label: "Standard maintenance" },
  },
  {
    feature: "Kitchen deep detail",
    hint: "Degrease, fronts, buildup",
    home_reset: { kind: "yes" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "partial", label: "Core only" },
  },
  {
    feature: "Inside cabinets",
    home_reset: { kind: "partial", label: "Add-on" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "partial", label: "Add-on" },
  },
  {
    feature: "Inside oven & fridge",
    home_reset: { kind: "partial", label: "Add-on" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "partial", label: "Add-on" },
  },
  {
    feature: "Bathroom descaling",
    home_reset: { kind: "yes" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "partial", label: "Routine" },
  },
  {
    feature: "Skirting & door frames",
    home_reset: { kind: "yes" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "partial", label: "Light" },
  },
  {
    feature: "Ideal frequency",
    home_reset: { kind: "text", label: "Every few months" },
    move_out: { kind: "text", label: "One-time" },
    regular_cleaning: { kind: "text", label: "Weekly / bi-weekly" },
  },
  {
    feature: "Empty home focus",
    home_reset: { kind: "no" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "no" },
  },
  {
    feature: "Pet-friendly options",
    home_reset: { kind: "yes" },
    move_out: { kind: "yes" },
    regular_cleaning: { kind: "yes" },
  },
];

export function isServiceId(value: string | undefined): value is ServiceId {
  return value === "home_reset" || value === "move_out" || value === "regular_cleaning";
}

export function getServiceProfile(id: ServiceId): ServiceProfile {
  return SERVICE_PROFILES[id];
}
