"use client";

import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Notice, PageHeader, Panel, Skeleton, WorkspaceGate, btnGhost } from "@/components/aegisora/live/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Column = { label: string; render: (r: Row) => ReactNode };

type Props = {
  table: string;
  title: string;
  description: string;
  columns: Column[];
  empty: { title: string; body: string };
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  realtime?: boolean;
  actions?: (r: Row, reload: () => void) => ReactNode;
  detail?: (r: Row) => unknown;
  above?: (ws: Workspace, reload: () => void) => ReactNode;
  headerActions?: (ws: Workspace, reload: () => void) => ReactNode;
};

// step27: row cache. The last result per table stays in memory, so coming back to a page paints
// immediately and the fresh query runs in the background (no skeleton flash on every navigation).
const rowCache = new Map<string, Row[]>();
const ROW_CACHE_MAX = 40;
function rowCacheSet(key: string, value: Row[]) {
  rowCache.delete(key);
  rowCache.set(key, value);
  if (rowCache.size > ROW_CACHE_MAX) {
    const oldest = rowCache.keys().next().value;
    if (oldest !== undefined) rowCache.delete(oldest);
  }
}

function DetailGrid({ value }: { value: unknown }) {
  const entries = value && typeof value === "object" ? Object.entries(value as Record<string, unknown>) : [];
  const show = (v: unknown) => {
    if (v === null || v === undefined || v === "") return "-";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };
  return (
    <dl className="grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k.replace(/_/g, " ")}</dt>
          <dd className="mt-0.5 max-h-32 overflow-auto break-words font-mono">{show(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LiveTable(props: Props) {
  return <WorkspaceGate>{(ws) => <Inner key={ws.id} ws={ws} {...props} />}</WorkspaceGate>;
}

function Inner({ ws, table, title, description, columns, empty, select = "*", orderBy = "created_at", ascending = false, limit = 100, realtime = false, actions, detail, above, headerActions }: Props & { ws: Workspace }) {
  const cacheKey = [ws.id, table, select, orderBy, String(ascending), String(limit)].join("|");
  const [rows, setRows] = useState<Row[] | null>(() => rowCache.get(cacheKey) ?? null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from(table).select(select).eq("workspace_id", ws.id).order(orderBy, { ascending }).limit(limit);
    if (error) setErr(error.message);
    else {
      const list = (data ?? []) as unknown as Row[];
      rowCacheSet(cacheKey, list);
      setErr(null);
      setRows(list);
    }
  }, [cacheKey, table, select, orderBy, ascending, limit, ws.id]);

  // Initial async table hydration intentionally starts from an effect.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!realtime) return;
    const supabase = createClient();
    const ch = supabase
      .channel(`live-${table}-${ws.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `workspace_id=eq.${ws.id}` }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [realtime, table, ws.id, load]);

  const reload = () => { setRefreshing(true); void load().finally(() => setRefreshing(false)); };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {headerActions?.(ws, reload)}
            <button type="button" onClick={reload} disabled={refreshing} className={btnGhost} aria-label="Refresh"><RefreshCw className={refreshing ? "mr-1.5 size-3.5 animate-spin" : "mr-1.5 size-3.5"} />Refresh</button>
          </>
        }
      />
      {above?.(ws, reload)}
      {err && <Notice>{err}</Notice>}
      {rows === null && !err && <Skeleton />}
      {rows !== null && rows.length === 0 && (
        <Panel>
          <p className="font-medium">{empty.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{empty.body}</p>
        </Panel>
      )}
      {rows !== null && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[color:var(--aeg-card-line)] bg-card [box-shadow:var(--aeg-card-shadow)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((c) => (
                  <th key={c.label} className="bg-surface-1 px-4 py-3 text-xs font-medium text-muted-foreground">{c.label}</th>
                ))}
                {actions && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr tabIndex={0} aria-expanded={open === r.id} className="cursor-pointer border-b border-border/60 transition-colors hover:bg-surface-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" onClick={() => setOpen(open === r.id ? null : r.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(open === r.id ? null : r.id); } }}>
                    {columns.map((c) => (
                      <td key={c.label} className="px-4 py-3 align-top">{c.render(r)}</td>
                    ))}
                    {actions && (
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {actions(r, reload)}
                      </td>
                    )}
                  </tr>
                  {open === r.id && (
                    <tr className="border-b border-border/60">
                      <td colSpan={columns.length + (actions ? 1 : 0)} className="bg-surface-3 px-4 py-3">
                        <DetailGrid value={detail ? detail(r) : r} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}