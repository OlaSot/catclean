"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminClient } from "@/entities/client/admin-client.types";
import AdminClientCard from "@/features/clients/components/AdminClientCard";
import AdminClientsFilters, {
  buildClientsQueryString,
  EMPTY_ADMIN_CLIENTS_FILTERS,
  type AdminClientsFilterState,
} from "@/features/clients/components/AdminClientsFilters";
import type { AdminClientsApiResponse } from "@/features/clients/types/admin-clients-api.types";

type LoadState = "loading" | "idle";

export default function AdminClientsList() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminClientsFilterState>(
    EMPTY_ADMIN_CLIENTS_FILTERS
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const loadClients = useCallback(async (nextFilters: AdminClientsFilterState) => {
    setLoadState("loading");
    setError(null);

    try {
      const query = buildClientsQueryString(nextFilters);
      const response = await fetch(`/api/admin/clients${query}`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminClientsApiResponse;

      if (!response.ok || json.error) {
        setClients([]);
        setError(json.error ?? "Не удалось загрузить клиентов");
        return;
      }

      setClients(json.data ?? []);
    } catch {
      setClients([]);
      setError("Не удалось загрузить клиентов");
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
    void loadClients(queryFilters);
  }, [queryFilters, loadClients]);

  const isLoading = loadState === "loading";
  const hasActiveFilters =
    filters.search.trim() !== "" || filters.clientType !== "all";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Клиенты
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Управление профилями клиентов, контактами и историей заказов.
          </p>
          {!isLoading && !error ? (
            <p className="mt-3 text-xs font-medium text-slate-400">
              {clients.length === 0
                ? hasActiveFilters
                  ? "Нет клиентов по выбранным фильтрам"
                  : "Клиентов пока нет"
                : `${clients.length} клиент(ов)`}
            </p>
          ) : null}
        </div>

        <Link
          href="/app/admin/clients/new"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f]"
        >
          + Добавить клиента
        </Link>
      </div>

      <AdminClientsFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_ADMIN_CLIENTS_FILTERS)}
      />

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Загрузка клиентов...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Не удалось загрузить клиентов: {error}
        </div>
      ) : null}

      {!isLoading && !error && clients.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">Клиенты не найдены</p>
          <p className="mt-2 text-sm text-slate-500">
            {hasActiveFilters
              ? "Попробуйте изменить фильтры или сбросьте их, чтобы увидеть всех клиентов."
              : "Создайте клиента или добавьте профиль с ролью client в Supabase."}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && clients.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {clients.map((client) => (
            <AdminClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
