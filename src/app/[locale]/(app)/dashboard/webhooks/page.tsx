"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, Notice, Panel, btnGhost, fmt } from "@/components/aegisora/live/ui";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

const EVENTS = ["decision.block", "decision.escalate", "decision.allow"];

function HookTools({ ws, reload }: { ws: Workspace; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["decision.block", "decision.escalate"]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (events.length === 0) return setMsg({ ok: false, text: "Select at least one event." });
    const secret = "whsec_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const { error } = await createClient().from("webhooks").insert({ workspace_id: ws.id, url: url.trim(), events, secret });
    if (error) return setMsg({ ok: false, text: error.message.includes("check") ? "URL must start with https://" : error.message });
    setMsg({ ok: true, text: "Webhook created. Requests are signed with HMAC-SHA256 in the x-aegisora-signature header." });
    setUrl(""); setOpen(false); reload();
  }

  return (
    <div className="space-y-4">
      <button className={btnGhost} onClick={() => setOpen(!open)}>Add webhook</button>
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
      {open && (
        <Panel>
          <form onSubmit={add} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="w-url">Endpoint URL (https)</Label><Input id="w-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com/aegisora" /></div>
            <div className="flex flex-wrap gap-4 text-sm">
              {EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-2">
                  <input type="checkbox" checked={events.includes(ev)} onChange={(e) => setEvents(e.target.checked ? [...events, ev] : events.filter((x) => x !== ev))} />
                  <span className="font-mono text-xs">{ev}</span>
                </label>
              ))}
            </div>
            <button type="submit" className={btnPrimary}>Create webhook</button>
          </form>
        </Panel>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  return (
    <LiveTable
      table="webhooks"
      title="Webhooks"
      description="Push decisions to your own systems. Delivery happens right after each decision."
      above={(ws, reload) => <HookTools ws={ws} reload={reload} />}
      detail={(r) => ({ ...r, secret: "(hidden)" })}
      columns={[
        { label: "URL", render: (r) => <span className="font-mono text-xs">{r.url}</span> },
        { label: "Events", render: (r) => <span className="text-muted-foreground">{(r.events ?? []).join(", ")}</span> },
        { label: "State", render: (r) => <Badge value={r.enabled ? "active" : "suspended"} /> },
        { label: "Last delivery", render: (r) => (r.last_delivery_at ? `${fmt(r.last_delivery_at)} (${r.last_status || "failed"})` : "-") },
      ]}
      actions={(r, reload) => (
        <div className="flex justify-end gap-2">
          <button className={btnGhost} onClick={async () => { const { error } = await createClient().from("webhooks").update({ enabled: !r.enabled }).eq("id", r.id); if (error) alert(error.message); reload(); }}>
            {r.enabled ? "Disable" : "Enable"}
          </button>
          <button className={btnGhost} onClick={async () => { if (!confirm("Delete this webhook?")) return; const { error } = await createClient().from("webhooks").delete().eq("id", r.id); if (error) alert(error.message); reload(); }}>
            Delete
          </button>
        </div>
      )}
      empty={{ title: "No webhooks", body: "Add an https endpoint to be notified of blocked or escalated actions." }}
    />
  );
}