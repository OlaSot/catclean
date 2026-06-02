"use client";

import type { CleanerProfileStatus } from "@/lib/constants/cleaner-status";
import { CLEANER_STATUS_FILTER_OPTIONS } from "@/lib/constants/cleaner-status";
import { inputClassName } from "@/components/ui/FormField";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

export type AdminCleanersFilterState = {
  search: string;
  status: "all" | CleanerProfileStatus;
  city: string;
  petFriendly: boolean;
  ownsVacuum: boolean;
  ownsSteamCleaner: boolean;
  acceptsWindows: boolean;
  acceptsDryCleaning: boolean;
};

export const EMPTY_ADMIN_CLEANERS_FILTERS: AdminCleanersFilterState = {
  search: "",
  status: "all",
  city: "",
  petFriendly: false,
  ownsVacuum: false,
  ownsSteamCleaner: false,
  acceptsWindows: false,
  acceptsDryCleaning: false,
};

export function buildCleanersQueryString(
  filters: AdminCleanersFilterState
): string {
  const params = new URLSearchParams();

  const search = filters.search.trim();
  if (search) params.set("search", search);

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  const city = filters.city.trim();
  if (city) params.set("city", city);

  if (filters.petFriendly) params.set("pet_friendly", "true");
  if (filters.ownsVacuum) params.set("owns_vacuum", "true");
  if (filters.ownsSteamCleaner) params.set("owns_steam_cleaner", "true");
  if (filters.acceptsWindows) params.set("accepts_windows", "true");
  if (filters.acceptsDryCleaning) params.set("accepts_dry_cleaning", "true");

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

type SkillToggleProps = {
  label: string;
  active: boolean;
  onToggle: () => void;
};

function SkillToggle({ label, active, onToggle }: SkillToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        active
          ? "inline-flex items-center rounded-full bg-[#EEF4FA] px-3 py-1.5 text-xs font-semibold text-[#34597E] ring-1 ring-[#C5D9EB] transition"
          : "inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50"
      }
    >
      {label}
    </button>
  );
}

type AdminCleanersFiltersProps = {
  filters: AdminCleanersFilterState;
  onChange: (filters: AdminCleanersFilterState) => void;
  onReset: () => void;
};

export default function AdminCleanersFilters({
  filters,
  onChange,
  onReset,
}: AdminCleanersFiltersProps) {
  const patch = (partial: Partial<AdminCleanersFilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">Filters</p>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          Reset filters
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="block lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Name, email or phone"
            className={`mt-2 ${inputClassName}`}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(e) =>
              patch({
                status: e.target.value as AdminCleanersFilterState["status"],
              })
            }
            className={`mt-2 ${selectClassName}`}
          >
            {CLEANER_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            City
          </span>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => patch({ city: e.target.value })}
            placeholder="e.g. Hannover"
            className={`mt-2 ${inputClassName}`}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Skills & equipment
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Show cleaners who have the selected skill (toggle on = must have)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <SkillToggle
            label="Pet friendly"
            active={filters.petFriendly}
            onToggle={() => patch({ petFriendly: !filters.petFriendly })}
          />
          <SkillToggle
            label="Owns vacuum"
            active={filters.ownsVacuum}
            onToggle={() => patch({ ownsVacuum: !filters.ownsVacuum })}
          />
          <SkillToggle
            label="Steam cleaner"
            active={filters.ownsSteamCleaner}
            onToggle={() => patch({ ownsSteamCleaner: !filters.ownsSteamCleaner })}
          />
          <SkillToggle
            label="Windows"
            active={filters.acceptsWindows}
            onToggle={() => patch({ acceptsWindows: !filters.acceptsWindows })}
          />
          <SkillToggle
            label="Dry cleaning"
            active={filters.acceptsDryCleaning}
            onToggle={() =>
              patch({ acceptsDryCleaning: !filters.acceptsDryCleaning })
            }
          />
        </div>
      </div>
    </div>
  );
}
