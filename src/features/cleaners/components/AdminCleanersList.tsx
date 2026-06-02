"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import AdminCleanerCard from "@/features/cleaners/components/AdminCleanerCard";
import AdminCleanersFilters, {
  buildCleanersQueryString,
  EMPTY_ADMIN_CLEANERS_FILTERS,
  type AdminCleanersFilterState,
} from "@/features/cleaners/components/AdminCleanersFilters";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";

type LoadState = "loading" | "idle";

export default function AdminCleanersList() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminCleanersFilterState>(
    EMPTY_ADMIN_CLEANERS_FILTERS
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const loadCleaners = useCallback(async (nextFilters: AdminCleanersFilterState) => {
    setLoadState("loading");
    setError(null);

    try {
      const query = buildCleanersQueryString(nextFilters);
      const response = await fetch(`/api/admin/cleaners${query}`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminCleanersApiResponse;

      if (!response.ok || json.error) {
        setCleaners([]);
        setError(json.error ?? "Failed to load cleaners");
        return;
      }

      setCleaners(json.data ?? []);
    } catch {
      setCleaners([]);
      setError("Failed to load cleaners");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    void loadCleaners(queryFilters);
  }, [queryFilters, loadCleaners]);

  const isLoading = loadState === "loading";
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.city.trim() !== "" ||
    filters.petFriendly ||
    filters.ownsVacuum ||
    filters.ownsSteamCleaner ||
    filters.acceptsWindows ||
    filters.acceptsDryCleaning;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Cleaners
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Manage cleaner profiles, skills and availability.
          </p>
          {!isLoading && !error ? (
            <p className="mt-3 text-xs font-medium text-slate-400">
              {cleaners.length === 0
                ? hasActiveFilters
                  ? "No cleaners match filters"
                  : "No cleaners yet"
                : `${cleaners.length} cleaner${cleaners.length === 1 ? "" : "s"}`}
            </p>
          ) : null}
        </div>

        <Link
          href="/app/admin/cleaners/new"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f]"
        >
          + Add cleaner
        </Link>
      </div>

      <AdminCleanersFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_ADMIN_CLEANERS_FILTERS)}
      />

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Loading cleaners...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load cleaners: {error}
        </div>
      ) : null}

      {!isLoading && !error && cleaners.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">No cleaners found</p>
          <p className="mt-2 text-sm text-slate-500">
            {hasActiveFilters
              ? "Try adjusting filters or reset them to see all cleaners."
              : "Create a cleaner with role cleaner and a cleaner_profiles row."}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && cleaners.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {cleaners.map((cleaner) => (
            <AdminCleanerCard
              key={cleaner.id}
              cleaner={cleaner}
              onAvatarUpdated={(updated) =>
                setCleaners((prev) =>
                  prev.map((item) => (item.id === updated.id ? updated : item))
                )
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
