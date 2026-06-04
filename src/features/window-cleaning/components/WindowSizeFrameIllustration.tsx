import type { WindowSizeFrame } from "../window-cleaning.types";

const FRAME_CONFIG: Record<
  WindowSizeFrame,
  { panes: Array<{ x: number; y: number; w: number; h: number }>; label: string }
> = {
  s: {
    label: "Small",
    panes: [{ x: 18, y: 14, w: 28, h: 36 }],
  },
  m: {
    label: "Medium",
    panes: [
      { x: 12, y: 12, w: 22, h: 40 },
      { x: 38, y: 12, w: 22, h: 40 },
    ],
  },
  l: {
    label: "Large",
    panes: [
      { x: 8, y: 10, w: 18, h: 42 },
      { x: 30, y: 10, w: 18, h: 42 },
      { x: 52, y: 10, w: 18, h: 42 },
    ],
  },
  xl: {
    label: "Panoramic",
    panes: [{ x: 6, y: 8, w: 68, h: 44 }],
  },
};

type Props = {
  size: WindowSizeFrame;
  className?: string;
};

export function WindowSizeFrameIllustration({ size, className = "" }: Props) {
  const config = FRAME_CONFIG[size];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl border border-white/60 bg-white/75 px-2 py-1.5 shadow-sm backdrop-blur-sm ${className}`.trim()}
      aria-hidden
    >
      <svg viewBox="0 0 80 56" className="h-12 w-[4.5rem] sm:h-14 sm:w-20" role="img">
        <title>{config.label} window frame</title>
        <rect
          x="4"
          y="4"
          width="72"
          height="48"
          rx="3"
          fill="none"
          stroke="#94b8d4"
          strokeWidth="2"
        />
        {config.panes.map((pane, index) => (
          <rect
            key={index}
            x={pane.x}
            y={pane.y}
            width={pane.w}
            height={pane.h}
            rx="1.5"
            fill="#dbeafe"
            stroke="#5B8DB8"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}
