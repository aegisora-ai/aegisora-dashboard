import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.AEGISORA_E2E_SUPABASE_URL;
const anon = process.env.AEGISORA_E2E_SUPABASE_ANON_KEY;
const serviceRole = process.env.AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY;
const e2eRef = "daigywopatmznzgaouqo";
if (!url || !url.includes(e2eRef) || !anon || !serviceRole) {
  console.error("STOP: E2E guard or test credentials failed.");
  process.exit(2);
}
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceRole, opts);
const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const password = `AeG!${randomUUID()}9z`;
const result = { status: "FAIL", environment: "e2e", checks: [], tables: [], seed: {}, cleanup: { verified: false } };
const userIds = [];
const wsIds = [];
const rowsOf = (r) => (Array.isArray(r.data) ? r.data.length : 0);
const errOf = (r) => (r.error ? String(r.error.message || r.error.code || "error").slice(0, 90) : null);
function check(name, pass, details = {}) {
  result.checks.push({ name, pass: Boolean(pass), ...details });
}

const TABLES = ["agents","api_keys","approvals","audit_events","billing_customers","billing_payments","billing_subscriptions","decisions","evidence","executions","global_search_documents","incidents","policies","policy_audit_events","policy_change_requests","policy_versions","risk_rules","service_accounts","service_account_keys","traces","webhooks","workspace_entitlements","workspace_invitations","workspace_members","workspace_settings"];

async function makeUser(label) {
  const email = `aegisora-c24-${label}-${runId}@example.com`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error("createUser failed " + label);
  const id = created.data.user.id;
  userIds.push(id);
  const client = createClient(url, anon, opts);
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const ws = await client.rpc("create_workspace", { workspace_name: `C24 ${label} ${runId}`, workspace_slug: `c24-${label}-${runId}` });
  if (ws.error || typeof ws.data !== "string") throw ws.error ?? new Error("create_workspace failed " + label);
  wsIds.push(ws.data);
  return { id, client, wsId: ws.data };
}

async function seed(table, row) {
  const r = await admin.from(table).insert(row).select();
  result.seed[table] = r.error ? "ERR: " + errOf(r) : "ok";
  return r.error ? null : (r.data && r.data[0]) || {};
}
async function seedEnum(table, row, field) {
  let last = null;
  for (const v of ["ALLOW", "allow", "BLOCK", "block"]) {
    const r = await admin.from(table).insert({ ...row, [field]: v }).select();
    if (!r.error) { result.seed[table] = "ok (" + field + "=" + v + ")"; return (r.data && r.data[0]) || {}; }
    last = errOf(r);
  }
  result.seed[table] = "ERR: " + last;
  return null;
}
async function countB(t, wsId) {
  const r = await admin.from(t).select("workspace_id").eq("workspace_id", wsId).limit(1000);
  return r.error ? null : rowsOf(r);
}

