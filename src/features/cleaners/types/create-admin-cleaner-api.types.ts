import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";

export type CreateAdminCleanerRequestBody = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  status: "active" | "pending";
  baseCity: string;
  workingRadiusKm: number;
  petFriendly?: boolean;
  ownsVacuum?: boolean;
  ownsSteamCleaner?: boolean;
  acceptsWindows?: boolean;
  acceptsDryCleaning?: boolean;
};

export type CreateAdminCleanerApiResponse = {
  data: ActiveCleaner | null;
  error: string | null;
};
