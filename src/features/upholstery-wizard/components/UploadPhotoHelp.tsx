import { UploadPhotoHelp as BaseUploadPhotoHelp } from "@/components/ui/UploadPhotoHelp";

export function UploadPhotoHelp() {
  return (
    <BaseUploadPhotoHelp
      headline="Not sure what to choose?"
      description="Upload a photo and we'll help you select the right option."
      ariaLabel="Upload furniture photo"
    />
  );
}