try {
  const A = await makeUser("a");
  const B = await makeUser("b");
  const anonClient = createClient(url, anon, opts);
  const w = B.wsId;

  await seed("agents", { workspace_id: w, name: "iso-agent-" + runId });
  await seed("risk_rules", { workspace_id: w, name: "iso-rule-" + runId });
  await seed("incidents", { workspace_id: w, title: "iso-incident-" + runId });
  await seed("webhooks", { workspace_id: w, url: "https://example.com/iso-" + runId, secret: "iso-secret-" + runId });
  await seed("api_keys", { workspace_id: w, name: "iso-key-" + runId, prefix: "iso_" + runId.slice(0, 6), key_hash: "iso" + runId });
  await seed("service_accounts", { workspace_id: w, created_by: B.id, name: "iso-sa-" + runId });
  await seed("traces", { workspace_id: w, trace_id: "iso-t-" + runId });
  await seed("workspace_settings", { workspace_id: w });
  const dec = await seedEnum("decisions", { workspace_id: w, reason: "iso", trace_id: "iso-d-" + runId, agent_name: "iso", action: "iso" }, "decision");
  await seedEnum("policies", { workspace_id: w, name: "iso-policy-" + runId }, "decision");
  if (dec && dec.id) await seed("approvals", { workspace_id: w, decision_id: dec.id, expires_at: new Date(Date.now() + 3600000).toISOString() });
  else result.seed.approvals = "skipped: no decision row";
  const pol = await admin.from("policies").select("id").eq("workspace_id", w).limit(1);
  const sa = await admin.from("service_accounts").select("id").eq("workspace_id", w).limit(1);
  const polId = pol.data && pol.data[0] ? pol.data[0].id : null;
  const saId = sa.data && sa.data[0] ? sa.data[0].id : null;
  const seedTry = async (table, variants) => {
    let last = null;
    for (const row of variants) {
      const r = await admin.from(table).insert(row).select();
      if (!r.error) { result.seed[table] = "ok"; return true; }
      last = errOf(r);
    }
    result.seed[table] = "ERR: " + last;
    return false;
  };
  const decs = ["ALLOW", "BLOCK", "allow", "block"];
  const plans = ["starter", "team", "pro", "free"];
  await seedTry("evidence", decs.map((d) => ({ workspace_id: w, action: "iso", decision: d, trace_id: "iso-e-" + runId })));
  await seedTry("executions", decs.map((d) => ({ workspace_id: w, action: "iso", decision: d, trace_id: "iso-x-" + runId })));
  await seedTry("global_search_documents", [{ workspace_id: w, resource_type: "agent", resource_id: "iso-" + runId, title: "iso-doc-" + runId, href: "/iso", search_text: "iso " + runId }]);
  await seedTry("policy_audit_events", [{ workspace_id: w, action: "iso.test" }]);
  if (polId) await seedTry("policy_change_requests", [1, 2, 3].map((v) => ({ policy_id: polId, workspace_id: w, requested_by: B.id, reason: "iso", proposed_version: v })));
  else result.seed.policy_change_requests = "skipped: no policy row";
  if (saId) await seedTry("service_account_keys", [{ service_account_id: saId, workspace_id: w, name: "iso-sak-" + runId, key_prefix: "iso_" + runId.slice(0, 6), key_hash: "iso" + runId }]);
  else result.seed.service_account_keys = "skipped: no service account row";
  await seedTry("workspace_invitations", [{ workspace_id: w, email: "aegisora-c24-invitee-" + runId + "@example.com" }]);
  await seedTry("billing_customers", [{ workspace_id: w, stripe_customer_id: "cus_iso_" + runId }]);
  await seedTry("billing_payments", plans.flatMap((p) => ["paid", "complete", "pending"].map((s) => ({ workspace_id: w, stripe_checkout_session_id: "cs_iso_" + runId, plan_key: p, status: s }))));
  await seedTry("billing_subscriptions", plans.flatMap((p) => ["active", "trialing"].map((s) => ({ workspace_id: w, stripe_subscription_id: "sub_iso_" + runId, plan_key: p, status: s }))));
  await seedTry("workspace_entitlements", [{ workspace_id: w, plan_key: "pilot", status: "active", billing_mode: "one_time_pilot" }, { workspace_id: w, plan_key: "team", status: "active", billing_mode: "subscription" }]);
  const bucket = "iso-" + runId;
  const evt = "evt_iso_" + runId;
  await seed("api_rate_limits", { bucket_key: bucket, window_started_at: new Date().toISOString() });
  await seed("billing_events", { stripe_event_id: evt, event_type: "iso.test", payload: {} });

  const ownWs = await A.client.from("workspaces").select("id");
  check("A sees its own workspace", (ownWs.data ?? []).some((x) => x.id === A.wsId));
  check("A does not see B workspace in the list", !(ownWs.data ?? []).some((x) => x.id === w));
  const ownMem = await A.client.from("workspace_members").select("workspace_id,user_id");
  check("A sees its own membership row", (ownMem.data ?? []).some((m) => m.workspace_id === A.wsId && m.user_id === A.id));
  check("A sees no membership row of B workspace", !(ownMem.data ?? []).some((m) => m.workspace_id === w));
  const anonWs = await anonClient.from("workspaces").select("id");
  check("Unauthenticated client sees no workspaces", rowsOf(anonWs) === 0, { error: errOf(anonWs) });

  for (const t of TABLES) {
    const before = await countB(t, w);
    if (before === null) { result.tables.push({ table: t, skipped: true, reason: "no workspace_id or not readable by admin" }); continue; }
    const aAll = await A.client.from(t).select("workspace_id").limit(1000);
    const aB = await A.client.from(t).select("workspace_id").eq("workspace_id", w);
    const an = await anonClient.from(t).select("workspace_id").limit(1000);
    const bOwn = await B.client.from(t).select("workspace_id").eq("workspace_id", w);
    const leaked = (aAll.data ?? []).filter((r) => r.workspace_id === w).length + rowsOf(aB);
    result.tables.push({ table: t, rows_in_B: before, b_saw_own: rowsOf(bOwn), A_saw_B_rows: leaked, anon_saw_rows: rowsOf(an), pass: leaked === 0 && rowsOf(an) === 0 });
  }

  for (const t of ["api_rate_limits", "billing_events"]) {
    const key = t === "api_rate_limits" ? ["bucket_key", bucket] : ["stripe_event_id", evt];
    const adm = await admin.from(t).select("*").eq(key[0], key[1]);
    const aa = await A.client.from(t).select("*").eq(key[0], key[1]);
    const an = await anonClient.from(t).select("*").eq(key[0], key[1]);
    result.tables.push({ table: t, rows_in_B: rowsOf(adm), b_saw_own: "n/a", A_saw_B_rows: rowsOf(aa), anon_saw_rows: rowsOf(an), pass: rowsOf(adm) === 1 && rowsOf(aa) === 0 && rowsOf(an) === 0 });
  }

  const u1 = await A.client.from("workspaces").update({ name: "HIJACKED-" + runId }).eq("id", w).select("id");
  check("A cannot rename B workspace", rowsOf(u1) === 0, { error: errOf(u1) });
  const u2 = await A.client.from("workspace_members").update({ role: "VIEWER" }).eq("workspace_id", w).select("user_id");
  check("A cannot change roles in B workspace", rowsOf(u2) === 0, { error: errOf(u2) });
  const i1 = await A.client.from("workspace_members").insert({ workspace_id: w, user_id: A.id, role: "OWNER", status: "active" }).select("user_id");
  check("A cannot add itself as OWNER of B workspace", rowsOf(i1) === 0, { error: errOf(i1) });
  const i2 = await A.client.from("agents").insert({ workspace_id: w, name: "iso-attack-" + runId }).select("id");
  check("A cannot insert an agent into B workspace", rowsOf(i2) === 0, { error: errOf(i2) });

  for (const t of TABLES) {
    const before = await countB(t, w);
    if (!before) continue;
    const del = await A.client.from(t).delete().eq("workspace_id", w).select();
    const mv = await A.client.from(t).update({ workspace_id: A.wsId }).eq("workspace_id", w).select();
    const after = await countB(t, w);
    check(`A cannot delete or move B rows in ${t}`, rowsOf(del) === 0 && rowsOf(mv) === 0 && after === before, { rows_before: before, rows_after: after, del_rows: rowsOf(del), move_rows: rowsOf(mv) });
  }

  const wsB = await admin.from("workspaces").select("name").eq("id", w).maybeSingle();
  check("B workspace name unchanged (admin view)", wsB.data && !String(wsB.data.name).startsWith("HIJACKED"));
  const memB = await admin.from("workspace_members").select("user_id").eq("workspace_id", w);
  check("B workspace still has exactly one member (admin view)", rowsOf(memB) === 1 && memB.data[0].user_id === B.id, { members: rowsOf(memB) });
  const attackAgents = await admin.from("agents").select("id").eq("workspace_id", w).eq("name", "iso-attack-" + runId);
  check("No attacker agent exists in B workspace (admin view)", rowsOf(attackAgents) === 0);
} catch (e) {
  result.error = String(e && e.message ? e.message : e).slice(0, 200);
} finally {
  await admin.from("api_rate_limits").delete().eq("bucket_key", "iso-" + runId);
  await admin.from("billing_events").delete().eq("stripe_event_id", "evt_iso_" + runId);
  for (const id of wsIds) await admin.from("workspaces").delete().eq("id", id);
  for (const id of userIds) await admin.auth.admin.deleteUser(id);
  const left = wsIds.length ? await admin.from("workspaces").select("id").in("id", wsIds) : { data: [] };
  let usersLeft = 0;
  for (const id of userIds) {
    const u = await admin.auth.admin.getUserById(id);
    if (u.data && u.data.user) usersLeft += 1;
  }
  result.cleanup = { verified: rowsOf(left) === 0 && usersLeft === 0, workspaces_left: rowsOf(left), users_left: usersLeft };
  const tested = result.tables.filter((t) => !t.skipped && t.rows_in_B > 0).map((t) => t.table);
  const untested = result.tables.filter((t) => t.skipped || !(t.rows_in_B > 0)).map((t) => t.table);
  const allPass = result.checks.length > 0 && result.checks.every((c) => c.pass) && result.tables.every((t) => t.skipped || t.pass) && result.cleanup.verified && !result.error;
  result.status = allPass ? "PASS" : "FAIL";
  console.log("table | rows_in_B | B_saw_own | A_saw_B | anon_saw | pass");
  for (const t of result.tables) console.log(t.skipped ? `${t.table} | skipped (${t.reason})` : `${t.table} | ${t.rows_in_B} | ${t.b_saw_own} | ${t.A_saw_B_rows} | ${t.anon_saw_rows} | ${t.pass}`);
  console.log("SEED: " + JSON.stringify(result.seed));
  console.log("TESTED WITH REAL ROWS (" + tested.length + "): " + tested.join(", "));
  console.log("NOT TESTED WITH ROWS (" + untested.length + "): " + untested.join(", "));
  const failed = result.checks.filter((c) => !c.pass);
  console.log(JSON.stringify({ status: result.status, error: result.error, checks_total: result.checks.length, checks_failed: failed, cleanup: result.cleanup }, null, 2));
  await mkdir(path.join(process.cwd(), ".enterprise"), { recursive: true });
  await writeFile(path.join(process.cwd(), ".enterprise", "phase-c24-workspace-isolation.json"), JSON.stringify(result, null, 2));
  process.exitCode = allPass ? 0 : 1;
}
