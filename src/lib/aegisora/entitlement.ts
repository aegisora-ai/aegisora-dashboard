import { admin } from "@/lib/aegisora/server";

export type ExecutionEntitlementResult = {
  allowed: boolean;
  status: string | null;
  planKey: string | null;
  reason: string;
};

const ACTIVE_STATUSES = new Set<string>(["active"]);

function normalizedString(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

export async function evaluateWorkspaceExecutionEntitlement(
  workspaceId: string,
): Promise<ExecutionEntitlementResult> {
  const db = admin();

  const [result, workspaceResult] = await Promise.all([
    db
      .from("workspace_entitlements")
      .select("*")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .maybeSingle(),
    db
      .from("workspaces")
      .select("account_type, pilot_ends_at")
      .eq("id", workspaceId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (result.error || workspaceResult.error) {
    return {
      allowed: false,
      status: null,
      planKey: null,
      reason: "Execution entitlement could not be verified; request failed closed.",
    };
  }

  const row =
    result.data &&
    typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : null;

  if (!row) {
    return {
      allowed: false,
      status: null,
      planKey: null,
      reason: "No workspace execution entitlement is active.",
    };
  }

  const status = normalizedString(row.status)?.toLowerCase() ?? null;
  const planKey = normalizedString(row.plan_key);

  if (!status || !ACTIVE_STATUSES.has(status)) {
    return {
      allowed: false,
      status,
      planKey,
      reason: "Workspace execution entitlement is not active.",
    };
  }

  const workspace =
    workspaceResult.data &&
    typeof workspaceResult.data === "object"
      ? (workspaceResult.data as Record<string, unknown>)
      : null;

  if (!workspace) {
    return {
      allowed: false,
      status,
      planKey,
      reason: "Workspace could not be found; request failed closed.",
    };
  }

  // Pilot workspaces have a hard end date. Paid workspaces are not affected.
  const accountType =
    normalizedString(workspace.account_type)?.toLowerCase() ?? "standard";

  if (accountType === "pilot") {
    const endsAt =
      typeof workspace.pilot_ends_at === "string"
        ? Date.parse(workspace.pilot_ends_at)
        : Number.NaN;

    if (!Number.isFinite(endsAt) || endsAt <= Date.now()) {
      return {
        allowed: false,
        status,
        planKey,
        reason: "The pilot period for this workspace has ended.",
      };
    }
  }

  return {
    allowed: true,
    status,
    planKey,
    reason: "Workspace execution entitlement is active.",
  };
}
