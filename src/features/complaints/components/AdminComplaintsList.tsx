"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import type { AdminComplaintListItem } from "@/entities/complaint/admin-complaint.types";
import { COMPLAINT_STATUSES } from "@/lib/constants/complaint";
import type {
  AdminComplaintsApiResponse,
  AdminUpdateComplaintApiResponse,
} from "@/features/complaints/types/admin-complaints-api.types";

type LoadState = "loading" | "idle";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

const STATUS_OPTIONS = COMPLAINT_STATUSES.map((status) => ({
  value: status,
  label:
    status === "in_progress"
      ? "In progress"
      : status.charAt(0).toUpperCase() + status.slice(1),
}));

function statusPillClass(status: string): string {
  const map: Record<string, string> = {
    open: "bg-amber-50 text-amber-800 ring-amber-200",
    in_progress: "bg-sky-50 text-sky-700 ring-sky-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    closed: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function AdminComplaintsList() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [complaints, setComplaints] = useState<AdminComplaintListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { status: string; adminNote: string }>
  >({});

  const loadComplaints = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/complaints", {
        credentials: "include",
      });
      const json = (await response.json()) as AdminComplaintsApiResponse;

      if (!response.ok || json.error) {
        setComplaints([]);
        setError(json.error ?? "Failed to load complaints");
        return;
      }

      const items = json.data ?? [];
      setComplaints(items);
      const nextDrafts: Record<string, { status: string; adminNote: string }> =
        {};
      for (const item of items) {
        nextDrafts[item.id] = {
          status: item.status,
          adminNote: item.adminNote ?? "",
        };
      }
      setDrafts(nextDrafts);
    } catch {
      setComplaints([]);
      setError("Failed to load complaints");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  const handleSave = async (complaintId: string) => {
    const draft = drafts[complaintId];
    if (!draft) return;

    setSavingId(complaintId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          adminNote: draft.adminNote.trim() || null,
        }),
      });
      const json = (await response.json()) as AdminUpdateComplaintApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to update complaint");
        return;
      }

      setComplaints((prev) =>
        prev.map((item) => (item.id === complaintId ? json.data! : item))
      );
      setDrafts((prev) => ({
        ...prev,
        [complaintId]: {
          status: json.data!.status,
          adminNote: json.data!.adminNote ?? "",
        },
      }));
    } catch {
      setError("Failed to update complaint");
    } finally {
      setSavingId(null);
    }
  };

  const isLoading = loadState === "loading";

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
          Complaints
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Client complaints and internal follow-up notes.
        </p>
        {!isLoading && !error ? (
          <p className="mt-3 text-xs font-medium text-slate-400">
            {complaints.length === 0
              ? "No complaints yet"
              : `${complaints.length} complaint${complaints.length === 1 ? "" : "s"}`}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Loading complaints...
        </div>
      ) : null}

      {!isLoading && !error && complaints.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-base font-medium text-slate-700">
            No complaints yet
          </p>
        </div>
      ) : null}

      {!isLoading && !error && complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const draft = drafts[complaint.id] ?? {
              status: complaint.status,
              adminNote: complaint.adminNote ?? "",
            };

            return (
              <article
                key={complaint.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      {complaint.clientName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {complaint.clientEmail}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass(complaint.status)}`}
                  >
                    {complaint.statusLabel}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Order</dt>
                    <dd className="mt-0.5 font-semibold text-[#34597E]">
                      <Link
                        href={`/app/admin/orders/${complaint.orderId}`}
                        className="hover:underline"
                      >
                        #{complaint.orderDisplayId}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Reason</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">
                      {complaint.reasonLabel}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Description</dt>
                    <dd className="mt-0.5 text-slate-700">
                      {complaint.description}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd className="mt-0.5 text-slate-600">
                      {formatDateTime(complaint.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </span>
                    <StyledSelect
                      value={draft.status}
                      options={STATUS_OPTIONS}
                      onChange={(value) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: { ...draft, status: value },
                        }))
                      }
                      className="mt-1.5"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Admin note
                    </span>
                    <textarea
                      value={draft.adminNote}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: {
                            ...draft,
                            adminNote: e.target.value,
                          },
                        }))
                      }
                      rows={2}
                      className="mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10"
                      placeholder="Internal note for the team..."
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={savingId === complaint.id}
                  onClick={() => void handleSave(complaint.id)}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4d6f] disabled:opacity-60"
                >
                  {savingId === complaint.id ? "Saving..." : "Save changes"}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
