"use client";

import { buildScheduleTimeOptions } from "@/lib/orders/schedule-time";
import { useMemo } from "react";

type ScheduleTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

const defaultClassName =
  "rounded-lg border border-[#C5D9EB] bg-white px-2 py-1 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/20";

export function ScheduleTimeSelect({
  value,
  onChange,
  onBlur,
  disabled,
  className = defaultClassName,
  id,
  name,
}: ScheduleTimeSelectProps) {
  const options = useMemo(() => buildScheduleTimeOptions(), []);

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
    >
      {options.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
}
