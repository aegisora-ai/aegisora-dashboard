import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), false);
const { createClient } = await import("@supabase/supabase-js");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase schema preflight requires configured server credentials.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const variants = [
  ["agents", ["state", "status", "workspace_id", "name", "description", "framework", "external_id", "metadata", "source", "last_seen_at"]],
  ["policies", ["decision", "effect", "workspace_id", "name", "enabled", "action_pattern", "resource_pattern", "agent_id", "priority"]],
  ["decisions", ["decision", "effect", "workspace_id", "agent_id", "agent_name", "action", "resource", "reason", "policy_id", "risk_score", "trace_id", "input", "created_at"]],
  ["executions", ["decision", "effect", "workspace_id", "agent_id", "action", "trace_id", "risk_score", "created_at"]],
  ["evidence", ["decision", "effect", "workspace_id", "decision_id", "execution_id", "agent_id", "trace_id", "action", "payload", "hash", "created_at"]],
];
const applicationRequired = {
  agents: ["state", "workspace_id", "name", "source", "last_seen_at"],
  policies: ["decision", "workspace_id", "name", "enabled", "action_pattern", "resource_pattern", "agent_id", "priority"],
  decisions: ["decision", "workspace_id", "agent_id", "agent_name", "action", "resource", "reason", "policy_id", "risk_score", "trace_id", "input", "created_at"],
  executions: ["decision", "workspace_id", "agent_id", "action", "trace_id", "risk_score", "created_at"],
  evidence: ["decision", "workspace_id", "decision_id", "execution_id", "agent_id", "trace_id", "action", "payload", "hash", "created_at"],
};
const checks = [];
for (const [table, columns] of variants) {
  for (const column of columns) {
    const { error } = await db.from(table).select(column).limit(0);
    checks.push({ table, column, present: !error, error_code: error?.code ?? null, error_message: error ? String(error.message ?? "").slice(0, 120) : null });
  }
}
await mkdir(".enterprise", { recursive: true });
const missingColumnCodes = new Set(["42703", "PGRST204", "42P01", "PGRST205"]);
const mismatches = Object.entries(applicationRequired).flatMap(([table, requiredColumns]) => requiredColumns.flatMap((column) => {
  const runtime = checks.find((item) => item.table === table && item.column === column);
  return runtime?.present ? [] : [{ table, required_by_application: column, runtime_column_present: false, runtime_probe_error: runtime?.error_code ?? "unknown" }];
}));
const report = {
  checked_at_utc: new Date().toISOString(),
  target_host: new URL(url).host,
  data_read: false,
  checks,
  probe_status: checks.every((item) => item.present || (item.error_code && missingColumnCodes.has(item.error_code))) ? "PASS" : "FAIL",
  schema_compatibility: !checks.every((item) => item.present || (item.error_code && missingColumnCodes.has(item.error_code))) ? "PROBE_FAILED" : mismatches.length ? "MISMATCH" : "MATCH",
  application_required_columns: applicationRequired,
  missing_application_columns: mismatches,
  legacy_aliases: checks.filter((item) => ["status", "effect"].includes(item.column) && item.present).map(({ table, column }) => ({ table, column })),
  note: "Column names only were probed with SELECT ... LIMIT 0. No customer rows or credential values were read or written.",
};
await writeFile(".enterprise/phase-schema-compatibility.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
