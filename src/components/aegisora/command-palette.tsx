"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/aegisora/use-workspace";

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
  { label: "Webhooks", href: "/dashboard/webhooks", group: "Go to" },
  { label: "Team", href: "/dashboard/team", group: "Go to" },
  { label: "Billing", href: "/dashboard/billing", group: "Go to" },
  { label: "Workspace", href: "/dashboard/workspace", group: "Go to" },
  { label: "Settings", href: "/dashboard/settings", group: "Go to" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const { ws } = useWorkspace();
  const wsId = ws?.id;
  const term = q.trim();
  const [live, setLive] = useState<{ q: string; items: Item[] }>({ q: "", items: [] });

  // Live search over the signed-in workspace (RLS-scoped), replaces sample data.
  useEffect(() => {
    if (!open || !wsId || term.length < 2) return;
    let alive = true;
    const timer = setTimeout(() => {
      void (async () => {
        const sb = createClient();
        const like = `%${term.replace(/[%_,()]/g, " ")}%`;
        const [a, p, d] = await Promise.all([
          sb.from("agents").select("id,name,framework").eq("workspace_id", wsId).ilike("name", like).limit(5),
          sb.from("policies").select("id,name,version").eq("workspace_id", wsId).ilike("name", like).limit(5),
          sb.from("decisions").select("id,agent_name,action").eq("workspace_id", wsId).ilike("action", like).order("created_at", { ascending: false }).limit(5),
        ]);
        const found: Item[] = [
          ...((a.data ?? []) as { id: string; name: string; framework: string | null }[]).map((r) => ({
            label: r.name, hint: r.framework ?? "agent", href: `/dashboard/agents/${r.id}`, group: "Agents",
          })),
          ...((p.data ?? []) as { id: string; name: string; version: number }[]).map((r) => ({
            label: `${r.name} (v${r.version})`, hint: "policy", href: `/dashboard/policies/${r.id}`, group: "Policies",
          })),
          ...((d.data ?? []) as { id: string; agent_name: string; action: string }[]).map((r) => ({
            label: `${r.action} by ${r.agent_name}`, hint: r.id.slice(0, 8), href: `/dashboard/decisions/${r.id}`, group: "Decisions",
          })),
        ];
        if (alive) setLive({ q: term, items: found });
      })();
    }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [open, wsId, term]);
  const liveItems = useMemo(() => (live.q === term ? live.items : []), [live, term]);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQ("");
      setIdx(0);
    }
  }

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...items, ...liveItems]
      .filter((i) => !s || `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""}`.toLowerCase().includes(s))
      .slice(0, 12);
  }, [q, liveItems]);

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
