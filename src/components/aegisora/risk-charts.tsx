'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const trendData = [
  { day: 'Mon', critical: 0, high: 3, medium: 8 },
  { day: 'Tue', critical: 1, high: 5, medium: 11 },
  { day: 'Wed', critical: 0, high: 2, medium: 9 },
  { day: 'Thu', critical: 0, high: 4, medium: 14 },
  { day: 'Fri', critical: 1, high: 6, medium: 10 },
  { day: 'Sat', critical: 0, high: 1, medium: 5 },
  { day: 'Sun', critical: 0, high: 3, medium: 7 },
];

const distributionData = [
  { name: 'Critical', value: 0, color: '#ef4444' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Medium', value: 48, color: '#eab308' },
  { name: 'Low', value: 892, color: '#22c55e' },
];

const agentRiskData = [
  { agent: 'Financial-Forecaster', score: 82 },
  { agent: 'Customer-Support-Bot', score: 67 },
  { agent: 'HR-Assistant-Agent', score: 41 },
  { agent: 'Internal-Data-Analyzer', score: 18 },
  { agent: 'Marketing-Copy-Agent', score: 9 },
];

function ChartFrame({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // Client-only chart mount prevents SSR/browser rendering mismatch.
  useEffect(() => {
  const timer = window.setTimeout(() => {
    setMounted(true);
  }, 0);

  return () => window.clearTimeout(timer);
}, []);
  if (!mounted) return <div className="h-[280px]" />;
  return <>{children}</>;
}

export function RiskTrendChart() {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="riskHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="riskMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="url(#riskMedium)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="url(#riskHigh)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#riskCritical)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function RiskDistributionChart() {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
            {distributionData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="var(--surface-2)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function TopAgentsRiskChart() {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={agentRiskData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="agent" stroke="var(--muted-foreground)" fontSize={11} width={150} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'var(--border)', opacity: 0.3 }} contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {agentRiskData.map((entry) => (
              <Cell key={entry.agent} fill={entry.score >= 70 ? '#ef4444' : entry.score >= 40 ? '#eab308' : '#22c55e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}




