/**
 * Seeds demo cleaners and clients. Safe to re-run: skips existing emails.
 * Removes legacy Warsaw/Poland demo clients on each run.
 *
 * Usage: npm run seed:examples
 * Demo password for all accounts: demo1234
 */

import { createAdminCleaner } from "../src/server/mutations/cleaners/createAdminCleaner";
import { createAdminClient } from "../src/server/mutations/clients/createAdminClient";
import { createSupabaseAdminClient } from "../src/lib/supabase/supabaseAdmin";
import { deleteDemoUserByEmail } from "./lib/delete-demo-user";
import { loadEnv } from "./lib/load-env";

const DEMO_PASSWORD = "demo1234";

/** Retired demo clients (Warsaw / Poland locales). */
const LEGACY_CLIENT_EMAILS = [
  "jan.kowalczyk@catclean.demo",
  "katarzyna.zielinska@catclean.demo",
  "office@greenleaf.pl",
  "recepcja@hotelbaltic.demo",
];

const CLEANERS = [
  {
    email: "anna.kowalska@catclean.demo",
    fullName: "Anna Weber",
    phone: "+49 511 111 0001",
    status: "active" as const,
    baseCity: "Hannover",
    workingRadiusKm: 15,
    petFriendly: true,
    ownsVacuum: true,
    ownsSteamCleaner: false,
    acceptsWindows: true,
    acceptsDryCleaning: false,
  },
  {
    email: "piotr.nowak@catclean.demo",
    fullName: "Peter Nowak",
    phone: "+49 511 111 0002",
    status: "active" as const,
    baseCity: "Hannover",
    workingRadiusKm: 20,
    petFriendly: false,
    ownsVacuum: true,
    ownsSteamCleaner: true,
    acceptsWindows: true,
    acceptsDryCleaning: true,
  },
  {
    email: "maria.wisniewska@catclean.demo",
    fullName: "Maria Wagner",
    phone: "+49 511 111 0003",
    status: "pending" as const,
    baseCity: "Hannover",
    workingRadiusKm: 12,
    petFriendly: true,
    ownsVacuum: false,
    ownsSteamCleaner: false,
    acceptsWindows: false,
    acceptsDryCleaning: true,
  },
  {
    email: "tomasz.lewandowski@catclean.demo",
    fullName: "Thomas Bauer",
    phone: "+49 511 111 0004",
    status: "active" as const,
    baseCity: "Hannover",
    workingRadiusKm: 25,
    petFriendly: true,
    ownsVacuum: true,
    ownsSteamCleaner: true,
    acceptsWindows: true,
    acceptsDryCleaning: true,
  },
];

const CLIENTS = [
  {
    email: "john.mueller@catclean.demo",
    fullName: "John Mueller",
    phone: "+49 511 222 0001",
    clientType: "private" as const,
  },
  {
    email: "lisa.schmidt@catclean.demo",
    fullName: "Lisa Schmidt",
    phone: "+49 511 222 0002",
    clientType: "private" as const,
  },
  {
    email: "office@greenleaf.de",
    fullName: "Mark Brooks",
    phone: "+49 511 222 0003",
    clientType: "business" as const,
    companyName: "Green Leaf GmbH",
  },
  {
    email: "reception@hotelbaltic.demo",
    fullName: "Eva Malinowski",
    phone: "+49 511 222 0004",
    clientType: "business" as const,
    companyName: "Hotel Baltic Hannover",
  },
];

function isAlreadyRegistered(error: string | null): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("user already")
  );
}

async function removeLegacyDemoClients() {
  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    console.warn(`Skipping legacy cleanup: ${admin.error}`);
    return;
  }

  console.log("\n--- Legacy clients (Warsaw/Poland) ---");
  for (const email of LEGACY_CLIENT_EMAILS) {
    try {
      const { deleted, ordersRemoved } = await deleteDemoUserByEmail(
        admin.supabase,
        email
      );
      if (deleted) {
        console.log(`✓ removed ${email} (${ordersRemoved} order(s))`);
      } else {
        console.log(`○ ${email} — not found`);
      }
    } catch (err) {
      console.error(
        `✗ ${email}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

async function syncExistingCleaner(
  email: string,
  patch: {
    fullName: string;
    phone: string;
    baseCity: string;
  }
) {
  const admin = createSupabaseAdminClient();
  if (!admin.supabase) return;

  const { data: profile } = await admin.supabase
    .from("profiles")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();

  if (!profile?.id) return;

  await admin.supabase
    .from("profiles")
    .update({
      full_name: patch.fullName,
      phone: patch.phone,
    })
    .eq("id", profile.id);

  await admin.supabase
    .from("cleaner_profiles")
    .update({ base_city: patch.baseCity })
    .eq("profile_id", profile.id);
}

async function seedCleaners() {
  console.log("\n--- Cleaners (Hannover) ---");
  for (const cleaner of CLEANERS) {
    const { cleaner: created, error } = await createAdminCleaner({
      ...cleaner,
      password: DEMO_PASSWORD,
    });

    if (created) {
      console.log(`✓ ${created.name} <${created.email}> [${created.status}]`);
      continue;
    }

    if (isAlreadyRegistered(error)) {
      await syncExistingCleaner(cleaner.email, {
        fullName: cleaner.fullName,
        phone: cleaner.phone,
        baseCity: cleaner.baseCity,
      });
      console.log(
        `○ ${cleaner.fullName} <${cleaner.email}> — exists, synced Hannover profile`
      );
      continue;
    }

    console.error(`✗ ${cleaner.email}: ${error ?? "unknown error"}`);
  }
}

async function seedClients() {
  console.log("\n--- Clients (Hannover) ---");
  for (const client of CLIENTS) {
    const { client: created, error } = await createAdminClient({
      ...client,
      password: DEMO_PASSWORD,
    });

    if (created) {
      console.log(
        `✓ ${created.name} <${created.email}> [${created.clientType}]`
      );
      continue;
    }

    if (isAlreadyRegistered(error)) {
      console.log(`○ ${client.fullName} <${client.email}> — already exists, skipped`);
      continue;
    }

    console.error(`✗ ${client.email}: ${error ?? "unknown error"}`);
  }
}

async function main() {
  loadEnv();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  console.log("Seeding CatClean demo users (password: demo1234)…");
  await removeLegacyDemoClients();
  await seedCleaners();
  await seedClients();
  console.log("\nDone. Demo region: Hannover, Germany.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
