"use client";

import { useCallback, useEffect, useRef } from "react";

type HeroVideoBackgroundProps = {
  src: string;
  poster: string;
};

/**
 * Mobile: dedicated top video band with focal point on the cat (object-position).
 * Desktop: full-bleed background behind the hero.
 */
export function HeroVideoBackground({ src, poster }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const ensurePlaying = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    if (!video.paused) return;

    void video.play().catch(() => {
      // Mobile browsers may block the first attempt; loadeddata/visibility handlers retry.
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => ensurePlaying();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePlaying();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onReady);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) ensurePlaying();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);

    ensurePlaying();

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onReady);
      observer.disconnect();
    };
  }, [ensurePlaying, src]);

  return (
    <div
      className="pointer-events-none relative h-[30svh] min-h-[190px] max-h-[260px] w-full overflow-hidden sm:h-[32svh] sm:max-h-[280px] md:h-[36svh] md:max-h-[320px] lg:absolute lg:inset-0 lg:h-full lg:max-h-none"
      aria-hidden
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-[52%_28%] min-[390px]:object-[50%_30%] sm:object-[50%_32%] md:object-[50%_38%] lg:object-[50%_42%] xl:object-center"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
      />

      {/* Mobile: light overlay + fade into content area below */}
      <div className="motion-fade-in absolute inset-0 bg-linear-to-b from-white/25 via-transparent via-55% to-[#EEF2F7] lg:hidden" />

      {/* Desktop: very subtle bottom fade only — no white wash */}
      <div className="absolute inset-0 hidden bg-linear-to-b from-transparent via-transparent to-black/15 lg:block" />
    </div>
  );
}
