"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SitePageShell } from "@/components/layout/SitePageShell";
import { usePublicT } from "@/i18n/public/usePublicT";

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

export default function ConfirmOrderPage() {
  const { t, locale } = usePublicT();
  const params = useParams<{ token: string }>();
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [data, setData] = useState<ConfirmData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accessSending, setAccessSending] = useState(false);
  const [accessSent, setAccessSent] = useState(false);
  const [accessError, setAccessError] = useState(false);

  useEffect(() => {
    setToken(params?.token ?? "");
  }, [params]);

  const serviceTypeLabel = useCallback(
    (value: string) => {
      const key = `public.serviceType.${value}` as const;
      const label = t(key);
      return label.startsWith("public.") ? value : label;
    },
    [t]
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
        setError(json.error ?? t("public.confirm.notFound"));
        return;
      }
      setData(json.data);
    } catch {
      setData(null);
      setError(t("public.confirm.notFound"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const reasonMessage = useMemo(() => {
    if (!data || data.canConfirm || success || data.order.status === "confirmed") return null;
    if (data.statusReason === "used") return t("public.confirm.used");
    if (data.statusReason === "expired") return t("public.confirm.expired");
    return t("public.confirm.unavailable");
  }, [data, success, t]);

  const dateTime = useMemo(() => {
    if (!data?.order.scheduledDate) return "—";
    const date = new Date(`${data.order.scheduledDate}T12:00:00`);
    const language = locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB";
    return `${new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(date)}${
      data.order.scheduledTime ? `, ${data.order.scheduledTime.slice(0, 5)}` : ""
    }`;
  }, [data, locale]);

  const sendAccessLink = async () => {
    if (!token) return;
    setAccessSending(true);
    setAccessError(false);
    try {
      const response = await fetch(`/api/public/order-confirmations/${token}/client-access`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("access link failed");
      setAccessSent(true);
    } catch {
      setAccessError(true);
    } finally {
      setAccessSending(false);
    }
  };

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
        setError(json.error ?? t("public.confirm.unavailable"));
        return;
      }
      setSuccess(true);
      await load();
    } catch {
      setError(t("public.confirm.unavailable"));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SitePageShell contentClassName="py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center py-6 sm:py-10">
        <section className="w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold text-slate-800">{t("public.confirm.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("public.confirm.subtitle")}</p>

          {loading ? <p className="mt-6 text-sm text-slate-500">{t("public.confirm.loading")}</p> : null}
          {!loading && error ? (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {!loading && data ? (
            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
              <p className="text-sm font-semibold text-slate-800">#{data.order.displayId}</p>
              <p className="text-sm text-slate-700">
                {t("public.confirm.service")}: {serviceTypeLabel(data.order.serviceType)}
              </p>
              <p className="text-sm text-slate-700">
                {t("public.confirm.schedule")}: {dateTime}
              </p>
              <p className="text-sm text-slate-700">
                {t("public.confirm.address")}: {data.order.addressLine || "—"}
              </p>
              <p className="text-sm text-slate-700">
                {t("public.confirm.status")}: {data.order.status === "confirmed"
                  ? t("public.confirm.statusConfirmed")
                  : t("public.confirm.statusAwaiting")}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {t("public.confirm.total")}: {data.order.total.toFixed(2)} {data.order.currency}
              </p>

              {reasonMessage ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {reasonMessage}
                </p>
              ) : null}

              {success || data.order.status === "confirmed" ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {t("public.confirm.success")}
                </p>
              ) : null}

              {data.canConfirm && !success ? (
                <button
                  type="button"
                  onClick={confirmOrder}
                  disabled={confirming}
                  className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
                >
                  {confirming ? t("public.confirm.confirming") : t("public.confirm.confirm")}
                </button>
              ) : null}

              {success || data.order.status === "confirmed" ? (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <h2 className="text-base font-semibold text-slate-800">{t("public.confirm.accessTitle")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t("public.confirm.accessText")}</p>
                  {accessSent ? (
                    <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("public.confirm.accessSent")}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={sendAccessLink}
                      disabled={accessSending}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
                    >
                      {accessSending ? t("public.confirm.accessSending") : t("public.confirm.accessButton")}
                    </button>
                  )}
                  {accessError ? <p className="mt-2 text-sm text-rose-700">{t("public.confirm.accessError")}</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </SitePageShell>
  );
}
