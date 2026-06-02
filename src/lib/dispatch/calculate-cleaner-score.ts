export type CleanerScoreInput = {
  availabilityStatus:
    | "available"
    | "unavailable"
    | "vacation"
    | "sick"
    | "preferred_day_off"
    | null;
  isAcceptingOrders: boolean;
  cityMatch: boolean;
  hasOverlap: boolean;
  workload: {
    totalOrders: number;
    totalHours: number;
    exceedsMaxHours: boolean;
    exceedsMaxOrders: boolean;
  };
  order: {
    serviceType: string;
    hasPets: boolean;
  };
  reliability: {
    complaintsCount: number;
    completedOrdersCount: number;
    oftenLate: boolean;
    strongMoveOut: boolean;
    goodWithPets: boolean;
    previousClientOrdersCount: number;
    preferredForClient: boolean;
    hasAnyPreferredForClient: boolean;
  };
};

export type CleanerScoreResult = {
  score: number;
  reasons: string[];
  warnings: string[];
};

export function calculateCleanerScore(input: CleanerScoreInput): CleanerScoreResult {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (input.availabilityStatus === "available") {
    score += 18;
    reasons.push("Available");
  } else if (
    input.availabilityStatus === "unavailable" ||
    input.availabilityStatus === "vacation" ||
    input.availabilityStatus === "sick"
  ) {
    score -= 75;
    warnings.push("Unavailable on selected date");
  } else if (input.availabilityStatus === "preferred_day_off") {
    score -= 20;
    warnings.push("Preferred day off");
  }

  if (!input.isAcceptingOrders) {
    score -= 60;
    warnings.push("Not accepting orders");
  } else {
    score += 8;
  }

  if (input.workload.exceedsMaxHours || input.workload.exceedsMaxOrders) {
    score -= 30;
    warnings.push("Overload risk");
  } else {
    const loadBonus = Math.max(0, 14 - input.workload.totalOrders * 3);
    score += loadBonus;
    if (input.workload.totalOrders <= 2) reasons.push("Low workload");
  }

  if (input.hasOverlap) {
    score -= 40;
    warnings.push("Possible overlap");
  }

  if (input.cityMatch) {
    score += 14;
    reasons.push("Works in order city");
  }

  if (input.reliability.oftenLate) {
    score -= 22;
    warnings.push("Often late");
  }

  if (
    input.order.serviceType === "move_in_out" &&
    input.reliability.strongMoveOut
  ) {
    score += 12;
    reasons.push("Strong move-out cleaner");
  }

  if (input.order.hasPets && input.reliability.goodWithPets) {
    score += 10;
    reasons.push("Good with pets");
  }

  if (input.reliability.preferredForClient) {
    score += 32;
    reasons.push("Preferred cleaner for this client");
  } else if (
    !input.reliability.hasAnyPreferredForClient &&
    input.reliability.previousClientOrdersCount > 0
  ) {
    score += 10;
    reasons.push("Worked with this client before");
  }

  const complaintsPenalty = Math.min(20, input.reliability.complaintsCount * 5);
  if (complaintsPenalty > 0) {
    score -= complaintsPenalty;
    warnings.push("Recent complaint history");
  }

  const completionBonus = Math.min(
    10,
    Math.floor(input.reliability.completedOrdersCount / 10) * 2
  );
  score += completionBonus;
  if (completionBonus >= 6) reasons.push("Reliable completion history");

  return { score, reasons, warnings };
}
