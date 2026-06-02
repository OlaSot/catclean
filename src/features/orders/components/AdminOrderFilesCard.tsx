"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { ORDER_FILE_CATEGORIES } from "@/lib/constants/order-file-category";
import type { OrderFileCategory } from "@/lib/constants/order-file-category";
import type {
  AdminOrderFile,
  AdminOrderFileDeleteApiResponse,
  AdminOrderFileUploadApiResponse,
  AdminOrderFilesListApiResponse,
} from "@/features/orders/types/admin-order-files-api.types";
import { useT } from "@/i18n/useT";

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

type AdminOrderFilesCardProps = {
  orderId: string;
  compact?: boolean;
};

export default function AdminOrderFilesCard({
  orderId,
  compact = false,
}: AdminOrderFilesCardProps) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<AdminOrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<OrderFileCategory>("before_photo");

  const categoryOptions = ORDER_FILE_CATEGORIES.map((item) => ({
    value: item.value,
    label: t(`fileCategory.${item.value}`),
  }));

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/files`, {
        credentials: "include",
      });
      const json = (await response.json()) as AdminOrderFilesListApiResponse;

      if (!response.ok || json.error) {
        setFiles([]);
        setError(json.error ?? t("attachments.failedLoadFiles"));
        return;
      }

      setFiles(json.data ?? []);
    } catch {
      setFiles([]);
      setError(t("attachments.failedLoadFiles"));
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

      const response = await fetch(`/api/admin/orders/${orderId}/files`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = (await response.json()) as AdminOrderFileUploadApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? t("attachments.failedUploadFile"));
        return;
      }

      setFiles((prev) => [json.data!, ...prev]);
    } catch {
      setError(t("attachments.failedUploadFile"));
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
    if (!window.confirm(t("attachments.confirmDelete"))) return;

    setDeletingId(fileId);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/files/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const json = (await response.json()) as AdminOrderFileDeleteApiResponse;

      if (!response.ok || json.error) {
        setError(json.error ?? t("attachments.failedDeleteFile"));
        return;
      }

      setFiles((prev) => prev.filter((item) => item.id !== fileId));
    } catch {
      setError(t("attachments.failedDeleteFile"));
    } finally {
      setDeletingId(null);
    }
  };

  const uploadBoxClass = compact
    ? "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 bg-[#F6F8FB]/60 px-4 py-5 text-center transition hover:border-[#34597E]/40 hover:bg-[#EEF4FA]/80"
    : "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-[#F6F8FB]/60 px-6 py-10 text-center transition hover:border-[#34597E]/40 hover:bg-[#EEF4FA]/80";

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        {t("attachments.uploadHint")}
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {t("attachments.category")}
          </span>
          <StyledSelect
            value={category}
            options={categoryOptions}
            onChange={(value) => setCategory(value as OrderFileCategory)}
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
        className={uploadBoxClass}
      >
        <Upload className={`${compact ? "h-6 w-6" : "h-8 w-8"} text-[#34597E]/70`} aria-hidden />
        <p className="text-sm font-medium text-slate-700">
          {uploading ? t("common.loading") : t("attachments.dropOrClick")}
        </p>
        {!compact ? (
          <p className="text-xs text-slate-500">{t("common.upload")}</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => void handleFileSelected(e)}
      />

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      ) : null}

      {!loading && files.length === 0 && !error ? (
        <p className="text-sm text-slate-500">{t("attachments.noFilesYet")}</p>
      ) : null}

      {!loading && files.length > 0 ? (
        <ul className={`grid gap-4 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
          {files.map((file) => (
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
                  {file.fileType === "application/pdf" ? (
                    <FileText className="h-10 w-10 text-[#34597E]" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-[#34597E]" />
                  )}
                  {file.signedUrl ? (
                    <a
                      href={file.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#34597E] hover:underline"
                    >
                      {t("attachments.openFile")}
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
                      {t(`fileCategory.${file.category}`)} · {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    title={t("attachments.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {formatUploadedAt(file.createdAt)}
                  {file.uploadedBy
                    ? ` · ${file.uploadedBy.fullName ?? file.uploadedBy.email}`
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
