"use client";

import { CLIENT_TYPE_FILTER_OPTIONS } from "@/lib/constants/client-type";
import type { ClientType } from "@/lib/constants/client-type";
import { inputClassName } from "@/components/ui/FormField";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

export type AdminClientsFilterState = {
  search: string;
  clientType: "all" | ClientType;
};

export const EMPTY_ADMIN_CLIENTS_FILTERS: AdminClientsFilterState = {
  search: "",
  clientType: "all",
};

export function buildClientsQueryString(
  filters: AdminClientsFilterState
): string {
  const params = new URLSearchParams();

  const search = filters.search.trim();
  if (search) params.set("search", search);

  if (filters.clientType !== "all") {
    params.set("client_type", filters.clientType);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

type AdminClientsFiltersProps = {
  filters: AdminClientsFilterState;
  onChange: (filters: AdminClientsFilterState) => void;
  onReset: () => void;
};

export default function AdminClientsFilters({
  filters,
  onChange,
  onReset,
}: AdminClientsFiltersProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">Фильтры</p>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Поиск
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Имя, email или телефон"
            className={`mt-2 ${inputClassName}`}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Тип клиента
          </span>
          <select
            value={filters.clientType}
            onChange={(e) =>
              onChange({
                ...filters,
                clientType: e.target.value as AdminClientsFilterState["clientType"],
              })
            }
            className={`mt-2 ${selectClassName}`}
          >
            {CLIENT_TYPE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
