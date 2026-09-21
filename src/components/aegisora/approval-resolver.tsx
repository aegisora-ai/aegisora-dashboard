"use client";

import { useState } from "react";
import { ApprovalBadge, type ApprovalStatus } from "@/components/aegisora/state-badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { btnOutline, btnPrimary } from "@/lib/ui";

const executionFor: Record<ApprovalStatus, string> = {
  PENDING: "Paused. Waiting for an authorized approver.",
  APPROVED: "Released. The action may proceed to execution.",
  REJECTED: "Stopped. The action will not execute.",
  EXPIRED: "Stopped. The approval window closed without a resolution.",
};

export function ApprovalResolver({
  initialStatus,
  initialResolution,
  initialResolvedAt,
  requiredPermission,
}: {
  initialStatus: ApprovalStatus;
  initialResolution?: string;
  initialResolvedAt?: string;
  requiredPermission: string;
}) {
  const [status, setStatus] = useState<ApprovalStatus>(initialStatus);
  const [reason, setReason] = useState(initialResolution ?? "");
  const [resolvedAt, setResolvedAt] = useState<string | undefined>(initialResolvedAt);

  function resolve(next: "APPROVED" | "REJECTED") {
    if (!reason.trim()) return;
    setStatus(next);
    setResolvedAt(new Date().toISOString().replace("T", " ").slice(0, 19) + "Z");
  }

  return (
    <section aria-labelledby="resolution-title" className="aeg-panel h-fit p-5">
      <h2 id="resolution-title" className="text-sm font-medium">Resolution</h2>
      <div className="mt-3">
        <ApprovalBadge status={status} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{executionFor[status]}</p>

      {status === "PENDING" ? (
        <div className="mt-5 space-y-4 border-t border-border pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Resolution reason</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this being approved or rejected?" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!reason.trim()} onClick={() => resolve("APPROVED")} className={`${btnPrimary} disabled:opacity-40`}>
              Approve
            </button>
            <button type="button" disabled={!reason.trim()} onClick={() => resolve("REJECTED")} className={`${btnOutline} disabled:opacity-40`}>
              Reject
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Requires <span className="font-mono">{requiredPermission}</span>. Prototype: authorization is not enforced and the result is not saved.
          </p>
        </div>
      ) : (
        <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          {reason && (
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="mt-0.5">{reason}</dd>
            </div>
          )}
          {resolvedAt && (
            <div>
              <dt className="text-muted-foreground">Resolved</dt>
              <dd className="mt-0.5 font-mono text-xs">{resolvedAt}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}