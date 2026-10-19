import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
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
const email = `aegisora-c25-${runId}@example.com`;
const password = `AeG!${randomUUID()}9z`;
const apiKey = `aeg_live_${randomBytes(24).toString("hex")}`;
const result = { status: "FAIL", environment: "e2e", checks: [], cleanup: { verified: false } };
let userId = null;
let workspaceId = null;
let child = null;

function check(name, pass, details = {}) {
  result.checks.push({ name, pass: Boolean(pass), ...details });
}

async function evaluate(origin) {
  const response = await fetch(`${origin}/api/v1/evaluate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ agent: "temporary-test-agent", action: "read-settings", resource: "iso", input: {}, trace: { id: randomUUID(), spans: [{ name: "caller", attrs: {} }] } }),
  });
  const payload = await response.json().catch(() => null);
  const raw = JSON.stringify(payload ?? null);
  const eff = payload?.decision?.effect ?? payload?.effect ?? (typeof payload?.decision === "string" ? payload.decision : null);
  const effStr = eff ? String(eff).toUpperCase() : raw.includes('"ALLOW"') ? "ALLOW" : raw.includes('"BLOCK"') ? "BLOCK" : "UNKNOWN";
  return { status: response.status, ok: response.ok, effect: effStr, snippet: raw.slice(0, 140) };
}
const allowed = (r) => r.ok && r.effect === "ALLOW";
const blocked = (r) => !r.ok || r.effect === "BLOCK";

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error("createUser failed");
  userId = created.data.user.id;
  const client = createClient(url, anon, opts);
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const ws = await client.rpc("create_workspace", { workspace_name: `C25 ${runId}`, workspace_slug: `c25-${runId}` });
  if (ws.error || typeof ws.data !== "string") throw ws.error ?? new Error("create_workspace failed");
  workspaceId = ws.data;

  const s1 = await admin.from("workspace_settings").upsert({ workspace_id: workspaceId, default_effect: "BLOCK", auto_register_agents: true }, { onConflict: "workspace_id" });
  if (s1.error) throw s1.error;
  const e1 = await admin.from("workspace_entitlements").upsert({ workspace_id: workspaceId, plan_key: "pilot", status: "active", billing_mode: "one_time_pilot" }, { onConflict: "workspace_id" });
  if (e1.error) throw e1.error;
  const k1 = await admin.from("api_keys").insert({ workspace_id: workspaceId, name: "c25", prefix: apiKey.slice(0, 13), key_hash: createHash("sha256").update(apiKey).digest("hex"), created_by: userId });
  if (k1.error) throw k1.error;
  const p1 = await admin.from("policies").insert({ workspace_id: workspaceId, name: "C25 allow read", action_pattern: "read-settings*", resource_pattern: "*", decision: "ALLOW", priority: 1, enabled: true });
  if (p1.error) throw p1.error;

  await mkdir(path.join(root, ".enterprise"), { recursive: true });
  const portServer = createServer();
  await new Promise((resolve, reject) => portServer.listen(0, "127.0.0.1", resolve).once("error", reject));
  const address = portServer.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => portServer.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const log = createWriteStream(path.join(root, ".enterprise", "entitlement-e2e-next.log"), { flags: "w" });
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: serviceRole },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  let ready = false;
  for (let i = 0; i < 120; i += 1) {
    if (child.exitCode !== null) throw new Error("Production server exited before ready (is .next built?).");
    try {
      const r = await fetch(`${origin}/api/v1/health`, { signal: AbortSignal.timeout(1500) });
      if (r.status < 500) { ready = true; break; }
    } catch { /* wait */ }
    await delay(1000);
  }
  if (!ready) throw new Error("Server did not become ready.");

  const setStatus = async (status) => {
    const u = await admin.from("workspace_entitlements").update({ status }).eq("workspace_id", workspaceId);
    if (u.error) throw u.error;
  };

  let r = await evaluate(origin);
  check("active entitlement: read action is ALLOWed", allowed(r), { status: r.status, effect: r.effect });
  await setStatus("inactive");
  r = await evaluate(origin);
  check("inactive entitlement: execution is blocked", blocked(r), { status: r.status, effect: r.effect, snippet: r.snippet });
  await setStatus("past_due");
  r = await evaluate(origin);
  check("past_due entitlement: execution is blocked", blocked(r), { status: r.status, effect: r.effect, snippet: r.snippet });
  await setStatus("active");
  r = await evaluate(origin);
  check("re-activated entitlement: ALLOW works again", allowed(r), { status: r.status, effect: r.effect });
  const del = await admin.from("workspace_entitlements").delete().eq("workspace_id", workspaceId);
  if (del.error) throw del.error;
  r = await evaluate(origin);
  check("no entitlement row: execution is blocked", blocked(r), { status: r.status, effect: r.effect, snippet: r.snippet });
} catch (e) {
  result.error = String(e && e.message ? e.message : e).slice(0, 200);
} finally {
  if (child) { try { child.kill(); } catch { /* ignore */ } }
  await delay(1500);
  if (workspaceId) await admin.from("workspaces").delete().eq("id", workspaceId);
  if (userId) await admin.auth.admin.deleteUser(userId);
  const wsLeft = workspaceId ? await admin.from("workspaces").select("id").eq("id", workspaceId) : { data: [] };
  const userLeft = userId ? await admin.auth.admin.getUserById(userId) : { data: { user: null } };
  const wsN = Array.isArray(wsLeft.data) ? wsLeft.data.length : 0;
  const uN = userLeft.data && userLeft.data.user ? 1 : 0;
  result.cleanup = { verified: wsN === 0 && uN === 0, workspaces_left: wsN, users_left: uN };
  const allPass = result.checks.length === 5 && result.checks.every((c) => c.pass) && result.cleanup.verified && !result.error;
  result.status = allPass ? "PASS" : "FAIL";
  console.log(JSON.stringify(result, null, 2));
  await writeFile(path.join(root, ".enterprise", "phase-c25-entitlement-e2e.json"), JSON.stringify(result, null, 2));
  process.exitCode = allPass ? 0 : 1;
}