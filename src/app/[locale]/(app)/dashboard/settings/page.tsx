"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice, PageHeader, Panel, WorkspaceGate, selectCls } from "@/components/aegisora/live/ui";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

type S = { default_effect: string; auto_register_agents: boolean; approval_expiry_hours: number; alert_on_block: boolean };

function Settings({ ws }: { ws: Workspace }) {
  const [name, setName] = useState(ws.name);
  const [s, setS] = useState<S>({ default_effect: "BLOCK", auto_register_agents: true, approval_expiry_hours: 24, alert_on_block: true });
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const [{ data: st }, { data: auth }] = await Promise.all([
        supabase.from("workspace_settings").select("*").eq("workspace_id", ws.id).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      if (st) setS({ default_effect: st.default_effect, auto_register_agents: st.auto_register_agents, approval_expiry_hours: st.approval_expiry_hours, alert_on_block: st.alert_on_block });
      if (auth.user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle();
        setFullName(p?.full_name ?? "");
      }
    })();
  }, [ws.id]);

  async function saveWorkspace(e: FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const r1 = await supabase.from("workspaces").update({ name: name.trim() }).eq("id", ws.id).select("id");
    if (r1.error || !r1.data?.length) return setMsg({ ok: false, text: r1.error?.message ?? "Only owners and admins can change workspace settings." });
    const r2 = await supabase.from("workspace_settings").upsert({ workspace_id: ws.id, ...s, approval_expiry_hours: Math.max(1, Math.min(720, Number(s.approval_expiry_hours) || 24)), updated_at: new Date().toISOString() }, { onConflict: "workspace_id" });
    setMsg(r2.error ? { ok: false, text: r2.error.message } : { ok: true, text: "Workspace settings saved. They apply to the next API call." });
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", auth.user.id);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Profile saved." });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Governance behaviour for this workspace, and your profile." />
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}

      <Panel>
        <form onSubmit={saveWorkspace} className="space-y-4">
          <h2 className="text-sm font-semibold">Workspace and governance defaults</h2>
          <div className="space-y-1.5"><Label htmlFor="s-name">Workspace name</Label><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></div>
          <div className="space-y-1.5">
            <Label htmlFor="s-def">When no policy matches</Label>
            <select id="s-def" className={selectCls} value={s.default_effect} onChange={(e) => setS({ ...s, default_effect: e.target.value })}>
              <option value="BLOCK">BLOCK (fail closed, recommended)</option>
              <option value="ESCALATE">ESCALATE (ask a human)</option>
              <option value="ALLOW">ALLOW (open)</option>
            </select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="s-exp">Approval expires after (hours)</Label><Input id="s-exp" type="number" min={1} max={720} value={s.approval_expiry_hours} onChange={(e) => setS({ ...s, approval_expiry_hours: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.auto_register_agents} onChange={(e) => setS({ ...s, auto_register_agents: e.target.checked })} />Auto-register unknown agents on first API call</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.alert_on_block} onChange={(e) => setS({ ...s, alert_on_block: e.target.checked })} />Open an incident when an action is blocked</label>
          <button type="submit" className={btnPrimary}>Save</button>
        </form>
      </Panel>

      <Panel>
        <form onSubmit={saveProfile} className="space-y-4">
          <h2 className="text-sm font-semibold">Your profile</h2>
          <div className="space-y-1.5"><Label htmlFor="s-full">Full name</Label><Input id="s-full" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} /></div>
          <button type="submit" className={btnPrimary}>Save profile</button>
        </form>
      </Panel>
    </div>
  );
}

export default function SettingsPage() {
  return <WorkspaceGate>{(ws) => <Settings key={ws.id} ws={ws} />}</WorkspaceGate>;
}