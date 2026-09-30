import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ApiError, admin, authenticate, fail, readJson, str } from "@/lib/aegisora/server";
import { maskSensitiveData, maskSensitiveText } from "@/lib/aegisora/redaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    const body = await readJson(req, 256_000);
    const agentName = str(body.agent, "agent", 120)!.trim();
    const traceId = str(body.trace_id, "trace_id", 128, false) ?? randomUUID();
    const spans = Array.isArray(body.spans) ? body.spans.slice(0, 500) : [];
    if (spans.length === 0) throw new ApiError(400, "invalid_request", "'spans' must be a non-empty array.");
    if (!agentName || maskSensitiveText(agentName) !== agentName) {
      throw new ApiError(400, "invalid_request", "'agent' must be a non-sensitive identifier.");
    }
    if (maskSensitiveText(traceId) !== traceId) {
      throw new ApiError(400, "invalid_request", "'trace_id' must not contain personal data or credentials.");
    }
    const db = admin();
    const { data: agent } = await db.from("agents").select("id").eq("workspace_id", auth.workspaceId).eq("name", agentName).maybeSingle();
    const { error } = await db.from("traces").insert({
      workspace_id: auth.workspaceId,
      agent_id: agent?.id ?? null,
      agent_name: agentName,
      trace_id: traceId,
      name: maskSensitiveText(str(body.name, "name", 200, false) ?? "imported trace"),
      status: maskSensitiveText(str(body.status, "status", 30, false) ?? "ok"),
      duration_ms: typeof body.duration_ms === "number" ? Math.round(body.duration_ms) : null,
      spans: maskSensitiveData(spans),
    });
    if (error) throw error;
    return NextResponse.json({ trace_id: traceId, spans: spans.length });
  } catch (e) {
    return fail(e);
  }
}
