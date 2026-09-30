import { NextResponse } from "next/server";
import { ApiError, readJson } from "@/lib/aegisora/server";
import { authenticateUser, requireAal2, requireWorkspacePermission } from "@/lib/aegisora/rbac-http";
import { maskSensitiveText } from "@/lib/aegisora/redaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

function field(value: unknown, name: string, max: number, fallback = ""): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "string" || value.trim().length > max) throw new ApiError(400, "invalid_request", `'${name}' must be a string up to ${max} characters.`);
  const normalized = value.trim();
  if (maskSensitiveText(normalized) !== normalized) throw new ApiError(400, "invalid_request", `'${name}' must not contain personal data or credentials.`);
  return normalized;
}

export async function POST(req: Request) {
  try {
    const { user, aal, supabase } = await authenticateUser(req);
    const body = await readJson(req, 32_000);
    const workspaceId = typeof body.workspace_id === "string" ? body.workspace_id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(workspaceId)) {
      throw new ApiError(400, "invalid_workspace", "'workspace_id' must be a UUID.");
    }
    await requireWorkspacePermission(user.id, workspaceId, "governance:manage");
    requireAal2(aal);

    const name = field(body.name, "name", 120);
    const actionPattern = field(body.action_pattern, "action_pattern", 200, "*") || "*";
    const resourcePattern = field(body.resource_pattern, "resource_pattern", 500, "*") || "*";
    const decision = body.decision;
    if (!name || !["ALLOW", "BLOCK", "ESCALATE"].includes(String(decision))) {
      throw new ApiError(400, "invalid_request", "A name and ALLOW, BLOCK, or ESCALATE decision are required.");
    }
    const priority: unknown = body.priority === undefined ? 100 : body.priority;
    if (typeof priority !== "number" || !Number.isInteger(priority) || priority < 0 || priority > 10_000) throw new ApiError(400, "invalid_request", "'priority' must be an integer from 0 to 10000.");

    let agentId: string | null = null;
    if (body.agent_id !== undefined && body.agent_id !== null && body.agent_id !== "") {
      if (typeof body.agent_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.agent_id)) {
        throw new ApiError(400, "invalid_request", "'agent_id' must be a UUID.");
      }
      const { data: agent, error } = await supabase.from("agents").select("id").eq("id", body.agent_id).eq("workspace_id", workspaceId).maybeSingle();
      if (error) throw error;
      if (!agent) throw new ApiError(404, "agent_not_found", "Agent not found in this workspace.");
      agentId = agent.id;
    }

    // Use the caller's verified JWT so RLS and the database audit trigger retain
    // actor attribution; the service-role client is deliberately not used here.
    const { data, error } = await supabase.from("policies").insert({
      workspace_id: workspaceId,
      name,
      agent_id: agentId,
      action_pattern: actionPattern,
      resource_pattern: resourcePattern,
      decision,
      priority,
      enabled: true,
    }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status) : 500;
    if (status === 401) return errorResponse(401, "unauthorized", "A valid Supabase session is required.");
    if (status === 403) {
      const mfaRequired = error instanceof Error && error.message.startsWith("Complete multi-factor");
      return errorResponse(403, mfaRequired ? "mfa_required" : "forbidden", error instanceof Error ? error.message : "Forbidden.");
    }
    if (error instanceof ApiError) return errorResponse(error.status, error.code, error.message);
    console.error("[aegisora] Workspace policy creation failed.");
    return errorResponse(500, "internal_error", "Unable to create the workspace policy.");
  }
}
