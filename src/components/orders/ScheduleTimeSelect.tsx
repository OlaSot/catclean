"use client";

type ScheduleTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

import { inputMd } from "@/lib/design-system/tokens";

const defaultClassName = `${inputMd} cursor-pointer font-semibold tabular-nums`;

export function ScheduleTimeSelect({
  value,
  onChange,
  onBlur,
  disabled,
  className = defaultClassName,
  id,
  name,
}: ScheduleTimeSelectProps) {
  const clock = value.trim().slice(0, 5);

  return (
    <input
      id={id}
      name={name}
      type="time"
      step={60}
      value={clock}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
    />
  );
}
