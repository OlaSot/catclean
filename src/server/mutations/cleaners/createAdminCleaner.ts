import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import {
  checkDuplicateProfilePhone,
  DUPLICATE_PHONE_MESSAGE,
  isPhoneNormalizedDuplicateError,
  validateProfilePhone,
} from "@/lib/phone/profile-phone";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { upsertProfileForAuthUser } from "@/server/mutations/profiles/upsertProfileForAuthUser";

export type CreateAdminCleanerInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  status: "active" | "pending";
  baseCity: string;
  workingRadiusKm: number;
  petFriendly: boolean;
  ownsVacuum: boolean;
  ownsSteamCleaner: boolean;
  acceptsWindows: boolean;
  acceptsDryCleaning: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(
  input: CreateAdminCleanerInput
): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim();
  const fullName = input.fullName.trim();
  const baseCity = input.baseCity.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Valid email is required" };
  }

  if (!input.password || input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  if (!fullName) {
    return { ok: false, error: "Full name is required" };
  }

  if (input.status !== "active" && input.status !== "pending") {
    return { ok: false, error: "Status must be active or pending" };
  }

  if (!baseCity) {
    return { ok: false, error: "Base city is required" };
  }

  if (
    !Number.isFinite(input.workingRadiusKm) ||
    input.workingRadiusKm < 0 ||
    input.workingRadiusKm > 500
  ) {
    return { ok: false, error: "Working radius must be between 0 and 500 km" };
  }

  return { ok: true };
}

async function rollbackAuthUser(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>["supabase"]>,
  userId: string
) {
  await supabase.from("cleaner_profiles").delete().eq("profile_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.auth.admin.deleteUser(userId);
}

export async function createAdminCleaner(
  input: CreateAdminCleanerInput
): Promise<{ cleaner: ActiveCleaner | null; error: string | null }> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { cleaner: null, error: validation.error };
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return { cleaner: null, error: admin.error };
  }

  const supabase = admin.supabase;
  const email = input.email.trim().toLowerCase();
  const phoneFields = validateProfilePhone(input.phone);
  if (!phoneFields.ok) {
    return { cleaner: null, error: phoneFields.error };
  }

  const duplicateCheck = await checkDuplicateProfilePhone(
    supabase,
    phoneFields.fields.phoneNormalized
  );
  if (duplicateCheck.error) {
    return { cleaner: null, error: duplicateCheck.error };
  }
  if (duplicateCheck.duplicate) {
    return { cleaner: null, error: DUPLICATE_PHONE_MESSAGE };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (authError) {
    console.error("createAdminCleaner auth:", authError);
    return { cleaner: null, error: authError.message };
  }

  const userId = authData.user.id;

  const profileResult = await upsertProfileForAuthUser(supabase, {
    id: userId,
    email,
    full_name: input.fullName.trim(),
    phone: phoneFields.fields.phone,
    phone_normalized: phoneFields.fields.phoneNormalized,
    role: "cleaner",
  });

  if (profileResult.error) {
    await supabase.auth.admin.deleteUser(userId);
    if (isPhoneNormalizedDuplicateError({ message: profileResult.error })) {
      return { cleaner: null, error: DUPLICATE_PHONE_MESSAGE };
    }
    return { cleaner: null, error: profileResult.error };
  }

  const { data: cleanerProfileRow, error: cleanerProfileError } = await supabase
    .from("cleaner_profiles")
    .upsert(
      {
        profile_id: userId,
        status: input.status,
        base_city: input.baseCity.trim(),
        working_radius_km: input.workingRadiusKm,
        pet_friendly: input.petFriendly,
        owns_vacuum: input.ownsVacuum,
        owns_steam_cleaner: input.ownsSteamCleaner,
        accepts_windows: input.acceptsWindows,
        accepts_dry_cleaning: input.acceptsDryCleaning,
      },
      { onConflict: "profile_id" }
    )
    .select("id")
    .single();

  if (cleanerProfileError) {
    console.error("createAdminCleaner cleaner_profiles:", cleanerProfileError);
    await rollbackAuthUser(supabase, userId);
    return { cleaner: null, error: cleanerProfileError.message };
  }

  const cleanerProfileId =
    typeof cleanerProfileRow?.id === "string" ? cleanerProfileRow.id : null;

  return {
    cleaner: {
      id: userId,
      cleanerProfileId,
      name: input.fullName.trim(),
      email,
      phone: phoneFields.fields.phone,
      avatarUrl: null,
      baseCity: input.baseCity.trim(),
      rating: null,
      status: input.status,
      petFriendly: input.petFriendly,
      ownsVacuum: input.ownsVacuum,
      ownsSteamCleaner: input.ownsSteamCleaner,
      acceptsWindows: input.acceptsWindows,
      acceptsDryCleaning: input.acceptsDryCleaning,
      maxDailyHours: 8,
      maxOrdersPerDay: 4,
      preferredWorkCities: [],
      isAcceptingOrders: true,
    },
    error: null,
  };
}
