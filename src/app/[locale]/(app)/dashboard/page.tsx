"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Circle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Badge, Panel, Skeleton, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import type { Row } from "@/components/aegisora/live/live-table";
import { DecisionSplit, HourlyChart, type Bucket } from "@/components/aegisora/live/decision-charts";
import { cn } from "@/lib/utils";
import { HomeHero } from "@/components/aegisora/home-hero";

type Stats = { agents: number; policies: number; keys: number; pending: number; incidents: number; allow: number; block: number; escalate: number };
type Point = { created_at: string; decision: string | null };

const HOUR = 36e5;

function bucketize(points: Point[]): { buckets: Bucket[]; labels: string[] } {
  const now = Date.now();
  const buckets: Bucket[] = Array.from({ length: 24 }, () => ({ allow: 0, escalate: 0, block: 0 }));
  const labels = Array.from({ length: 24 }, (_, i) => String(new Date(now - (23 - i) * HOUR).getHours()).padStart(2, "0"));
  for (const p of points) {
    const idx = 23 - Math.floor((now - new Date(p.created_at).getTime()) / HOUR);
    if (idx < 0 || idx > 23) continue;
    if (p.decision === "ALLOW") buckets[idx].allow++;
    else if (p.decision === "ESCALATE") buckets[idx].escalate++;
    else if (p.decision === "BLOCK") buckets[idx].block++;
  }
  return { buckets, labels };
}

function Overview({ ws }: { ws: Workspace }) {
  const [s, setS] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Row[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const c = (t: string) => supabase.from(t).select("id", { count: "exact", head: true }).eq("workspace_id", ws.id);
      const since = new Date(Date.now() - 864e5).toISOString();
      const [agents, policies, keys, pending, incidents, allow, block, esc, rec, series] = await Promise.all([
        c("agents"),
        c("policies").eq("enabled", true),
        c("api_keys").is("revoked_at", null),
        c("approvals").eq("status", "pending"),
        c("incidents").eq("status", "open"),
        c("decisions").eq("decision", "ALLOW").gte("created_at", since),
        c("decisions").eq("decision", "BLOCK").gte("created_at", since),
        c("decisions").eq("decision", "ESCALATE").gte("created_at", since),
        supabase.from("decisions").select("id,created_at,decision,agent_id,agents(name),evidence(action)").eq("workspace_id", ws.id).order("created_at", { ascending: false }).limit(8),
        supabase.from("decisions").select("created_at,decision").eq("workspace_id", ws.id).gte("created_at", since).limit(1000),
      ]);
      if (!alive) return;
      setS({
        agents: agents.count ?? 0, policies: policies.count ?? 0, keys: keys.count ?? 0, pending: pending.count ?? 0,
        incidents: incidents.count ?? 0, allow: allow.count ?? 0, block: block.count ?? 0, escalate: esc.count ?? 0,
      });
      setRecent((rec.data ?? []) as Row[]);
      setPoints((series.data ?? []) as Point[]);
    })();
    return () => { alive = false; };
  }, [ws.id]);

  if (!s) return <Skeleton />;
  const total24 = s.allow + s.block + s.escalate;
  const { buckets, labels } = bucketize(points);
  const steps = [
    { done: s.keys > 0, label: "Create an API key", href: "/dashboard/api-keys" },
    { done: s.policies > 0, label: "Add a policy (or load the starter policies)", href: "/dashboard/policies" },
    { done: s.agents > 0, label: "Connect or import your agents", href: "/dashboard/agents" },
    { done: total24 > 0 || recent.length > 0, label: "Send your first test action", href: "/dashboard/decisions" },
  ];
  const tiles = [
    { label: "Agents", value: s.agents, href: "/dashboard/agents" },
    { label: "Active policies", value: s.policies, href: "/dashboard/policies" },
    { label: "Pending approvals", value: s.pending, href: "/dashboard/approvals", warn: s.pending > 0 },
    { label: "Open incidents", value: s.incidents, href: "/dashboard/incidents", warn: s.incidents > 0 },
  ];

  return (
    <div className="space-y-6">
      <HomeHero workspaceName={ws.name} />

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-xl border border-border bg-surface-1 p-4 transition hover:border-primary/60 active:scale-[0.98] sm:p-5">
            <div className="text-xs font-medium text-muted-foreground">{t.label}</div>
            <div className={cn("mt-2 text-3xl font-semibold tracking-tight sm:text-4xl", t.warn && "text-escalate")}>{t.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <h2 className="text-sm font-semibold">Decisions per hour</h2>
          <p className="mt-1 text-xs text-muted-foreground">Last 24 hours. Hover a bar for the exact counts.</p>
          <HourlyChart buckets={buckets} labels={labels} />
        </Panel>
        <Panel>
          <h2 className="text-sm font-semibold">Outcome split</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total24} decisions in the last 24 hours.</p>
          <DecisionSplit allow={s.allow} escalate={s.escalate} block={s.block} />
        </Panel>
      </div>

      <Panel>
        <h2 className="text-sm font-semibold">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet. Decisions appear here the moment an agent calls the API.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {recent.map((r) => {
              const open = openId === r.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="flex min-h-12 w-full flex-wrap items-center gap-x-3 gap-y-1 py-2 text-left text-sm hover:bg-surface-3/60"
                  >
                    <Badge value={r.decision} />
                    <span className="font-mono text-xs">{r.evidence?.[0]?.action ?? "-"}</span>
                    <span className="text-muted-foreground">{r.agents?.name ?? "Unknown agent"}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{fmt(r.created_at)}</span>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                  </button>
                  {open && (
                    <dl className="grid gap-3 rounded-lg bg-surface-1 p-4 text-xs sm:grid-cols-4">
                      <div><dt className="text-muted-foreground">Decision ID</dt><dd className="mt-1 font-mono">{String(r.id).slice(0, 12)}</dd></div>
                      <div><dt className="text-muted-foreground">Agent</dt><dd className="mt-1">{r.agents?.name ?? "Unknown agent"}</dd></div>
                      <div><dt className="text-muted-foreground">Action</dt><dd className="mt-1 font-mono">{r.evidence?.[0]?.action ?? "-"}</dd></div>
                      <div className="flex items-end">
                        <Link href={`/dashboard/decisions/${r.id}`} className="font-medium text-primary hover:underline">Open full decision</Link>
                      </div>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function OverviewPage() {
  return <WorkspaceGate>{(ws) => <Overview key={ws.id} ws={ws} />}</WorkspaceGate>;
}