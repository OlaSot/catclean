"use client";

import { useCallback, useEffect, useRef } from "react";

const PLAYBACK_RATE = 0.88;
const LOOP_LEAD_SECONDS = 0.12;

/**
 * Calm hero playback: muted autoplay, slightly slowed, seamless loop restart.
 */
export function useHeroVideo(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const ensurePlaying = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playbackRate = PLAYBACK_RATE;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    void video.play().then(() => {
      video.removeAttribute("poster");
    }).catch(() => {
      // Retried by load/visibility/gesture handlers.
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => ensurePlaying();

    const onTimeUpdate = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (video.currentTime >= duration - LOOP_LEAD_SECONDS) {
        video.currentTime = 0;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePlaying();
    };

    const unlockOnGesture = () => ensurePlaying();

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("timeupdate", onTimeUpdate);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onReady);
    document.addEventListener("touchstart", unlockOnGesture, { passive: true });
    document.addEventListener("click", unlockOnGesture);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) ensurePlaying();
      },
      { threshold: 0.01 },
    );
    observer.observe(video);

    video.load();
    ensurePlaying();

    const retryTimers = [150, 400, 900].map((delay) =>
      window.setTimeout(ensurePlaying, delay),
    );

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("timeupdate", onTimeUpdate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onReady);
      document.removeEventListener("touchstart", unlockOnGesture);
      document.removeEventListener("click", unlockOnGesture);
      observer.disconnect();
      retryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [ensurePlaying, src]);

  return { videoRef, ensurePlaying };
}
