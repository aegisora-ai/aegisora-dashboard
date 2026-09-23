'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Server, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockChartData = [
  { time: '08:00', allowed: 120, blocked: 12 },
  { time: '09:00', allowed: 210, blocked: 25 },
  { time: '10:00', allowed: 380, blocked: 45 },
  { time: '11:00', allowed: 310, blocked: 30 },
  { time: '12:00', allowed: 450, blocked: 80 },
  { time: '13:00', allowed: 390, blocked: 60 },
  { time: '14:00', allowed: 520, blocked: 90 },
];

const mockLogs = [
  { id: '1', agent: 'Customer-Support-Bot', action: 'stripe_refund_api', risk: 'High', status: 'BLOCKED', time: 'Just now' },
  { id: '2', agent: 'Internal-Data-Analyzer', action: 'postgres_read_query', risk: 'Low', status: 'ALLOWED', time: '2 min ago' },
  { id: '3', agent: 'HR-Assistant-Agent', action: 'send_email_api', risk: 'Medium', status: 'ESCALATED', time: '15 min ago' },
  { id: '4', agent: 'Financial-Forecaster', action: 'aws_s3_write', risk: 'High', status: 'BLOCKED', time: '1 hour ago' },
];

const riskStyles: Record<string, string> = {
  High: 'bg-red-500/10 text-red-400 ring-red-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  Low: 'bg-green-500/10 text-green-400 ring-green-500/20',
};

const statusStyles: Record<string, string> = {
  BLOCKED: 'bg-red-500/20 text-red-400',
  ALLOWED: 'bg-green-500/20 text-green-400',
  ESCALATED: 'bg-yellow-500/20 text-yellow-400',
};

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    { name: 'Total Intercepted', value: '2.4M', change: '+14%', icon: Activity, color: 'text-blue-500' },
    { name: 'Actions Blocked', value: '18,400', change: '+2%', icon: ShieldAlert, color: 'text-red-500' },
    { name: 'Active Agents', value: '37', change: '+5', icon: Server, color: 'text-green-500' },
    { name: 'Avg. Latency', value: '18ms', change: '-2ms', icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-[#020611] p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Environment Overview</h1>
            <p className="text-sm text-slate-400">Real-time metrics for your production AI agents.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#1677ff]/10 px-4 py-2 text-[#1677ff] border border-[#1677ff]/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1677ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1677ff]"></span>
            </span>
            <span className="text-sm font-semibold">System Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#061022] p-6 shadow-lg transition-all hover:border-[#1677ff]/50 hover:shadow-[#1677ff]/10">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-800/20 blur-2xl group-hover:bg-[#1677ff]/10 transition-all"></div>
              <div className="flex items-center">
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="truncate text-sm font-medium text-slate-400">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="ml-2 text-sm font-semibold text-green-400">{stat.change}</span>
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-800 bg-[#061022] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Agent Action Volume</h3>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1677ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09162e', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="allowed" stroke="#1677ff" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowed)" />
                    <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#061022] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Action Risk Levels</h3>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData.slice(-4)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{fill: '#1e293b', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#09162e', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="allowed" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-12 text-xl font-bold text-white mb-4">Real-time Policy Evaluations</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#061022] shadow-lg">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-[#09162e]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">AI Agent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Action / Tool Call</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Factor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Decision</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-[#061022]">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#09162e] transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white flex items-center gap-3">
                    <Server className="h-4 w-4 text-slate-500" /> {log.agent}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-slate-300">{log.action}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${riskStyles[log.risk]}`}>
                      {log.risk === 'High' ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                      {log.risk}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyles[log.status]}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
