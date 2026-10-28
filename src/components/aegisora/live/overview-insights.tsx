"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Row = { created_at: string; decision: string | null; agent_name: string | null; action: string | null; risk_score: number | null; policy_id: string | null };
type Pending = { id: string; agent_name: string | null; action: string | null; requested_at: string; expires_at: string };
type Bubble = { name: string; x: number; y: number; z: number; esc: number };

const DAY = 864e5;
const PAGE = 1000;
const MAX_PAGES = 5;
const C = { allow: "var(--allow)", escalate: "var(--escalate)", block: "var(--block)", primary: "var(--primary)", grid: "var(--border)", text: "var(--muted-foreground)" };
const PALETTE = ["#3a85f8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#94a3b8"];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--popover-foreground)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" },
  labelStyle: { color: "var(--popover-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--popover-foreground)" },
};
const axis = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, axisLine: false, tickLine: false };

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const dayKey = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

function stat(rows: Row[]) {
  let allow = 0, block = 0, esc = 0, policy = 0, high = 0;
  for (const r of rows) {
    if (r.decision === "ALLOW") allow++;
    else if (r.decision === "BLOCK") block++;
    else if (r.decision === "ESCALATE") esc++;
    if (r.policy_id) policy++;
    if ((r.risk_score ?? 0) >= 70) high++;
  }
  return { total: rows.length, allow, block, esc, policy, high };
}

function build(rows: Row[]) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return { key: dayKey(d), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), allow: 0, escalate: 0, block: 0, total: 0, blockRate: 0, allowRate: 0, escRate: 0 };
  });
  const idx = new Map(days.map((d, i) => [d.key, i]));
  const cur: Row[] = [];
  const prev: Row[] = [];
  const week = [0, 0, 0, 0, 0, 0, 0];
  for (const r of rows) {
    const t = new Date(r.created_at);
    const i = idx.get(dayKey(t));
    if (i === undefined) continue;
    const d = days[i];
    d.total++;
    if (r.decision === "ALLOW") d.allow++;
    else if (r.decision === "BLOCK") d.block++;
    else if (r.decision === "ESCALATE") d.escalate++;
    (i >= 7 ? cur : prev).push(r);
    week[(t.getDay() + 6) % 7]++;
  }
  for (const d of days) {
    d.blockRate = pct(d.block, d.total);
    d.allowRate = pct(d.allow, d.total);
    d.escRate = pct(d.escalate, d.total);
  }
  const sc = stat(cur);
  const sp = stat(prev);

  const ag = new Map<string, { name: string; allow: number; escalate: number; block: number; total: number }>();
  const cat = new Map<string, number>();
  const blocked = new Map<string, number>();
  for (const r of cur) {
    const name = r.agent_name || "Unknown";
    const a = ag.get(name) ?? { name, allow: 0, escalate: 0, block: 0, total: 0 };
    a.total++;
    if (r.decision === "ALLOW") a.allow++;
    else if (r.decision === "BLOCK") a.block++;
    else if (r.decision === "ESCALATE") a.escalate++;
    ag.set(name, a);
    const fam = (r.action || "unknown").split(".")[0] || "unknown";
    cat.set(fam, (cat.get(fam) ?? 0) + 1);
    if (r.decision === "BLOCK") blocked.set(r.action || "unknown", (blocked.get(r.action || "unknown") ?? 0) + 1);
  }
  const agents = [...ag.values()].sort((a, b) => b.total - a.total);
  const bubbles: Bubble[] = agents.slice(0, 12).map((a) => ({ name: a.name, x: a.total, y: pct(a.block, a.total), z: Math.max(a.escalate, 1), esc: a.escalate }));
  const catSorted = [...cat.entries()].sort((a, b) => b[1] - a[1]);
  const cats = catSorted.slice(0, 5).map(([name, value]) => ({ name, value }));
  const rest = catSorted.slice(5).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) cats.push({ name: "other", value: rest });
  const topBlocked = [...blocked.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([action, count]) => ({ action, count }));
  const avgBlock = pct(sc.block, sc.total);
  const radar = [
    { axis: "Policy coverage", cur: pct(sc.policy, sc.total), prev: pct(sp.policy, sp.total) },
    { axis: "Allowed", cur: pct(sc.allow, sc.total), prev: pct(sp.allow, sp.total) },
    { axis: "Blocked", cur: pct(sc.block, sc.total), prev: pct(sp.block, sp.total) },
    { axis: "Escalated", cur: pct(sc.esc, sc.total), prev: pct(sp.esc, sp.total) },
    { axis: "High risk", cur: pct(sc.high, sc.total), prev: pct(sp.high, sp.total) },
  ];
  const today = (new Date().getDay() + 6) % 7;
  const weekData = WEEK.map((name, i) => ({ name, value: week[i], today: i === today }));
  return { days, sc, sp, agents: agents.slice(0, 6), bubbles, cats, topBlocked, avgBlock, radar, weekData, total: rows.length };
}

