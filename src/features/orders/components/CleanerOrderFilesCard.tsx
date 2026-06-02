"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import {
  CLEANER_ORDER_FILE_CATEGORIES,
  type CleanerOrderFileCategory,
} from "@/lib/constants/cleaner-order-file-category";
import type {
  CleanerOrderFile,
  CleanerOrderFileDeleteApiResponse,
  CleanerOrderFileUploadApiResponse,
  CleanerOrderFilesListApiResponse,
} from "@/features/orders/types/cleaner-order-files-api.types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type CleanerOrderFilesCardProps = {
  orderId: string;
};

export default function CleanerOrderFilesCard({ orderId }: CleanerOrderFilesCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<CleanerOrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CleanerOrderFileCategory>("before_photo");

  const categoryOptions = CLEANER_ORDER_FILE_CATEGORIES.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cleaner/orders/${orderId}/files`, {
        credentials: "include",
      });
      const json = (await response.json()) as CleanerOrderFilesListApiResponse;

      if (!response.ok || json.error) {
        setFiles([]);
        setError(json.error ?? "Failed to load photos");
        return;
      }

      setFiles(json.data ?? []);
    } catch {
      setFiles([]);
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const uploadSelectedFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch(`/api/cleaner/orders/${orderId}/files`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = (await response.json()) as CleanerOrderFileUploadApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to upload photo");
        return;
      }

      setFiles((prev) => [json.data!, ...prev]);
    } catch {
      setError("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    await uploadSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || uploading) return;
    void uploadSelectedFile(file);
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Delete this photo?")) return;

    setDeletingId(fileId);
    setError(null);

    try {
      const response = await fetch(
        `/api/cleaner/orders/${orderId}/files/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const json = (await response.json()) as CleanerOrderFileDeleteApiResponse;

      if (!response.ok || json.error) {
        setError(json.error ?? "Failed to delete photo");
        return;
      }

      setFiles((prev) => prev.filter((item) => item.id !== fileId));
    } catch {
      setError("Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        JPEG, PNG or WebP · max 10MB · visible to staff on this order
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Category
          </span>
          <StyledSelect
            value={category}
            options={categoryOptions}
            onChange={(value) => setCategory(value as CleanerOrderFileCategory)}
            className="mt-1.5"
          />
        </label>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleUploadClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleUploadClick();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-[#F6F8FB]/60 px-6 py-10 text-center transition hover:border-[#34597E]/40 hover:bg-[#EEF4FA]/80"
      >
        <Upload className="h-8 w-8 text-[#34597E]/70" aria-hidden />
        <p className="text-sm font-medium text-slate-700">
          {uploading ? "Uploading…" : "Drop a photo here or tap to upload"}
        </p>
        <p className="text-xs text-slate-500">Uses category selected above</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFileSelected(e)}
      />

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading photos…</p>
      ) : null}

      {!loading && files.length === 0 && !error ? (
        <p className="text-sm text-slate-500">No photos yet. Upload before or after shots.</p>
      ) : null}

      {!loading && files.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {files.map((file) => {
            return (
              <li
                key={file.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/40"
              >
                {file.isImage && file.signedUrl ? (
                  <a
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-4/3 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.signedUrl}
                      alt={file.fileName}
                      className="h-full w-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex aspect-4/3 flex-col items-center justify-center gap-2 bg-[#EEF4FA] px-4 text-center">
                    <ImageIcon className="h-10 w-10 text-[#34597E]" />
                    {file.signedUrl ? (
                      <a
                        href={file.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#34597E] hover:underline"
                      >
                        Open file
                      </a>
                    ) : null}
                  </div>
                )}

                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {file.fileName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {file.categoryLabel} · {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                    {file.canDelete ? (
                      <button
                        type="button"
                        onClick={() => void handleDelete(file.id)}
                        disabled={deletingId === file.id}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        title="Delete photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formatUploadedAt(file.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
