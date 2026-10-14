"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Workspace = { id: string; name: string; slug: string };
let cached: Workspace | null = null;

export function useWorkspace() {
  const [ws, setWs] = useState<Workspace | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("workspace_members")
      .select("workspaces(id,name,slug)")
      .order("created_at", { ascending: true })
      .limit(1);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const raw = (data?.[0] as unknown as { workspaces?: Workspace | Workspace[] } | undefined)?.workspaces;
    cached = (Array.isArray(raw) ? raw[0] : raw) ?? null;
    setWs(cached);
    setError(null);
    setLoading(false);
  }, []);

  // Cache miss intentionally triggers asynchronous workspace hydration.
  useEffect(() => {
    if (cached === null) {
      const timer = window.setTimeout(() => {
        void load();
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [load]);

  return { ws, loading, error, reload: load };
}





