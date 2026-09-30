import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/aegisora/rbac-http";
import { admin } from "@/lib/aegisora/server";

export async function POST(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    const { data, error } = await admin().rpc("accept_workspace_invites", {
      p_user_id: user.id,
      p_actor_id: user.id,
    });
    if (error) throw error;
    return NextResponse.json({ accepted: Number(data ?? 0) });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 401;
    return NextResponse.json(
      { error: { code: status === 401 ? "unauthorized" : "internal_error", message: status === 401 ? "A valid user session is required." : "Unable to accept workspace invitations." } },
      { status },
    );
  }
}
