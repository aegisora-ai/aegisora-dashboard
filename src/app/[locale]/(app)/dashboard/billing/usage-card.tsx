"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/aegisora/use-workspace";

type Usage = {
  window: { start: string; end: string };
  evaluations: { total: number; allow: number; block: number; escalate: number };
  source: string;
  billing_status: "not_connected";
};

export function UsageCard() {
  const { ws, loading: workspaceLoading } = useWorkspace();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (workspaceLoading) return;
      if (!ws) {
        setError("No active workspace is available.");
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) { setError("Sign in to view workspace usage."); setLoading(false); }
        return;
      }
      try {
        const response = await fetch("/api/v1/workspace/usage", {
          headers: { Authorization: `Bearer ${session.access_token}`, "X-Workspace-Id": ws.id },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error?.message ?? "Unable to load usage.");
        if (!cancelled) { setUsage(body as Usage); setError(null); }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load usage.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [ws, workspaceLoading]);

  const metric = (label: string, value?: number) => (
    <div className="rounded-lg border border-border/70 p-4" key={label}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-medium tabular-nums">{loading ? "—" : (value ?? 0).toLocaleString()}</p>
    </div>
  );

  return (
    <section aria-labelledby="usage-heading" className="aeg-panel space-y-4 p-5">
      <div>
        <h2 id="usage-heading" className="text-sm font-medium">Governance activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">Persisted decisions recorded this UTC calendar month. These counts are operational telemetry, not billable usage.</p>
      </div>
      {error ? <p role="status" className="text-sm text-destructive">{error}</p> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metric("Evaluations", usage?.evaluations.total)}
            {metric("Allowed", usage?.evaluations.allow)}
            {metric("Blocked", usage?.evaluations.block)}
            {metric("Escalated", usage?.evaluations.escalate)}
          </div>
          {usage && <p className="text-xs text-muted-foreground">UTC window: {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(usage.window.start))} up to (but not including) {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(usage.window.end))}. Source: {usage.source}.</p>}
        </>
      )}
    </section>
  );
}
