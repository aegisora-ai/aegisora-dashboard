import { NextResponse } from "next/server";
import { ApiError, admin, authenticate, fail } from "@/lib/aegisora/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "invalid_request", "Invalid decision id.");
    const db = admin();
    const { data: d } = await db
      .from("decisions")
      .select("id,decision,reason,agent_id,trace_id,created_at,policy_id,risk_score")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .maybeSingle();
    if (!d) throw new ApiError(404, "not_found", "Decision not found.");

    const { data: ev } = await db.from("evidence").select("payload").eq("decision_id", id).maybeSingle();
    const payload = (ev?.payload ?? {}) as Record<string, unknown>;
    const agentName = (payload.agent_name as string) ?? null;
    const action = (payload.action as string) ?? null;
    const resource = (payload.resource as string) ?? null;

    let approval: Record<string, unknown> | null = null;
    if (d.decision === "ESCALATE") {
      const { data: a } = await db.from("approvals").select("id,status,expires_at,resolved_at,note").eq("decision_id", id).maybeSingle();
      approval = a;
      if (a && a.status === "pending" && new Date(a.expires_at as string) < new Date()) {
        await db.from("approvals").update({ status: "expired" }).eq("id", a.id);
        approval = { ...a, status: "expired" };
      }
    }
    const mayExecute = d.decision === "ALLOW" || (d.decision === "ESCALATE" && approval?.status === "approved");
    return NextResponse.json({ ...d, agent_name: agentName, action, resource, approval, may_execute: mayExecute });
  } catch (e) {
    return fail(e);
  }
}