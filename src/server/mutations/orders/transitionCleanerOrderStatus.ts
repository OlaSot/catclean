import type { SupabaseClient } from "@supabase/supabase-js";

type CleanerTransitionTarget = "in_progress" | "completed";

type CleanerTransitionRpcResult = {
  ok: boolean;
  errorCode?: "forbidden" | "invalid_target" | "not_found" | "invalid_transition";
  oldStatus?: string;
  newStatus?: string;
};

export async function transitionCleanerOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  targetStatus: CleanerTransitionTarget
): Promise<{
  ok: boolean;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  conflict?: boolean;
}> {
  const id = orderId.trim();
  if (!id) return { ok: false, error: "Invalid order id" };

  const { data, error } = await supabase.rpc("transition_cleaner_order_status", {
    p_order_id: id,
    p_target_status: targetStatus,
  });

  if (error) {
    console.error("transitionCleanerOrderStatus:", error);
    return { ok: false, error: error.message };
  }

  const result = data as CleanerTransitionRpcResult | null;
  if (!result?.ok) {
    if (result?.errorCode === "not_found") {
      return { ok: false, error: "Order not found", notFound: true };
    }
    if (result?.errorCode === "forbidden") {
      return { ok: false, error: "Forbidden", forbidden: true };
    }
    if (result?.errorCode === "invalid_transition") {
      return {
        ok: false,
        error: `Cannot change order from status "${result.oldStatus ?? "unknown"}"`,
        conflict: true,
      };
    }
    return { ok: false, error: "Invalid cleaner order transition" };
  }

  return { ok: true, error: null };
}
