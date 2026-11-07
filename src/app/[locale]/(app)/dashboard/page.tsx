"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Badge, Notice, PageHeader, Panel, Skeleton, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import type { Row } from "@/components/aegisora/live/live-table";
import type { Bucket } from "@/components/aegisora/live/decision-charts";
import { HourlyBars, StatCard } from "@/components/aegisora/live/overview-v2";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

// null = the query failed (unknown), never "0".
type Stats = { agents: number | null; policies: number | null; keys: number | null; pending: number | null; incidents: number | null; allow: number | null; block: number | null; escalate: number | null };
type Point = { created_at: string; decision: string | null };
type Pending = { id: string; agent_name: string | null; action: string | null; requested_at: string; expires_at: string };

const HOUR = 36e5;
const SERIES_LIMIT = 1000;
const NONE: Stats = { agents: null, policies: null, keys: null, pending: null, incidents: null, allow: null, block: null, escalate: null };
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover";

const pick = (v: unknown): Record<string, unknown> | null =>
  Array.isArray(v) ? ((v[0] as Record<string, unknown> | undefined) ?? null) : ((v as Record<string, unknown> | null) ?? null);

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

function timeLeft(iso: string) {
  const mins = Math.round((Date.parse(iso) - Date.now()) / 6e4);
  if (mins < 1) return "expires now";
  if (mins < 60) return mins + "m left";
  return Math.round(mins / 60) + "h left";
}

