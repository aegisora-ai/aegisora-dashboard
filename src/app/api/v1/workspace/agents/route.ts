import { NextResponse } from "next/server";
import { ApiError, admin, readJson } from "@/lib/aegisora/server";
import { authenticateUser, requireAal2, requireWorkspacePermission } from "@/lib/aegisora/rbac-http";
import { normalizeAgentInput, type AgentWrite } from "@/lib/aegisora/agent-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: Request) {
  try {
    const { user, aal } = await authenticateUser(req);
    const body = await readJson(req, 512_000);
    const workspaceId = typeof body.workspace_id === "string" ? body.workspace_id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(workspaceId)) {
      throw new ApiError(400, "invalid_request", "'workspace_id' must be a UUID.");
    }
    await requireWorkspacePermission(user.id, workspaceId, "governance:manage");
    requireAal2(aal);

    const operation = body.operation;
    const db = admin();
    if (operation === "create") {
      const normalized = normalizeAgentInput(body.agent, workspaceId, "manual");
      if (!normalized.row) throw new ApiError(400, "invalid_agent", normalized.error ?? "Invalid agent.");
      const { data, error } = await db.from("agents").insert(normalized.row).select("id").single();
      if (error) throw error;
      return NextResponse.json({ id: data.id }, { status: 201 });
    }

    if (operation === "import") {
      const agents = Array.isArray(body.agents) ? body.agents : null;
      if (!agents || agents.length === 0 || agents.length > 500) {
        throw new ApiError(400, "invalid_request", "'agents' must be an array of 1–500 items.");
      }
      const rows = new Map<string, AgentWrite>();
      for (const agent of agents) {
        const normalized = normalizeAgentInput(agent, workspaceId, "import");
        if (!normalized.row) throw new ApiError(400, "invalid_agent", normalized.error ?? "Invalid agent in import.");
        rows.set(normalized.row.name, normalized.row);
      }
      const { error } = await db.from("agents").upsert([...rows.values()], { onConflict: "workspace_id,name" });
      if (error) throw error;
      return NextResponse.json({ imported: rows.size });
    }

    if (operation === "update") {
      const agentId = typeof body.agent_id === "string" ? body.agent_id : "";
      const state = body.state;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(agentId) || (state !== "ACTIVE" && state !== "DISABLED")) {
        throw new ApiError(400, "invalid_request", "'agent_id' and a valid state are required.");
      }
      const { data, error } = await db.from("agents").update({ state }).eq("id", agentId).eq("workspace_id", workspaceId).select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new ApiError(404, "not_found", "Agent not found in this workspace.");
      return NextResponse.json({ updated: true });
    }

    if (operation === "delete") {
      const agentId = typeof body.agent_id === "string" ? body.agent_id : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(agentId)) {
        throw new ApiError(400, "invalid_request", "'agent_id' must be a UUID.");
      }
      const { data, error } = await db.from("agents").delete().eq("id", agentId).eq("workspace_id", workspaceId).select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new ApiError(404, "not_found", "Agent not found in this workspace.");
      return NextResponse.json({ deleted: true });
    }

    throw new ApiError(400, "invalid_request", "Unsupported agent operation.");
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;
    if (status === 401) return errorResponse(401, "unauthorized", "A valid Supabase session is required.");
    if (status === 403) {
      const mfaRequired = error instanceof Error && error.message.startsWith("Complete multi-factor");
      return errorResponse(403, mfaRequired ? "mfa_required" : "forbidden", error instanceof Error ? error.message : "Forbidden.");
    }
    if (error instanceof ApiError) return errorResponse(error.status, error.code, error.message);
    console.error("[aegisora] Workspace agent operation failed.", error);
    return errorResponse(500, "internal_error", "Unable to complete the workspace agent operation.");
  }
}
