"use client";

import type { CSSProperties } from "react";
import { useHeroVideo } from "./useHeroVideo";

type HeroVideoBackgroundProps = {
  src: string;
  poster: string;
  variant?: "default" | "mobile-soft";
};

const MOBILE_VIDEO_MASK =
  "linear-gradient(to bottom, #000 0%, #000 54%, rgba(0,0,0,0.82) 66%, rgba(0,0,0,0.32) 82%, rgba(0,0,0,0.08) 94%, transparent 100%)";

const MOBILE_SOFT_VIDEO_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.08) 72%, transparent 100%)";

const MOBILE_COLOR_FADE =
  "linear-gradient(to bottom, transparent 0%, transparent 40%, color-mix(in srgb, var(--cc-page-bg) 4%, transparent) 54%, color-mix(in srgb, var(--cc-page-bg) 16%, transparent) 68%, color-mix(in srgb, var(--cc-page-bg) 36%, transparent) 82%, color-mix(in srgb, var(--cc-page-bg) 58%, transparent) 93%, var(--cc-page-bg) 100%)";

const MOBILE_SOFT_COLOR_FADE =
  "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, color-mix(in srgb, var(--cc-page-bg) 45%, transparent) 55%, color-mix(in srgb, var(--cc-page-bg) 82%, transparent) 78%, var(--cc-page-bg) 100%)";

const MOBILE_BLUR_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0.32) 84%, rgba(0,0,0,0.68) 100%)";

const MOBILE_SOFT_BLUR_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.2) 50%, rgba(238,242,247,0.75) 100%)";

/**
 * Mobile: dedicated top video band with focal point on the cat (object-position).
 * Desktop: full-bleed background — cat composition shifted right, reading area left.
 */
export function HeroVideoBackground({
  src,
  poster,
  variant = "default",
}: HeroVideoBackgroundProps) {
  const { videoRef } = useHeroVideo(src);
  const isMobileSoft = variant === "mobile-soft";

  const shellClass = isMobileSoft
    ? "pointer-events-none relative h-[16svh] min-h-[108px] max-h-[132px] w-full overflow-hidden"
    : "pointer-events-none absolute inset-0 h-full w-full overflow-hidden";

  const mask = isMobileSoft ? MOBILE_SOFT_VIDEO_MASK : MOBILE_VIDEO_MASK;
  const colorFade = isMobileSoft ? MOBILE_SOFT_COLOR_FADE : MOBILE_COLOR_FADE;
  const blurMask = isMobileSoft ? MOBILE_SOFT_BLUR_MASK : MOBILE_BLUR_MASK;

  return (
    <div className={shellClass} aria-hidden>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover object-[58%_30%] min-[390px]:object-[60%_32%] sm:object-[62%_34%] md:object-[64%_36%] lg:object-[72%_38%] xl:object-[68%_40%] 2xl:object-[70%_42%] max-lg:opacity-90 max-lg:[mask-image:var(--hero-video-mask)] max-lg:[-webkit-mask-image:var(--hero-video-mask)] ${
          isMobileSoft ? "opacity-75 saturate-[0.92]" : "lg:saturate-[1.02]"
        }`}
        style={
          {
            "--hero-video-mask": mask,
          } as CSSProperties
        }
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        {...(poster ? { poster } : {})}
      />

      <div className="absolute inset-0 lg:hidden" aria-hidden>
        <div className="absolute inset-0" style={{ background: colorFade }} />
        <div
          className={`absolute inset-x-0 bottom-0 backdrop-blur-[6px] backdrop-saturate-105 ${isMobileSoft ? "h-[70%]" : "h-[58%]"}`}
          style={{
            maskImage: blurMask,
            WebkitMaskImage: blurMask,
          }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 hidden h-[14%] bg-linear-to-t from-[var(--cc-page-bg)]/90 via-[var(--cc-page-bg)]/25 to-transparent lg:block" aria-hidden />
    </div>
  );
}
