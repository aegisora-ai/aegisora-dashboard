import { NextResponse } from "next/server";
import {
  authenticateUser,
  normalizeRole,
  requireAal2,
  requireWorkspacePermission,
  WORKSPACE_ROLES,
} from "@/lib/aegisora/rbac-http";
import { admin } from "@/lib/aegisora/server";

function errorResponse(
  status: number,
  code: string,
  message: string
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

function workspaceIdFrom(req: Request): string | null {
  const value = req.headers.get("x-workspace-id")?.trim() ?? "";

  if (!/^[0-9a-f-]{36}$/i.test(value)) {
    return null;
  }

  return value;
}

async function listMembers(workspaceId: string) {
  const db = admin();

  const { data: members, error } = await db
    .from("workspace_members")
    .select("user_id, role, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const authAdmin = db.auth.admin;
  const users: Record<string, { email: string | null; name: string | null }> = {};

  let page = 1;

  while (page <= 10) {
    const result = await authAdmin.listUsers({
      page,
      perPage: 1000,
    });

    if (result.error) throw result.error;

    for (const user of result.data.users) {
      users[user.id] = {
        email: user.email ?? null,
        name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null,
      };
    }

    if (result.data.users.length < 1000) break;

    page += 1;
  }

  return (members ?? []).map((member) => ({
    user_id: member.user_id,
    email: users[member.user_id]?.email ?? null,
    name: users[member.user_id]?.name ?? null,
    role: normalizeRole(member.role),
    status: member.status,
    created_at: member.created_at,
  }));
}

export async function GET(req: Request) {
  try {
    await authenticateUser(req);
    const workspaceId = workspaceIdFrom(req);

    if (!workspaceId) {
      return errorResponse(
        400,
        "invalid_workspace",
        "X-Workspace-Id header is required."
      );
    }

    const { user, aal } = await authenticateUser(req);

    const role = await requireWorkspacePermission(
      user.id,
      workspaceId,
      "team:read"
    );

    const members = await listMembers(workspaceId);

    return NextResponse.json({
      workspace_id: workspaceId,
      current_user_id: user.id,
      current_role: role,
      current_aal: aal,
      members,
    });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? Number((error as { status: number }).status)
        : 500;

    if (status === 403 || status === 401) {
      return errorResponse(
        status,
        status === 403 ? "forbidden" : "unauthorized",
        error instanceof Error ? error.message : "Forbidden."
      );
    }

    return errorResponse(500, "internal_error", "Unable to load workspace members.");
  }
}

export async function PATCH(req: Request) {
  try {
    await authenticateUser(req);
    const workspaceId = workspaceIdFrom(req);

    if (!workspaceId) {
      return errorResponse(
        400,
        "invalid_workspace",
        "X-Workspace-Id header is required."
      );
    }

    const { user, aal } = await authenticateUser(req);

    const actorRole = await requireWorkspacePermission(
      user.id,
      workspaceId,
      "team:manage"
    );
    requireAal2(aal);

    const body = await req.json().catch(() => null);

    const targetUserId =
      body && typeof body.user_id === "string"
        ? body.user_id.trim()
        : "";

    const targetRole = normalizeRole(body?.role);

    if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return errorResponse(
        400,
        "invalid_user",
        "A valid user_id is required."
      );
    }

    if (!targetRole) {
      return errorResponse(
        400,
        "invalid_role",
        `role must be one of: ${WORKSPACE_ROLES.join(", ")}`
      );
    }

    const db = admin();

    const { data: targetMember, error: targetError } = await db
      .from("workspace_members")
      .select("user_id, role, status")
      .eq("workspace_id", workspaceId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetError) throw targetError;

    if (!targetMember || targetMember.status !== "active") {
      return errorResponse(
        404,
        "member_not_found",
        "Target workspace member was not found."
      );
    }

    const currentTargetRole = normalizeRole(targetMember.role);

    if (!currentTargetRole) {
      return errorResponse(
        409,
        "invalid_current_role",
        "Target has an unsupported workspace role."
      );
    }

    if (actorRole !== "OWNER") {
      if (
        currentTargetRole === "OWNER" ||
        targetRole === "OWNER"
      ) {
        return errorResponse(
          403,
          "owner_only",
          "OWNER role changes require an OWNER."
        );
      }
    }

    if (
      actorRole !== "OWNER" &&
      targetRole === "ADMIN" &&
      currentTargetRole !== "ADMIN"
    ) {
      return errorResponse(
        403,
        "owner_only",
        "Only an OWNER can promote a member to ADMIN."
      );
    }

    if (
      actorRole === "ADMIN" &&
      currentTargetRole === "OWNER"
    ) {
      return errorResponse(
        403,
        "owner_only",
        "Only an OWNER can modify an OWNER."
      );
    }

    const { data: updated, error: updateError } = await db.rpc("set_workspace_member_role", {
      p_workspace_id: workspaceId,
      p_user_id: targetUserId,
      p_role: targetRole,
      p_actor_id: user.id,
    });
    if (updateError) throw updateError;
    if (updated !== true) {
      return errorResponse(404, "member_not_found", "Target workspace member was not found.");
    }

    return NextResponse.json({
      updated: true,
      workspace_id: workspaceId,
      actor_role: actorRole,
      target_user_id: targetUserId,
      target_role: targetRole,
    });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? Number((error as { status: number }).status)
        : 500;

    if (status === 403 || status === 401) {
      return errorResponse(
        status,
        status === 403 ? (error instanceof Error && error.message.startsWith("Complete multi-factor") ? "mfa_required" : "forbidden") : "unauthorized",
        error instanceof Error ? error.message : "Forbidden."
      );
    }

    return errorResponse(500, "internal_error", "Unable to update workspace member.");
  }
}

export async function POST(req: Request) {
  let inviteStage = "request";
  try {
    await authenticateUser(req);
    const workspaceId = workspaceIdFrom(req);
    if (!workspaceId) {
      return errorResponse(400, "invalid_workspace", "X-Workspace-Id header is required.");
    }

    inviteStage = "authenticate_and_authorize";
    const { user, aal } = await authenticateUser(req);
    const actorRole = await requireWorkspacePermission(user.id, workspaceId, "team:manage");
    requireAal2(aal);
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = normalizeRole(body?.role);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return errorResponse(400, "invalid_email", "A valid email address is required.");
    }
    if (!role) {
      return errorResponse(400, "invalid_role", `role must be one of: ${WORKSPACE_ROLES.join(", ")}`);
    }
    if (actorRole === "ADMIN" && role !== "OPERATOR" && role !== "VIEWER") {
      return errorResponse(403, "owner_only", "Only an OWNER can invite an ADMIN or OWNER.");
    }

    const db = admin();
    // Reuse an existing auth account when present. Otherwise Supabase sends its
    // normal invitation email and returns the user id needed for membership.
    inviteStage = "lookup_auth_user";
    let targetUserId: string | null = null;
    let page = 1;
    while (!targetUserId && page <= 10) {
      const listed = await db.auth.admin.listUsers({ page, perPage: 1000 });
      if (listed.error) throw listed.error;
      targetUserId = listed.data.users.find((candidate) => candidate.email?.toLowerCase() === email)?.id ?? null;
      if (listed.data.users.length < 1000) break;
      page += 1;
    }
    inviteStage = "check_existing_membership";
    if (targetUserId) {
      const { data: existingMember, error: existingError } = await db.from("workspace_members")
        .select("user_id").eq("workspace_id", workspaceId).eq("user_id", targetUserId).maybeSingle();
      if (existingError) throw existingError;
      if (existingMember) return errorResponse(409, "already_a_member", "This account already has a workspace membership.");
    }

    let newlyInvited = false;
    if (!targetUserId) {
      inviteStage = "send_invitation";
      const invite = await db.auth.admin.inviteUserByEmail(email);
      if (invite.error) throw invite.error;
      targetUserId = invite.data.user.id;
      newlyInvited = true;
    }

    inviteStage = "add_workspace_member_rpc";
    const { error: insertError } = await db.rpc("add_workspace_member", {
      p_workspace_id: workspaceId,
      p_user_id: targetUserId,
      p_role: role,
      p_status: "invited",
      p_actor_id: user.id,
    });
    if (insertError) {
      if (newlyInvited && targetUserId) {
        await db.auth.admin.deleteUser(targetUserId);
      }
      if (insertError.code === "23505") {
        return errorResponse(409, "already_a_member", "This account already has a workspace membership.");
      }
      throw insertError;
    }

    return NextResponse.json({ invited: true, email_sent: newlyInvited, workspace_id: workspaceId, user_id: targetUserId, role, status: "invited" }, { status: 201 });
  } catch (error) {
    const inviteFailure =
      typeof error === "object" && error !== null
        ? (error as { name?: unknown; code?: unknown; message?: unknown })
        : null;
    const inviteMessage =
      typeof inviteFailure?.message === "string"
        ? inviteFailure.message
            .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
            .slice(0, 240)
        : "Unknown error";
    console.error("[aegisora] workspace member invite failed", {
      stage: inviteStage,
      name: typeof inviteFailure?.name === "string" ? inviteFailure.name : "UnknownError",
      code: typeof inviteFailure?.code === "string" ? inviteFailure.code : undefined,
      message: inviteMessage,
    });
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;
    if (status === 403 || status === 401) {
      return errorResponse(status, status === 403 ? (error instanceof Error && error.message.startsWith("Complete multi-factor") ? "mfa_required" : "forbidden") : "unauthorized", error instanceof Error ? error.message : "Forbidden.");
    }
    return errorResponse(500, "internal_error", "Unable to invite workspace member.");
  }
}

