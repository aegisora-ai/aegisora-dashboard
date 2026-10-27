#!/usr/bin/env node
// Cross-checks the public /demo sandbox against the production evidence format.
// 1) builds a small chain through the demo API (evaluate -> resolve -> evaluate)
// 2) asks the demo's own verifier, then verify-evidence-export.mjs (an independent
//    implementation of the SQL evidence_hash_v2 formula) to check that same chain
// 3) prints one SQL query: Postgres tells you whether the demo's payload_text is
//    byte-identical to what jsonb::text produces (the part JavaScript cannot prove).
// Usage: node scripts/security/check-demo-chain.mjs [baseUrl]   (default http://localhost:3000)
import { writeFileSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const here = dirname(fileURLToPath(import.meta.url));
const results = [];
const check = (name, ok) => {
  results.push(ok);
  console.log((ok ? "PASS  " : "FAIL  ") + name);
};

async function call(body) {
  const res = await fetch(base + "/api/demo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Demo API returned non-JSON (" + res.status + "): " + text.slice(0, 120));
  }
  if (!res.ok) throw new Error("Demo API " + res.status + ": " + JSON.stringify(json).slice(0, 200));
  return json;
}

try {
  const a = await call({
    op: "evaluate", seq: 1, prevHash: "GENESIS", agent: "finance-agent", action: "payments.transfer", risk: 10,
    input: { amount: 48000, currency: "EUR", note: "caf\u00e9 \u20ac 50%" },
  });
  const b = await call({
    op: "resolve", seq: 2, prevHash: a.record.hash, decisionId: a.record.decision_id,
    traceId: a.record.trace_id, action: a.record.action, approve: true,
  });
  const c = await call({
    op: "evaluate", seq: 3, prevHash: b.record.hash, agent: "code-agent", action: "db.drop_table", risk: 20,
    input: { target: "users", nested: { b: 1, a: [1, 2.5, { z: null, yy: true }] }, "long key name": "x" },
  });
  const records = [a.record, b.record, c.record];

  check("demo evaluates the sample actions (ESCALATE, then BLOCK)", a.effect === "ESCALATE" && c.effect === "BLOCK");
  check("created_at_utc has microsecond precision like the database", records.every((r) => /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/.test(r.created_at_utc)));

  const own = await call({ op: "verify", chain: records });
  console.log("      demo verifier says: " + JSON.stringify(own));

  const tampered = JSON.parse(JSON.stringify(records));
  tampered[1].payload_text = tampered[1].payload_text.replace("demo-reviewer", "someone-else");
  const own2 = await call({ op: "verify", chain: tampered });
  console.log("      demo verifier on tampered chain: " + JSON.stringify(own2));

  const dir = mkdtempSync(join(tmpdir(), "aeg-demo-"));
  const file = join(dir, "demo-export.json");
  writeFileSync(file, JSON.stringify({
    format: "aegisora-evidence-export/1", workspace_id: records[0].workspace_id, total: records.length, records,
  }));
  const r = spawnSync(process.execPath, [join(here, "verify-evidence-export.mjs"), file], { encoding: "utf8" });
  console.log(r.stdout.split("\n").map((l) => "      " + l).join("\n"));
  check("independent verifier (SQL formula) accepts the demo chain", r.status === 0);

  const q = records
    .map((x) => "select (" + "$p$" + x.payload_text + "$p$::jsonb)::text = $p$" + x.payload_text + "$p$ as same")
    .join("\nunion all\n");
  console.log("\nRun this in the Supabase SQL editor. Every row must be true:\n\n" + q + ";\n");
} catch (e) {
  console.error("ERROR: " + (e instanceof Error ? e.message : String(e)));
  process.exit(2);
}
process.exit(results.every(Boolean) ? 0 : 1);
