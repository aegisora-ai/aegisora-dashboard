import { createRequire } from "node:module";
import { randomUUID, createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(root, true);
require("./_prod-guard.cjs");
if ((process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('hypbttzeqeupwdzbgwbd')) { console.error('REFUSING: runtime Supabase project is LIVE.'); process.exit(1); } // AEGISORA-LIVE-GUARD
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3199";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !serviceRole) throw new Error("Supabase test credentials are not configured.");

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const password = `AeG!${randomUUID()}9z`;
const fixtures = [];
const result = { status: "FAIL", checks: [], cleanup: { verified: false } };
let workspaceId = null;

function assert(name, pass, details = {}) {
  result.checks.push({ name, pass: Boolean(pass), ...details });
  if (!pass) throw new Error(`C13 check failed: ${name}`);
}

function codeFromTotpSecret(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.toUpperCase().replace(/=+$/g, "")) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", Buffer.from(bytes)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

async function newFixture(role) {
  const email = `aegisora-c13-${role.toLowerCase()}-${runId}@example.com`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `Temporary C13 ${role}` } });
  if (created.error || !created.data.user) throw created.error ?? new Error(`Could not create ${role} fixture.`);
  const fixture = { role, email, id: created.data.user.id };
  fixtures.push(fixture);
  return fixture;
}

async function signIn(fixture) {
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const response = await client.auth.signInWithPassword({ email: fixture.email, password });
  if (response.error || !response.data.session) throw response.error ?? new Error(`${fixture.role} login failed.`);
  return { client, session: response.data.session, token: response.data.session.access_token };
}

async function stepUp(fixture) {
  const { client } = await signIn(fixture);
  const enrollment = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: `C13 ${fixture.role}` });
  if (enrollment.error || enrollment.data.type !== "totp") throw enrollment.error ?? new Error(`${fixture.role} TOTP enrollment failed.`);
  const verified = await client.auth.mfa.challengeAndVerify({ factorId: enrollment.data.id, code: codeFromTotpSecret(enrollment.data.totp.secret) });
  if (verified.error) throw verified.error;
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) throw error ?? new Error(`${fixture.role} AAL2 session missing.`);
  const claims = JSON.parse(Buffer.from(data.session.access_token.split(".")[1], "base64url").toString("utf8"));
  assert(`${fixture.role} obtains AAL2 session`, claims.aal === "aal2");
  return { client, token: data.session.access_token };
}

