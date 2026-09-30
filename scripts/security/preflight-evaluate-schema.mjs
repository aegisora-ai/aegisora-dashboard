import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), false);
const { createClient } = await import("@supabase/supabase-js");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const checks = [
  ["agents", "id,name,state,external_id,source,last_seen_at"],
  ["policies", "id,name,decision,enabled,action_pattern,resource_pattern,agent_id"],
  ["workspace_settings", "workspace_id,default_effect,auto_register_agents,approval_expiry_hours,alert_on_block"],
  ["decisions", "id,workspace_id,agent_id,decision,reason,policy_id,risk_score,trace_id"],
  ["executions", "id,workspace_id,agent_id,action,decision,trace_id,risk_score"],
  ["evidence", "id,workspace_id,decision_id,execution_id,agent_id,trace_id,action,decision,payload,hash"],
  ["traces", "workspace_id,agent_id,agent_name,trace_id,name,decision_id,status,duration_ms,spans"],
  ["approvals", "workspace_id,decision_id,agent_id,agent_name,action,resource,expires_at"],
  ["incidents", "workspace_id,decision_id,severity,title"],
  ["audit_events", "workspace_id,actor,action,target_type,target_id,meta"],
];
const results = [];
for (const [table, columns] of checks) {
  const { error } = await db.from(table).select(columns).limit(0);
  results.push({ table, status: error ? "FAIL" : "PASS", code: error?.code ?? null });
}
console.log(JSON.stringify({ status: results.every((r) => r.status === "PASS") ? "PASS" : "FAIL", checks: results }, null, 2));
if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
