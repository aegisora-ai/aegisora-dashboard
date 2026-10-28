"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type R = { created_at: string; decision: string | null; action: string | null; risk_score: number | null };

const DAY = 864e5;
const C = { allow: "var(--allow)", escalate: "var(--escalate)", block: "var(--block)", primary: "var(--primary)", grid: "var(--border)" };
const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--popover-foreground)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" },
  labelStyle: { color: "var(--popover-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--popover-foreground)" },
};
const axis = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, axisLine: false, tickLine: false };
const dayKey = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

function Card({ title, hint, className, children }: { title: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("aeg-panel min-w-0 p-4 sm:p-5", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function build(rows: R[]) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return { key: dayKey(d), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), allow: 0, escalate: 0, block: 0 };
  });
  const idx = new Map(days.map((d, i) => [d.key, i]));
  const acts = new Map<string, { name: string; allow: number; escalate: number; block: number; total: number }>();
  const risk = [
    { name: "0-19", value: 0 }, { name: "20-39", value: 0 }, { name: "40-59", value: 0 },
    { name: "60-79", value: 0 }, { name: "80-100", value: 0 },
  ];
  for (const r of rows) {
    const i = idx.get(dayKey(new Date(r.created_at)));
    const k = r.decision === "ALLOW" ? "allow" : r.decision === "BLOCK" ? "block" : r.decision === "ESCALATE" ? "escalate" : null;
    if (i !== undefined && k) days[i][k]++;
    const name = r.action || "unknown";
    const a = acts.get(name) ?? { name, allow: 0, escalate: 0, block: 0, total: 0 };
    a.total++;
    if (k) a[k]++;
    acts.set(name, a);
    if (typeof r.risk_score === "number") risk[Math.min(4, Math.floor(r.risk_score / 20))].value++;
  }
  const top = [...acts.values()].sort((a, b) => b.total - a.total).slice(0, 6);
  return { days, top, risk, hasRisk: risk.some((x) => x.value > 0) };
}

export function DecisionCharts({ wsId }: { wsId: string }) {
  const [rows, setRows] = useState<R[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = createClient();
        const since = new Date(Date.now() - 14 * DAY).toISOString();
        const { data, error } = await sb
          .from("decisions")
          .select("created_at,decision,action,risk_score")
          .eq("workspace_id", wsId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(1000);
        if (!alive) return;
        setRows(error ? [] : ((data ?? []) as R[]));
      } catch {
        if (alive) setRows([]);
      }
    })();
    return () => { alive = false; };
  }, [wsId]);

  const m = useMemo(() => (rows && rows.length > 0 ? build(rows) : null), [rows]);

  if (rows === null) return <div className="h-64 animate-pulse rounded-xl bg-surface-3" aria-busy="true" />;
  if (!m) return null;

  const topH = Math.max(200, m.top.length * 46 + 40);
  const riskColor = ["var(--allow)", "var(--allow)", "var(--escalate)", "var(--block)", "var(--block)"];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Decisions per day" hint="Last 14 days. Tap or hover for exact counts.">
          <div className="h-60 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={18} />
                <YAxis {...axis} width={34} allowDecimals={false} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Area type="monotone" dataKey="allow" name="Allowed" stackId="d" stroke={C.allow} strokeWidth={2} fill={C.allow} fillOpacity={0.25} />
                <Area type="monotone" dataKey="escalate" name="Escalated" stackId="d" stroke={C.escalate} strokeWidth={2} fill={C.escalate} fillOpacity={0.25} />
                <Area type="monotone" dataKey="block" name="Blocked" stackId="d" stroke={C.block} strokeWidth={2} fill={C.block} fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Risk score spread" hint={m.hasRisk ? "How risky the actions were, last 14 days." : "No risk scores recorded yet."}>
          <div className="h-60 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.risk} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} width={34} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
                <Bar dataKey="value" name="Decisions" radius={[6, 6, 0, 0]}>
                  {m.risk.map((b, i) => <Cell key={b.name} fill={riskColor[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Top actions by outcome" hint="Most frequent actions, last 14 days.">
        <div style={{ height: topH }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m.top} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={C.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" {...axis} allowDecimals={false} />
              <YAxis type="category" dataKey="name" {...axis} width={120} tickFormatter={(v: string) => (v.length > 20 ? v.slice(0, 19) + "\u2026" : v)} />
              <Tooltip {...tip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="allow" name="Allowed" stackId="a" fill={C.allow} />
              <Bar dataKey="escalate" name="Escalated" stackId="a" fill={C.escalate} />
              <Bar dataKey="block" name="Blocked" stackId="a" fill={C.block} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}