async function api(method, actor, body, expectedStatus, expectedCode) {
  const response = await fetch(`${baseUrl}/api/v1/workspace/members`, {
    method,
    headers: {
      Authorization: `Bearer ${actor.token}`,
      "X-Workspace-Id": workspaceId,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);
  const pass = response.status === expectedStatus && (!expectedCode || payload?.error?.code === expectedCode);
  assert(`${actor.role ?? actor.name} ${method} ${expectedCode ?? expectedStatus}`, pass, { actual_status: response.status, actual_code: payload?.error?.code ?? null });
  return payload;
}

try {
  // Fail fast when the SQL rollout has not reached the hosted database.
  const migrationPreflight = await admin.rpc("accept_workspace_invites", { p_user_id: randomUUID(), p_actor_id: randomUUID() });
  if (!migrationPreflight.error || !migrationPreflight.error.message.toLowerCase().includes("actor must match")) {
    throw new Error("Hosted membership-audit RPC is absent or its preflight contract changed; apply both migrations before running C13.");
  }
  result.checks.push({ name: "hosted membership migration preflight", pass: true });

  const owner = await newFixture("OWNER");
  const adminRole = await newFixture("ADMIN");
  const operator = await newFixture("OPERATOR");
  const viewer = await newFixture("VIEWER");
  const target = await newFixture("TARGET");
  const ownerLogin = await signIn(owner);
  Object.assign(ownerLogin, { role: "OWNER", token: ownerLogin.session.access_token });
  const createdWorkspace = await ownerLogin.client.rpc("create_workspace", { workspace_name: `C13 lifecycle ${runId}`, workspace_slug: `c13-${runId}` });
  if (createdWorkspace.error || typeof createdWorkspace.data !== "string") throw createdWorkspace.error ?? new Error("Workspace fixture creation failed.");
  workspaceId = createdWorkspace.data;

  const { error: memberInsertError } = await admin.from("workspace_members").insert([
    { workspace_id: workspaceId, user_id: adminRole.id, role: "ADMIN", status: "active" },
    { workspace_id: workspaceId, user_id: operator.id, role: "OPERATOR", status: "active" },
    { workspace_id: workspaceId, user_id: viewer.id, role: "VIEWER", status: "active" },
  ]);
  if (memberInsertError) throw memberInsertError;

  const ownerActor = await stepUp(owner);
  const ownerAal1 = await signIn(owner);
  Object.assign(ownerAal1, { role: "OWNER", token: ownerAal1.session.access_token });
  const adminActor = await stepUp(adminRole);
  const operatorAal1 = await signIn(operator);
  const viewerAal1 = await signIn(viewer);
  const targetAal1 = await signIn(target);
  Object.assign(ownerActor, { role: "OWNER" });
  Object.assign(adminActor, { role: "ADMIN" });
  Object.assign(operatorAal1, { role: "OPERATOR" });
  Object.assign(viewerAal1, { role: "VIEWER" });
  Object.assign(targetAal1, { role: "TARGET" });

  for (const [actor, role] of [[ownerActor, "OWNER"], [adminActor, "ADMIN"], [operatorAal1, "OPERATOR"], [viewerAal1, "VIEWER"]]) {
    const headers = { Authorization: `Bearer ${actor.token}`, "X-Workspace-Id": workspaceId };
    const response = await fetch(`${baseUrl}/api/v1/workspace/members`, { headers });
    const payload = await response.json().catch(() => null);
    assert(`${role} team read`, response.status === 200 && payload.current_role === role, { actual_status: response.status });
  }

  const invite = await api("POST", ownerActor, { email: target.email, role: "VIEWER" }, 201);
  assert("existing account invitation stays pending without sending mail", invite.status === "invited" && invite.email_sent === false);
  const acceptResponse = await fetch(`${baseUrl}/api/v1/workspace/members/accept`, { method: "POST", headers: { Authorization: `Bearer ${targetAal1.session.access_token}` } });
  const acceptPayload = await acceptResponse.json().catch(() => null);
  assert("invitee accepts only its own invitation", acceptResponse.status === 200 && acceptPayload.accepted === 1, { actual_status: acceptResponse.status });

  await api("PATCH", ownerAal1, { user_id: target.id, role: "ADMIN" }, 403, "mfa_required");
  await api("PATCH", adminActor, { user_id: target.id, role: "OPERATOR" }, 200);
  await api("PATCH", adminActor, { user_id: target.id, role: "ADMIN" }, 403, "owner_only");
  await api("PATCH", adminActor, { user_id: owner.id, role: "VIEWER" }, 403, "owner_only");
  await api("PATCH", operatorAal1, { user_id: target.id, role: "VIEWER" }, 403, "forbidden");
  await api("PATCH", viewerAal1, { user_id: target.id, role: "OPERATOR" }, 403, "forbidden");
  await api("PATCH", ownerActor, { user_id: target.id, role: "ADMIN" }, 200);
  await api("DELETE", adminActor, { user_id: owner.id }, 403, "owner_only");
  await api("PATCH", ownerActor, { user_id: target.id, role: "OPERATOR" }, 200);
  await api("DELETE", adminActor, { user_id: target.id }, 200);

  const { data: events, error: auditError } = await admin.from("audit_events")
    .select("actor, action, target_id, meta").eq("workspace_id", workspaceId).eq("target_type", "workspace_member");
  if (auditError) throw auditError;
  assert("audit contains actor-attributed invite, acceptance, role changes and removal", [owner.id, target.id, adminRole.id].every((actorId) => events?.some((event) => event.actor === actorId)) && events?.some((event) => event.action === "workspace_members.role_change") && events?.some((event) => event.action === "workspace_members.delete"));

  const { error: auditWriteError } = await viewerAal1.client.from("audit_events").insert({ workspace_id: workspaceId, actor: viewer.id, action: "forged" });
  assert("authenticated user cannot forge audit event", Boolean(auditWriteError));
  result.status = "PASS";
} catch (error) {
  result.status = "FAIL";
  result.error = error instanceof Error ? error.message : "C13 membership lifecycle matrix failed.";
} finally {
  if (workspaceId) {
    await admin.from("workspaces").delete().eq("id", workspaceId);
    const absent = await admin.from("workspaces").select("id").eq("id", workspaceId).maybeSingle();
    result.cleanup.workspace_absent = !absent.data;
  }
  for (const fixture of fixtures) {
    const deleted = await admin.auth.admin.deleteUser(fixture.id);
    const after = await admin.auth.admin.getUserById(fixture.id);
    fixture.cleanup = !deleted.error && Boolean(after.error);
  }
  result.cleanup.users_absent = fixtures.every((fixture) => fixture.cleanup === true);
  result.cleanup.verified = (!workspaceId || result.cleanup.workspace_absent) && result.cleanup.users_absent;
  if (!result.cleanup.verified) result.status = "FAIL";
  result.finished_at_utc = new Date().toISOString();
  await mkdir(path.join(root, ".enterprise", "phase-c13-team-lifecycle"), { recursive: true });
  await writeFile(path.join(root, ".enterprise", "phase-c13-team-lifecycle", "result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.status === "PASS" ? 0 : 1;
