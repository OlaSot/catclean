"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { en } from "@/i18n/dictionaries/en";
import { ru } from "@/i18n/dictionaries/ru";

type ConfirmData = {
  token: string;
  expiresAt: string;
  usedAt: string | null;
  canConfirm: boolean;
  statusReason: string | null;
  order: {
    id: string;
    displayId: string;
    status: string;
    serviceType: string;
    scheduledDate: string | null;
    scheduledTime: string | null;
    total: number;
    currency: string;
    addressLine: string;
  };
};

const COPY = {
  en: {
    title: "Confirm order",
    subtitle: "Review order details and confirm.",
    loading: "Loading...",
    notFound: "Confirmation link is invalid.",
    confirm: "Confirm order",
    confirming: "Confirming...",
    success: "Order confirmed successfully.",
    used: "This confirmation link was already used.",
    expired: "This confirmation link has expired.",
    unavailable: "This order can no longer be confirmed.",
    schedule: "Schedule",
    service: "Service",
    total: "Total",
    status: "Status",
    address: "Address",
  },
  ru: {
    title: "Подтверждение заказа",
    subtitle: "Проверьте детали заказа и подтвердите его.",
    loading: "Загрузка...",
    notFound: "Ссылка подтверждения недействительна.",
    confirm: "Подтвердить заказ",
    confirming: "Подтверждаем...",
    success: "Заказ успешно подтвержден.",
    used: "Эта ссылка подтверждения уже использована.",
    expired: "Срок действия ссылки подтверждения истек.",
    unavailable: "Этот заказ больше нельзя подтвердить.",
    schedule: "Дата и время",
    service: "Услуга",
    total: "Итого",
    status: "Статус",
    address: "Адрес",
  },
} as const;

function getLocale(): "en" | "ru" {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem("catclean_locale");
  return value === "ru" ? "ru" : "en";
}

export default function ConfirmOrderPage() {
  const params = useParams<{ token: string }>();
  const [token, setToken] = useState<string>("");
  const [locale, setLocale] = useState<"en" | "ru">("en");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [data, setData] = useState<ConfirmData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(params?.token ?? "");
    setLocale(getLocale());
  }, [params]);

  const t = COPY[locale];
  const dict = locale === "ru" ? ru : en;
  const serviceTypeLabel = useCallback(
    (value: string) => {
      const key = `serviceType.${value}` as keyof typeof en;
      return (dict as Record<string, string>)[key] ?? value;
    },
    [dict]
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/public/order-confirmations/${token}`);
      const json = (await response.json()) as { data: ConfirmData | null; error: string | null };
      if (!response.ok || !json.data) {
        setData(null);
        setError(json.error ?? t.notFound);
        return;
      }
      setData(json.data);
    } catch {
      setData(null);
      setError(t.notFound);
    } finally {
      setLoading(false);
    }
  }, [token, t.notFound]);

  useEffect(() => {
    void load();
  }, [load]);

  const reasonMessage = useMemo(() => {
    if (!data || data.canConfirm) return null;
    if (data.statusReason === "used") return t.used;
    if (data.statusReason === "expired") return t.expired;
    return t.unavailable;
  }, [data, t.expired, t.unavailable, t.used]);

  const confirmOrder = async () => {
    if (!token) return;
    setConfirming(true);
    setError(null);
    try {
      const response = await fetch(`/api/public/order-confirmations/${token}/confirm`, {
        method: "POST",
      });
      const json = (await response.json()) as { data: { ok: boolean } | null; error: string | null };
      if (!response.ok || !json.data?.ok) {
        setError(json.error ?? t.unavailable);
        return;
      }
      setSuccess(true);
      await load();
    } catch {
      setError(t.unavailable);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-8">
      <section className="w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-slate-800">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>

        {loading ? <p className="mt-6 text-sm text-slate-500">{t.loading}</p> : null}
        {!loading && error ? (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!loading && data ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
            <p className="text-sm font-semibold text-slate-800">#{data.order.displayId}</p>
            <p className="text-sm text-slate-700">
              {t.service}: {serviceTypeLabel(data.order.serviceType)}
            </p>
            <p className="text-sm text-slate-700">
              {t.schedule}: {data.order.scheduledDate ?? "—"} {data.order.scheduledTime ?? ""}
            </p>
            <p className="text-sm text-slate-700">
              {t.address}: {data.order.addressLine || "—"}
            </p>
            <p className="text-sm text-slate-700">
              {t.status}: {data.order.status}
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {t.total}: {data.order.total.toFixed(2)} {data.order.currency}
            </p>

            {reasonMessage ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {reasonMessage}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {t.success}
              </p>
            ) : null}

            <button
              type="button"
              onClick={confirmOrder}
              disabled={!data.canConfirm || confirming || success}
              className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
            >
              {confirming ? t.confirming : t.confirm}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
