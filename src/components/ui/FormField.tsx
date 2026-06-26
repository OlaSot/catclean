import type { ReactNode } from "react";
import { inputMd, textareaClass, typography } from "@/lib/design-system/tokens";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  hint?: string;
};

export function FormField({ label, htmlFor, error, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={typography.label}>
        {label}
      </label>
      {children}
      {hint ? <p className={typography.hint}>{hint}</p> : null}
      {error ? <p className={typography.error}>{error}</p> : null}
    </div>
  );
}

export const inputClassName = inputMd;

export const textareaClassName = textareaClass;
