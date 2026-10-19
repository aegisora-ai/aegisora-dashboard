import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const url = process.env.AEGISORA_E2E_SUPABASE_URL;
const anon = process.env.AEGISORA_E2E_SUPABASE_ANON_KEY;
const serviceRole = process.env.AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !url.includes("daigywopatmznzgaouqo") || !anon || !serviceRole) {
  console.error("STOP: E2E guard or test credentials failed.");
  process.exit(2);
}
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceRole, opts);
const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const email = `aegisora-c26-${runId}@example.com`;
const password = `AeG!${randomUUID()}9z`;
const apiKey = `aeg_live_${randomBytes(24).toString("hex")}`;
const result = { status: "FAIL", environment: "e2e", checks: [], cleanup: { verified: false } };
let userId = null, workspaceId = null, child = null;
const check = (name, pass, d = {}) => result.checks.push({ name, pass: Boolean(pass), ...d });

async function call(origin, key) {
  const r = await fetch(`${origin}/api/v1/evaluate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ agent: "rate-test-agent", action: "read-settings", resource: "iso", input: {} }),
  });
  await r.text().catch(() => "");
  return { status: r.status, retry: r.headers.get("retry-after") };
}

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error("createUser failed");
  userId = created.data.user.id;
  const client = createClient(url, anon, opts);
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const ws = await client.rpc("create_workspace", { workspace_name: `C26 ${runId}`, workspace_slug: `c26-${runId}` });
  if (ws.error || typeof ws.data !== "string") throw ws.error ?? new Error("create_workspace failed");
  workspaceId = ws.data;
  const e1 = await admin.from("workspace_entitlements").upsert({ workspace_id: workspaceId, plan_key: "pilot", status: "active", billing_mode: "one_time_pilot" }, { onConflict: "workspace_id" });
  if (e1.error) throw e1.error;
  const k1 = await admin.from("api_keys").insert({ workspace_id: workspaceId, name: "c26", prefix: apiKey.slice(0, 13), key_hash: createHash("sha256").update(apiKey).digest("hex"), created_by: userId });
  if (k1.error) throw k1.error;

  await mkdir(path.join(root, ".enterprise"), { recursive: true });
  const ps = createServer();
  await new Promise((res, rej) => ps.listen(0, "127.0.0.1", res).once("error", rej));
  const port = ps.address().port;
  await new Promise((res) => ps.close(res));
  const origin = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: serviceRole },
    windowsHide: true, stdio: ["ignore", "ignore", "ignore"],
  });
  let ready = false;
  for (let i = 0; i < 120; i += 1) {
    if (child.exitCode !== null) throw new Error("Server exited before ready (is .next built?).");
    try { const r = await fetch(`${origin}/api/v1/health`, { signal: AbortSignal.timeout(1500) }); if (r.status < 500) { ready = true; break; } } catch {}
    await delay(1000);
  }
  if (!ready) throw new Error("Server did not become ready.");

  const codes = [];
  let first429 = null;
  for (let i = 0; i < 70; i += 1) {
    const r = await call(origin, apiKey);
    codes.push(r.status);
    if (r.status === 429 && !first429) first429 = { at: i + 1, retry: r.retry };
  }
  const ok = codes.filter((c) => c === 200).length;
  check("normal requests are served before the limit", ok >= 1 && codes[0] === 200, { ok_count: ok });
  check("limit triggers 429 within 70 requests", Boolean(first429), { first_429_at_request: first429?.at ?? null });
  check("429 carries a positive Retry-After header", first429 && Number(first429.retry) > 0, { retry_after: first429?.retry ?? null });
  check("a bad key is rejected, not rate-limited into 200", (await call(origin, "aeg_live_" + "0".repeat(48))).status !== 200);
  const wait = Math.max(1, Math.min(65, Number(first429?.retry ?? 60) + 2));
  await delay(wait * 1000);
  const after = await call(origin, apiKey);
  check("window resets: request is served again after waiting", after.status === 200, { status: after.status, waited_s: wait });
} catch (e) {
  result.error = String(e && e.message ? e.message : e).slice(0, 200);
} finally {
  if (child) { try { child.kill(); } catch {} }
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
  await writeFile(path.join(root, ".enterprise", "phase-c26-rate-limit-e2e.json"), JSON.stringify(result, null, 2));
  process.exitCode = allPass ? 0 : 1;
}