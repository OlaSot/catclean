"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type StyledSelectOption = {
  value: string;
  label: string;
};

type StyledSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
};

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
  id,
  disabled = false,
}: StyledSelectProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative mt-1.5 ${className}`}>
      <button
        type="button"
        id={controlId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className={`truncate ${selected ? "" : "text-slate-400"}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-[#34597E]" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-labelledby={controlId}
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200/80 bg-white py-1 shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#EEF4FA] font-semibold text-[#34597E]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-[#34597E]" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
