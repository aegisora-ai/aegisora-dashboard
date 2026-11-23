"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice, Panel } from "@/components/aegisora/live/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountPanel() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await createClient().auth.getUser();
      setEmail(data.user?.email ?? "");
    })();
  }, []);

  const matches = email !== "" && confirm.trim().toLowerCase() === email.toLowerCase();

  async function onDelete(e: FormEvent) {
    e.preventDefault();
    if (!matches || busy) return;
    if (!window.confirm("This permanently deletes your account. This cannot be undone. Continue?")) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      setBusy(false);
      setMsg({ ok: false, text: "Your session has expired. Please sign in again." });
      return;
    }
    const res = await fetch("/api/v1/account/delete", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ confirm }),
    });
    const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    if (!res.ok) {
      setBusy(false);
      setMsg({ ok: false, text: j?.error?.message ?? "Deletion failed." });
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <Panel>
      <form onSubmit={onDelete} className="space-y-4">
        <h2 className="text-sm font-semibold">Delete account</h2>
        <p className="text-sm text-muted-foreground">
          Permanently deletes your login and profile and removes you from your workspaces. You cannot delete your account
          while you are the only owner of a workspace with other members, or while a paid subscription is active.
          Contact support for workspace data requests.
        </p>
        {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
        <div className="space-y-1.5">
          <Label htmlFor="del-confirm">Type your email to confirm</Label>
          <Input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" placeholder={email} />
        </div>
        <button
          type="submit"
          disabled={!matches || busy}
          className="inline-flex h-9 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Deleting..." : "Delete my account"}
        </button>
      </form>
    </Panel>
  );
}