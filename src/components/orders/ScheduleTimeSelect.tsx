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

import { selectNative } from "@/lib/design-system/tokens";

const defaultClassName = `${selectNative} font-semibold`;

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
