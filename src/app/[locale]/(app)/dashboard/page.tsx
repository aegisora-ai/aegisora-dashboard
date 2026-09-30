"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Badge, PageHeader, Panel, Skeleton, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import type { Row } from "@/components/aegisora/live/live-table";

type Stats = { agents: number; policies: number; keys: number; pending: number; incidents: number; allow: number; block: number; escalate: number };

function Overview({ ws }: { ws: Workspace }) {
  const [s, setS] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Row[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const c = (t: string) => supabase.from(t).select("id", { count: "exact", head: true }).eq("workspace_id", ws.id);
      const since = new Date(Date.now() - 864e5).toISOString();
      const [agents, policies, keys, pending, incidents, allow, block, esc, rec] = await Promise.all([
        c("agents"),
        c("policies").eq("enabled", true),
        c("api_keys").is("revoked_at", null),
        c("approvals").eq("status", "pending"),
        c("incidents").eq("status", "open"),
        c("decisions").eq("decision", "ALLOW").gte("created_at", since),
        c("decisions").eq("decision", "BLOCK").gte("created_at", since),
        c("decisions").eq("decision", "ESCALATE").gte("created_at", since),
        supabase.from("decisions").select("id,created_at,decision,agent_id,agents(name),evidence(action)").eq("workspace_id", ws.id).order("created_at", { ascending: false }).limit(8),
      ]);
      if (!alive) return;
      setS({
        agents: agents.count ?? 0, policies: policies.count ?? 0, keys: keys.count ?? 0, pending: pending.count ?? 0,
        incidents: incidents.count ?? 0, allow: allow.count ?? 0, block: block.count ?? 0, escalate: esc.count ?? 0,
      });
      setRecent((rec.data ?? []) as Row[]);
    })();
    return () => { alive = false; };
  }, [ws.id]);

  if (!s) return <Skeleton />;
  const total24 = s.allow + s.block + s.escalate;
  const steps = [
    { done: s.keys > 0, label: "Create an API key", href: "/dashboard/api-keys" },
    { done: s.policies > 0, label: "Add a policy (or load the starter policies)", href: "/dashboard/policies" },
    { done: s.agents > 0, label: "Connect or import your agents", href: "/dashboard/agents" },
    { done: total24 > 0 || recent.length > 0, label: "Send your first test action", href: "/dashboard/decisions" },
  ];
  const tiles = [
    { label: "Agents", value: s.agents, href: "/dashboard/agents" },
    { label: "Active policies", value: s.policies, href: "/dashboard/policies" },
    { label: "Pending approvals", value: s.pending, href: "/dashboard/approvals" },
    { label: "Open incidents", value: s.incidents, href: "/dashboard/incidents" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description={`${ws.name}: live governance state.`} />

      {!steps.every((x) => x.done) && (
        <Panel>
          <h2 className="text-sm font-semibold">Get started</h2>
          <ul className="mt-3 space-y-2">
            {steps.map((x) => (
              <li key={x.label}>
                <Link href={x.href} className="flex items-center gap-2.5 text-sm hover:underline">
                  {x.done ? <Check className="size-4 text-allow" /> : <Circle className="size-4 text-muted-foreground" />}
                  <span className={x.done ? "text-muted-foreground line-through" : ""}>{x.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-md border border-border bg-surface-1 p-5 hover:bg-surface-3">
            <div className="font-mono text-[10px] tracking-wider text-muted-foreground">{t.label.toUpperCase()}</div>
            <div className="mt-2 text-3xl font-semibold">{t.value}</div>
          </Link>
        ))}
      </div>

      <Panel>
        <h2 className="text-sm font-semibold">Decisions, last 24 hours</h2>
        <div className="mt-3 flex gap-8 text-sm">
          <span><span className="text-2xl font-semibold text-allow">{s.allow}</span> <span className="text-muted-foreground">allowed</span></span>
          <span><span className="text-2xl font-semibold text-escalate">{s.escalate}</span> <span className="text-muted-foreground">escalated</span></span>
          <span><span className="text-2xl font-semibold text-block">{s.block}</span> <span className="text-muted-foreground">blocked</span></span>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-sm font-semibold">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet. Decisions appear here the moment an agent calls the API.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                <Badge value={r.decision} />
                <span className="font-mono text-xs">{r.evidence?.[0]?.action ?? "—"}</span>
                <span className="text-muted-foreground">{r.agents?.name ?? "Unknown agent"}</span>
                <span className="ml-auto text-xs text-muted-foreground">{fmt(r.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function OverviewPage() {
  return <WorkspaceGate>{(ws) => <Overview key={ws.id} ws={ws} />}</WorkspaceGate>;
}