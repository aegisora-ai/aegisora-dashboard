"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { demoAgents } from "@/lib/demo-agents";
import { demoApprovals } from "@/lib/demo-approvals";
import { demoDecisions } from "@/lib/demo-data";
import { demoIncidents } from "@/lib/demo-incidents";
import { demoIntegrations } from "@/lib/demo-integrations";
import { demoMembers } from "@/lib/demo-team";
import { demoPolicies } from "@/lib/demo-policies";
import { demoProviders } from "@/lib/demo-providers";
import { demoTraces } from "@/lib/demo-traces";
import { demoWebhooks } from "@/lib/demo-webhooks";
import { cn } from "@/lib/utils";

type Item = { label: string; hint?: string; href: string; group: string; keywords?: string };

const items: Item[] = [
  { label: "Overview", href: "/dashboard", group: "Go to" },
  { label: "Decisions", href: "/dashboard/decisions", group: "Go to" },
  { label: "Approvals", href: "/dashboard/approvals", group: "Go to" },
  { label: "Evidence", href: "/dashboard/evidence", group: "Go to" },
  { label: "Audit", href: "/dashboard/audit", group: "Go to" },
  { label: "Agents", href: "/dashboard/agents", group: "Go to" },
  { label: "Policies", href: "/dashboard/policies", group: "Go to" },
  { label: "Risk", href: "/dashboard/risk", group: "Go to" },
  { label: "Incidents", href: "/dashboard/incidents", group: "Go to" },
  { label: "Traces", href: "/dashboard/traces", group: "Go to" },
  { label: "Live Activity", href: "/dashboard/activity", group: "Go to" },
  { label: "Providers", href: "/dashboard/providers", group: "Go to" },
  { label: "Integrations", href: "/dashboard/integrations", group: "Go to" },
  { label: "Webhooks", href: "/dashboard/webhooks", group: "Go to" },
  { label: "Team", href: "/dashboard/team", group: "Go to" },
  { label: "Identity", href: "/dashboard/identity", group: "Go to" },
  { label: "Billing", href: "/dashboard/billing", group: "Go to" },
  { label: "Workspace", href: "/dashboard/workspace", group: "Go to" },
  { label: "Settings", href: "/dashboard/settings", group: "Go to" },
  ...demoDecisions.map((d) => ({
    label: `${d.action} by ${d.agent}`,
    hint: d.id,
    href: `/dashboard/decisions/${d.id}`,
    group: "Decisions",
    keywords: `${d.agent} ${d.policy} ${d.traceId} ${d.evidenceId} ${d.auditId} ${d.state} ${d.environment}`,
  })),
  ...demoApprovals.map((a) => ({
    label: `${a.action} by ${a.agent}`,
    hint: a.id,
    href: `/dashboard/approvals/${a.id}`,
    group: "Approvals",
    keywords: `${a.policy} ${a.status} ${a.environment}`,
  })),
  ...demoAgents.map((a) => ({
    label: a.name,
    hint: a.id,
    href: `/dashboard/agents/${a.id}`,
    group: "Agents",
    keywords: `${a.environment} ${a.status} ${a.owner}`,
  })),
  ...demoPolicies.map((p) => ({
    label: `${p.name}-${p.version}`,
    hint: p.id,
    href: `/dashboard/policies/${p.id}`,
    group: "Policies",
    keywords: `${p.agent} ${p.action} ${p.environment} ${p.decision}`,
  })),
  ...demoIncidents.map((i) => ({
    label: i.title,
    hint: i.id,
    href: `/dashboard/incidents/${i.id}`,
    group: "Incidents",
    keywords: `${i.agent} ${i.status} ${i.severity}`,
  })),
  ...demoTraces.map((t) => ({
    label: `${t.agent} / ${t.action}`,
    hint: t.id,
    href: `/dashboard/traces/${t.id}`,
    group: "Traces",
    keywords: `${t.environment} ${t.outcome}`,
  })),
  ...demoProviders.map((p) => ({
    label: p.name,
    hint: p.id,
    href: `/dashboard/providers/${p.id}`,
    group: "Providers",
    keywords: `${p.kind} ${p.status} ${p.region}`,
  })),
  ...demoIntegrations.map((i) => ({
    label: i.name,
    hint: i.category,
    href: "/dashboard/integrations",
    group: "Integrations",
    keywords: `${i.category} ${i.status}`,
  })),
  ...demoWebhooks.map((w) => ({
    label: w.url,
    hint: w.id,
    href: `/dashboard/webhooks/${w.id}`,
    group: "Webhooks",
    keywords: `${w.status} ${w.events.join(" ")}`,
  })),
  ...demoMembers.map((m) => ({
    label: m.name,
    hint: m.role,
    href: "/dashboard/team",
    group: "Team",
    keywords: `${m.email} ${m.status} ${m.role}`,
  })),
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQ("");
      setIdx(0);
    }
  }

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((i) => !s || `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""}`.toLowerCase().includes(s))
      .slice(0, 12);
  }, [q]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  function go(i: Item) {
    onClose();
    router.push(i.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((v) => Math.min(v + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter" && results[idx]) {
      e.preventDefault();
      go(results[idx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Aegisora Control"
        onKeyDown={onKeyDown}
        className="aeg-panel relative w-full max-w-xl overflow-hidden bg-popover"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="Search decisions, approvals, agents, policies, trace IDs"
            aria-label="Search"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <ul role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matching records.</li>}
          {results.map((r, i) => (
            <li key={`${r.href}-${i}`} role="option" aria-selected={i === idx}>
              <button
                type="button"
                onClick={() => go(r)}
                onMouseEnter={() => setIdx(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-sm px-3 py-2 text-left text-sm",
                  i === idx ? "bg-surface-4" : "hover:bg-surface-3",
                )}
              >
                <span>
                  <span className="block">{r.label}</span>
                  <span className="block font-mono text-[10px] tracking-wider text-muted-foreground">{r.group.toUpperCase()}</span>
                </span>
                {r.hint && <span className="font-mono text-[11px] text-muted-foreground">{r.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}