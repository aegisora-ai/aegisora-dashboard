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

export function LiveTable(props: Props) {
  return <WorkspaceGate>{(ws) => <Inner key={ws.id} ws={ws} {...props} />}</WorkspaceGate>;
}

function Inner({ ws, table, title, description, columns, empty, select = "*", orderBy = "created_at", ascending = false, limit = 100, realtime = false, actions, detail, above, headerActions }: Props & { ws: Workspace }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from(table).select(select).eq("workspace_id", ws.id).order(orderBy, { ascending }).limit(limit);
    if (error) setErr(error.message);
    else {
      setErr(null);
      setRows((data ?? []) as unknown as Row[]);
    }
  }, [table, select, orderBy, ascending, limit, ws.id]);

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

  const reload = () => { void load(); };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {headerActions?.(ws, reload)}
            <button type="button" onClick={reload} className={btnGhost} aria-label="Refresh"><RefreshCw className="mr-1.5 size-3.5" />Refresh</button>
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
        <div className="overflow-x-auto rounded-md border border-border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((c) => (
                  <th key={c.label} className="px-4 py-2.5 font-mono text-[10px] font-normal tracking-wider text-muted-foreground">{c.label.toUpperCase()}</th>
                ))}
                {actions && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className="cursor-pointer border-b border-border/60 hover:bg-surface-3" onClick={() => setOpen(open === r.id ? null : r.id)}>
                    {columns.map((c) => (
                      <td key={c.label} className="px-4 py-2.5 align-top">{c.render(r)}</td>
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
                        <pre className="overflow-x-auto font-mono text-[11px] text-muted-foreground">{JSON.stringify(detail ? detail(r) : r, null, 2)}</pre>
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




