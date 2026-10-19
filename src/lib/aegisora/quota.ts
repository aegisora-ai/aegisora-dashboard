import { admin } from "@/lib/aegisora/server";

export type QuotaResult = { allowed: boolean; reason: string };

export async function evaluateMonthlyQuota(
  workspaceId: string,
  planKey: string | null,
): Promise<QuotaResult> {
  const db = admin();
  const plan = (planKey ?? "").trim().toLowerCase();

  const lim = await db
    .from("plan_limits")
    .select("max_decisions_per_month")
    .eq("plan_key", plan)
    .maybeSingle();

  if (lim.error) {
    return { allowed: false, reason: "Plan limits could not be verified; request failed closed." };
  }
  if (!lim.data) {
    return { allowed: false, reason: "No plan limits are defined for this plan; request failed closed." };
  }

  const max = lim.data.max_decisions_per_month as number | null;
  if (max === null) return { allowed: true, reason: "Unlimited monthly decisions." };

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const used = await db
    .from("decisions")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", start);

  if (used.error) {
    return { allowed: false, reason: "Monthly usage could not be verified; request failed closed." };
  }
  if ((used.count ?? 0) >= max) {
    return { allowed: false, reason: "Monthly decision limit of " + max + " reached for this plan." };
  }
  return { allowed: true, reason: "Within monthly decision limit." };
}