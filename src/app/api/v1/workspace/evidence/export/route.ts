import { NextResponse } from "next/server";
import { admin } from "@/lib/aegisora/server";
import { authenticateUser, requireWorkspacePermission } from "@/lib/aegisora/rbac-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE = 1000;
const MAX_PAGES = 200;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    const workspaceId = req.headers.get("x-workspace-id")?.trim() ?? "";
    if (!UUID_RE.test(workspaceId)) {
      return errorResponse(400, "invalid_workspace", "X-Workspace-Id header must contain a workspace UUID.");
    }
    await requireWorkspacePermission(user.id, workspaceId, "workspace:manage");

    const db = admin();
    const rows: unknown[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const { data, error } = await db
        .rpc("evidence_export", { ws: workspaceId })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (error) throw error;
      const batch = (data ?? []) as unknown[];
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }

    let serverCheck: { total: number; broken: number } | null = null;
    try {
      const { data } = await db.rpc("evidence_verify_core", { ws: workspaceId });
      const r = Array.isArray(data) ? data[0] : data;
      if (r) serverCheck = { total: Number(r.total), broken: Number(r.broken) };
    } catch {
      serverCheck = null;
    }

    const body = {
      format: "aegisora-evidence-export/1",
      workspace_id: workspaceId,
      exported_at: new Date().toISOString(),
      hash_algorithm: "sha256",
      hash_version_2_fields: [
        "prev_hash", "workspace_id", "seq", "id", "decision_id", "action",
        "decision", "trace_id", "created_at_utc", "payload_text",
      ],
      total: rows.length,
      server_check: serverCheck,
      records: rows,
    };
    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="aegisora-evidence-${workspaceId}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;
    if (status === 401) return errorResponse(401, "unauthorized", "A valid Supabase session is required.");
    if (status === 403) return errorResponse(403, "forbidden", "An active workspace membership is required.");
    console.error("[aegisora] Evidence export failed.");
    return errorResponse(500, "internal_error", "Unable to export evidence.");
  }
}