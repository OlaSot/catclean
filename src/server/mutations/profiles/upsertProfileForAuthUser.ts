import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileUpsertRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  phone_normalized: string;
  role: "client" | "cleaner";
};

/**
 * Auth signup triggers often insert into public.profiles automatically.
 * Upsert avoids duplicate key on profiles_pkey.
 */
export async function upsertProfileForAuthUser(
  supabase: SupabaseClient,
  row: ProfileUpsertRow
): Promise<{ error: string | null }> {
  const payload = {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    phone_normalized: row.phone_normalized,
    role: row.role,
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (!upsertError) {
    return { error: null };
  }

  const isDuplicate =
    upsertError.code === "23505" ||
    upsertError.message.includes("profiles_pkey");

  if (!isDuplicate) {
    console.error("upsertProfileForAuthUser upsert:", upsertError);
    return { error: upsertError.message };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", row.id);

  if (updateError) {
    console.error("upsertProfileForAuthUser update:", updateError);
    return { error: updateError.message };
  }

  return { error: null };
}
