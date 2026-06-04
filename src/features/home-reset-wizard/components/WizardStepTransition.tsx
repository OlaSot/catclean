"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  phase: "enter" | "exit";
  onAnimationEnd: () => void;
  children: ReactNode;
};

export function WizardStepTransition({ phase, onAnimationEnd, children }: Props) {
  useEffect(() => {
    if (phase !== "exit") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) return;
    onAnimationEnd();
  }, [phase, onAnimationEnd]);

  return (
    <div
      className={phase === "exit" ? "hr-wizard-step-exit" : "hr-wizard-step-enter"}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget || phase !== "exit") return;
        onAnimationEnd();
      }}
    >
      {children}
    </div>
  );
}
