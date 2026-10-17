// Usage (PowerShell):
//   $env:AEGISORA_API_KEY  = "aeg_live_..."
//   $env:AEGISORA_BASE_URL = "https://<your-aegisora-host>"
//   node scripts/quickstart-demo.mjs
import { Aegisora } from "../public/sdk/aegisora.mjs";

const client = new Aegisora();
const requests = [
  { agent: "quickstart-agent", action: "files.read", resource: "/reports/q3.pdf", risk: 10 },
  { agent: "quickstart-agent", action: "payments.transfer", resource: "acct:demo", risk: 90 },
];

for (const r of requests) {
  const d = await client.evaluate(r);
  console.log(JSON.stringify({
    action: r.action,
    effect: d.effect,
    reason: d.reason,
    decision_id: d.decision_id,
    evidence_hash: d.evidence_hash,
  }, null, 2));
}