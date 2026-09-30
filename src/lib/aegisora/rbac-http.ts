import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { admin } from "@/lib/aegisora/server";

export const WORKSPACE_ROLES = [
  "OWNER",
  "ADMIN",
  "OPERATOR",
  "VIEWER",
] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type WorkspacePermission =
  | "workspace:read"
  | "workspace:manage"
  | "team:read"
  | "team:manage"
  | "runtime:operate"
  | "governance:manage";

const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly WorkspacePermission[]> = {
  OWNER: ["workspace:read", "workspace:manage", "team:read", "team:manage", "runtime:operate", "governance:manage"],
  ADMIN: ["workspace:read", "workspace:manage", "team:read", "team:manage", "runtime:operate", "governance:manage"],
  OPERATOR: ["workspace:read", "team:read", "runtime:operate"],
  VIEWER: ["workspace:read", "team:read"],
};

export function roleCan(role: WorkspaceRole, permission: WorkspacePermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 10,
  OPERATOR: 20,
  ADMIN: 30,
  OWNER: 40,
};

export function normalizeRole(value: unknown): WorkspaceRole | null {
  if (typeof value !== "string") return null;

  const role = value.trim().toUpperCase();

  if (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "OPERATOR" ||
    role === "VIEWER"
  ) {
    return role;
  }

  return null;
}

export function roleAtLeast(
  actual: WorkspaceRole,
  required: WorkspaceRole
): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

export function isManagementRole(role: WorkspaceRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function isOwner(role: WorkspaceRole): boolean {
  return role === "OWNER";
}

function env(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function bearerToken(req: Request): string {
  const authorization = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/.exec(authorization);
  if (!match) {
    const error = new Error("Missing Authorization bearer token.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
  return match[1];
}

export function requestSupabase(req: Request): SupabaseClient {
  const token = bearerToken(req);

  return createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function authenticateUser(
  req: Request
): Promise<{ supabase: SupabaseClient; user: User; aal: string }> {
  const token = bearerToken(req);
  const supabase = requestSupabase(req);
  const response = await fetch(`${env("NEXT_PUBLIC_SUPABASE_URL")}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const unauthorized = new Error("Unauthorized user session.");
    (unauthorized as Error & { status?: number }).status = 401;
    throw unauthorized;
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || typeof (payload as { id?: unknown }).id !== "string") {
    const unauthorized = new Error("Unauthorized user session.");
    (unauthorized as Error & { status?: number }).status = 401;
    throw unauthorized;
  }

  // The Auth endpoint above verifies the JWT. Read only its signed AAL claim
  // for step-up authorization; the token never trusts client-supplied headers.
  let claims: { sub?: unknown; aal?: unknown };
  try {
    const parts = token.split(".");
    claims = JSON.parse(Buffer.from(parts[1] ?? "", "base64url").toString("utf8")) as { sub?: unknown; aal?: unknown };
  } catch {
    const unauthorized = new Error("Unauthorized user session.");
    (unauthorized as Error & { status?: number }).status = 401;
    throw unauthorized;
  }
  if (claims.sub !== (payload as { id: string }).id || (claims.aal !== "aal1" && claims.aal !== "aal2")) {
    const unauthorized = new Error("Unauthorized user session.");
    (unauthorized as Error & { status?: number }).status = 401;
    throw unauthorized;
  }

  return { supabase, user: payload as User, aal: claims.aal };
}

export function requireAal2(aal: string): void {
  if (aal !== "aal2") {
    const error = new Error("Complete multi-factor authentication before changing workspace access.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

export async function getWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const db = admin();

  const { data, error } = await db
    .from("workspace_members")
    .select("role, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;

  return normalizeRole(data?.role);
}

export async function requireWorkspaceRole(
  userId: string,
  workspaceId: string,
  minimumRole: WorkspaceRole
): Promise<WorkspaceRole> {
  const actual = await getWorkspaceMembership(userId, workspaceId);

  if (!actual) {
    const error = new Error("Workspace membership required.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }

  if (!roleAtLeast(actual, minimumRole)) {
    const error = new Error(
      `Workspace role ${actual} does not satisfy required role ${minimumRole}.`
    );
    (error as Error & { status?: number }).status = 403;
    throw error;
  }

  return actual;
}

/** Authorizes an operation from the authenticated user and active server-side membership. */
export async function requireWorkspacePermission(
  userId: string,
  workspaceId: string,
  permission: WorkspacePermission
): Promise<WorkspaceRole> {
  const actual = await getWorkspaceMembership(userId, workspaceId);
  if (!actual) {
    const error = new Error("Active workspace membership required.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  if (!roleCan(actual, permission)) {
    const error = new Error(`Workspace role ${actual} cannot perform ${permission}.`);
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  return actual;
}
