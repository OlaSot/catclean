"use client";

import { useCallback, useRef, useState } from "react";

type Phase = "enter" | "exit";

export function useHomeResetStepTransition(initialStep = 1) {
  const [progressStep, setProgressStep] = useState(initialStep);
  const [displayStep, setDisplayStep] = useState(initialStep);
  const [phase, setPhase] = useState<Phase>("enter");
  const pendingStepRef = useRef<number | null>(null);

  const goToStep = useCallback(
    (next: number) => {
      if (next === displayStep && phase === "enter") return;

      pendingStepRef.current = next;
      setProgressStep(next);
      setPhase("exit");
    },
    [displayStep, phase]
  );

  const handleStepAnimationEnd = useCallback(() => {
    if (phase !== "exit" || pendingStepRef.current == null) return;

    const next = pendingStepRef.current;
    pendingStepRef.current = null;
    setDisplayStep(next);
    setPhase("enter");
  }, [phase]);

  return {
    progressStep,
    displayStep,
    phase,
    goToStep,
    handleStepAnimationEnd,
    setProgressStep,
    setDisplayStep,
    setPhase,
  };
}
