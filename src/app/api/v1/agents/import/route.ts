import { NextResponse } from "next/server";
import { ApiError, admin, authenticate, fail, readJson } from "@/lib/aegisora/server";
import { normalizeAgentInput } from "@/lib/aegisora/agent-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    const body = await readJson(req, 512_000);
    const list = Array.isArray(body.agents) ? (body.agents as Record<string, unknown>[]) : null;
    if (!list || list.length === 0 || list.length > 500) throw new ApiError(400, "invalid_request", "'agents' must be an array of 1-500 items.");

    const map = new Map<string, Record<string, unknown>>();
    for (const a of list) {
      const normalized = normalizeAgentInput(a, auth.workspaceId, "import");
      if (!normalized.row) throw new ApiError(400, "invalid_agent", normalized.error ?? "Invalid agent.");
      map.set(normalized.row.name, normalized.row);
    }
    if (map.size === 0) throw new ApiError(400, "invalid_request", "No valid agents found (each needs a 'name').");
    const { error } = await admin().from("agents").upsert([...map.values()], { onConflict: "workspace_id,name" });
    if (error) throw error;
    return NextResponse.json({ imported: map.size });
  } catch (e) {
    return fail(e);
  }
}
