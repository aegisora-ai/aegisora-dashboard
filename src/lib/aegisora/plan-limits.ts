import { ApiError, admin } from "@/lib/aegisora/server";

export type LimitedResource = "agents" | "members";

const LIMIT_COLUMN = {
  agents: "max_agents",
  members: "max_members",
} as const;

// Kill switch for operations: set AEGISORA_ENFORCE_PLAN_LIMITS=false to disable enforcement.
function enforcementEnabled(): boolean {
  return process.env.AEGISORA_ENFORCE_PLAN_LIMITS !== "false";
}

function unverified(): ApiError {
  return new ApiError(503, "plan_unverified", "Plan limits could not be verified. Please try again.");
}

async function resolvePlanKey(workspaceId: string): Promise<string> {
  const { data, error } = await admin()
    .from("workspace_entitlements")
    .select("plan_key,status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw unverified();
  const status = typeof data?.status === "string" ? data.status.toLowerCase() : null;
  if (!data || status !== "active") {
    throw new ApiError(402, "plan_required", "This workspace has no active plan. Choose a plan to continue.");
  }
  return String(data.plan_key).toLowerCase();
}

async function readLimit(planKey: string, resource: LimitedResource): Promise<number | null> {
  const { data, error } = await admin()
    .from("plan_limits")
    .select("max_agents,max_members")
    .eq("plan_key", planKey)
    .maybeSingle();
  if (error || !data) throw unverified();
  const value = (data as Record<string, unknown>)[LIMIT_COLUMN[resource]];
  return typeof value === "number" ? value : null;
}

async function countCurrent(workspaceId: string, resource: LimitedResource): Promise<number> {
  const db = admin();
  if (resource === "agents") {
    const result = await db
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);
    if (result.error) throw unverified();
    return result.count ?? 0;
  }
  const result = await db
    .from("workspace_members")
    .select("user_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["active", "invited"]);
  if (result.error) throw unverified();
  return result.count ?? 0;
}

export async function assertWithinPlanLimit(
  workspaceId: string,
  resource: LimitedResource,
  adding: number,
): Promise<void> {
  if (!enforcementEnabled() || adding <= 0) return;
  const planKey = await resolvePlanKey(workspaceId);
  const max = await readLimit(planKey, resource);
  if (max === null) return;
  const current = await countCurrent(workspaceId, resource);
  if (current + adding > max) {
    throw new ApiError(
      402,
      "plan_limit_reached",
      `The ${planKey} plan includes up to ${max} ${resource}. Upgrade your plan to add more.`,
    );
  }
}

export async function assertAgentImportWithinLimit(workspaceId: string, names: string[]): Promise<void> {
  if (!enforcementEnabled() || names.length === 0) return;
  const existing = new Set<string>();
  for (let i = 0; i < names.length; i += 100) {
    const chunk = names.slice(i, i + 100);
    const { data, error } = await admin()
      .from("agents")
      .select("name")
      .eq("workspace_id", workspaceId)
      .in("name", chunk);
    if (error) throw unverified();
    for (const row of (data ?? []) as Array<{ name: unknown }>) existing.add(String(row.name));
  }
  const adding = names.filter((name) => !existing.has(name)).length;
  await assertWithinPlanLimit(workspaceId, "agents", adding);
}

export type WorkspacePlanSummary = {
  key: string | null;
  status: string | null;
  limits: {
    decisions_per_month: number | null;
    agents: number | null;
    members: number | null;
    requests_per_minute: number | null;
  } | null;
};

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export async function getWorkspacePlanSummary(workspaceId: string): Promise<WorkspacePlanSummary> {
  const empty: WorkspacePlanSummary = { key: null, status: null, limits: null };
  try {
    const db = admin();
    const ent = await db
      .from("workspace_entitlements")
      .select("plan_key,status")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (ent.error || !ent.data) return empty;
    const key = String(ent.data.plan_key).toLowerCase();
    const status = typeof ent.data.status === "string" ? ent.data.status.toLowerCase() : null;
    const lim = await db
      .from("plan_limits")
      .select("max_decisions_per_month,max_agents,max_members,requests_per_minute")
      .eq("plan_key", key)
      .maybeSingle();
    if (lim.error || !lim.data) return { key, status, limits: null };
    const row = lim.data as Record<string, unknown>;
    return {
      key,
      status,
      limits: {
        decisions_per_month: num(row.max_decisions_per_month),
        agents: num(row.max_agents),
        members: num(row.max_members),
        requests_per_minute: num(row.requests_per_minute),
      },
    };
  } catch {
    return empty;
  }
}