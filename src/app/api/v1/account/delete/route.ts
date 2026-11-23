import { NextResponse } from "next/server";
import { admin } from "@/lib/aegisora/server";
import { authenticateUser } from "@/lib/aegisora/rbac-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MemberRow = { user_id: string; workspace_id: string; role: string | null; status: string | null };
type SubRow = { status: string | null; cancel_at_period_end: boolean | null };

const LIVE_SUBSCRIPTION = ["active", "trialing", "past_due", "unpaid"];

function respond(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    const body = (await req.json().catch(() => ({}))) as { confirm?: unknown };
    const email = (user.email ?? "").trim().toLowerCase();
    if (!email || typeof body.confirm !== "string" || body.confirm.trim().toLowerCase() !== email) {
      return respond(400, "confirmation_required", "Type your account email to confirm.");
    }

    const db = admin();
    const mineRes = await db
      .from("workspace_members")
      .select("user_id,workspace_id,role,status")
      .eq("user_id", user.id);
    if (mineRes.error) return respond(500, "lookup_failed", "Could not check your workspaces. Please try again.");
    const mine = (mineRes.data ?? []) as MemberRow[];

    for (const m of mine) {
      if (String(m.role ?? "").toUpperCase() !== "OWNER") continue;

      const othersRes = await db
        .from("workspace_members")
        .select("user_id,workspace_id,role,status")
        .eq("workspace_id", m.workspace_id)
        .neq("user_id", user.id)
        .in("status", ["active", "invited"]);
      if (othersRes.error) return respond(500, "lookup_failed", "Could not check workspace members. Please try again.");
      const others = (othersRes.data ?? []) as MemberRow[];
      const otherOwners = others.filter(
        (o) => String(o.role ?? "").toUpperCase() === "OWNER" && o.status === "active",
      );

      if (others.length > 0 && otherOwners.length === 0) {
        return respond(
          409,
          "ownership_transfer_required",
          "You are the only owner of a workspace that has other members. Make another member an owner first.",
        );
      }

      if (otherOwners.length === 0) {
        const subRes = await db
          .from("billing_subscriptions")
          .select("status,cancel_at_period_end")
          .eq("workspace_id", m.workspace_id)
          .in("status", LIVE_SUBSCRIPTION);
        if (subRes.error) return respond(500, "lookup_failed", "Could not check billing. Please try again.");
        const subs = (subRes.data ?? []) as SubRow[];
        if (subs.some((s) => !s.cancel_at_period_end)) {
          return respond(
            409,
            "subscription_active",
            "Your workspace has an active subscription. Cancel it in the billing portal first, then delete your account.",
          );
        }
      }
    }

    const del = await db.auth.admin.deleteUser(user.id);
    if (del.error) {
      console.error("account delete failed:", del.error.message);
      return respond(500, "delete_failed", "Your account could not be deleted automatically. Please contact support.");
    }

    // Best-effort cleanup if the database did not cascade.
    await db.from("workspace_members").delete().eq("user_id", user.id);
    await db.from("profiles").delete().eq("id", user.id);

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
    if (status === 401) return respond(401, "unauthorized", "A valid session is required.");
    console.error("account delete error:", error instanceof Error ? error.message : "unknown");
    return respond(500, "server_error", "Unexpected error. Please try again.");
  }
}