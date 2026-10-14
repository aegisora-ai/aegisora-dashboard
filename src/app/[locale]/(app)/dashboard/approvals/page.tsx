"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, btnGhost, fmt } from "@/components/aegisora/live/ui";

type ResolutionStatus = "approved" | "rejected";

function ApprovalActions({
  id,
  reload,
}: {
  id: string;
  reload: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success" | null>(null);

  async function submit(status: ResolutionStatus) {
    const cleanNote = note.trim();
    if (!cleanNote || busy) return;

    setBusy(true);
    setMessage("");
    setMessageKind(null);

    try {
      const { data, error } = await createClient().auth.getSession();
      const token = data.session?.access_token;

      if (error || !token) {
        setMessage("Your session is missing or expired. Sign in again.");
        setMessageKind("error");
        return;
      }

      const response = await fetch(
        `/api/v1/workspace/approvals/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, note: cleanNote }),
          cache: "no-store",
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
        approval?: { status?: string };
      } | null;

      if (!response.ok) {
        setMessage(payload?.error?.message ?? "Unable to resolve approval. Refresh and try again.");
        setMessageKind("error");
        return;
      }

      setMessage(`Approval ${payload?.approval?.status ?? status} saved.`);
      setMessageKind("success");
      setNote("");
      reload();
    } catch {
      setMessage("Network error. The approval status could not be confirmed; refresh before retrying.");
      setMessageKind("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-56 flex-col items-end gap-2">
      <textarea
        aria-label={`Resolution reason for approval ${id}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        maxLength={2000}
        disabled={busy}
        placeholder="Required resolution reason"
        className="w-full min-w-56 rounded-sm border border-border bg-surface-1 p-2 text-xs text-foreground placeholder:text-muted-foreground disabled:opacity-50"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={btnGhost}
          disabled={busy || !note.trim()}
          onClick={() => void submit("approved")}
        >
          {busy ? "Saving…" : "Approve"}
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={busy || !note.trim()}
          onClick={() => void submit("rejected")}
        >
          {busy ? "Saving…" : "Reject"}
        </button>
      </div>
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`max-w-64 text-right text-xs ${
            messageKind === "error" ? "text-block" : "text-muted-foreground"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <LiveTable
      table="approvals"
      title="Approvals"
      description="Escalated actions wait here. Execution stays paused until an authorized human decides."
      realtime
      columns={[
        { label: "Requested", render: (row) => fmt(row.requested_at) },
        { label: "Agent", render: (row) => row.agent_name },
        {
          label: "Action",
          render: (row) => <span className="font-mono text-xs">{row.action}</span>,
        },
        {
          label: "Status",
          render: (row) => (
            <Badge
              value={
                row.status === "pending" && new Date(row.expires_at) <= new Date()
                  ? "expired"
                  : row.status
              }
            />
          ),
        },
        { label: "Expires", render: (row) => fmt(row.expires_at) },
      ]}
      actions={(row, reload) =>
        row.status === "pending" && new Date(row.expires_at) > new Date() ? (
          <ApprovalActions id={String(row.id)} reload={reload} />
        ) : null
      }
      empty={{
        title: "No approvals yet",
        body: "When a policy returns ESCALATE, its request appears here. Load a starter policy and send a payment.* action to try it.",
      }}
    />
  );
}