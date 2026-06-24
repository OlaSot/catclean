"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type CleanerDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  baseCity: string | null;
  maxDailyHours: number;
  maxOrdersPerDay: number;
  preferredWorkCities: string[];
  isAcceptingOrders: boolean;
};

type AvailabilityRow = {
  id: string;
  cleaner_id: string;
  date: string;
  status: "available" | "unavailable" | "vacation" | "sick" | "preferred_day_off";
  note: string | null;
  created_at: string;
};

const AVAILABILITY_OPTIONS: AvailabilityRow["status"][] = [
  "available",
  "unavailable",
  "vacation",
  "sick",
  "preferred_day_off",
];

function availabilityStatusLabel(status: AvailabilityRow["status"]): string {
  switch (status) {
    case "available":
      return "доступен";
    case "unavailable":
      return "недоступен";
    case "vacation":
      return "отпуск";
    case "sick":
      return "больничный";
    case "preferred_day_off":
      return "предпочтительный выходной";
    default:
      return status;
  }
}

export default function AdminCleanerDetailView({ cleanerId }: { cleanerId: string }) {
  const [cleaner, setCleaner] = useState<CleanerDetail | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().slice(0, 10));
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityRow["status"]>("available");
  const [availabilityNote, setAvailabilityNote] = useState("");

  const [maxDailyHours, setMaxDailyHours] = useState("8");
  const [maxOrdersPerDay, setMaxOrdersPerDay] = useState("4");
  const [preferredWorkCities, setPreferredWorkCities] = useState("");
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  const range = useMemo(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 3);
    const to = new Date(today);
    to.setDate(today.getDate() + 21);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cleanerRes, availabilityRes] = await Promise.all([
        fetch(`/api/admin/cleaners/${cleanerId}`, { credentials: "include" }),
        fetch(
          `/api/admin/cleaners/${cleanerId}/availability?from=${range.from}&to=${range.to}`,
          { credentials: "include" }
        ),
      ]);
      const cleanerJson = (await cleanerRes.json()) as { data: CleanerDetail | null; error: string | null };
      const availabilityJson = (await availabilityRes.json()) as { data: AvailabilityRow[] | null; error: string | null };
      if (!cleanerRes.ok || cleanerJson.error || !cleanerJson.data) {
        setError(cleanerJson.error ?? "Не удалось загрузить клинера");
        setCleaner(null);
        return;
      }
      setCleaner(cleanerJson.data);
      setMaxDailyHours(String(cleanerJson.data.maxDailyHours));
      setMaxOrdersPerDay(String(cleanerJson.data.maxOrdersPerDay));
      setPreferredWorkCities(cleanerJson.data.preferredWorkCities.join(", "));
      setIsAcceptingOrders(cleanerJson.data.isAcceptingOrders);
      setAvailability(availabilityJson.data ?? []);
    } catch {
      setError("Не удалось загрузить клинера");
    } finally {
      setLoading(false);
    }
  }, [cleanerId, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    setSavePending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cleaners/${cleanerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxDailyHours: Number(maxDailyHours),
          maxOrdersPerDay: Number(maxOrdersPerDay),
          preferredWorkCities: preferredWorkCities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          isAcceptingOrders,
        }),
      });
      const json = (await response.json()) as { data: CleanerDetail | null; error: string | null };
      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Не удалось сохранить настройки клинера");
        return;
      }
      setCleaner(json.data);
    } catch {
      setError("Не удалось сохранить настройки клинера");
    } finally {
      setSavePending(false);
    }
  }

  async function upsertAvailability() {
    setSavePending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cleaners/${cleanerId}/availability`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: availabilityDate,
          status: availabilityStatus,
          note: availabilityNote,
        }),
      });
      const json = (await response.json()) as { data: { ok: true } | null; error: string | null };
      if (!response.ok || json.error) {
        setError(json.error ?? "Не удалось сохранить доступность");
        return;
      }
      await load();
    } catch {
      setError("Не удалось сохранить доступность");
    } finally {
      setSavePending(false);
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Загрузка клинера...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>;
  }

  if (!cleaner) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/admin/cleaners" className="text-sm text-[#34597E] hover:underline">
          ← Назад к клинерам
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-800">{cleaner.fullName}</h1>
        <p className="mt-1 text-sm text-slate-500">{cleaner.email} · {cleaner.phone}</p>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Настройки нагрузки</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            Макс. часов в день
            <input value={maxDailyHours} onChange={(e) => setMaxDailyHours(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm text-slate-600">
            Макс. заказов в день
            <input value={maxOrdersPerDay} onChange={(e) => setMaxOrdersPerDay(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm text-slate-600 sm:col-span-2">
            Предпочтительные города работы (через запятую)
            <input value={preferredWorkCities} onChange={(e) => setPreferredWorkCities(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isAcceptingOrders} onChange={(e) => setIsAcceptingOrders(e.target.checked)} />
            Принимает заказы
          </label>
        </div>
        <button type="button" onClick={() => void saveSettings()} disabled={savePending} className="mt-4 rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white">
          Сохранить настройки
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Доступность</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityRow["status"])} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {AVAILABILITY_OPTIONS.map((status) => (
              <option key={status} value={status}>{availabilityStatusLabel(status)}</option>
            ))}
          </select>
          <input value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)} placeholder="Заметка" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={() => void upsertAvailability()} disabled={savePending} className="mt-3 rounded-full border border-[#C5D9EB] bg-[#EEF4FA] px-4 py-2 text-sm font-semibold text-[#34597E]">
          Добавить / обновить доступность
        </button>

        <div className="mt-4 space-y-2">
          {availability.length === 0 ? (
            <p className="text-sm text-slate-500">В выбранном диапазоне нет записей о доступности.</p>
          ) : (
            availability.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{item.date}</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-slate-700">{availabilityStatusLabel(item.status)}</span>
                {item.note ? <span className="mx-2 text-slate-400">{item.note}</span> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
