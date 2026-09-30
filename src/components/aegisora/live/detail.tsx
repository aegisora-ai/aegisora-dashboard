"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Row } from "@/components/aegisora/live/live-table";
import { Badge, Notice, Panel, Skeleton, fmt } from "@/components/aegisora/live/ui";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RecordState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ok"; row: Row };

// Older deployments named the column "effect"; the canonical schema uses "decision".
export const dec = (r: Row) => r.decision ?? r.effect;

export function useRecord(table: string, workspaceId: string, id: string): RecordState {
  const key = table + ":" + workspaceId + ":" + id;
  const [state, setState] = useState<{ key: string; value: RecordState } | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      let value: RecordState;
      if (!UUID.test(id)) {
        value = { status: "missing" };
      } else {
        const { data, error } = await createClient()
          .from(table).select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
        value = error
          ? { status: "error", message: error.message }
          : data ? { status: "ok", row: data as Row } : { status: "missing" };
      }
      if (alive) setState({ key, value });
    })();
    return () => { alive = false; };
  }, [table, workspaceId, id, key]);
  return state && state.key === key ? state.value : { status: "loading" };
}

export function useRows(table: string, workspaceId: string, column: string, value: string, limit = 8): Row[] | null {
  const key = table + ":" + workspaceId + ":" + column + ":" + value;
  const [state, setState] = useState<{ key: string; rows: Row[] } | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data } = await createClient()
        .from(table).select("*").eq("workspace_id", workspaceId).eq(column, value)
        .order("created_at", { ascending: false }).limit(limit);
      if (alive) setState({ key, rows: (data ?? []) as Row[] });
    })();
    return () => { alive = false; };
  }, [table, workspaceId, column, value, limit, key]);
  return state && state.key === key ? state.rows : null;
}

export function Field({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  const empty = v === null || v === undefined || v === "";
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={mono ? "break-all font-mono text-xs" : ""}>{empty ? "-" : v}</dd>
    </div>
  );
}

export function JsonBlock({ value }: { value: unknown }) {
  const empty = value === null || value === undefined || (typeof value === "object" && Object.keys(value as object).length === 0);
  if (empty) return <p className="text-sm text-muted-foreground">None</p>;
  return <pre className="max-h-72 overflow-auto rounded-sm bg-surface-3 p-3 font-mono text-[11px]">{JSON.stringify(value, null, 2)}</pre>;
}

export function RecordView({ state, backHref, backLabel, children }: {
  state: RecordState; backHref: string; backLabel: string; children: (row: Row) => ReactNode;
}) {
  const back = (
    <p className="font-mono text-xs text-muted-foreground">
      <Link href={backHref} className="hover:text-foreground">{backLabel}</Link>
    </p>
  );
  if (state.status === "loading") return <div className="mx-auto max-w-[80rem] space-y-4">{back}<Skeleton /></div>;
  if (state.status === "error") return <div className="mx-auto max-w-[80rem] space-y-4">{back}<Notice ok={false}>{state.message}</Notice></div>;
  if (state.status === "missing") {
    return (
      <div className="mx-auto max-w-[80rem] space-y-4">
        {back}
        <Panel><p className="py-6 text-center text-sm text-muted-foreground">This record was not found in your workspace.</p></Panel>
      </div>
    );
  }
  return <div className="mx-auto max-w-[80rem] space-y-6">{back}{children(state.row)}</div>;
}

export function DecisionList({ rows }: { rows: Row[] | null }) {
  if (rows === null) return <Skeleton />;
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">No decisions recorded yet.</p>;
  return (
    <ul className="divide-y divide-border/60">
      {rows.map((d) => (
        <li key={d.id}>
          <Link href={`/dashboard/decisions/${d.id}`} className="flex items-center gap-3 py-2.5 hover:text-foreground">
            <span className="font-mono text-[11px] text-muted-foreground">{fmt(d.created_at)}</span>
            <span className="font-mono text-xs">{d.agent_name} / {d.action}</span>
            <span className="ml-auto"><Badge value={dec(d)} /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}