function Overview({ ws }: { ws: Workspace }) {
  const [s, setS] = useState<Stats | null>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const [recent, setRecent] = useState<Row[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [attention, setAttention] = useState<Pending[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const c = (t: string) => supabase.from(t).select("id", { count: "exact", head: true }).eq("workspace_id", ws.id);
        const since = new Date(Date.now() - 864e5).toISOString();
        const nowIso = new Date().toISOString();
        const [agents, policies, keys, pending, incidents, allow, block, esc, rec, series, att] = await Promise.all([
          c("agents"),
          c("policies").eq("enabled", true),
          c("api_keys").is("revoked_at", null),
          c("approvals").eq("status", "pending").gt("expires_at", nowIso),
          c("incidents").eq("status", "open"),
          c("decisions").eq("decision", "ALLOW").gte("created_at", since),
          c("decisions").eq("decision", "BLOCK").gte("created_at", since),
          c("decisions").eq("decision", "ESCALATE").gte("created_at", since),
          supabase.from("decisions").select("id,created_at,decision,agent_id,agents(name),evidence(action)").eq("workspace_id", ws.id).order("created_at", { ascending: false }).limit(8),
          supabase.from("decisions").select("created_at,decision").eq("workspace_id", ws.id).gte("created_at", since).order("created_at", { ascending: false }).limit(SERIES_LIMIT),
          supabase.from("approvals").select("id,agent_name,action,requested_at,expires_at").eq("workspace_id", ws.id).eq("status", "pending").gt("expires_at", nowIso).order("requested_at", { ascending: false }).limit(5),
        ]);
        if (!alive) return;
        const bad: string[] = [];
        const num = (label: string, r: { count: number | null; error: unknown }) => {
          if (r.error) { bad.push(label); return null; }
          return r.count ?? 0;
        };
        setS({
          agents: num("agents", agents), policies: num("policies", policies), keys: num("API keys", keys),
          pending: num("approvals", pending), incidents: num("incidents", incidents),
          allow: num("decisions", allow), block: num("decisions", block), escalate: num("decisions", esc),
        });
        if (rec.error) bad.push("recent activity");
        if (series.error) bad.push("hourly chart");
        if (att.error) bad.push("approval list");
        setRecent(rec.error ? [] : ((rec.data ?? []) as unknown as Row[]));
        setPoints(series.error ? [] : ((series.data ?? []) as Point[]));
        setAttention(att.error ? [] : ((att.data ?? []) as Pending[]));
        setFailed(Array.from(new Set(bad)));
      } catch {
        if (!alive) return;
        setS(NONE);
        setFailed(["connection"]);
      }
    })();
    return () => { alive = false; };
  }, [ws.id]);

  if (!s) return <Skeleton />;

  const dash = (x: number | null) => (x === null ? "-" : String(x));
  const decisionsKnown = s.allow !== null && s.block !== null && s.escalate !== null;
  const total24 = (s.allow ?? 0) + (s.block ?? 0) + (s.escalate ?? 0);
  const setupKnown = s.keys !== null && s.policies !== null && s.agents !== null;
  const { buckets, labels } = bucketize(points);
  const steps = [
    { done: (s.keys ?? 0) > 0, label: "Create an API key", cta: "Create an API key", href: "/dashboard/api-keys" },
    { done: (s.policies ?? 0) > 0, label: "Add a policy (or load the starter policies)", cta: "Add a policy", href: "/dashboard/policies" },
    { done: (s.agents ?? 0) > 0, label: "Connect or import your agents", cta: "Connect an agent", href: "/dashboard/agents" },
    { done: total24 > 0 || recent.length > 0, label: "Send your first test action", cta: "Send a test action", href: "/dashboard/decisions" },
  ];
  const nextStep = steps.find((x) => !x.done);
  const doneCount = steps.filter((x) => x.done).length;
  const tiles = [
    { label: "Actions governed (24h)", value: decisionsKnown ? String(total24) : "-", href: "/dashboard/activity", warn: false },
    { label: "Blocked (24h)", value: dash(s.block), href: "/dashboard/decisions", warn: false },
    { label: "Awaiting approval", value: dash(s.pending), href: "/dashboard/approvals", warn: (s.pending ?? 0) > 0 },
    { label: "Open incidents", value: dash(s.incidents), href: "/dashboard/incidents", warn: (s.incidents ?? 0) > 0 },
  ];
  const subtitle = ws.name + " - " + dash(s.agents) + " agents, " + dash(s.policies) + " active policies";

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description={subtitle} />

      {failed.length > 0 && (
        <Notice>
          Some figures could not be loaded ({failed.join(", ")}). A dash means unknown, not zero. Refresh the page, or contact support if this continues.
        </Notice>
      )}

      {setupKnown && nextStep && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Finish setup ({doneCount} of {steps.length})</h2>
              <p className="mt-1 text-xs text-muted-foreground">Next: {nextStep.label}</p>
            </div>
            <Link href={nextStep.href} className={cn(btnPrimary, focusRing)}>
              {nextStep.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <StatCard key={t.label} label={t.label} value={t.value} href={t.href} warn={t.warn} />
        ))}
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Decisions per hour</h2>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
            {decisionsKnown ? " - " + total24 + " total" : ""}
          </p>
        </div>
        <div className="mt-5">
          {points.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No decisions in the last 24 hours.</p>
          ) : (
            <HourlyBars buckets={buckets} labels={labels} />
          )}
        </div>
        {decisionsKnown && total24 > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span className="text-allow">{s.allow} allowed</span>
            <span className="text-escalate">{s.escalate} escalated</span>
            <span className="text-block">{s.block} blocked</span>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-semibold">Recent decisions</h2>
            <Link href="/dashboard/decisions" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted-foreground">No decisions yet. Send a test action from your agent or with curl and it will appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-border text-xs text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Time</th>
                    <th className="px-5 py-2.5 font-medium">Agent</th>
                    <th className="px-5 py-2.5 font-medium">Action</th>
                    <th className="px-5 py-2.5 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={String(r.id)} className="border-b border-border/60 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{fmt(r.created_at)}</td>
                      <td className="px-5 py-3">{String(pick(r.agents)?.name ?? "-")}</td>
                      <td className="px-5 py-3 font-mono text-xs">{String(pick(r.evidence)?.action ?? "-")}</td>
                      <td className="px-5 py-3"><Badge value={r.decision} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Needs your attention</h2>
            {(s.pending ?? 0) > 0 && (
              <Link href="/dashboard/approvals" className={cn(btnPrimary, focusRing)}>{"Review (" + s.pending + ")"}</Link>
            )}
          </div>
          {s.pending === null ? (
            <p className="mt-2 text-sm text-muted-foreground">Approvals could not be loaded.</p>
          ) : attention.length > 0 ? (
            <ul className="mt-3 divide-y divide-border/60">
              {attention.map((a) => (
                <li key={a.id}>
                  <Link href="/dashboard/approvals" className={cn("flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm hover:bg-surface-3/60", focusRing)}>
                    <span className="font-mono text-xs">{a.action ?? "-"}</span>
                    <span className="text-muted-foreground">{a.agent_name ?? "Unknown agent"}</span>
                    <span className="ml-auto text-xs text-escalate">{timeLeft(a.expires_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : s.pending > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{s.pending + " approval(s) are waiting for a decision."}</p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-allow" aria-hidden="true" />
              All clear. No action is waiting for a decision.
            </p>
          )}
          {(s.incidents ?? 0) > 0 && (
            <p className="mt-3 border-t border-border/60 pt-3 text-sm">
              <Link href="/dashboard/incidents" className="font-medium text-primary hover:underline">
                {s.incidents === 1 ? "1 open incident" : s.incidents + " open incidents"}
              </Link>
              <span className="text-muted-foreground"> to review.</span>
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <WorkspaceGate>{(ws) => <Overview ws={ws} />}</WorkspaceGate>;
}