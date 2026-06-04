"use client";

import { useRef } from "react";
import { Camera, Upload } from "lucide-react";

export function UploadPhotoHelp() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange() {
    // UI-only: selection is not sent anywhere yet.
    // Future: send photo to CRM
    // Future: send photo to Telegram
  }

  return (
    <div className="rounded-2xl border border-[#d6e6f2] bg-[#eef5fb] px-3.5 py-3 sm:px-4 sm:py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-[#34597E] shadow-sm">
            <Camera className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            <span className="font-semibold text-slate-800">Not sure which window type fits?</span>
            <br className="hidden sm:block" />
            <span className="sm:ml-0">
              {" "}
              Upload photos and our team will verify everything before the appointment.
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleUploadClick}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#34597E]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#34597E] transition hover:border-[#34597E] hover:bg-[#f8fbfd] lg:w-auto"
        >
          <Upload className="h-4 w-4" aria-hidden />
          Upload photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload window photos"
      />
    </div>
  );
}
