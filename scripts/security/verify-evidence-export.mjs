#!/usr/bin/env node
// Independent check of an Aegisora evidence export (format "aegisora-evidence-export/1"). No dependencies.
// Usage: node scripts/security/verify-evidence-export.mjs <export.json>
// Recomputes evidence_hash_v2 for every record, checks each link to the previous record and the sequence.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("usage: node scripts/security/verify-evidence-export.mjs <export.json>"); process.exit(2); }
const doc = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(doc.records)) { console.error("Not an evidence export: no records array."); process.exit(2); }

const f = (v) => (v === null || v === undefined ? "~" : Buffer.byteLength(String(v), "utf8") + ":" + String(v));
const h2 = (r) => createHash("sha256")
  .update(["v2", f(r.prev_hash), f(r.workspace_id), f(r.seq), f(r.id), f(r.decision_id), f(r.action), f(r.decision), f(r.trace_id), f(r.created_at_utc), f(r.payload_text)].join("|"), "utf8")
  .digest("hex");

const records = [...doc.records].sort((a, b) => Number(a.seq) - Number(b.seq));
const problems = [];
let v2 = 0, other = 0, prev = null;
records.forEach((r, i) => {
  const why = [];
  if (r.prev_hash !== (prev ?? "GENESIS")) why.push("prev_hash does not match the previous record");
  if (Number(r.seq) !== i + 1) why.push("sequence gap (expected " + (i + 1) + ")");
  if (Number(r.hash_version) === 2) { v2++; if (h2(r) !== r.hash) why.push("hash mismatch: stored " + r.hash + ", recomputed " + h2(r)); }
  else other++;
  if (why.length) problems.push({ seq: r.seq, why });
  prev = r.hash;
});

console.log("file:             " + file);
console.log("records:          " + records.length + " (hash v2: " + v2 + ", other versions not recomputed: " + other + ")");
console.log("broken:           " + problems.length);
for (const p of problems.slice(0, 10)) console.log("  #" + p.seq + ": " + p.why.join("; "));
if (doc.server_check) {
  const same = Number(doc.server_check.total) === records.length && Number(doc.server_check.broken) === problems.length;
  console.log("server check:     total " + doc.server_check.total + ", broken " + doc.server_check.broken + (same ? "  (matches this check)" : "  (DIFFERS from this check)"));
  if (!same) problems.push({ seq: "-", why: ["server check differs"] });
}
console.log(problems.length === 0 ? "RESULT: PASS" : "RESULT: FAIL");
process.exit(problems.length === 0 ? 0 : 1);