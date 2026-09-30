import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHmac } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(root, false);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !serviceRole) throw new Error("Supabase test credentials are not configured.");
const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `aegisora-mfa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
const password = `AeG!${randomUUID()}9z`;
const slug = `mfa-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const result = { status: "FAIL", checks: [], cleanup: { verified: false } };
let userId = null;
let workspaceId = null;
let totpSecret = null;
let child = null;

function totp(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.toUpperCase().replace(/=+$/g, "")) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  const key = Buffer.from(bytes);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: "Temporary MFA E2E" } });
  if (created.error || !created.data.user) throw created.error ?? new Error("MFA fixture user creation failed.");
  userId = created.data.user.id;
  const userClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const signedIn = await userClient.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session) throw signedIn.error ?? new Error("MFA fixture sign-in failed.");

  const workspace = await userClient.rpc("create_workspace", { workspace_name: "Temporary MFA E2E", workspace_slug: slug });
  if (workspace.error || typeof workspace.data !== "string") throw workspace.error ?? new Error("Temporary workspace creation failed.");
  workspaceId = workspace.data;
  result.checks.push({ name: "temporary workspace provisioned for protected API check", pass: true });

  const enrollment = await userClient.auth.mfa.enroll({ factorType: "totp", friendlyName: "Temporary MFA E2E" });
  if (enrollment.error || enrollment.data.type !== "totp") throw enrollment.error ?? new Error("Supabase TOTP enrollment unavailable.");
  totpSecret = enrollment.data.totp.secret;
  const confirmation = await userClient.auth.mfa.challengeAndVerify({ factorId: enrollment.data.id, code: totp(totpSecret) });
  if (confirmation.error) throw confirmation.error;
  result.checks.push({ name: "real Supabase TOTP enrollment and verification", pass: true });

  await userClient.auth.signOut();
  const freshSession = await userClient.auth.signInWithPassword({ email, password });
  if (freshSession.error || !freshSession.data.session) throw freshSession.error ?? new Error("Fresh AAL1 sign-in failed.");
  const aal1Response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${freshSession.data.session.access_token}` } });
  if (!aal1Response.ok) throw new Error("Fresh Supabase session was not accepted.");
  const accessClaims = JSON.parse(Buffer.from(freshSession.data.session.access_token.split(".")[1], "base64url").toString("utf8"));
  result.checks.push({ name: "fresh Supabase login starts at AAL1", pass: accessClaims.aal === "aal1" });

  const portServer = createServer();
  await new Promise((resolve, reject) => portServer.listen(0, "127.0.0.1", resolve).once("error", reject));
  const address = portServer.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => portServer.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const log = createWriteStream(path.join(root, ".enterprise", "mfa-e2e-next.log"), { flags: "w" });
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], { cwd: root, env: process.env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
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
  if (!ready) throw new Error("Production server did not become ready.");

  const apiResponse = await fetch(`${origin}/api/v1/workspace/members`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${freshSession.data.session.access_token}`, "X-Workspace-Id": workspaceId, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role: "ADMIN" }),
  });
  const apiPayload = await apiResponse.json().catch(() => null);
  const serverDeniedAal1 = apiResponse.status === 403 && apiPayload?.error?.code === "mfa_required";
  result.checks.push({ name: "team role mutation refuses AAL1 session", pass: serverDeniedAal1, status: apiResponse.status, code: apiPayload?.error?.code ?? null });
  if (!serverDeniedAal1) throw new Error("Privileged team mutation did not explicitly require MFA.");

  const run = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "tests/e2e/mfa.spec.ts", "--workers=1"], {
    cwd: root,
    env: { ...process.env, E2E_EMAIL: email, E2E_PASSWORD: password, E2E_MFA_SECRET: totpSecret, PLAYWRIGHT_BASE_URL: origin },
    stdio: "inherit", timeout: 120_000,
  });
  const browserMfa = run.status === 0;
  result.checks.push({ name: "browser authenticator step-up reaches AAL2", pass: browserMfa, exit_code: run.status ?? null });
  if (run.error) throw run.error;
  if (!browserMfa) throw new Error("Browser TOTP step-up failed.");
  result.status = "PASS";
} catch (error) {
  result.status = "FAIL";
  result.error = error instanceof Error ? error.message : "MFA E2E failed.";
} finally {
  if (child && child.exitCode === null) child.kill();
  if (workspaceId) {
    await admin.from("workspaces").delete().eq("id", workspaceId);
    const remaining = await admin.from("workspaces").select("id").eq("id", workspaceId).maybeSingle();
    result.cleanup.workspace_absent = !remaining.data;
  }
  if (userId) {
    const removed = await admin.auth.admin.deleteUser(userId);
    const after = await admin.auth.admin.getUserById(userId);
    result.cleanup.user_absent = Boolean(after.error);
    result.cleanup.user_deleted = !removed.error;
  }
  result.cleanup.verified = (!workspaceId || result.cleanup.workspace_absent) && (!userId || result.cleanup.user_absent && result.cleanup.user_deleted);
  if (!result.cleanup.verified) result.status = "FAIL";
  result.finished_at_utc = new Date().toISOString();
  await mkdir(path.join(root, ".enterprise"), { recursive: true });
  await writeFile(path.join(root, ".enterprise", "phase-c15-mfa-e2e.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.status === "PASS" ? 0 : 1;
