"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminClient } from "@/entities/client/admin-client.types";
import AdminClientAvatar from "@/features/clients/components/AdminClientAvatar";
import type { AdminClientDetailApiResponse } from "@/features/clients/types/admin-client-detail-api.types";
import { StyledSelect } from "@/components/ui/StyledSelect";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import { useT } from "@/i18n/useT";
import { formatClientTypeLabel } from "@/lib/constants/client-type";
import {
  displayValue,
  formatOrderDate,
} from "@/features/orders/lib/format-order-display";
import { clientTypeBadgeClass } from "@/lib/design-system/client-type-badge";
import { CARD_CLASS } from "@/components/ui/Card";

type LoadState = "loading" | "idle";

type AdminClientDetailViewProps = {
  clientId: string;
};

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`p-6 ${CARD_CLASS}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
export default function AdminClientDetailView({
  clientId,
}: AdminClientDetailViewProps) {
  const { t, serviceTypeLabel, paymentLabel } = useT();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [client, setClient] = useState<AdminClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferredCleaners, setPreferredCleaners] = useState<
    { id: string; cleanerId: string; cleanerName: string; isPrimary: boolean }[]
  >([]);
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);
  const [selectedCleanerId, setSelectedCleanerId] = useState("");
  const [inviteState, setInviteState] = useState<
    { loading: boolean; message: string | null; error: string | null }
  >({ loading: false, message: null, error: null });
  const [clientOrders, setClientOrders] = useState<
    {
      id: string;
      displayId: string;
      statusLabel: string;
      paymentStatus: string;
      scheduledDate: string | null;
      scheduledTime: string | null;
      serviceType: string | null;
      cleanerName: string | null;
      total: number;
      currency: string;
    }[]
  >([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  }>({
    page: 1,
    pageSize: 30,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  const loadClient = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminClientDetailApiResponse;

      if (!response.ok || json.error) {
        setClient(null);
        setError(json.error ?? "Не удалось загрузить клиента");
        return;
      }

      setClient(json.data);
    } catch {
      setClient(null);
      setError("Не удалось загрузить клиента");
    } finally {
      setLoadState("idle");
    }
  }, [clientId]);

  const loadPreferred = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/clients/${clientId}/preferred-cleaners`,
        { credentials: "include" }
      );
      const json = (await response.json()) as {
        data:
          | {
              id: string;
              cleanerId: string;
              cleanerName: string;
              isPrimary: boolean;
            }[]
          | null;
      };
      if (!response.ok || !json.data) {
        setPreferredCleaners([]);
        return;
      }
      setPreferredCleaners(json.data);
    } catch {
      setPreferredCleaners([]);
    }
  }, [clientId]);

  const loadCleaners = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/cleaners?status=active", {
        credentials: "include",
      });
      const json = (await response.json()) as AdminCleanersApiResponse;
      if (!response.ok || json.error || !json.data) {
        setCleaners([]);
        return;
      }
      setCleaners(json.data);
      if (json.data.length > 0) setSelectedCleanerId(json.data[0].id);
    } catch {
      setCleaners([]);
    }
  }, []);

  const loadClientOrders = useCallback(async (page: number) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/orders?page=${page}`, {
        credentials: "include",
      });
      const json = (await response.json()) as {
        data:
          | {
              items: {
                id: string;
                displayId: string;
                statusLabel: string;
                paymentStatus: string;
                scheduledDate: string | null;
                scheduledTime: string | null;
                serviceType: string | null;
                cleanerName: string | null;
                total: number;
                currency: string;
              }[];
              pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
                hasMore: boolean;
              };
            }
          | null;
        error: string | null;
      };
      if (!response.ok || json.error || !json.data) {
        setClientOrders([]);
        setOrdersPagination({
          page: 1,
          pageSize: 30,
          total: 0,
          totalPages: 1,
          hasMore: false,
        });
        return;
      }
      setClientOrders(json.data.items);
      setOrdersPagination(json.data.pagination);
    } catch {
      setClientOrders([]);
      setOrdersPagination({
        page: 1,
        pageSize: 30,
        total: 0,
        totalPages: 1,
        hasMore: false,
      });
    }
  }, [clientId]);

  useEffect(() => {
    void loadClient();
  }, [loadClient]);

  useEffect(() => {
    void loadPreferred();
    void loadCleaners();
    void loadClientOrders(ordersPage);
  }, [loadCleaners, loadClientOrders, loadPreferred, ordersPage]);

  const isLoading = loadState === "loading";
  const cleanerOptions = cleaners.map((cleaner) => ({
    value: cleaner.id,
    label: cleaner.baseCity ? `${cleaner.name} · ${cleaner.baseCity}` : cleaner.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/app/admin/clients"
          className="text-sm font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
        >
          ← Назад к клиентам
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Загрузка клиента...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !client ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">Клиент не найден</p>
        </div>
      ) : null}

      {!isLoading && !error && client ? (
        <>
          <div className="flex flex-wrap items-start gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-8">
            <AdminClientAvatar
              key={client.avatarUrl ?? client.id}
              name={client.name}
              avatarUrl={client.avatarUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                  {client.name}
                </h1>
                {client.clientType ? (
                  <span className={clientTypeBadgeClass(client.clientType)}>
                    {formatClientTypeLabel(client.clientType)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-600">{client.email}</p>
              <p className="text-sm text-slate-600">{client.phone}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title="Контакты">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {client.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Телефон
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {client.phone}
                  </dd>
                </div>
                {client.companyName ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Компания
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {displayValue(client.companyName)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5">
                {inviteState.message ? (
                  <div className="mb-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                    {inviteState.message}
                  </div>
                ) : null}
                {inviteState.error ? (
                  <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {inviteState.error}
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={inviteState.loading}
                  onClick={async () => {
                    setInviteState({ loading: true, message: null, error: null });
                    try {
                      const res = await fetch(
                        `/api/admin/clients/${clientId}/send-password-recovery`,
                        {
                          method: "POST",
                          credentials: "include",
                        }
                      );
                      const json = (await res.json()) as {
                        data: { success: boolean } | null;
                        error: string | null;
                      };

                      if (!res.ok || json.error) {
                        setInviteState({
                          loading: false,
                          message: null,
                          error: json.error ?? "Не удалось отправить восстановление",
                        });
                        return;
                      }

                      setInviteState({
                        loading: false,
                        message: "Письмо для восстановления пароля отправлено.",
                        error: null,
                      });
                    } catch (e) {
                      setInviteState({
                        loading: false,
                        message: null,
                        error:
                          e instanceof Error
                            ? e.message
                            : "Не удалось отправить восстановление",
                      });
                    }
                  }}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviteState.loading
                    ? "Отправка..."
                    : "Отправить восстановление пароля"}
                </button>
              </div>
            </DetailCard>

            <DetailCard title="Заказы">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Всего заказов
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {client.ordersCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Последний заказ
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {client.lastOrderDate
                      ? formatOrderDate(client.lastOrderDate)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </DetailCard>
          </div>

          <DetailCard title="Внутренняя заметка">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {client.internalNote?.trim()
                ? client.internalNote
                : "Пока нет внутренней заметки."}
            </p>
          </DetailCard>

          <DetailCard title="Заказы клиента">
            {clientOrders.length === 0 ? (
              <p className="text-sm text-slate-500">Заказов пока нет.</p>
            ) : (
              <ul className="space-y-3">
                {clientOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/app/admin/orders/${order.id}`}
                      className="block rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/60 px-4 py-3 transition hover:border-[#C5D9EB] hover:bg-[#EEF4FA]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">#{order.displayId}</p>
                        <p className="text-sm font-semibold text-[#34597E]">
                          {order.total.toFixed(2)} {order.currency}
                        </p>
                      </div>
                      <div className="mt-1 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                        <p>
                          Статус: <span className="font-medium text-slate-700">{order.statusLabel}</span>
                        </p>
                        <p>
                          Оплата:{" "}
                          <span className="font-medium text-slate-700">
                            {order.paymentStatus === "paid" ||
                            order.paymentStatus === "unpaid" ||
                            order.paymentStatus === "card_hold"
                              ? paymentLabel(order.paymentStatus)
                              : order.paymentStatus}
                          </span>
                        </p>
                        <p>
                          Услуга:{" "}
                          <span className="font-medium text-slate-700">
                            {order.serviceType ? serviceTypeLabel(order.serviceType) : "—"}
                          </span>
                        </p>
                        <p>
                          Клинер:{" "}
                          <span className="font-medium text-slate-700">{order.cleanerName ?? "Не назначен"}</span>
                        </p>
                        <p className="sm:col-span-2">
                          Запланировано:{" "}
                          <span className="font-medium text-slate-700">
                            {order.scheduledDate
                              ? `${formatOrderDate(order.scheduledDate)}${order.scheduledTime ? ` · ${order.scheduledTime}` : ""}`
                              : "—"}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Страница {ordersPagination.page} / {ordersPagination.totalPages} · {ordersPagination.total} заказ(ов)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={ordersPagination.page <= 1}
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  type="button"
                  disabled={!ordersPagination.hasMore}
                  onClick={() => setOrdersPage((p) => p + 1)}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:opacity-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          </DetailCard>

          <DetailCard title={t("assignment.preferredCleaners")}>
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <StyledSelect
                  value={selectedCleanerId}
                  options={cleanerOptions}
                  onChange={setSelectedCleanerId}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!selectedCleanerId) return;
                    await fetch(`/api/admin/clients/${clientId}/preferred-cleaners`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cleanerId: selectedCleanerId, isPrimary: false }),
                    });
                    await loadPreferred();
                  }}
                  className="rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white"
                >
                  {t("common.save")}
                </button>
              </div>

              {preferredCleaners.length === 0 ? (
                <p className="text-sm text-slate-500">{t("common.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {preferredCleaners.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-2 ${
                        item.isPrimary
                          ? "border-indigo-200 bg-indigo-50/40"
                          : "border-slate-200/80 bg-white"
                      }`}
                    >
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold">{item.cleanerName}</span>
                        {item.isPrimary ? (
                          <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                            основной
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {!item.isPrimary ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/clients/${clientId}/preferred-cleaners`, {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ cleanerId: item.cleanerId, isPrimary: true }),
                              });
                              await loadPreferred();
                            }}
                            className="rounded-full border border-[#C5D9EB] bg-[#EEF4FA] px-3 py-1 text-xs font-semibold text-[#34597E]"
                          >
                            сделать основным
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(
                              `/api/admin/clients/${clientId}/preferred-cleaners/${item.id}`,
                              { method: "DELETE", credentials: "include" }
                            );
                            await loadPreferred();
                          }}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                        >
                          удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DetailCard>
        </>
      ) : null}
    </div>
  );
}
