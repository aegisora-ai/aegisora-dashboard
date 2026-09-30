"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, Notice, Panel, btnGhost, selectCls } from "@/components/aegisora/live/ui";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

const STARTERS = [
  { name: "Block destructive actions", action_pattern: "*delete*", decision: "BLOCK", priority: 10 },
  { name: "Require approval for payments", action_pattern: "payment.*", decision: "ESCALATE", priority: 20 },
  { name: "Allow read-only actions", action_pattern: "read.*", decision: "ALLOW", priority: 100 },
];

function PolicyTools({ ws, reload }: { ws: Workspace; reload: () => void }) {
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState({ name: "", agent_id: "", action_pattern: "*", resource_pattern: "*", decision: "BLOCK", priority: "100" });

  useEffect(() => {
    void (async () => {
      const { data } = await createClient().from("agents").select("id,name").eq("workspace_id", ws.id).order("name");
      setAgents((data ?? []) as { id: string; name: string }[]);
    })();
  }, [ws.id]);

  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("policies").insert({
      workspace_id: ws.id, name: f.name.trim(), agent_id: f.agent_id || null,
      action_pattern: f.action_pattern.trim() || "*", resource_pattern: f.resource_pattern.trim() || "*",
      decision: f.decision, priority: Number(f.priority) || 100,
    });
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Policy created." });
    setOpen(false); reload();
  }

  async function starters() {
    const { error } = await createClient().from("policies").insert(STARTERS.map((s) => ({ ...s, workspace_id: ws.id })));
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Starter policies added." });
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => setOpen(!open)}>New policy</button>
        <button className={btnGhost} onClick={() => void starters()}>Load starter policies</button>
      </div>
      <p className="text-xs text-muted-foreground">
        Patterns use * as a wildcard (payment.*, *delete*). If several policies match: BLOCK wins over ESCALATE, ESCALATE over ALLOW. If none match, the workspace default from Settings applies (BLOCK unless changed).
      </p>
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
      {open && (
        <Panel>
          <form onSubmit={add} className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label htmlFor="p-name">Name</Label><Input id="p-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label htmlFor="p-agent">Applies to</Label>
              <select id="p-agent" className={selectCls} value={f.agent_id} onChange={(e) => setF({ ...f, agent_id: e.target.value })}>
                <option value="">All agents</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="p-eff">Effect</Label>
              <select id="p-eff" className={selectCls} value={f.decision} onChange={(e) => setF({ ...f, decision: e.target.value })}>
                <option>ALLOW</option><option>ESCALATE</option><option>BLOCK</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="p-act">Action pattern</Label><Input id="p-act" value={f.action_pattern} onChange={(e) => setF({ ...f, action_pattern: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="p-res">Resource pattern</Label><Input id="p-res" value={f.resource_pattern} onChange={(e) => setF({ ...f, resource_pattern: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="p-pri">Priority (lower = first)</Label><Input id="p-pri" type="number" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} /></div>
            <div className="sm:col-span-3"><button type="submit" className={btnPrimary}>Create policy</button></div>
          </form>
        </Panel>
      )}
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <LiveTable
      table="policies"
      title="Policies"
      description="Rules that decide whether an agent action is allowed, blocked or needs approval."
      select="*, agents(name)"
      orderBy="priority"
      ascending
      above={(ws, reload) => <PolicyTools ws={ws} reload={reload} />}
      columns={[
        { label: "Priority", render: (r) => <span className="font-mono text-xs">{r.priority}</span> },
        { label: "Name", render: (r) => r.name },
        { label: "Applies to", render: (r) => <span className="text-muted-foreground">{r.agents?.name ?? "All agents"}</span> },
        { label: "Action", render: (r) => <span className="font-mono text-xs">{r.action_pattern}</span> },
        { label: "Effect", render: (r) => <Badge value={r.decision} /> },
        { label: "State", render: (r) => <Badge value={r.enabled ? "active" : "suspended"} /> },
      ]}
      actions={(r, reload) => (
        <div className="flex justify-end gap-2">
          <button className={btnGhost} onClick={async () => { const { error } = await createClient().from("policies").update({ enabled: !r.enabled }).eq("id", r.id); if (error) alert(error.message); reload(); }}>
            {r.enabled ? "Disable" : "Enable"}
          </button>
          <button className={btnGhost} onClick={async () => { if (!confirm(`Delete policy "${r.name}"?`)) return; const { error } = await createClient().from("policies").delete().eq("id", r.id); if (error) alert(error.message); reload(); }}>
            Delete
          </button>
        </div>
      )}
      empty={{ title: "No policies yet", body: "With no policies every action falls back to the workspace default (BLOCK). Load the starter policies to try the full flow." }}
    />
  );
}