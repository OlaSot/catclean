import Link from "next/link";
import type { Order } from "@/entities/order/order.types";
import { useT } from "@/i18n/useT";
import { ORDER_SERVICE_TYPES } from "@/lib/constants/orders";
import { BOOKING_PRODUCT_HOME_CARE, BOOKING_PRODUCT_HOME_RESET } from "@/lib/orders/booking-product-label";
import { Calendar, Clock, MapPin, Pencil } from "lucide-react";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import type { AssignCleanerApiResponse } from "@/features/orders/types/assign-cleaner-api.types";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminUpdateOrderApiResponse } from "@/features/orders/types/admin-update-order-api.types";
import { Bell, BellRing, MoreVertical } from "lucide-react";
import { ScheduleTimeSelect } from "@/components/orders/ScheduleTimeSelect";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import { badgeClass, orderStatusTone, serviceTypeTone } from "@/lib/design-system/badge-variants";
import { buttonSizes, buttonVariants } from "@/lib/design-system/tokens";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

function formatMoney(v: number) {
  return v.toFixed(2);
}

function serviceLabel(serviceType: string): string {
  const match = ORDER_SERVICE_TYPES.find((item) => item.value === serviceType);
  return match?.label ?? serviceType;
}

function productBadgeKey(order: Order): string {
  return order.productKey ?? order.bookingProduct ?? order.serviceType;
}

const btnPrimary = `${buttonVariants.primary} ${buttonSizes.sm}`;

const btnGhost = `${buttonVariants.ghost} ${buttonSizes.sm}`;

const btnLink = `text-xs ${buttonVariants.link}`;

const btnLinkDanger = `text-xs ${buttonVariants.linkDanger}`;

function statusPillStyle(status: Order["status"]): string {
  return badgeClass(orderStatusTone(status), "xs");
}

function PaymentPill({
  payment,
  label,
}: {
  payment: Order["payment"];
  label: string;
}) {

  const cls =
    payment.status === "paid"
      ? badgeClass("emerald", "xs")
      : payment.status === "card_hold"
        ? badgeClass("indigo", "xs")
        : badgeClass("rose", "xs");

  return (
    <span className={cls}>{label}</span>
  );
}

