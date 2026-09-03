"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "className"> & {
  wrapperClassName?: string;
  imageClassName?: string;
};

export function WizardMotionImage({
  wrapperClassName = "",
  imageClassName = "object-cover object-center",
  alt,
  unoptimized,
  onError,
  ...imageProps
}: Props) {
  const [failed, setFailed] = useState(false);
  const src = imageProps.src;
  const isLocalPublicFile =
    typeof src === "string" && src.startsWith("/") && !src.startsWith("//");

  return (
    <div
      className={`hr-wizard-image-enter relative overflow-hidden ${wrapperClassName}`.trim()}
    >
      <Image
        key={`${typeof src === "string" ? src : "img"}-${failed ? "raw" : "opt"}`}
        alt={alt}
        className={imageClassName}
        unoptimized={failed || unoptimized || isLocalPublicFile}
        onError={(event) => {
          if (!failed) {
            setFailed(true);
            return;
          }
          onError?.(event);
        }}
        {...imageProps}
      />
    </div>
  );
}
