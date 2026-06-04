"use client";

import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "className"> & {
  wrapperClassName?: string;
  imageClassName?: string;
};

export function WizardMotionImage({
  wrapperClassName = "",
  imageClassName = "object-cover object-center",
  alt,
  ...imageProps
}: Props) {
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`.trim()}>
      <Image
        key={typeof imageProps.src === "string" ? imageProps.src : undefined}
        alt={alt}
        className={`hr-wizard-image-enter ${imageClassName}`.trim()}
        {...imageProps}
      />
    </div>
  );
}
