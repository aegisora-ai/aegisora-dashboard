"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/aegisora/workspace-provider";

export default function WorkspacePage() {
  const { currentWorkspace, loading } = useWorkspace();
  const canManage = currentWorkspace?.role === "OWNER" || currentWorkspace?.role === "ADMIN";

  if (loading) {
    return <div className="mx-auto max-w-4xl py-12 text-sm text-muted-foreground">Loading workspace…</div>;
  }

  if (!currentWorkspace) {
    return <div className="mx-auto max-w-4xl py-12 text-sm text-muted-foreground">No active workspace is available for this account.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace details from your active membership.</p>
      </header>
      <section aria-labelledby="general-title" className="aeg-panel p-5">
        <h2 id="general-title" className="text-sm font-medium">General</h2>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Name</dt><dd>{currentWorkspace.name}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Slug</dt><dd className="font-mono text-xs">{currentWorkspace.slug}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Your role</dt><dd>{currentWorkspace.role}</dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="access-title" className="aeg-panel p-5">
        <h2 id="access-title" className="text-sm font-medium">Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {canManage ? "Your role can manage workspace members." : "Workspace administration is limited to owners and admins."}
        </p>
        <Link className="mt-4 inline-flex text-sm underline underline-offset-4" href="/dashboard/team">View team</Link>
      </section>
    </div>
  );
}
