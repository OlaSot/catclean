"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type { CleanerProfileStatus } from "@/lib/constants/cleaner-status";
import { getCleanerInitials } from "@/features/cleaners/lib/cleaner-initials";
import type { UploadCleanerAvatarApiResponse } from "@/features/cleaners/types/upload-cleaner-avatar-api.types";
import { displayValue } from "@/features/orders/lib/format-order-display";

const ACCEPTED_AVATAR_TYPES = "image/jpeg,image/png,image/webp";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

type SkillBadgeProps = {
  label: string;
  enabled: boolean;
};

function SkillBadge({ label, enabled }: SkillBadgeProps) {
  return (
    <span
      className={
        enabled
          ? "inline-flex items-center rounded-full bg-[#EEF4FA] px-3 py-1 text-xs font-medium text-[#34597E] ring-1 ring-[#C5D9EB]"
          : "inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-200/80"
      }
    >
      {label}
    </span>
  );
}

function CleanerAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initials = getCleanerInitials(name);
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = Boolean(avatarUrl) && !imageFailed;

  if (showImage && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-[#E5EDF5]"
      />
    );
  }

  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#EEF4FA] text-lg font-semibold text-[#34597E] shadow-sm ring-2 ring-[#E5EDF5]"
      aria-hidden
    >
      {initials}
    </div>
  );
}

function statusBadgeClass(status: CleanerProfileStatus): string {
  const base =
    "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";
  switch (status) {
    case "active":
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    case "pending":
      return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
    case "paused":
      return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
    case "blocked":
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    default:
      return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
  }
}

type AdminCleanerCardProps = {
  cleaner: ActiveCleaner;
  onAvatarUpdated: (cleaner: ActiveCleaner) => void;
};

export default function AdminCleanerCard({
  cleaner,
  onAvatarUpdated,
}: AdminCleanerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const skills: { label: string; enabled: boolean }[] = [
    { label: "Можно с питомцами", enabled: cleaner.petFriendly },
    { label: "Есть пылесос", enabled: cleaner.ownsVacuum },
    { label: "Есть пароочиститель", enabled: cleaner.ownsSteamCleaner },
    { label: "Windows", enabled: cleaner.acceptsWindows },
    { label: "Химчистка", enabled: cleaner.acceptsDryCleaning },
  ];

  function validateFileClient(file: File): string | null {
    if (!ACCEPTED_AVATAR_TYPES.split(",").includes(file.type)) {
      return "Разрешены только изображения JPEG, PNG и WebP";
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return "Размер изображения должен быть не более 2MB";
    }
    return null;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    const clientError = validateFileClient(file);
    if (clientError) {
      setUploadError(clientError);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/cleaners/${cleaner.id}/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = (await response.json()) as UploadCleanerAvatarApiResponse;

      if (!response.ok || json.error || !json.data) {
        setUploadError(json.error ?? "Не удалось загрузить аватар");
        return;
      }

      onAvatarUpdated(json.data);
      setUploadSuccess(true);
    } catch {
      setUploadError("Не удалось загрузить аватар");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start gap-4">
        <CleanerAvatar
          key={cleaner.avatarUrl ?? cleaner.id}
          name={cleaner.name}
          avatarUrl={cleaner.avatarUrl}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">
                <Link href={`/app/admin/cleaners/${cleaner.id}`} className="hover:text-[#34597E] hover:underline">
                  {cleaner.name}
                </Link>
              </h2>
              <p className="mt-1 truncate text-sm text-slate-600">{cleaner.email}</p>
              <p className="truncate text-sm text-slate-600">{cleaner.phone}</p>
            </div>
            <span className={statusBadgeClass(cleaner.status)}>
              {cleaner.status}
            </span>
          </div>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES}
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center justify-center rounded-full border border-[#C5D9EB] bg-[#EEF4FA] px-4 py-2 text-xs font-semibold text-[#34597E] transition hover:bg-[#E5EDF5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Загрузка..." : "Загрузить аватар"}
            </button>
            <p className="mt-2 text-xs text-slate-400">JPEG, PNG или WebP · максимум 2MB</p>
          </div>
        </div>
      </div>

      {uploadError ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {uploadError}
        </p>
      ) : null}

      {uploadSuccess ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Аватар успешно обновлен.
        </p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Базовый город
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {displayValue(cleaner.baseCity)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Рейтинг
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {cleaner.rating != null ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-[#34597E]">★</span>
                {cleaner.rating.toFixed(1)}
              </span>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Навыки и оборудование
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillBadge key={skill.label} label={skill.label} enabled={skill.enabled} />
          ))}
        </div>
      </div>
    </article>
  );
}
