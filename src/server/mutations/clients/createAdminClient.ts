import type { AdminClient } from "@/entities/client/admin-client.types";
import {
  checkDuplicateProfilePhone,
  DUPLICATE_PHONE_MESSAGE,
  isPhoneNormalizedDuplicateError,
  validateProfilePhone,
} from "@/lib/phone/profile-phone";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { upsertProfileForAuthUser } from "@/server/mutations/profiles/upsertProfileForAuthUser";

export type CreateAdminClientInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  clientType: "private" | "business";
  companyName?: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(
  input: CreateAdminClientInput
): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim();
  const password = input.password;
  const fullName = input.fullName.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Valid email is required" };
  }

  if (!password || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  if (!fullName) {
    return { ok: false, error: "Full name is required" };
  }

  if (input.clientType !== "private" && input.clientType !== "business") {
    return { ok: false, error: "Client type must be private or business" };
  }

  return { ok: true };
}

async function rollbackAuthUser(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>["supabase"]>,
  userId: string
) {
  await supabase.from("client_profiles").delete().eq("profile_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.auth.admin.deleteUser(userId);
}

export async function createAdminClient(
  input: CreateAdminClientInput
): Promise<{ client: AdminClient | null; error: string | null }> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { client: null, error: validation.error };
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return { client: null, error: admin.error };
  }

  const supabase = admin.supabase;
  const email = input.email.trim().toLowerCase();
  const companyName = input.companyName?.trim() || null;
  const phoneFields = validateProfilePhone(input.phone);
  if (!phoneFields.ok) {
    return { client: null, error: phoneFields.error };
  }

  const duplicateCheck = await checkDuplicateProfilePhone(
    supabase,
    phoneFields.fields.phoneNormalized
  );
  if (duplicateCheck.error) {
    return { client: null, error: duplicateCheck.error };
  }
  if (duplicateCheck.duplicate) {
    return { client: null, error: DUPLICATE_PHONE_MESSAGE };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (authError) {
    console.error("createAdminClient auth:", authError);
    return { client: null, error: authError.message };
  }

  const userId = authData.user.id;

  const profileResult = await upsertProfileForAuthUser(supabase, {
    id: userId,
    email,
    full_name: input.fullName.trim(),
    phone: phoneFields.fields.phone,
    phone_normalized: phoneFields.fields.phoneNormalized,
    role: "client",
  });

  if (profileResult.error) {
    await supabase.auth.admin.deleteUser(userId);
    if (isPhoneNormalizedDuplicateError({ message: profileResult.error })) {
      return { client: null, error: DUPLICATE_PHONE_MESSAGE };
    }
    return { client: null, error: profileResult.error };
  }

  const { error: clientProfileError } = await supabase
    .from("client_profiles")
    .upsert(
      {
        profile_id: userId,
        client_type: input.clientType,
        company_name: companyName,
      },
      { onConflict: "profile_id" }
    );

  if (clientProfileError) {
    const isDuplicate =
      clientProfileError.code === "23505" ||
      clientProfileError.message.includes("client_profiles");

    if (isDuplicate) {
      const { error: updateCpError } = await supabase
        .from("client_profiles")
        .update({
          client_type: input.clientType,
          company_name: companyName,
        })
        .eq("profile_id", userId);

      if (!updateCpError) {
        return {
          client: {
            id: userId,
            name: input.fullName.trim(),
            email,
            phone: phoneFields.fields.phone,
            clientType: input.clientType,
            companyName,
            avatarUrl: null,
            internalNote: null,
            ordersCount: 0,
            lastOrderDate: null,
          },
          error: null,
        };
      }
    }

    console.error("createAdminClient client_profiles:", clientProfileError);
    await rollbackAuthUser(supabase, userId);
    return { client: null, error: clientProfileError.message };
  }

  return {
    client: {
      id: userId,
      name: input.fullName.trim(),
      email,
      phone: phoneFields.fields.phone,
      clientType: input.clientType,
      companyName,
      avatarUrl: null,
      internalNote: null,
      ordersCount: 0,
      lastOrderDate: null,
    },
    error: null,
  };
}
