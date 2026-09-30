"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/aegisora/use-workspace";

export function usePendingApprovals(): number {
  const { ws } = useWorkspace();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!ws) return;
    const supabase = createClient();
    let alive = true;
    const load = async () => {
      const { count } = await supabase
        .from("approvals")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id)
        .eq("status", "pending");
      if (alive) setN(count ?? 0);
    };
    void load();
    const ch = supabase
      .channel(`pending-${ws.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals", filter: `workspace_id=eq.${ws.id}` }, () => { void load(); })
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
  }, [ws]);

  return n;
}