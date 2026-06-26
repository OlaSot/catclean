"use client";

import { useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

type UploadPhotoHelpProps = {
  headline: string;
  description: string;
  buttonLabel?: string;
  multiple?: boolean;
  ariaLabel?: string;
};

export function UploadPhotoHelp({
  headline,
  description,
  buttonLabel = "Upload photo",
  multiple = false,
  ariaLabel = "Upload photo",
}: UploadPhotoHelpProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange() {
    // UI-only: selection is not sent anywhere yet.
  }

  return (
    <Card variant="info" className="px-3.5 py-3 sm:px-4 sm:py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-[#34597E] shadow-sm">
            <Camera className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            <span className="font-semibold text-slate-800">{headline}</span>
            <br className="hidden sm:block" />
            <span className="sm:ml-0"> {description}</span>
          </p>
        </div>

        <Button
          type="button"
          variant="outlineBrand"
          size="md"
          fullWidth
          className="shrink-0 lg:w-auto"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4" aria-hidden />
          {buttonLabel}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={handleFileChange}
        aria-label={ariaLabel}
      />
    </Card>
  );
}
