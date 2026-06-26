import { UploadPhotoHelp as BaseUploadPhotoHelp } from "@/components/ui/UploadPhotoHelp";

export function UploadPhotoHelp() {
  return (
    <BaseUploadPhotoHelp
      headline="Not sure which window type fits?"
      description="Upload photos and our team will verify everything before the appointment."
      multiple
      ariaLabel="Upload window photos"
    />
  );
}
