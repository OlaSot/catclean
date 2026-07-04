"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

const DEFAULT_MIN_SCALE = 0.48;
const DEFAULT_MAX_SCALE = 1;

type ViewportFitProps = {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
  /** Scale uniformly by height only — keeps card proportions, no width pre-expansion */
  fitHeightOnly?: boolean;
  /** Extra shrink applied after fit (e.g. 0.92 = 8% smaller) */
  scaleMultiplier?: number;
  /** Anchor scaled content to the bottom of the container */
  alignBottom?: boolean;
  /** Reserved space at the bottom so shadows/badges are not clipped */
  bottomInset?: number;
};

/**
 * Scales children to fit the parent's visible box (height + width).
 * Collapses layout height after scale so overflow does not force page scroll.
 */
export function ViewportFit({
  children,
  minScale = DEFAULT_MIN_SCALE,
  maxScale = DEFAULT_MAX_SCALE,
  className = "",
  fitHeightOnly = false,
  scaleMultiplier = 1,
  alignBottom = false,
  bottomInset = 0,
}: ViewportFitProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [needsScroll, setNeedsScroll] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = measureRef.current;
      const outer = outerRef.current;
      if (!el || !outer) return;

      const availableH = Math.max(0, outer.clientHeight - bottomInset);
      const availableW = outer.clientWidth;
      const measuredH = el.scrollHeight;
      const measuredW = el.scrollWidth;

      if (availableH <= 0 || measuredH <= 0) return;

      const scaleH = availableH / measuredH;
      const scaleW = availableW / Math.max(measuredW, 1);
      const next = fitHeightOnly
        ? Math.min(maxScale, scaleH)
        : Math.min(maxScale, scaleH, scaleW);
      const clamped = Math.max(minScale, next);
      const adjusted = Math.min(maxScale, clamped * scaleMultiplier);

      setContentHeight(measuredH);
      setScale(adjusted);
      setNeedsScroll(adjusted <= minScale && measuredH * adjusted > availableH + 2);
    };

    measure();
    const raf = requestAnimationFrame(() => measure());

    const el = measureRef.current;
    const outer = outerRef.current;
    if (!el) return () => cancelAnimationFrame(raf);

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    if (outer) ro.observe(outer);

    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [children, minScale, maxScale, fitHeightOnly, scaleMultiplier, bottomInset]);

  const inverse = scale < 1 ? 1 / scale : 1;
  const visualHeight =
    contentHeight > 0 ? Math.ceil(contentHeight * (scale < 1 ? scale : 1)) : undefined;
  const useWidthCompensation = scale < 1 && !fitHeightOnly;
  const transformOrigin = alignBottom
    ? "bottom center"
    : fitHeightOnly
      ? "top center"
      : "top left";

  return (
    <div
      ref={outerRef}
      className={`flex h-full min-h-0 flex-1 flex-col ${needsScroll ? "overflow-y-auto" : "overflow-hidden"} ${className}`.trim()}
      style={bottomInset > 0 ? { paddingBottom: bottomInset } : undefined}
    >
      <div
        className={`w-full ${alignBottom ? "mt-auto flex flex-col justify-end overflow-visible" : fitHeightOnly && scale < 1 ? "mx-auto" : ""}`}
        style={
          alignBottom && visualHeight
            ? { height: visualHeight, flexShrink: 0 }
            : !alignBottom && visualHeight
              ? { height: visualHeight, flexShrink: 0 }
              : undefined
        }
      >
        <div
          ref={measureRef}
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin,
            width: useWidthCompensation ? `${inverse * 100}%` : "100%",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
