"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace, type Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const selectCls = "h-9 w-full rounded-sm border border-border bg-surface-1 px-2 text-sm";
export const btnGhost = "inline-flex h-8 items-center rounded-sm border border-border px-3 text-xs hover:bg-surface-3 disabled:opacity-50";

export const fmt = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "-";

const tones: Record<string, string> = {
  ALLOW: "text-allow", BLOCK: "text-block", ESCALATE: "text-escalate",
  approved: "text-allow", rejected: "text-block", pending: "text-escalate", expired: "text-muted-foreground",
  open: "text-block", resolved: "text-allow", active: "text-allow", suspended: "text-block",
  ok: "text-allow", block: "text-block", escalate: "text-escalate", allow: "text-allow",
};

export function Badge({ value }: { value: unknown }) {
  const v = String(value ?? "");
  return (
    <span className={cn("rounded-sm border border-border bg-surface-3 px-2 py-0.5 font-mono text-[10px] tracking-wider", tones[v] ?? "text-muted-foreground")}>
      {v.toUpperCase()}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-border bg-surface-1 p-5 [box-shadow:var(--panel-shadow)]", className)}>{children}</div>;
}

export function Notice({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <p role={ok ? "status" : "alert"} className={cn("rounded-sm border px-3 py-2 text-xs", ok ? "border-allow/30 bg-surface-3 text-allow" : "border-block/30 bg-block-muted text-block")}>
      {children}
    </p>
  );
}

export function Skeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true">
      <div className="h-9 w-56 rounded-sm bg-surface-3" />
      <div className="h-24 rounded-md bg-surface-3" />
      <div className="h-24 rounded-md bg-surface-3" />
    </div>
  );
}

function CreateWorkspace({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setBusy(false);
      setErr("Your session has expired. Sign in again to continue.");
      return;
    }
    const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace") + "-" + Math.random().toString(16).slice(2, 8);
    const { error } = await supabase.rpc("create_workspace", { p_name: name.trim() });
    setBusy(false);
    if (error) setErr(error.message);
    else onDone();
  }

  return (
    <Panel className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Create your workspace</h2>
      <p className="mt-1 text-sm text-muted-foreground">A workspace holds your agents, policies and evidence. You can invite your team later.</p>
      {err && <div className="mt-4"><Notice>{err}</Notice></div>}
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Company or team name</Label>
          <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <button type="submit" disabled={busy || !name.trim()} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {busy ? "Creating..." : "Create workspace"}
        </button>
      </form>
    </Panel>
  );
}

export function WorkspaceGate({ children }: { children: (ws: Workspace) => ReactNode }) {
  const { ws, loading, error, reload } = useWorkspace();
  if (loading && !ws) return <Skeleton />;
  if (error) return <Notice>Could not load your workspace: {error}. Refresh the page, or contact support if this continues.</Notice>;
  if (!ws) return <CreateWorkspace onDone={() => void reload()} />;
  return <>{children(ws)}</>;
}
