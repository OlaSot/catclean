"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";

type ThemeToggleProps = {
  toDarkLabel: string;
  toLightLabel: string;
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({
  toDarkLabel,
  toLightLabel,
  compact = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = mounted && theme === "dark";
  const label = dark ? toLightLabel : toDarkLabel;
  const size = compact ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[#34597E] shadow-sm transition hover:border-[#b9ccde] hover:bg-[#f8fbff] ${size} ${className}`.trim()}
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}
