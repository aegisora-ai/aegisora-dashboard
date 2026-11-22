"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/components/aegisora/workspace-provider";

const BTN = "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-surface-3 disabled:opacity-50";
const RED = { color: "var(--block)", borderColor: "rgb(255 92 92 / 0.4)" } as const;

export default function WorkspacePage() {
  const { workspaces, currentWorkspace, loading, setCurrentWorkspaceId, refresh } = useWorkspace();
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isOwner = (r: string) => r.toUpperCase() === "OWNER";
  const canEdit = (r: string) => isOwner(r) || r.toUpperCase() === "ADMIN";

  async function rename(id: string) {
    const v = name.trim();
    if (v.length < 2) { setMsg({ ok: false, text: "Name must be at least 2 characters." }); return; }
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().from("workspaces").update({ name: v }).eq("id", id).select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setMsg({ ok: false, text: error?.message ?? "Rename was not permitted for this workspace." });
      return;
    }
    setEditId(null);
    setMsg({ ok: true, text: "Workspace renamed." });
    refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().from("workspaces").delete().eq("id", id).select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setMsg({ ok: false, text: error?.message ?? "Delete was not permitted. Only owners can delete a workspace." });
      return;
    }
    setDelId(null);
    setConfirm("");
    setMsg({ ok: true, text: "Workspace deleted." });
    refresh();
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl py-12 text-sm text-muted-foreground">Loading workspaces...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Switch, rename, delete or create workspaces.</p>
        </div>
        <Link href="/onboarding" className="aegc-btn aegc-btn--solid"><Plus aria-hidden="true" />New workspace</Link>
      </header>

      {msg ? (
        <p role="status" className="rounded-lg border border-border px-4 py-3 text-sm" style={{ color: msg.ok ? "var(--allow)" : "var(--block)" }}>{msg.text}</p>
      ) : null}

      {workspaces.length === 0 ? (
        <p className="aeg-panel p-5 text-sm text-muted-foreground">No workspace yet. Create one to get started.</p>
      ) : (
        <ul className="aeg-panel divide-y divide-border/60">
          {workspaces.map((w) => {
            const current = currentWorkspace?.id === w.id;
            return (
              <li key={w.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    {editId === w.id ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={60}
                        autoFocus
                        aria-label="Workspace name"
                        className="h-9 w-full max-w-xs rounded-md border border-border bg-transparent px-3 text-sm"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium">{w.name}{current ? <Check className="ml-2 inline size-4 text-cyan" aria-label="Current" /> : null}</p>
                    )}
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{w.slug} &middot; {w.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {editId === w.id ? (
                      <>
                        <button type="button" className={BTN} disabled={busy} onClick={() => rename(w.id)}>Save</button>
                        <button type="button" className={BTN} disabled={busy} onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {!current ? <button type="button" className={BTN} onClick={() => setCurrentWorkspaceId(w.id)}>Switch</button> : null}
                        {canEdit(w.role) ? (
                          <button type="button" className={BTN} onClick={() => { setEditId(w.id); setName(w.name); setDelId(null); setMsg(null); }}>
                            <Pencil className="size-3.5" aria-hidden="true" />Rename
                          </button>
                        ) : null}
                        {isOwner(w.role) ? (
                          <button type="button" className={BTN} style={RED} onClick={() => { setDelId(w.id); setConfirm(""); setEditId(null); setMsg(null); }}>
                            <Trash2 className="size-3.5" aria-hidden="true" />Delete
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                {delId === w.id ? (
                  <div className="mt-4 rounded-lg border p-4" style={{ borderColor: "rgb(255 92 92 / 0.35)" }}>
                    <p className="text-sm">
                      This permanently deletes <b>{w.name}</b> with all its agents, policies, decisions, evidence and keys. This cannot be undone.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Type DELETE to confirm.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        aria-label="Type DELETE to confirm"
                        className="h-9 w-40 rounded-md border border-border bg-transparent px-3 text-sm"
                      />
                      <button type="button" className={BTN} style={RED} disabled={busy || confirm !== "DELETE"} onClick={() => remove(w.id)}>Delete workspace</button>
                      <button type="button" className={BTN} disabled={busy} onClick={() => { setDelId(null); setConfirm(""); }}>Cancel</button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">
        Members and roles are managed under <Link className="underline underline-offset-4" href="/dashboard/team">Team</Link>.
      </p>
    </div>
  );
}