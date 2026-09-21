"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function Sparkline({ data, tone = "cyan" }: { data: number[]; tone?: "cyan" | "allow" | "block" | "escalate" }) {
  const points = data.map((v, i) => ({ i, v }));
  const stroke = `var(--${tone === "cyan" ? "cyan" : tone})`;
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#spark-${tone})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DecisionBreakdownChart({ allow, block, escalate }: { allow: number; block: number; escalate: number }) {
  const data = [
    { name: "ALLOW", value: allow, color: "var(--allow)" },
    { name: "BLOCK", value: block, color: "var(--block)" },
    { name: "ESCALATE", value: escalate, color: "var(--escalate)" },
  ];
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            cursor={{ fill: "var(--surface-3)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskTrendChart({ data }: { data: { day: number; low: number; medium: number; high: number; critical: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)" }}
            labelFormatter={(d) => `Day ${d}`}
          />
          <Line type="monotone" dataKey="low" stroke="var(--allow)" strokeWidth={1.5} dot={false} name="LOW" />
          <Line type="monotone" dataKey="medium" stroke="var(--cyan)" strokeWidth={1.5} dot={false} name="MEDIUM" />
          <Line type="monotone" dataKey="high" stroke="var(--escalate)" strokeWidth={1.5} dot={false} name="HIGH" />
          <Line type="monotone" dataKey="critical" stroke="var(--block)" strokeWidth={2} dot={false} name="CRITICAL" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityBreakdownChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={70} />
          <Tooltip
            cursor={{ fill: "var(--surface-3)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MatchTrendChart({ data }: { data: number[] }) {
  const points = data.map((v, i) => ({ day: i + 1, v }));
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="match-trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)" }}
            labelFormatter={(d) => `Day ${d}`}
          />
          <Area type="monotone" dataKey="v" stroke="var(--cyan)" strokeWidth={2} fill="url(#match-trend)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}