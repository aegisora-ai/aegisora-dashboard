"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Notice, btnGhost, fmt } from "@/components/aegisora/live/ui";

function Verify({ wsId }: { wsId: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <>
      <button
        className={btnGhost}
        onClick={async () => {
          const { data, error } = await createClient().rpc("verify_evidence_chain", { ws: wsId });
          if (error) return setMsg({ ok: false, text: error.message });
          const r = (Array.isArray(data) ? data[0] : data) as { total: number; broken: number };
          setMsg(r.broken === 0 ? { ok: true, text: `Chain intact: ${r.total} records verified.` } : { ok: false, text: `Integrity failure: ${r.broken} of ${r.total} records do not verify.` });
        }}
      >
        Verify chain
      </button>
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
      headerActions={(ws) => <Verify wsId={ws.id} />}
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