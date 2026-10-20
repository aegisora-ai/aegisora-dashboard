import { createRequire } from "node:module";
import { randomUUID, createHmac } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(root, true);
require("./_prod-guard.cjs");
const url = process.env.AEGISORA_E2E_SUPABASE_URL;
const anon = process.env.AEGISORA_E2E_SUPABASE_ANON_KEY;
const serviceRole = process.env.AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !serviceRole) throw new Error("Dedicated disposable E2E Supabase credentials are required; refusing to use application runtime credentials.");
const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
const suffix = randomUUID().replaceAll("-", "").slice(0, 14);
const ownerEmail = `aegisora-agent-c13-owner-${suffix}@example.com`;
const viewerEmail = `aegisora-agent-c13-viewer-${suffix}@example.com`;
const ownerPassword = `Ag!${randomUUID()}x9`;
const viewerPassword = `Ag!${randomUUID()}x8`;
const slug = `agent-c13-${suffix}`;
const result = { status: "FAIL", checks: [], cleanup: { verified: false } };
let ownerId = null;
let viewerId = null;
let workspaceId = null;
let child = null;
let origin = null;

function assert(name, pass, details = {}) {
  result.checks.push({ name, pass: Boolean(pass), ...details });
  if (!pass) throw new Error(`Agent API E2E failed: ${name}`);
}
function totp(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.toUpperCase().replace(/=+$/g, "")) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  const key = Buffer.from(bytes);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const code = ((digest[offset] & 127) << 24) | ((digest[offset + 1] & 255) << 16) | ((digest[offset + 2] & 255) << 8) | (digest[offset + 3] & 255);
  return String(code % 1_000_000).padStart(6, "0");
}
async function post(token, body) {
  const response = await fetch(`${origin}/api/v1/workspace/agents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ workspace_id: workspaceId, ...body }),
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

try {
  const ownerCreated = await admin.auth.admin.createUser({ email: ownerEmail, password: ownerPassword, email_confirm: true, user_metadata: { full_name: "Temporary agent API OWNER" } });
  if (ownerCreated.error || !ownerCreated.data.user) throw ownerCreated.error ?? new Error("OWNER fixture creation failed.");
  ownerId = ownerCreated.data.user.id;
  const viewerCreated = await admin.auth.admin.createUser({ email: viewerEmail, password: viewerPassword, email_confirm: true, user_metadata: { full_name: "Temporary agent API VIEWER" } });
  if (viewerCreated.error || !viewerCreated.data.user) throw viewerCreated.error ?? new Error("VIEWER fixture creation failed.");
  viewerId = viewerCreated.data.user.id;

  const owner = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const viewer = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const ownerLogin = await owner.auth.signInWithPassword({ email: ownerEmail, password: ownerPassword });
  const viewerLogin = await viewer.auth.signInWithPassword({ email: viewerEmail, password: viewerPassword });
  if (ownerLogin.error || !ownerLogin.data.session) throw ownerLogin.error ?? new Error("OWNER sign-in failed.");
  if (viewerLogin.error || !viewerLogin.data.session) throw viewerLogin.error ?? new Error("VIEWER sign-in failed.");
  const workspace = await owner.rpc("create_workspace", { p_name: "Temporary Agent API E2E" });
  if (workspace.error || typeof workspace.data !== "string") throw workspace.error ?? new Error("Temporary workspace creation failed.");
  workspaceId = workspace.data;

  const member = await admin.from("workspace_members").insert({ workspace_id: workspaceId, user_id: viewerId, role: "VIEWER", status: "active" });
  if (member.error) throw member.error;

  const portServer = createServer();
  await new Promise((resolve, reject) => portServer.listen(0, "127.0.0.1", resolve).once("error", reject));
  const address = portServer.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => portServer.close(resolve));
  origin = `http://127.0.0.1:${port}`;
  const log = createWriteStream(path.join(root, ".enterprise", "agent-api-e2e-next.log"), { flags: "w" });
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
    if (child.exitCode !== null) throw new Error("Production server exited before it was ready.");
    try {
      const response = await fetch(`${origin}/login`, { signal: AbortSignal.timeout(1500) });
      if (response.status < 500) { ready = true; break; }
    } catch { /* wait for local startup */ }
    await delay(1000);
  }
  if (!ready) throw new Error("Local production server did not become ready.");

  const viewerDenied = await post(viewerLogin.data.session.access_token, { operation: "create", agent: { name: `viewer-denied-${suffix}` } });
  assert("VIEWER cannot mutate the workspace agent inventory", viewerDenied.status === 403 && viewerDenied.body?.error?.code === "forbidden", { status: viewerDenied.status, code: viewerDenied.body?.error?.code ?? null });

  const aal1Denied = await post(ownerLogin.data.session.access_token, { operation: "create", agent: { name: `aal1-denied-${suffix}` } });
  assert("OWNER AAL1 cannot perform governance-sensitive agent mutation", aal1Denied.status === 403 && aal1Denied.body?.error?.code === "mfa_required", { status: aal1Denied.status, code: aal1Denied.body?.error?.code ?? null });

  const enrolled = await owner.auth.mfa.enroll({ factorType: "totp", friendlyName: "Temporary Agent API E2E" });
  if (enrolled.error || enrolled.data.type !== "totp") throw enrolled.error ?? new Error("TOTP enrollment failed.");
  const verified = await owner.auth.mfa.challengeAndVerify({ factorId: enrolled.data.id, code: totp(enrolled.data.totp.secret) });
  if (verified.error) throw verified.error;
  const ownerAal2 = await owner.auth.getSession();
  const accessToken = ownerAal2.data.session?.access_token;
  const claims = accessToken ? JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8")) : {};
  assert("OWNER TOTP step-up produces an AAL2 Supabase token", claims.aal === "aal2", { aal: claims.aal ?? null });
  if (!accessToken) throw new Error("AAL2 access token is missing.");

  const piiRejected = await post(accessToken, { operation: "create", agent: { name: `owner-${ownerEmail}` } });
  assert("PII-containing agent names are rejected by the authenticated server endpoint", piiRejected.status === 400 && piiRejected.body?.error?.code === "invalid_agent", { status: piiRejected.status, code: piiRejected.body?.error?.code ?? null });
  const piiExternalIdRejected = await post(accessToken, { operation: "import", agents: [{ name: `safe-name-${suffix}`, external_id: ownerEmail }] });
  assert("PII-containing imported external IDs are rejected", piiExternalIdRejected.status === 400 && piiExternalIdRejected.body?.error?.code === "invalid_agent", { status: piiExternalIdRejected.status, code: piiExternalIdRejected.body?.error?.code ?? null });
  const foreignWorkspaceDenied = await post(accessToken, { workspace_id: "00000000-0000-4000-8000-000000000001", operation: "create", agent: { name: `foreign-denied-${suffix}` } });
  assert("OWNER cannot mutate agents by substituting an unowned workspace ID", foreignWorkspaceDenied.status === 403 && foreignWorkspaceDenied.body?.error?.code === "forbidden", { status: foreignWorkspaceDenied.status, code: foreignWorkspaceDenied.body?.error?.code ?? null });

  const imported = await post(accessToken, { operation: "import", agents: [
    { name: `safe-agent-${suffix}`, description: `owner ${ownerEmail}`, external_id: `external-${suffix}`, metadata: { email: ownerEmail, note: "support worker" } },
  ] });
  assert("OWNER AAL2 can import an agent and the server reports one persisted row", imported.status === 200 && imported.body?.imported === 1, { status: imported.status, imported: imported.body?.imported ?? null });
  const { data: importedRows, error: importedError } = await admin.from("agents").select("id,name,description,external_id,metadata,state").eq("workspace_id", workspaceId).eq("name", `safe-agent-${suffix}`);
  if (importedError) throw importedError;
  assert("agent persistence masks free-text/metadata PII and does not copy the name into external_id", importedRows?.length === 1 && importedRows[0].description === "owner [REDACTED_EMAIL]" && importedRows[0].metadata?.email === "[REDACTED]" && importedRows[0].external_id === `external-${suffix}`);
  const agentId = importedRows?.[0]?.id;
  if (!agentId) throw new Error("Imported agent row was not persisted.");

  const updated = await post(accessToken, { operation: "update", agent_id: agentId, state: "DISABLED" });
  assert("OWNER AAL2 can update an agent in the caller workspace", updated.status === 200 && updated.body?.updated === true, { status: updated.status });
  const { data: afterUpdate, error: updateReadError } = await admin.from("agents").select("state").eq("id", agentId).maybeSingle();
  if (updateReadError) throw updateReadError;
  assert("agent state update persisted", afterUpdate?.state === "DISABLED");

  const deleted = await post(accessToken, { operation: "delete", agent_id: agentId });
  assert("OWNER AAL2 can delete an agent in the caller workspace", deleted.status === 200 && deleted.body?.deleted === true, { status: deleted.status });
  const { data: afterDelete, error: deleteReadError } = await admin.from("agents").select("id").eq("id", agentId).maybeSingle();
  if (deleteReadError) throw deleteReadError;
  assert("deleted agent is absent", !afterDelete);

  result.status = "PASS";
} catch (error) {
  result.status = "FAIL";
  result.error = error instanceof Error ? error.message : "Agent API E2E failed.";
} finally {
  if (child && child.exitCode === null) child.kill();
  if (workspaceId) {
    const removed = await admin.from("workspaces").delete().eq("id", workspaceId);
    if (removed.error) result.cleanup.workspace_delete_error = removed.error.code ?? "delete_failed";
    const remaining = await admin.from("workspaces").select("id").eq("id", workspaceId).maybeSingle();
    result.cleanup.workspace_absent = !remaining.data;
  }
  for (const [id, key] of [[ownerId, "owner"], [viewerId, "viewer"]]) {
    if (!id) continue;
    const removed = await admin.auth.admin.deleteUser(id);
    const after = await admin.auth.admin.getUserById(id);
    result.cleanup[`${key}_user_deleted`] = !removed.error;
    result.cleanup[`${key}_user_absent`] = Boolean(after.error);
  }
  result.cleanup.verified = (!workspaceId || result.cleanup.workspace_absent) &&
    (!ownerId || result.cleanup.owner_user_deleted && result.cleanup.owner_user_absent) && (!viewerId || result.cleanup.viewer_user_deleted && result.cleanup.viewer_user_absent);
  if (!result.cleanup.verified) result.status = "FAIL";
  result.finished_at_utc = new Date().toISOString();
  await mkdir(path.join(root, ".enterprise"), { recursive: true });
  await writeFile(path.join(root, ".enterprise", "phase-c13-c21-agent-api-e2e.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.status === "PASS" ? 0 : 1;
