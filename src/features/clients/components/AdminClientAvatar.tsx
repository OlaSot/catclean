"use client";

import { useState } from "react";
import { getClientInitials } from "@/features/clients/lib/client-initials";

type AdminClientAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: "h-16 w-16 text-lg",
  lg: "h-20 w-20 text-xl",
};

export default function AdminClientAvatar({
  name,
  avatarUrl,
  size = "md",
}: AdminClientAvatarProps) {
  const initials = getClientInitials(name);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !imageFailed;
  const dim = sizeClasses[size];

  if (showImage && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={`${dim} shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-[#E5EDF5]`}
      />
    );
  }

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#EEF4FA] font-semibold text-[#34597E] shadow-sm ring-2 ring-[#E5EDF5]`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
