"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LOGIN_HERO_CSS_FALLBACK_CLASS,
  LOGIN_HERO_FALLBACK_IMAGE,
  LOGIN_HERO_IMAGE,
} from "./login-styles";

type LoginHeroVisualProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function LoginHeroVisual({
  className = "absolute inset-0",
  imageClassName = "object-cover object-[50%_32%]",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 54vw",
}: LoginHeroVisualProps) {
  const [imageSrc, setImageSrc] = useState(LOGIN_HERO_IMAGE);
  const [imageFailed, setImageFailed] = useState(false);

  const handleError = () => {
    if (imageSrc === LOGIN_HERO_IMAGE) {
      setImageSrc(LOGIN_HERO_FALLBACK_IMAGE);
      return;
    }

    setImageFailed(true);
  };

  if (imageFailed) {
    return (
      <div
        className={`${LOGIN_HERO_CSS_FALLBACK_CLASS} ${className}`.trim()}
        role="img"
        aria-label="Bright premium home interior"
      />
    );
  }

  return (
    <div className={className}>
      <Image
        src={imageSrc}
        alt="White cat in a bright, freshly cleaned home"
        fill
        priority={priority}
        sizes={sizes}
        className={imageClassName}
        onError={handleError}
      />
    </div>
  );
}
