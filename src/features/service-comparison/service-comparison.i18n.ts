import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";
import { COMPARISON_ROWS, SERVICE_IDS } from "./service-comparison.data";
import type { ComparisonCell, ComparisonRow, ServiceId, ServiceProfile } from "./service-comparison.types";

const AREA_KEYS = ["kitchen", "bathroom", "living"] as const;

const TABLE_ROW_KEYS = [
  "best_for",
  "cleaning_depth",
  "kitchen_deep_detail",
  "inside_cabinets",
  "inside_oven_fridge",
  "bathroom_descaling",
  "skirting_door_frames",
  "ideal_frequency",
  "empty_home_focus",
  "pet_friendly_options",
] as const;

const VISUAL_ACCENTS: Record<ServiceId, Record<(typeof AREA_KEYS)[number], string>> = {
  home_reset: {
    kitchen: "from-[#f5f9ff] via-[#e5f0fb] to-[#d7e6f4]",
    bathroom: "from-[#f8fcff] via-[#eaf3fb] to-[#dbe9f6]",
    living: "from-[#f6fbff] via-[#e7f1fa] to-[#d8e7f4]",
  },
  move_out: {
    kitchen: "from-[#f4f9ff] via-[#e3eff9] to-[#d4e5f2]",
    bathroom: "from-[#f9fcff] via-[#ebf4fb] to-[#dceaf5]",
    living: "from-[#f7fbff] via-[#e8f2fa] to-[#d9e8f4]",
  },
  regular_cleaning: {
    kitchen: "from-[#f6faff] via-[#eaf3fb] to-[#dceaf5]",
    bathroom: "from-[#f8fbff] via-[#edf4fb] to-[#dfeaf4]",
    living: "from-[#f7fbff] via-[#e9f2fa] to-[#dae8f3]",
  },
};

const ADD_ON_COUNTS: Record<ServiceId, number> = {
  home_reset: 5,
  move_out: 4,
  regular_cleaning: 6,
};

function localizeArea(
  t: PublicTranslateFn,
  serviceId: ServiceId,
  areaKey: (typeof AREA_KEYS)[number]
) {
  const base = `public.compare.profile.${serviceId}.${areaKey}`;
  const items: string[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const value = t(`${base}.item${i}`);
    if (value && !value.startsWith("public.")) items.push(value);
  }
  return {
    key: areaKey,
    title: t(`${base}.title`),
    visualLabel: t(`${base}.visualLabel`),
    visualAccent: VISUAL_ACCENTS[serviceId][areaKey],
    cta: t(`${base}.cta`),
    items,
  };
}

function localizeCell(
  t: PublicTranslateFn,
  rowKey: (typeof TABLE_ROW_KEYS)[number],
  serviceId: ServiceId,
  cell: ComparisonCell
): ComparisonCell {
  const labelKey = `public.compare.table.${rowKey}.${serviceId}`;
  const label = t(labelKey);

  if (cell.kind === "yes") return { kind: "yes" };
  if (cell.kind === "no") return { kind: "no" };
  if (cell.kind === "partial") return { kind: "partial", label };
  return { kind: "text", label };
}

export function getLocalizedServiceProfiles(
  t: PublicTranslateFn
): Record<ServiceId, ServiceProfile> {
  const profiles = {} as Record<ServiceId, ServiceProfile>;

  for (const id of SERVICE_IDS) {
    const base = `public.compare.profile.${id}`;
    const included: string[] = [];
    for (let i = 1; i <= 6; i += 1) {
      const value = t(`${base}.included${i}`);
      if (value && !value.startsWith("public.")) included.push(value);
    }

    profiles[id] = {
      id,
      title: t(`${base}.title`),
      tagline: t(`${base}.tagline`),
      shortDescription: t(`${base}.shortDescription`),
      cleaningAreas: AREA_KEYS.map((areaKey) => localizeArea(t, id, areaKey)),
      included,
      addOns: Array.from({ length: ADD_ON_COUNTS[id] }, (_, i) => {
        const n = i + 1;
        const addonBase = `${base}.addOn${n}`;
        return {
          title: t(`${addonBase}.title`),
          description: t(`${addonBase}.description`),
          price: t(`${addonBase}.price`),
        };
      }),
    };
  }

  return profiles;
}

export function getLocalizedComparisonRows(t: PublicTranslateFn): ComparisonRow[] {
  return COMPARISON_ROWS.map((row, index) => {
    const rowKey = TABLE_ROW_KEYS[index];
    const base = `public.compare.table.${rowKey}`;
    const hint = t(`${base}.hint`);
    return {
      feature: t(`${base}.feature`),
      hint: hint.startsWith("public.") ? undefined : hint,
      home_reset: localizeCell(t, rowKey, "home_reset", row.home_reset),
      move_out: localizeCell(t, rowKey, "move_out", row.move_out),
      regular_cleaning: localizeCell(t, rowKey, "regular_cleaning", row.regular_cleaning),
    };
  });
}
