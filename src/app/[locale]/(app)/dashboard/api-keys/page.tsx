"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, Notice, Panel, btnGhost, fmt } from "@/components/aegisora/live/ui";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";
import { confirmDialog, notify } from "@/components/aegisora/live/feedback";

function KeyTools({ ws, reload }: { ws: Workspace; reload: () => void }) {
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    setErr(null); setCopied(false); setNeedsMfa(false);
    const { data, error } = await createClient().rpc("create_api_key", { ws: ws.id, key_name: name.trim() });
    if (error) {
      if (/forbidden/i.test(error.message)) {
        const { data: lvl } = await createClient().auth.mfa.getAuthenticatorAssuranceLevel();
        const mfaMissing = lvl?.currentLevel !== "aal2";
        setNeedsMfa(mfaMissing);
        return setErr(mfaMissing ? "Multi-factor verification is required before you can manage API keys." : "Only workspace owners and admins can create API keys.");
      }
      return setErr(error.message);
    }
    setFresh(String(data)); setName(""); reload();
  }

  return (
    <div className="space-y-4">
      <Panel>
        <form onSubmit={create} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-1.5"><Label htmlFor="k-name">Key name</Label><Input id="k-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="production-runtime" required maxLength={80} /></div>
          <button type="submit" className={btnPrimary}>Create API key</button>
        </form>
      </Panel>
      {err && (
        <Notice>
          {err}
          {needsMfa && <>{" "}<Link href="/dashboard/identity" className="underline underline-offset-2">Verify on the Identity page</Link>.</>}
        </Notice>
      )}
      {fresh && (
        <Panel>
          <p className="text-sm font-medium">Copy your key now. It is shown only once and cannot be recovered.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-sm bg-surface-3 px-3 py-2 font-mono text-xs">{fresh}</code>
            <button className={btnGhost} onClick={async () => { await navigator.clipboard.writeText(fresh); setCopied(true); }}>{copied ? "Copied" : "Copy"}</button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Keep it server-side. Never ship it in browser code or commit it to git.</p>
        </Panel>
      )}
    </div>
  );
}

export default function ApiKeysPage() {
  return (
    <LiveTable
      table="api_keys"
      title="API Keys"
      description="Runtime credentials your agents use to call Aegisora. Only a hash is stored."
      select="id,name,prefix,last_used_at,revoked_at,created_at"
      above={(ws, reload) => <KeyTools ws={ws} reload={reload} />}
      columns={[
        { label: "Name", render: (r) => r.name },
        { label: "Key", render: (r) => <span className="font-mono text-xs">{r.prefix}...</span> },
        { label: "Created", render: (r) => fmt(r.created_at) },
        { label: "Last used", render: (r) => fmt(r.last_used_at) },
        { label: "Status", render: (r) => <Badge value={r.revoked_at ? "suspended" : "active"} /> },
      ]}
      actions={(r, reload) =>
        r.revoked_at ? (
          <button
            className={btnGhost}
            onClick={async () => {
              if (!(await confirmDialog({ title: `Delete "${r.name}"?`, body: "This revoked key is removed from the list permanently. Audit records are kept.", confirmLabel: "Delete key", danger: true }))) return;
              const { data, error } = await createClient().from("api_keys").delete().eq("id", r.id).not("revoked_at", "is", null).select("id");
              if (error) notify(error.message, false);
              else if (!data || data.length === 0) notify("Delete not permitted. Only workspace owners and admins can delete keys.", false);
              else notify("Key deleted.");
              reload();
            }}
          >
            Delete
          </button>
        ) : (
          <button className={btnGhost} onClick={async () => { if (!(await confirmDialog({ title: `Revoke "${r.name}"?`, body: "Agents using this key stop working immediately.", confirmLabel: "Revoke key", danger: true }))) return; const { error } = await createClient().from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", r.id); if (error) notify(error.message, false); reload(); }}>
            Revoke
          </button>
        )
      }
      empty={{ title: "No API keys", body: "Create a key to let an agent call POST /api/v1/evaluate." }}
    />
  );
}