function Card({ title, hint, className, children }: { title: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("aeg-panel min-w-0 p-4 sm:p-5", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Not enough data yet.</p>;
}

function Kpi({ label, value, deltaText, dir, tone, spark, color }: { label: string; value: string; deltaText: string | null; dir: number; tone: "good" | "bad" | "neutral"; spark: { v: number }[]; color: string }) {
  const Icon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  const cls = dir === 0 || tone === "neutral" ? "text-muted-foreground" : (tone === "good") === (dir > 0) ? "text-allow" : "text-block";
  return (
    <div className="aeg-panel min-w-0 p-4 sm:p-5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{value}</div>
      <div className={cn("mt-1 flex items-center gap-1 text-xs", cls)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {deltaText ?? "no prior week"}
      </div>
      <div className="mt-3 h-9">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.14} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BubbleTip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Bubble }> }) {
  const b = active && payload && payload.length > 0 ? payload[0].payload : undefined;
  if (!b) return null;
  return (
    <div style={tip.contentStyle}>
      <div className="px-3 py-2">
        <div className="font-semibold">{b.name}</div>
        <div className="mt-1 text-muted-foreground">{b.x} decisions</div>
        <div className="text-muted-foreground">{b.y}% blocked</div>
        <div className="text-muted-foreground">{b.esc} escalations</div>
      </div>
    </div>
  );
}

function hoursLeft(iso: string) {
  const h = Math.round((Date.parse(iso) - Date.now()) / 36e5);
  return h < 1 ? "under 1h left" : h + "h left";
}

export function OverviewInsights({ wsId }: { wsId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = createClient();
        const since = new Date();
        since.setHours(0, 0, 0, 0);
        since.setDate(since.getDate() - 13);
        const out: Row[] = [];
        for (let p = 0; p < MAX_PAGES; p++) {
          const { data, error } = await sb
            .from("decisions")
            .select("created_at,decision,agent_name,action,risk_score,policy_id")
            .eq("workspace_id", wsId)
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: false })
            .range(p * PAGE, p * PAGE + PAGE - 1);
          if (error) throw error;
          const batch = (data ?? []) as Row[];
          out.push(...batch);
          if (batch.length < PAGE) break;
        }
        const ap = await sb
          .from("approvals")
          .select("id,agent_name,action,requested_at,expires_at")
          .eq("workspace_id", wsId)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("requested_at", { ascending: false })
          .limit(25);
        if (!alive) return;
        setRows(out);
        setPending(ap.error ? [] : ((ap.data ?? []) as Pending[]));
      } catch {
        if (!alive) return;
        setFailed(true);
        setRows([]);
      }
    })();
    return () => { alive = false; };
  }, [wsId]);

  const m = useMemo(() => (rows ? build(rows) : null), [rows]);

  if (!m) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-surface-3" />)}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-surface-3" />
      </div>
    );
  }
  if (failed) {
    return <p className="rounded-lg border border-border bg-surface-1 p-4 text-sm text-muted-foreground">The trend charts could not be loaded. Refresh the page, or contact support if this continues.</p>;
  }
  if (m.total === 0) {
    return <Card title="Trends"><p className="py-6 text-sm text-muted-foreground">No decisions in the last 14 days. Charts appear here after your agents send their first actions.</p></Card>;
  }

  const { sc, sp } = m;
  const hasPrev = sp.total > 0;
  const dTotal = hasPrev ? Math.round(((sc.total - sp.total) / sp.total) * 100) : null;
  const rateDelta = (a: number, b: number) => (hasPrev ? Math.round((a - b) * 10) / 10 : null);
  const dAllow = rateDelta(pct(sc.allow, sc.total), pct(sp.allow, sp.total));
  const dBlock = rateDelta(pct(sc.block, sc.total), pct(sp.block, sp.total));
  const dEsc = rateDelta(pct(sc.esc, sc.total), pct(sp.esc, sp.total));
  const sign = (n: number) => (n > 0 ? "+" : "");
  const fmtPct = (n: number | null) => (n === null ? null : sign(n) + n + " pp vs previous 7 days");
  const dir = (n: number | null) => (n === null || n === 0 ? 0 : n > 0 ? 1 : -1);
  const sparkOf = (k: "total" | "allowRate" | "blockRate" | "escRate") => m.days.map((d) => ({ v: d[k] }));
  const catTotal = m.cats.reduce((s, c) => s + c.value, 0);
  const agentsH = Math.max(200, m.agents.length * 46 + 40);
  const bubbleColor = (y: number) => (y >= 40 ? C.block : y >= 15 ? C.escalate : C.allow);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi label="Decisions, 7 days" value={sc.total.toLocaleString()} deltaText={dTotal === null ? null : sign(dTotal) + dTotal + "% vs previous 7 days"} dir={dir(dTotal)} tone="neutral" spark={sparkOf("total")} color={C.primary} />
        <Kpi label="Allow rate" value={pct(sc.allow, sc.total) + "%"} deltaText={fmtPct(dAllow)} dir={dir(dAllow)} tone="good" spark={sparkOf("allowRate")} color={C.allow} />
        <Kpi label="Block rate" value={pct(sc.block, sc.total) + "%"} deltaText={fmtPct(dBlock)} dir={dir(dBlock)} tone="neutral" spark={sparkOf("blockRate")} color={C.block} />
        <Kpi label="Escalation rate" value={pct(sc.esc, sc.total) + "%"} deltaText={fmtPct(dEsc)} dir={dir(dEsc)} tone="bad" spark={sparkOf("escRate")} color={C.escalate} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Decisions per day" hint="Last 14 days. Tap or hover for exact counts.">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  {(["allow", "escalate", "block"] as const).map((k) => (
                    <linearGradient key={k} id={"ov-" + k} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "var(--" + k + ")", stopOpacity: 0.45 }} />
                      <stop offset="100%" style={{ stopColor: "var(--" + k + ")", stopOpacity: 0.03 }} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={18} />
                <YAxis {...axis} width={34} allowDecimals={false} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Area type="monotone" dataKey="allow" name="Allowed" stackId="d" stroke={C.allow} strokeWidth={2} fill="url(#ov-allow)" />
                <Area type="monotone" dataKey="escalate" name="Escalated" stackId="d" stroke={C.escalate} strokeWidth={2} fill="url(#ov-escalate)" />
                <Area type="monotone" dataKey="block" name="Blocked" stackId="d" stroke={C.block} strokeWidth={2} fill="url(#ov-block)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Where decisions come from" hint="Action families, last 7 days">
          {m.cats.length === 0 ? <Empty /> : (
            <>
              <div className="relative h-44 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip {...tip} />
                    <Pie data={m.cats} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
                      {m.cats.map((c, i) => <Cell key={c.name} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-2xl font-semibold tabular-nums">{catTotal.toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground">decisions</div>
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs">
                {m.cats.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                    <span className="font-mono text-muted-foreground">{c.value.toLocaleString()}</span>
                    <span className="w-10 text-right font-mono text-muted-foreground">{Math.round(pct(c.value, catTotal))}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Block rate trend" hint={"Share of decisions blocked per day. Dashed line: 7-day average (" + m.avgBlock + "%)."}>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={18} />
                <YAxis {...axis} width={38} unit="%" domain={[0, "auto"]} />
                <Tooltip {...tip} />
                <ReferenceLine y={m.avgBlock} stroke={C.escalate} strokeDasharray="5 4" />
                <Line type="monotone" dataKey="blockRate" name="Block rate" unit="%" stroke={C.block} strokeWidth={2.5} dot={{ r: 3, fill: C.block, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Busiest days of the week" hint="Last 14 days combined. Today is highlighted.">
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.weekData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} width={34} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
                <Bar dataKey="value" name="Decisions" radius={[6, 6, 0, 0]}>
                  {m.weekData.map((d) => <Cell key={d.name} fill={d.today ? C.primary : "color-mix(in srgb, var(--muted-foreground) 45%, transparent)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Governance profile" hint="Share of decisions, last 7 days vs the 7 days before." className="md:col-span-2 xl:col-span-1">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={m.radar} outerRadius="68%">
                <PolarGrid stroke={C.grid} />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Last 7 days" dataKey="cur" stroke={C.primary} fill={C.primary} fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Previous 7 days" dataKey="prev" stroke={C.text} fill={C.text} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Agents by outcome" hint="Top agents by volume, last 7 days.">
          {m.agents.length === 0 ? <Empty /> : (
            <div style={{ height: agentsH }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.agents} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={C.grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" {...axis} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" {...axis} width={92} tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 13) + "…" : v)} />
                  <Tooltip {...tip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                  <Bar dataKey="allow" name="Allowed" stackId="a" fill={C.allow} />
                  <Bar dataKey="escalate" name="Escalated" stackId="a" fill={C.escalate} />
                  <Bar dataKey="block" name="Blocked" stackId="a" fill={C.block} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Agent risk map" hint="Volume vs block rate. Bubble size = escalations. Red: 40%+ blocked, amber: 15%+.">
          {m.bubbles.length === 0 ? <Empty /> : (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke={C.grid} strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="Decisions" {...axis} allowDecimals={false} />
                  <YAxis type="number" dataKey="y" name="Block rate" unit="%" {...axis} width={40} domain={[0, 100]} />
                  <ZAxis type="number" dataKey="z" range={[80, 480]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<BubbleTip />} />
                  <Scatter data={m.bubbles}>
                    {m.bubbles.map((b) => <Cell key={b.name} fill={bubbleColor(b.y)} fillOpacity={0.72} stroke={bubbleColor(b.y)} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cn("aeg-panel min-w-0 p-4 sm:p-5", pending.length > 0 && "border-l-4 border-l-escalate")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-escalate" aria-hidden="true" />
              Pending approvals{pending.length > 0 ? " (" + pending.length + ")" : ""}
            </h2>
            <Link href="/dashboard/approvals" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No actions are waiting for a human decision.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border/60">
              {pending.slice(0, 4).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                  <span className="font-mono text-xs">{p.action ?? "-"}</span>
                  <span className="text-muted-foreground">{p.agent_name ?? "Unknown agent"}</span>
                  <span className="ml-auto text-xs text-escalate">{hoursLeft(p.expires_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card title="Most blocked actions" hint="Last 7 days">
          {m.topBlocked.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing was blocked in the last 7 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Action</th>
                    <th className="py-2 pr-3 text-right font-medium">Blocked</th>
                    <th className="py-2 text-right font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {m.topBlocked.map((b) => (
                    <tr key={b.action} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-mono text-xs">{b.action}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-xs text-block">{b.count.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono text-xs text-muted-foreground">{Math.round(pct(b.count, sc.block))}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {m.total >= PAGE * MAX_PAGES ? <p className="text-xs text-muted-foreground">Charts use the latest {(PAGE * MAX_PAGES).toLocaleString()} decisions of the last 14 days.</p> : null}
    </div>
  );
}