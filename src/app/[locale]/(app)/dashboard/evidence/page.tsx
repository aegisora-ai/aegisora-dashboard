"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Notice, btnGhost, fmt } from "@/components/aegisora/live/ui";

type ChainResult = { total: number; broken: number };

function Actions({ wsId }: { wsId: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    setMsg(null);
    const { data, error } = await createClient().rpc("verify_evidence_chain", { ws: wsId });
    if (error) return setMsg({ ok: false, text: error.message });
    const r = (Array.isArray(data) ? data[0] : data) as ChainResult | null;
    if (!r) return setMsg({ ok: false, text: "No verification result returned." });
    setMsg(
      r.broken === 0
        ? { ok: true, text: `Chain intact: ${r.total} records verified.` }
        : { ok: false, text: `Integrity failure: ${r.broken} of ${r.total} records do not verify.` },
    );
  }

  async function exportJson() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const rows: unknown[] = [];
      const page = 1000;
      for (let from = 0; ; from += page) {
        const { data, error } = await supabase
          .from("evidence")
          .select("*")
          .eq("workspace_id", wsId)
          .order("seq", { ascending: true })
          .range(from, from + page - 1);
        if (error) throw new Error(error.message);
        rows.push(...(data ?? []));
        if (!data || data.length < page) break;
      }
      const { data: chain } = await supabase.rpc("verify_evidence_chain", { ws: wsId });
      const c = (Array.isArray(chain) ? chain[0] : chain) as ChainResult | null;
      const pack = {
        exported_at: new Date().toISOString(),
        workspace_id: wsId,
        chain_verification: c ? { total: c.total, broken: c.broken } : null,
        record_count: rows.length,
        records: rows,
      };
      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aegisora-evidence-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ ok: true, text: `Exported ${rows.length} records.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Export failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className={btnGhost} onClick={() => void verify()}>Verify chain</button>
      <button className={btnGhost} onClick={() => void exportJson()} disabled={busy}>{busy ? "Exporting..." : "Export JSON"}</button>
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
    </>
  );
}

export default function EvidencePage() {
  return (
    <LiveTable
      table="evidence"
      title="Evidence"
      description="Append-only, hash-chained record of every decision. Each entry commits to the one before it."
      orderBy="seq"
      limit={200}
      headerActions={(ws) => <Actions wsId={ws.id} />}
      columns={[
        { label: "#", render: (r) => <span className="font-mono text-xs">{r.seq}</span> },
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Action", render: (r) => <span className="font-mono text-xs">{r.payload?.action}</span> },
        { label: "Effect", render: (r) => r.payload?.effect },
        { label: "Hash", render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{String(r.hash).slice(0, 16)}...</span> },
      ]}
      empty={{ title: "No evidence yet", body: "An evidence record is written for every decision, including blocked ones." }}
    />
  );
}