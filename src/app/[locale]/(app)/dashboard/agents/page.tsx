"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, Notice, Panel, btnGhost, fmt } from "@/components/aegisora/live/ui";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";
import { confirmDialog, notify } from "@/components/aegisora/live/feedback";

type Parsed = { name: string; framework: string | null; description: string | null; external_id: string | null; metadata: object };

function parseImport(text: string): Parsed[] {
  const t = text.trim();
  if (!t) return [];
  if (t.startsWith("[") || t.startsWith("{")) {
    const v = JSON.parse(t);
    const list: Record<string, unknown>[] = Array.isArray(v) ? v : Array.isArray(v?.agents) ? v.agents : [];
    return list
      .filter((a) => a && typeof a.name === "string" && a.name.trim())
      .map((a) => ({
        name: String(a.name).trim().slice(0, 120),
        framework: a.framework ? String(a.framework).slice(0, 80) : null,
        description: a.description ? String(a.description).slice(0, 1000) : null,
        external_id: a.external_id != null ? String(a.external_id).slice(0, 200) : null,
        metadata: a.metadata && typeof a.metadata === "object" ? (a.metadata as object) : {},
      }));
  }
  return t
    .split(/\r?\n/)
    .map((l) => l.split(",").map((x) => x.trim()))
    .filter((c) => c[0] && c[0].toLowerCase() !== "name")
    .map((c) => ({ name: c[0].slice(0, 120), framework: c[1] || null, description: c[2] || null, external_id: null, metadata: {} }));
}

function AgentTools({ ws, reload }: { ws: Workspace; reload: () => void }) {
  const [mode, setMode] = useState<"register" | "import" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [name, setName] = useState("");
  const [framework, setFramework] = useState("");
  const [description, setDescription] = useState("");
  const [bulk, setBulk] = useState("");
  const [origin, setOrigin] = useState("https://YOUR_DOMAIN");

  // Client-only origin hydration intentionally avoids SSR/browser mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  async function mutate(operation: string, values: Record<string, unknown>) {
    const { data: { session } } = await createClient().auth.getSession();
    if (!session?.access_token) {
      setMsg({ ok: false, text: "Your session expired. Sign in again to manage agents." });
      return false;
    }
    const response = await fetch("/api/v1/workspace/agents", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: ws.id, operation, ...values }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setMsg({ ok: false, text: payload?.error?.message ?? "Agent operation failed." });
      return false;
    }
    return true;
  }


  async function register(e: FormEvent) {
    e.preventDefault();
    const success = await mutate("create", { agent: { name: name.trim(), framework: framework.trim() || null, description: description.trim() || null, external_id: null } });
    if (!success) return;
    setMsg({ ok: true, text: `Agent "${name.trim()}" registered.` });
    setName(""); setFramework(""); setDescription(""); setMode(null); reload();
  }

  async function importBulk() {
    try {
      const rows = parseImport(bulk);
      if (rows.length === 0) return setMsg({ ok: false, text: "No agents found. Paste a JSON array or CSV lines (name,framework,description)." });
      if (rows.length > 500) return setMsg({ ok: false, text: "Maximum 500 agents per import." });
      const map = new Map(rows.map((r) => [r.name, r]));
      const success = await mutate("import", { agents: [...map.values()] });
      if (!success) return;
      setMsg({ ok: true, text: `${map.size} agents imported.` });
      setBulk(""); setMode(null); reload();
    } catch {
      setMsg({ ok: false, text: "Could not parse the input. Check the JSON or CSV format." });
    }
  }

  const snippet = `curl -X POST ${origin}/api/v1/evaluate \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"support-bot","action":"payment.refund","resource":"order_42"}'`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => setMode(mode === "register" ? null : "register")}>Register agent</button>
        <button className={btnGhost} onClick={() => setMode(mode === "import" ? null : "import")}>Import agents</button>
      </div>
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}

      {mode === "register" && (
        <Panel>
          <form onSubmit={register} className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label htmlFor="a-name">Name</Label><Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} /></div>
            <div className="space-y-1.5"><Label htmlFor="a-fw">Framework</Label><Input id="a-fw" value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="langchain, crewai, custom..." /></div>
            <div className="space-y-1.5"><Label htmlFor="a-desc">Description</Label><Input id="a-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="sm:col-span-3"><button type="submit" className={btnPrimary}>Register</button></div>
          </form>
        </Panel>
      )}

      {mode === "import" && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Migrating from another system? Paste a JSON array (<code className="font-mono text-xs">{`[{"name":"support-bot","framework":"langchain"}]`}</code>) or CSV lines (<code className="font-mono text-xs">name,framework,description</code>). Existing names are updated, not duplicated.
          </p>
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={7} className="mt-3 w-full rounded-sm border border-border bg-surface-1 p-2 font-mono text-xs" />
          <div className="mt-3"><button className={btnPrimary} onClick={() => void importBulk()}>Import</button></div>
        </Panel>
      )}

      <Panel>
        <h2 className="text-sm font-semibold">Connect an agent from code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Call the API before every tool or provider action and run the action only when <code className="font-mono text-xs">effect</code> is ALLOW. Unknown agent names register themselves on first call. Create a key under Platform, API Keys. Bulk import via script: POST /api/v1/agents/import.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-sm bg-surface-3 p-3 font-mono text-[11px]">{snippet}</pre>
      </Panel>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <LiveTable
      table="agents"
      title="Agents"
      description="The AI workers governed by your policies."
      limit={500}
      above={(ws, reload) => <AgentTools ws={ws} reload={reload} />}
      columns={[
        { label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
        { label: "Framework", render: (r) => <span className="text-muted-foreground">{r.framework || "-"}</span> },
        { label: "Source", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.source}</span> },
        { label: "Status", render: (r) => <Badge value={r.state} /> },
        { label: "Last seen", render: (r) => fmt(r.last_seen_at) },
      ]}
      actions={(r, reload) => (
        <div className="flex justify-end gap-2">
          <Link href={`/dashboard/agents/${r.id}`} className={btnGhost}>Open</Link>
          <button
            className={btnGhost}
            onClick={async () => {
              const { data: { session } } = await createClient().auth.getSession();
              if (!session?.access_token) { notify("Your session expired. Sign in again to manage agents.", false); return; }
              const response = await fetch("/api/v1/workspace/agents", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ workspace_id: r.workspace_id, operation: "update", agent_id: r.id, state: r.state === "ACTIVE" ? "DISABLED" : "ACTIVE" }) });
              if (!response.ok) { const payload = await response.json().catch(() => null); notify(payload?.error?.message ?? "Agent update failed.", false); }
              reload();
            }}
          >
            {r.state === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
          <button
            className={btnGhost}
            onClick={async () => {
              if (!(await confirmDialog({ title: `Delete agent "${r.name}"?`, body: "Its policies are removed too. This cannot be undone.", confirmLabel: "Delete agent", danger: true }))) return;
              const { data: { session } } = await createClient().auth.getSession();
              if (!session?.access_token) { notify("Your session expired. Sign in again to manage agents.", false); return; }
              const response = await fetch("/api/v1/workspace/agents", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ workspace_id: r.workspace_id, operation: "delete", agent_id: r.id }) });
              if (!response.ok) { const payload = await response.json().catch(() => null); notify(payload?.error?.message ?? "Agent deletion failed.", false); }
              reload();
            }}
          >
            Delete
          </button>
        </div>
      )}
      empty={{ title: "No agents yet", body: "Register one, import a list from another system, or just call the API: agents register themselves on their first action." }}
    />
  );
}