function initials(name: string): string {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${first}${second}`.toUpperCase();
}

function serviceBadgeStyle(serviceType: string): string {
  return badgeClass(serviceTypeTone(serviceType), "xs");
}

type OrderCardProps = {
  order: Order;
  onChanged?: () => void;
};

export default function OrderCard({ order, onChanged }: OrderCardProps) {
  const { t, orderStatusLabel, paymentLabel, bookingProductLabel } = useT();
  const primaryProductLabel =
    order.productLabel ??
    bookingProductLabel({
      bookingProduct: order.bookingProduct,
      serviceType: order.serviceType,
    });
  const showServiceTypeSecondary =
    Boolean(order.serviceType) &&
    order.serviceType !== order.productKey &&
    (order.bookingProduct === BOOKING_PRODUCT_HOME_CARE ||
      order.bookingProduct === BOOKING_PRODUCT_HOME_RESET ||
      order.productKey === BOOKING_PRODUCT_HOME_CARE ||
      order.productKey === BOOKING_PRODUCT_HOME_RESET);

  const detailHref = order.routeId
    ? `/app/admin/orders/${order.routeId}`
    : undefined;
  const orderApiHref = order.routeId
    ? `/api/admin/orders/${order.routeId}`
    : undefined;
  const editHref = order.routeId ? `${detailHref}/edit` : undefined;
  const clientHref = order.customer.id
    ? `/app/admin/clients/${order.customer.id}`
    : undefined;

  const assignedCleanerName = order.assigned.cleaners[0]?.name ?? null;
  const hasAssignedCleaner = Boolean(assignedCleanerName);
  const serviceSummaryLine =
    order.serviceSummary?.trim() || null;
  const showAwaitingConfirmationBadge =
    order.status === "awaiting_confirmation" || Boolean(order.confirmation?.hasActiveToken);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [cleanersLoading, setCleanersLoading] = useState(false);
  const [cleanersError, setCleanersError] = useState<string | null>(null);
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>("");
  const [cleanerSearch, setCleanerSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [editingSchedule, setEditingSchedule] = useState<"date" | "time" | null>(
    null
  );
  const [scheduleDate, setScheduleDate] = useState(order.dateISO);
  const [scheduleTime, setScheduleTime] = useState(() => {
    const raw = order.time === "—" ? "" : order.time;
    return raw ? (normalizeScheduleTime(raw) ?? raw) : "";
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);
  const [cardMenuOpen, setCardMenuOpen] = useState(false);

  useEffect(() => {
    setScheduleDate(order.dateISO);
    const raw = order.time === "—" ? "" : order.time;
    setScheduleTime(raw ? (normalizeScheduleTime(raw) ?? raw) : "");
  }, [order.dateISO, order.time]);

  useEffect(() => {
    if (editingSchedule === "date") {
      dateInputRef.current?.focus();
    }
  }, [editingSchedule]);

  useEffect(() => {
    if (!cardMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        cardMenuRef.current &&
        !cardMenuRef.current.contains(event.target as Node)
      ) {
        setCardMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [cardMenuOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;

    async function loadCleaners() {
      setCleanersLoading(true);
      setCleanersError(null);
      setAssignError(null);
      try {
        const res = await fetch("/api/admin/cleaners?status=active", {
          credentials: "include",
        });
        const json = (await res.json()) as AdminCleanersApiResponse;
        if (cancelled) return;
        if (!res.ok || json.error) {
          setCleaners([]);
          setCleanersError(json.error ?? "Failed to load cleaners");
          return;
        }
        const list = json.data ?? [];
        setCleaners(list);
        setCleanerSearch("");
        setSelectedCleanerId(list[0]?.id ?? "");
      } catch {
        if (!cancelled) {
          setCleaners([]);
          setCleanersError("Failed to load cleaners");
        }
      } finally {
        if (!cancelled) setCleanersLoading(false);
      }
    }

    void loadCleaners();
    return () => {
      cancelled = true;
    };
  }, [pickerOpen]);

  const canShowQuickAssign = useMemo(() => Boolean(detailHref), [detailHref]);
  const filteredCleaners = useMemo(() => {
    const q = cleanerSearch.trim().toLowerCase();
    if (!q) return cleaners;
    return cleaners.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [cleanerSearch, cleaners]);

  const handleAssign = async () => {
    if (!orderApiHref || !selectedCleanerId) return;
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch(`${orderApiHref}/assign-cleaner`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cleanerId: selectedCleanerId }),
      });
      const json = (await res.json()) as AssignCleanerApiResponse;
      if (!res.ok || json.error || !json.data) {
        setAssignError(json.error ?? "Failed to assign cleaner");
        return;
      }
      setPickerOpen(false);
      onChanged?.();
    } catch {
      setAssignError("Failed to assign cleaner");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!orderApiHref) return;
    setUnassigning(true);
    setAssignError(null);
    try {
      const res = await fetch(`${orderApiHref}/unassign-cleaner`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = (await res.json()) as { data: unknown; error: string | null };
      if (!res.ok || json.error) {
        setAssignError(json.error ?? "Failed to unassign cleaner");
        return;
      }
      onChanged?.();
    } catch {
      setAssignError("Failed to unassign cleaner");
    } finally {
      setUnassigning(false);
    }
  };

  const scheduleClickableClass = detailHref
    ? "cursor-pointer rounded-md px-1 -mx-1 transition hover:bg-[#EEF4FA] hover:text-[#34597E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8DB8]/30"
    : "";

  const saveSchedule = async (patch: {
    scheduled_date?: string;
    scheduled_time?: string;
  }) => {
    if (!orderApiHref) return false;

    setScheduleSaving(true);
    setScheduleError(null);

    try {
      const res = await fetch(orderApiHref, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const json = (await res.json()) as AdminUpdateOrderApiResponse;
      if (!res.ok || json.error) {
        setScheduleError(json.error ?? "Failed to update schedule");
        return false;
      }

      onChanged?.();
      return true;
    } catch {
      setScheduleError("Failed to update schedule");
      return false;
    } finally {
      setScheduleSaving(false);
    }
  };

  const commitDateEdit = async () => {
    const next = scheduleDate.trim();
    const current = order.dateISO;
    setEditingSchedule(null);
    if (!next || next === current) return;
    const ok = await saveSchedule({ scheduled_date: next });
    if (!ok) setScheduleDate(current);
  };

  const openTimeEdit = () => {
    setScheduleError(null);
    const raw = order.time === "—" ? "" : order.time;
    setScheduleTime(raw ? (normalizeScheduleTime(raw) ?? "09:00") : "09:00");
    setEditingSchedule("time");
  };

  const commitTimeEdit = async () => {
    const next = normalizeScheduleTime(scheduleTime.trim());
    const current =
      order.time === "—"
        ? ""
        : (normalizeScheduleTime(order.time) ?? order.time);
    setEditingSchedule(null);
    if (!next) {
      setScheduleError("Select a valid time");
      setScheduleTime(current);
      return;
    }
    if (next === current) return;
    const ok = await saveSchedule({ scheduled_time: next });
    if (!ok) setScheduleTime(current);
  };

  const cancelScheduleEdit = () => {
    setScheduleDate(order.dateISO);
    setScheduleTime(order.time === "—" ? "" : order.time);
    setScheduleError(null);
    setEditingSchedule(null);
  };

  const addressLine = [
    order.city,
    [order.address.street, order.address.house].filter(Boolean).join(" "),
  ]
    .filter((part) => part && part !== "—")
    .join(", ");

  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-4">
      <header className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              #{order.displayId}
            </span>
            <span
              className={serviceBadgeStyle(productBadgeKey(order))}
            >
              {primaryProductLabel}
            </span>
            {showServiceTypeSecondary ? (
              <span className="text-[10px] font-medium text-slate-400">
                {serviceLabel(order.serviceType)}
              </span>
            ) : null}
          </div>

          <h3 className="mt-0.5 truncate text-base font-semibold leading-snug text-slate-900">
            {clientHref ? (
              <Link href={clientHref} className="hover:text-[#34597E] hover:underline">
                {order.customer.name}
              </Link>
            ) : (
              order.customer.name
            )}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {editingSchedule === "date" ? (
                <input
                  ref={dateInputRef}
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  onBlur={() => void commitDateEdit()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void commitDateEdit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelScheduleEdit();
                    }
                  }}
                  disabled={scheduleSaving}
                  className="rounded-md border border-[#C5D9EB] bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#5B8DB8]/50 focus:ring-1 focus:ring-[#5B8DB8]/20"
                />
              ) : (
                <button
                  type="button"
                  disabled={!detailHref || scheduleSaving}
                  onClick={() => {
                    setScheduleError(null);
                    setEditingSchedule("date");
                  }}
                  className={`font-medium text-slate-700 ${scheduleClickableClass}`}
                  title={detailHref ? "Click to change date" : undefined}
                >
                  {formatDate(order.dateISO)}
                </button>
              )}
            </span>

            <span className="text-slate-300">·</span>

            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {editingSchedule === "time" ? (
                <ScheduleTimeSelect
                  value={scheduleTime}
                  onChange={setScheduleTime}
                  onBlur={() => void commitTimeEdit()}
                  disabled={scheduleSaving}
                />
              ) : (
                <button
                  type="button"
                  disabled={!detailHref || scheduleSaving}
                  onClick={openTimeEdit}
                  className={`font-medium text-slate-700 ${scheduleClickableClass}`}
                  title={detailHref ? "Click to change time" : undefined}
                >
                  {order.time}
                </button>
              )}
            </span>

            {scheduleSaving ? (
              <span className="text-[11px] font-medium text-slate-400">Saving…</span>
            ) : null}
          </div>

          {scheduleError ? (
            <p className="mt-1 text-[11px] text-rose-700">{scheduleError}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="inline-flex flex-wrap items-center justify-end gap-1 rounded-full bg-slate-50/90 p-0.5 ring-1 ring-slate-200/70">
            <PaymentPill
              payment={order.payment}
              label={paymentLabel(order.payment.status)}
            />
            <span className={statusPillStyle(order.status)}>
              {orderStatusLabel(order.status)}
            </span>
            {showAwaitingConfirmationBadge ? (
              <span className={badgeClass("amber", "xs")}>
                {t("orders.awaitingClientConfirmation")}
              </span>
            ) : null}
          </div>

          <div className="text-right leading-none">
            <p className="text-xl font-semibold tracking-tight text-slate-900">
              {formatMoney(order.pricing.total)}{" "}
              <span className="text-xs font-medium text-slate-500">
                {order.pricing.currency}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{order.payment.method}</p>
          </div>
        </div>
      </header>

      <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-600">
        {order.customer.phone && order.customer.phone !== "—" ? (
          <p className="truncate">{order.customer.phone}</p>
        ) : null}

        {serviceSummaryLine ? (
          <p className="text-slate-500">{serviceSummaryLine}</p>
        ) : null}

        {addressLine ? (
          <p className="flex items-start gap-1.5 text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="min-w-0">
              {addressLine}
              {order.address.floor ? (
                <span className="text-slate-400"> · Floor {order.address.floor}</span>
              ) : null}
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-2 border-t border-slate-100 pt-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {hasAssignedCleaner ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF4FA] text-[10px] font-semibold text-[#34597E] ring-1 ring-[#C5D9EB]">
                {initials(assignedCleanerName ?? "")}
              </span>
              <span className="font-medium text-slate-800">{assignedCleanerName}</span>
              {canShowQuickAssign ? (
                <>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className={btnLink}
                  >
                    Change
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={handleUnassign}
                    disabled={unassigning}
                    className={btnLinkDanger}
                  >
                    {unassigning ? "Removing…" : "Remove"}
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="text-slate-500">Not assigned</span>
              {canShowQuickAssign ? (
                <>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className={btnLink}
                  >
                    Assign cleaner
                  </button>
                </>
              ) : null}
            </div>
          )}

          {pickerOpen ? (
            <div className="mt-2 w-full max-w-md rounded-xl border border-slate-200/80 bg-[#F6F8FB] p-2">
              {cleanersLoading ? (
                <p className="text-[11px] text-slate-500">Loading cleaners…</p>
              ) : cleanersError ? (
                <p className="text-[11px] text-rose-700">{cleanersError}</p>
              ) : cleaners.length === 0 ? (
                <p className="text-[11px] text-slate-500">No active cleaners</p>
              ) : (
                <div className="space-y-1.5">
                  <input
                    value={cleanerSearch}
                    onChange={(e) => setCleanerSearch(e.target.value)}
                    placeholder="Search by name…"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10"
                  />

                  {filteredCleaners.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No cleaners match “{cleanerSearch.trim()}”.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <select
                        value={selectedCleanerId}
                        onChange={(e) => setSelectedCleanerId(e.target.value)}
                        className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10"
                      >
                        {filteredCleaners.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.baseCity ? ` · ${c.baseCity}` : ""}
                          </option>
                        ))}
                      </select>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={handleAssign}
                          disabled={assigning || !selectedCleanerId}
                          className={`${btnPrimary} disabled:opacity-60`}
                        >
                          {assigning ? "…" : "Assign"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickerOpen(false)}
                          className={btnGhost}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  )}

                  {cleanerSearch.trim() ? (
                    <button
                      type="button"
                      onClick={() => setCleanerSearch("")}
                      className={`${btnLink} px-0`}
                    >
                      Clear search
                    </button>
                  ) : null}
                </div>
              )}
              {assignError ? (
                <p className="mt-1.5 text-[11px] text-rose-700">{assignError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {detailHref ? (
            <Link href={detailHref} className={btnPrimary}>
              {t("common.viewDetails")}
            </Link>
          ) : null}
          {editHref ? (
            <Link href={editHref} className={btnGhost}>
              <Pencil className="h-3.5 w-3.5" />
              {t("common.edit")}
            </Link>
          ) : null}

          <div className="relative" ref={cardMenuRef}>
            <button
              type="button"
              onClick={() => setCardMenuOpen((open) => !open)}
              className={`${btnGhost} h-8 w-8 px-0`}
              aria-expanded={cardMenuOpen}
              aria-haspopup="menu"
              aria-label="More actions"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {cardMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 bottom-full z-20 mb-1.5 min-w-[188px] overflow-hidden rounded-xl border border-slate-200/80 bg-white py-0.5 shadow-[0_8px_28px_rgba(15,23,42,0.12)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-400"
                  title="Coming soon"
                >
                  <Bell className="h-3.5 w-3.5 shrink-0" />
                  Notify client
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-400"
                  title="Coming soon"
                >
                  <BellRing className="h-3.5 w-3.5 shrink-0" />
                  Notify cleaner
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
