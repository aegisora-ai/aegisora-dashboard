"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/components/aegisora/workspace-provider";
import { cn } from "@/lib/utils";
import { confirmDialog, notify } from "@/components/aegisora/live/feedback";

type Role = "OWNER" | "ADMIN" | "OPERATOR" | "VIEWER";

type Member = {
  user_id: string;
  email: string | null;
  name: string | null;
  role: Role | null;
  status: string | null;
  created_at: string;
};

const roles: Role[] = [
  "OWNER",
  "ADMIN",
  "OPERATOR",
  "VIEWER",
];

const roleDescriptions: Record<Role, string> = {
  OWNER: "Full workspace authority, including role administration.",
  ADMIN: "Workspace administration except OWNER-only changes.",
  OPERATOR: "Operational access without workspace administration.",
  VIEWER: "Read-only workspace access.",
};

const roleTone: Record<Role, string> = {
  OWNER: "text-cyan",
  ADMIN: "text-foreground",
  OPERATOR: "text-muted-foreground",
  VIEWER: "text-muted-foreground",
};

export default function TeamPage() {
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentAal, setCurrentAal] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Authenticated session required.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/v1/workspace/members", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Workspace-Id": currentWorkspace.id,
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(
        payload?.error?.message ??
          `Unable to load workspace members (${response.status}).`
      );
      setLoading(false);
      return;
    }

    setMembers(Array.isArray(payload?.members) ? payload.members : []);
    setCurrentRole(payload?.current_role ?? null);
    setCurrentAal(payload?.current_aal ?? null);
    setCurrentUserId(payload?.current_user_id ?? null);
    setLoading(false);
  }, [currentWorkspace]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";
  const canMutate = canManage && currentAal === "aal2";

  const counts = useMemo(() => {
    return roles.reduce(
      (acc, role) => {
        acc[role] = members.filter((member) => member.role === role).length;
        return acc;
      },
      {} as Record<Role, number>
    );
  }, [members]);

  async function updateRole(userId: string, role: Role) {
    if (!currentWorkspace || !canMutate) return;

    setSavingUserId(userId);
    setError(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Authenticated session required.");
      setSavingUserId(null);
      return;
    }

    const response = await fetch("/api/v1/workspace/members", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Workspace-Id": currentWorkspace.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        role,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(
        payload?.error?.message ??
          `Unable to update role (${response.status}).`
      );
      setSavingUserId(null);
      return;
    }

    await load();
    setSavingUserId(null);
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentWorkspace || !canMutate) return;
    setInviting(true);
    setError(null);
    setInviteMessage(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Authenticated session required.");
      setInviting(false);
      return;
    }
    const response = await fetch("/api/v1/workspace/members", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Workspace-Id": currentWorkspace.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? `Unable to invite member (${response.status}).`);
      setInviting(false);
      return;
    }
    setInviteEmail("");
    setInviteMessage(payload?.email_sent
      ? "Invitation email sent. Access activates when the person signs in."
      : "Membership is pending. The existing account can sign in to activate access.");
    setInviting(false);
    await load();
  }

  async function removeMember(userId: string) {
    if (!currentWorkspace || !canMutate || userId === currentUserId) return;
    const target = members.find((m) => m.user_id === userId);
    const confirmed = await confirmDialog({
      title: `Remove ${target?.name ?? target?.email ?? "this member"}?`,
      body: "They lose access to this workspace immediately.",
      confirmLabel: "Remove member",
      danger: true,
    });
    if (!confirmed) return;
    setSavingUserId(userId);
    setError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Authenticated session required.");
      setSavingUserId(null);
      return;
    }
    const response = await fetch("/api/v1/workspace/members", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Workspace-Id": currentWorkspace.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? `Unable to remove member (${response.status}).`);
      setSavingUserId(null);
      return;
    }
    await load();
    setSavingUserId(null);
  }

  if (workspaceLoading || loading) {
    return (
      <div className="mx-auto max-w-[80rem] py-12 text-sm text-muted-foreground">
        Loading workspace team…
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="mx-auto max-w-[80rem] py-12 text-sm text-muted-foreground">
        No active workspace available.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[80rem] space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite people, set their roles and review who has access.
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-[11px] tracking-wider text-muted-foreground">
            CURRENT ROLE
          </div>
          <div
            className={cn(
              "font-mono text-sm tracking-wider",
              currentRole ? roleTone[currentRole] : "text-muted-foreground"
            )}
          >
            {currentRole ?? "UNKNOWN"}
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-sm border border-block/40 bg-block/5 px-4 py-3 text-sm text-block">
          {error}
        </div>
      )}
      {inviteMessage && (
        <div role="status" className="rounded-sm border border-cyan/30 bg-cyan/5 px-4 py-3 text-sm text-cyan">{inviteMessage}</div>
      )}

      <section aria-labelledby="roles-title">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="roles-title" className="text-sm font-medium">
            Workspace roles
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {members.length} MEMBERS
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div key={role} className="aeg-panel p-4">
              <div
                className={cn(
                  "font-mono text-[11px] tracking-wider",
                  roleTone[role]
                )}
              >
                {role}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </p>
              <div className="mt-4 font-mono text-lg">
                {counts[role]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="members-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 id="members-title" className="text-sm font-medium">
            Members
          </h2>

          <span className="font-mono text-[11px] text-muted-foreground">
            {canMutate
              ? "ROLE MANAGEMENT ENABLED"
              : canManage
                ? "AAL2 STEP-UP REQUIRED"
              : "READ-ONLY ROLE ACCESS"}
          </span>
        </div>
        {canManage && !canMutate && (
          <p className="mb-3 text-xs text-muted-foreground">
            Workspace administration requires multi-factor verification. <Link href="/dashboard/identity" className="text-cyan underline underline-offset-2">Verify an authenticator code</Link>, then return here.
          </p>
        )}

        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && (
                  <th className="px-4 py-3 font-medium">Manage</th>
                )}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr
                  key={member.user_id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3 text-sm">
                    {member.name ?? "Unnamed user"}
                    {member.user_id === currentUserId && (
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                        YOU
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {member.email ?? "—"}
                  </td>

                  <td
                    className={cn(
                      "px-4 py-3 font-mono text-[11px] tracking-wider",
                      member.role ? roleTone[member.role] : "text-block"
                    )}
                  >
                    {member.role ?? "INVALID"}
                  </td>

                  <td className="px-4 py-3 font-mono text-[11px] tracking-wider text-muted-foreground">
                    {member.status ?? "unknown"}
                  </td>

                  {canManage && (
                    <td className="px-4 py-3">
                      {member.user_id === currentUserId ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          SELF
                        </span>
                      ) : (
                        <select
                          value={member.role ?? "VIEWER"}
                          disabled={
                            !canMutate || savingUserId === member.user_id ||
                            (currentRole === "ADMIN" &&
                              member.role === "OWNER")
                          }
                          onChange={(event) =>
                            void updateRole(
                              member.user_id,
                              event.target.value as Role
                            )
                          }
                          className="rounded-sm border border-border bg-surface-2 px-2 py-1.5 font-mono text-[11px]"
                        >
                          {roles.map((role) => (
                            <option
                              key={role}
                              value={role}
                              disabled={
                                currentRole === "ADMIN" && role === "OWNER"
                              }
                            >
                              {role}
                            </option>
                          ))}
                        </select>
                      )}
                      {canMutate && member.user_id !== currentUserId && (currentRole === "OWNER" || (member.role !== "OWNER" && member.role !== "ADMIN")) && (
                        <button
                          type="button"
                          disabled={savingUserId === member.user_id}
                          onClick={() => void removeMember(member.user_id)}
                          className="ml-3 text-xs text-block disabled:opacity-50"
                        >
                          {savingUserId === member.user_id ? "Removing…" : "Remove"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No active workspace members.
            </div>
          )}
        </div>
      </section>

      {canMutate && (
        <section aria-labelledby="invite-title" className="aeg-panel p-4">
          <h2 id="invite-title" className="text-sm font-medium">Invite a team member</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            New users receive an invitation email. Existing accounts activate their pending membership on their next sign-in.
          </p>
          <form onSubmit={(event) => void inviteMember(event)} className="mt-4 flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="member-email">Email address</label>
            <input
              id="member-email"
              type="email"
              required
              maxLength={254}
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="name@company.com"
              className="min-w-64 flex-1 rounded-sm border border-border bg-surface-2 px-3 py-2 text-sm"
            />
            <label className="sr-only" htmlFor="member-role">Workspace role</label>
            <select id="member-role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value as Role)} className="rounded-sm border border-border bg-surface-2 px-3 py-2 text-sm">
              {roles.filter((role) => currentRole === "OWNER" || role === "OPERATOR" || role === "VIEWER").map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <button type="submit" disabled={inviting || !inviteEmail.trim()} className="rounded-sm border border-cyan/50 px-4 py-2 text-sm text-cyan disabled:opacity-50">
              {inviting ? "Sending…" : "Send invite"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
