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

  // The server export carries every field needed to recompute each hash outside the database.
  async function exportJson() {
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) throw new Error("Your session is missing or expired. Sign in again.");
      const res = await fetch("/api/v1/workspace/evidence/export", {
        headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": wsId },
        cache: "no-store",
      });
      if (!res.ok) {
        const p = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(p?.error?.message ?? `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aegisora-evidence-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ ok: true, text: "Exported. Anyone can check the file offline: node scripts/security/verify-evidence-export.mjs <file>" });
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