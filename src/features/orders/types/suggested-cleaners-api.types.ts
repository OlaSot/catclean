import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";

export type SuggestedCleanerCandidate = {
  cleaner: ActiveCleaner;
  score: number;
  reasons: string[];
  warnings: string[];
  workloadToday: {
    totalOrders: number;
    totalHours: number;
    overlaps: number;
    exceedsMaxHours: boolean;
    exceedsMaxOrders: boolean;
  };
  reliability: {
    complaintsCount: number;
    completedOrdersCount: number;
    previousClientOrdersCount: number;
    oftenLate: boolean;
    strongMoveOut: boolean;
    goodWithPets: boolean;
  };
  preferredForClient: boolean;
  preferredPrimary: boolean;
};

export type SuggestedCleanersApiResponse = {
  data: SuggestedCleanerCandidate[] | null;
  error: string | null;
};
