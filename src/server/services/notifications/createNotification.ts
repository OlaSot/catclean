import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

export type NotificationRoleTarget = "admin" | "operator" | "client" | "cleaner";

export type CreateNotificationInput = {
  userId: string;
  roleTarget: NotificationRoleTarget;
  type: string;
  title: string;
  message?: string | null;
  orderId?: string | null;
};

export async function createNotification(input: CreateNotificationInput): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const userId = input.userId.trim();
  const roleTarget = input.roleTarget;
  const type = input.type.trim();
  const title = input.title.trim();
  const message =
    typeof input.message === "string" && input.message.trim()
      ? input.message.trim()
      : null;
  const orderId =
    typeof input.orderId === "string" && input.orderId.trim()
      ? input.orderId.trim()
      : null;

  if (!userId || !type || !title) {
    return { ok: false, error: "Invalid notification input" };
  }

  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { ok: false, error: adminResult.error };
  }

  const { error } = await adminResult.supabase.from("notifications").insert({
    user_id: userId,
    role_target: roleTarget,
    type,
    title,
    message,
    order_id: orderId,
  });

  if (error) {
    console.error("createNotification:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}

export async function createStaffNotifications(input: Omit<CreateNotificationInput, "userId">) {
  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { ok: false, error: adminResult.error };
  }

  const { data: staff, error: staffError } = await adminResult.supabase
    .from("profiles")
    .select("id, role")
    .in("role", ["admin", "operator"]);

  if (staffError) {
    console.error("createStaffNotifications profiles:", staffError);
    return { ok: false, error: staffError.message };
  }

  const ids = (staff ?? [])
    .map((row) => (row as { id: string }).id)
    .filter(Boolean);

  for (const id of ids) {
    const role = ((staff ?? []).find((r) => (r as { id: string }).id === id) as
      | { role?: string | null }
      | undefined)?.role;
    const roleTarget =
      role === "operator" ? ("operator" as const) : ("admin" as const);

    // Best-effort: keep going on partial failures
    // eslint-disable-next-line no-await-in-loop
    await createNotification({ ...input, userId: id, roleTarget });
  }

  return { ok: true, error: null };
}

