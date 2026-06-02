/**
 * Backfill profiles.phone_normalized from profiles.phone (E.164).
 * Logs invalid numbers and duplicate groups; does not delete or merge rows.
 *
 * Usage: npm run normalize:phones
 */

import { loadEnv } from "./lib/load-env";
import { createSupabaseAdminClient } from "../src/lib/supabase/supabaseAdmin";
import { normalizePhone } from "../src/lib/phone/normalize-phone";

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  phone: string | null;
};

async function main() {
  loadEnv();

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    console.error(admin.error ?? "Missing Supabase admin client");
    process.exit(1);
  }

  const supabase = admin.supabase;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, role, phone")
    .not("phone", "is", null);

  if (error) {
    console.error("Failed to load profiles:", error.message);
    process.exit(1);
  }

  const rows = (profiles ?? []) as ProfileRow[];
  console.log(`Loaded ${rows.length} profile(s) with non-null phone.\n`);

  const invalid: { id: string; email: string | null; phone: string | null }[] = [];
  const byNormalized = new Map<
    string,
    { id: string; email: string | null; role: string | null; phone: string | null }[]
  >();

  for (const row of rows) {
    const raw = row.phone ?? "";
    const normalized = normalizePhone(raw);
    if (!normalized) {
      invalid.push({ id: row.id, email: row.email, phone: row.phone });
      continue;
    }

    const group = byNormalized.get(normalized) ?? [];
    group.push(row);
    byNormalized.set(normalized, group);
  }

  const duplicateGroups = [...byNormalized.entries()].filter(
    ([, group]) => group.length > 1
  );
  const duplicateIds = new Set(
    duplicateGroups.flatMap(([, group]) => group.map((p) => p.id))
  );

  let updated = 0;
  let skippedDuplicate = 0;
  let skippedInvalid = invalid.length;

  for (const row of rows) {
    if (invalid.some((i) => i.id === row.id)) continue;
    if (duplicateIds.has(row.id)) {
      skippedDuplicate += 1;
      continue;
    }

    const normalized = normalizePhone(row.phone ?? "");
    if (!normalized) continue;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: normalized,
        phone_normalized: normalized,
      })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Update failed for ${row.id}:`, updateError.message);
      continue;
    }

    updated += 1;
  }

  console.log("--- Summary ---");
  console.log(`Updated: ${updated}`);
  console.log(`Invalid (skipped): ${skippedInvalid}`);
  console.log(`Duplicates (skipped): ${skippedDuplicate}`);

  if (invalid.length > 0) {
    console.log("\n--- Invalid phone numbers ---");
    for (const item of invalid) {
      console.log(
        `  id=${item.id} email=${item.email ?? "—"} phone="${item.phone ?? ""}"`
      );
    }
  }

  if (duplicateGroups.length > 0) {
    console.log("\n--- Duplicate normalized phones (manual merge required) ---");
    for (const [normalized, group] of duplicateGroups) {
      console.log(`  ${normalized}:`);
      for (const p of group) {
        console.log(
          `    - id=${p.id} role=${p.role ?? "—"} email=${p.email ?? "—"} raw="${p.phone ?? ""}"`
        );
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
