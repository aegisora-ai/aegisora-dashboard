import { admin } from "@/lib/aegisora/server";

export type NotifyInput = {
  workspaceId: string;
  effect: "ESCALATE" | "BLOCK";
  agent: string;
  action: string;
  resource: string;
  reason: string;
  risk: number;
  decisionId: string;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aegisora.org";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function recipients(ws: string): Promise<string[]> {
  const out = new Set<string>();
  try {
    const db = admin();
    const { data, error } = await db.from("workspace_members").select("user_id,role").eq("workspace_id", ws).in("role", ["owner", "admin"]);
    if (error) console.error("notify: members query failed", error.message);
    for (const m of data ?? []) {
      const { data: u } = await db.auth.admin.getUserById(String(m.user_id));
      const mail = u?.user?.email;
      if (mail) out.add(mail);
    }
  } catch (e) {
    console.error("notify: recipients failed", e);
  }
  return [...out];
}

export async function notifyDecision(n: NotifyInput): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.NOTIFY_FROM || "Aegisora <onboarding@resend.dev>";
  const to = await recipients(n.workspaceId);
  if (to.length === 0) return;

  const esca = n.effect === "ESCALATE";
  const subject = esca
    ? `[Aegisora] Approval needed: ${n.agent} → ${n.action}`
    : `[Aegisora] Blocked: ${n.agent} → ${n.action}`;
  const link = `${SITE}/dashboard/${esca ? "approvals" : "decisions"}`;
  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px">
<h2 style="margin:0 0 12px">${esca ? "Approval needed" : "Action blocked"}</h2>
<table style="border-collapse:collapse;font-size:14px">
<tr><td style="padding:4px 12px 4px 0;color:#666">Agent</td><td>${esc(n.agent)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666">Action</td><td>${esc(n.action)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666">Resource</td><td>${esc(n.resource || "-")}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666">Risk</td><td>${n.risk}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666">Reason</td><td>${esc(n.reason)}</td></tr>
</table>
<p style="margin-top:16px"><a href="${link}">${esca ? "Review and decide" : "Open decisions"}</a></p>
<p style="color:#888;font-size:12px">Decision ${esc(n.decisionId)}</p></div>`;

  await Promise.all(
    to.map(async (addr) => {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [addr], subject, html }),
        });
        if (!res.ok) console.error("notify: resend", res.status, await res.text());
      } catch (e) {
        console.error("notify: send failed", e);
      }
    }),
  );
}
