import { NextResponse } from "next/server";
import { admin } from "@/lib/aegisora/server";
import { authenticateUser, requireWorkspacePermission } from "@/lib/aegisora/rbac-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    const workspaceId = req.headers.get("x-workspace-id")?.trim() ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(workspaceId)) {
      return errorResponse(400, "invalid_workspace", "X-Workspace-Id header must contain a workspace UUID.");
    }

    
    await requireWorkspacePermission(user.id, workspaceId, "workspace:read");

    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const db = admin();
    const base = () => db.from("decisions").select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId).gte("created_at", windowStart.toISOString()).lt("created_at", windowEnd.toISOString());
    const [total, allow, block, escalate] = await Promise.all([
      base(), base().eq("decision", "ALLOW"), base().eq("decision", "BLOCK"), base().eq("decision", "ESCALATE"),
    ]);
    const failed = [total, allow, block, escalate].find((result) => result.error);
    if (failed?.error) throw failed.error;

    return NextResponse.json({
      workspace_id: workspaceId,
      window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
      evaluations: { total: total.count ?? 0, allow: allow.count ?? 0, block: block.count ?? 0, escalate: escalate.count ?? 0 },
      source: "persisted governance decisions",
      billing_status: "not_connected",
      measured_at: now.toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;
    if (status === 401) return errorResponse(401, "unauthorized", "A valid Supabase session is required.");
    if (status === 403) return errorResponse(403, "forbidden", "An active workspace membership is required.");
    console.error("[aegisora] Workspace usage query failed.");
    return errorResponse(500, "internal_error", "Unable to read workspace usage.");
  }
}
