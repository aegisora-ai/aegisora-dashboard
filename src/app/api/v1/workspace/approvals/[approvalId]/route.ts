import { NextResponse } from "next/server";
import { authenticateUser, requireAal2, requireWorkspacePermission } from "@/lib/aegisora/rbac-http";
import { admin, ApiError, fail, readJson, str } from "@/lib/aegisora/server";
import { maskSensitiveText } from "@/lib/aegisora/redaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ approvalId: string }> },
) {
  try {
    const { user, aal } = await authenticateUser(req);
    requireAal2(aal);

    const { approvalId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(approvalId)) {
      throw new ApiError(400, "invalid_request", "Invalid approval id.");
    }

    const body = await readJson(req, 8192);
    const status = str(body.status, "status", 16);
    if (status !== "approved" && status !== "rejected") {
      throw new ApiError(400, "invalid_request", "Status must be approved or rejected.");
    }

    const rawNote = str(body.note, "note", 2000);
    const note = rawNote?.trim() ?? "";
    if (!note) {
      throw new ApiError(400, "invalid_request", "A resolution reason is required.");
    }

    const safeNote = maskSensitiveText(note);
    if (!safeNote.trim()) {
      throw new ApiError(400, "invalid_request", "The resolution reason is empty after redaction.");
    }

    const db = admin();
    const { data: existing, error: lookupError } = await db
      .from("approvals")
      .select("id,workspace_id,status,expires_at,decision_id")
      .eq("id", approvalId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) {
      throw new ApiError(404, "not_found", "Approval not found.");
    }

    await requireWorkspacePermission(
      user.id,
      existing.workspace_id as string,
      "governance:manage",
    );

    if (String(existing.status).toLowerCase() !== "pending") {
      throw new ApiError(409, "approval_conflict", "This approval has already been resolved. Refresh the list.");
    }

    const expiresAt = Date.parse(String(existing.expires_at ?? ""));
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      throw new ApiError(409, "approval_expired", "This approval has expired and cannot be resolved.");
    }

    const resolvedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await db
      .from("approvals")
      .update({
        status,
        note: safeNote,
        resolved_at: resolvedAt,
        resolved_by: user.id,
      })
      .eq("id", approvalId)
      .eq("status", "pending")
      .gt("expires_at", resolvedAt)
      .select("id,decision_id,status,expires_at,resolved_at,resolved_by,note")
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      throw new ApiError(
        409,
        "approval_conflict",
        "The approval expired or was resolved by another request. Refresh the list.",
      );
    }

    return NextResponse.json(
      {
        approval: updated,
        may_execute: updated.status === "approved",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}