export async function DELETE(req: Request) {
  try {
    await authenticateUser(req);
    const workspaceId = workspaceIdFrom(req);
    if (!workspaceId) {
      return errorResponse(400, "invalid_workspace", "X-Workspace-Id header is required.");
    }
    const { user, aal } = await authenticateUser(req);
    const actorRole = await requireWorkspacePermission(user.id, workspaceId, "team:manage");
    requireAal2(aal);
    const body = await req.json().catch(() => null);
    const targetUserId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return errorResponse(400, "invalid_user", "A valid user_id is required.");
    }
    if (targetUserId === user.id) {
      return errorResponse(409, "self_removal", "Transfer ownership or ask another workspace administrator to remove your membership.");
    }

    const db = admin();
    const { data: target, error: targetError } = await db.from("workspace_members")
      .select("user_id, role, status").eq("workspace_id", workspaceId).eq("user_id", targetUserId).maybeSingle();
    if (targetError) throw targetError;
    if (!target) return errorResponse(404, "member_not_found", "Target workspace member was not found.");
    const targetRole = normalizeRole(target.role);
    if (!targetRole) return errorResponse(409, "invalid_current_role", "Target has an unsupported workspace role.");
    if (actorRole === "ADMIN" && (targetRole === "OWNER" || targetRole === "ADMIN")) {
      return errorResponse(403, "owner_only", "Only an OWNER can remove an ADMIN or OWNER.");
    }
    const { data: removed, error: deleteError } = await db.rpc("remove_workspace_member", {
      p_workspace_id: workspaceId,
      p_user_id: targetUserId,
      p_actor_id: user.id,
    });
    if (deleteError) {
      if (deleteError.message.toLowerCase().includes("last active workspace owner")) {
        return errorResponse(409, "last_owner", "The last active OWNER cannot be removed.");
      }
      throw deleteError;
    }
    if (removed !== true) return errorResponse(404, "member_not_found", "Target workspace member was not found.");
    return NextResponse.json({ removed: true, workspace_id: workspaceId, user_id: targetUserId });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;
    if (status === 403 || status === 401) {
      return errorResponse(status, status === 403 ? (error instanceof Error && error.message.startsWith("Complete multi-factor") ? "mfa_required" : "forbidden") : "unauthorized", error instanceof Error ? error.message : "Forbidden.");
    }
    return errorResponse(500, "internal_error", "Unable to remove workspace member.");
  }
}

