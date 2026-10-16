import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createWriteStream } from "node:fs";
import path from "node:path";

const root = process.cwd();
const url = process.env.AEGISORA_E2E_SUPABASE_URL;
const anon = process.env.AEGISORA_E2E_SUPABASE_ANON_KEY;
const serviceRole = process.env.AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY;
const stagingRef = "bvdsfwmlylnmahridalj";

if (!url || !url.includes(stagingRef) || !anon || !serviceRole) {
  console.error("STOP: Staging guard or test credentials failed.");
  process.exit(2);
}

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const result = {
  status: "FAIL",
  environment: "staging",
  checks: [],
  cleanup: { verified: false },
};

let ownerId = null;
let viewerId = null;
let workspaceId = null;
let child = null;
let logStream = null;
let origin = null;

function check(name, pass, details = {}) {
  result.checks.push({ name, pass: Boolean(pass), ...details });
  if (!pass) result.status = "FAIL";
  console.log(`${pass ? "[PASS]" : "[FAIL]"} ${name}`);
}

function base32Bytes(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const c of secret.toUpperCase().replace(/=+$/g, "")) {
    const index = alphabet.indexOf(c);
    if (index < 0) throw new Error("Invalid TOTP secret encoding.");

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 255);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }

  return Buffer.from(bytes);
}

function totp(secret) {
  const counter = Math.floor(Date.now() / 30000);
  const counterBytes = Buffer.alloc(8);
  counterBytes.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", base32Bytes(secret))
    .update(counterBytes)
    .digest();

  const offset = digest[digest.length - 1] & 15;
  const binary = (
    ((digest[offset] & 127) << 24) |
    ((digest[offset + 1] & 255) << 16) |
    ((digest[offset + 2] & 255) << 8) |
    (digest[offset + 3] & 255)
  );

  return String(binary % 1000000).padStart(6, "0");
}

function jwtClaims(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
}

function ensureNoError(error, message) {
  if (error) throw new Error(`${message}: ${error.message ?? "request failed"}`);
}

async function createFixture(label) {
  const suffix = randomBytes(5).toString("hex");
  const email = `ae-${label}-${suffix}@example.test`;
  const password = `Ag!${randomBytes(24).toString("hex")}Z9`;

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Temporary Approvals E2E ${label}` },
  });

  ensureNoError(created.error, `Create ${label} fixture`);
  if (!created.data.user) throw new Error(`Create ${label} fixture returned no user`);

  const user = created.data.user;
  if (label === "owner") ownerId = user.id;
  if (label === "viewer") viewerId = user.id;

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const login = await client.auth.signInWithPassword({ email, password });
  ensureNoError(login.error, `Sign in ${label}`);
  if (!login.data.session) throw new Error(`No initial session for ${label}`);

  const aal1Token = login.data.session.access_token;

  const enrolled = await client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Temporary Approvals E2E ${label}`,
  });

  ensureNoError(enrolled.error, `Enroll TOTP for ${label}`);
  if (enrolled.data.type !== "totp") throw new Error(`TOTP unavailable for ${label}`);

  const verification = await client.auth.mfa.challengeAndVerify({
    factorId: enrolled.data.id,
    code: totp(enrolled.data.totp.secret),
  });

  ensureNoError(verification.error, `Verify TOTP for ${label}`);

  const session = await client.auth.getSession();
  ensureNoError(session.error, `Read AAL2 session for ${label}`);

  const aal2Token = session.data.session?.access_token;
  if (!aal2Token || jwtClaims(aal2Token).aal !== "aal2") {
    throw new Error(`${label} did not obtain an AAL2 session`);
  }

  return { id: user.id, client, aal1Token, aal2Token };
}

async function startLocalServer() {
  const probe = createServer();
  await new Promise((resolve, reject) =>
    probe.listen(0, "127.0.0.1", resolve).once("error", reject)
  );

  const address = probe.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise(resolve => probe.close(resolve));

  origin = `http://127.0.0.1:${port}`;
  logStream = createWriteStream(
    path.join(root, ".enterprise", "approvals-e2e-next.log"),
    { flags: "w" },
  );

  child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      cwd: root,
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
        SUPABASE_SERVICE_ROLE_KEY: serviceRole,
      },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  let ready = false;

  for (let i = 0; i < 90; i++) {
    if (child.exitCode !== null) throw new Error("Next server exited before readiness.");

    try {
      const response = await fetch(`${origin}/api/v1/health`, {
        signal: AbortSignal.timeout(1500),
      });

      if (response.status < 500) {
        ready = true;
        break;
      }
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!ready) throw new Error("Local Next server did not become ready.");
}

async function patchApproval(token, id, status, note = "Authorized staging E2E test.") {
  const response = await fetch(
    `${origin}/api/v1/workspace/approvals/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, note }),
      cache: "no-store",
    },
  );

  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function createEscalatedApproval(apiKey, label) {
  const action = `approve-payment-e2e-${label}-${randomBytes(3).toString("hex")}`;

  const response = await fetch(`${origin}/api/v1/evaluate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent: "temporary-test-agent",
      action,
      resource: `payment:e2e-${label}`,
      input: { amount: 17, currency: "EUR", test_run: true },
      trace: {
        id: randomUUID(),
        spans: [{ name: "approvals-e2e", attrs: { test_run: true } }],
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Evaluate request failed: HTTP ${response.status}, ${payload?.error?.code ?? "unknown"}`);
  }

  for (let attempt = 0; attempt < 40; attempt++) {
    const rows = await admin
      .from("approvals")
      .select("id,workspace_id,status,expires_at,action,decision_id")
      .eq("workspace_id", workspaceId)
      .eq("action", action)
      .limit(1);

    ensureNoError(rows.error, "Read generated approval");

    if (rows.data?.[0]) return rows.data[0];

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  throw new Error("Evaluation did not create its expected approval record.");
}
async function auditSnapshot() {
  const query = await admin
    .from("audit_events")
    .select("id,actor,action,target_id,meta")
    .eq("workspace_id", workspaceId)
    .limit(100);

  ensureNoError(query.error, "Read audit events");
  return query.data ?? [];
}

try {
  console.log("Staging guard passed. Preparing temporary test fixtures...");

  const owner = await createFixture("owner");
  const viewer = await createFixture("viewer");

  const workspace = await owner.client.rpc("create_workspace", {
    workspace_name: "Temporary Approvals API E2E",
    workspace_slug: `approvals-e2e-${randomBytes(5).toString("hex")}`,
  });

  ensureNoError(workspace.error, "Create temporary workspace");
  if (typeof workspace.data !== "string") {
    throw new Error("Workspace creation returned no workspace id");
  }

  workspaceId = workspace.data;

  const member = await admin.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: viewer.id,
    role: "VIEWER",
    status: "active",
  });

  ensureNoError(member.error, "Add temporary VIEWER");

  const settings = await admin.from("workspace_settings").upsert({
    workspace_id: workspaceId,
    default_effect: "BLOCK",
    auto_register_agents: true,
  }, { onConflict: "workspace_id" });

  ensureNoError(settings.error, "Prepare workspace settings");

  const entitlement = await admin.from("workspace_entitlements").upsert({
    workspace_id: workspaceId,
    plan_key: "founder_pilot",
    status: "active",
    billing_mode: "one_time_pilot",
  }, { onConflict: "workspace_id" });

  ensureNoError(entitlement.error, "Prepare workspace entitlement");

  const apiKey = `aeg_live_${randomBytes(24).toString("hex")}`;

  const keyInsert = await admin.from("api_keys").insert({
    workspace_id: workspaceId,
    name: "temporary-approvals-e2e",
    prefix: apiKey.slice(0, 13),
    key_hash: createHash("sha256").update(apiKey).digest("hex"),
    created_by: owner.id,
  });

  ensureNoError(keyInsert.error, "Create temporary evaluation API key");

  const policies = await admin.from("policies").insert([
    {
      workspace_id: workspaceId,
      name: "Approvals E2E escalate",
      action_pattern: "approve-payment*",
      resource_pattern: "*",
      decision: "ESCALATE",
      priority: 1,
      enabled: true,
    },
    {
      workspace_id: workspaceId,
      name: "Approvals E2E fallback",
      action_pattern: "approve-payment*",
      resource_pattern: "*",
      decision: "ALLOW",
      priority: 2,
      enabled: true,
    },
  ]);

  ensureNoError(policies.error, "Create temporary E2E policies");

  await startLocalServer();

  const approval = await createEscalatedApproval(apiKey, "approve");

  const aal1 = await patchApproval(
    owner.aal1Token, approval.id, "approved",
  );

  check(
    "Owner AAL1 cannot resolve an approval",
    aal1.status === 403,
    { actual_status: aal1.status },
  );

  const viewerDenied = await patchApproval(
    viewer.aal2Token, approval.id, "approved",
  );

  check(
    "VIEWER AAL2 cannot resolve another workspace's approval",
    viewerDenied.status === 403,
    { actual_status: viewerDenied.status },
  );

  const missingReason = await patchApproval(
    owner.aal2Token, approval.id, "approved", "",
  );

  check(
    "A resolution reason is mandatory",
    missingReason.status === 400,
    { actual_status: missingReason.status },
  );

  const auditBefore = await auditSnapshot();
  const auditIdsBefore = new Set(auditBefore.map(row => row.id));

  const approved = await patchApproval(
    owner.aal2Token,
    approval.id,
    "approved",
    "Approved for isolated staging E2E testing.",
  );

  check(
    "Owner AAL2 can approve a pending, unexpired request",
    approved.status === 200 &&
      approved.body?.approval?.status === "approved" &&
      approved.body?.may_execute === true,
    { actual_status: approved.status },
  );

  const persisted = await admin
    .from("approvals")
    .select("id,status,note,resolved_by,resolved_at")
    .eq("id", approval.id)
    .maybeSingle();

  ensureNoError(persisted.error, "Verify persisted approval");

  check(
    "Approval reason and resolver persist in the database",
    persisted.data?.status === "approved" &&
      persisted.data?.resolved_by === owner.id &&
      persisted.data?.note === "Approved for isolated staging E2E testing." &&
      Boolean(persisted.data?.resolved_at),
  );

  const repeated = await patchApproval(
    owner.aal2Token, approval.id, "rejected",
  );

  check(
    "A resolved approval cannot be resolved a second time",
    repeated.status === 409,
    { actual_status: repeated.status },
  );

  const auditAfter = await auditSnapshot();
  const newEvents = auditAfter.filter(row => !auditIdsBefore.has(row.id));

  check(
    "Approval resolution creates an audit event",
    newEvents.some(row =>
      row.actor === owner.id ||
      /approv/i.test(
        `${row.action ?? ""} ${row.target_id ?? ""} ${JSON.stringify(row.meta ?? {})}`,
      ),
    ),
    { new_audit_event_count: newEvents.length },
  );

  const rejectApproval = await createEscalatedApproval(apiKey, "reject");

  const rejected = await patchApproval(
    owner.aal2Token,
    rejectApproval.id,
    "rejected",
    "Rejected for isolated staging E2E testing.",
  );

  check(
    "Owner AAL2 can reject a pending request with a reason",
    rejected.status === 200 &&
      rejected.body?.approval?.status === "rejected" &&
      rejected.body?.may_execute === false,
    { actual_status: rejected.status },
  );

  const rejectPersisted = await admin
    .from("approvals")
    .select("status,note,resolved_by")
    .eq("id", rejectApproval.id)
    .maybeSingle();

  ensureNoError(rejectPersisted.error, "Verify persisted rejection");

  check(
    "Rejection and its reason persist",
    rejectPersisted.data?.status === "rejected" &&
      rejectPersisted.data?.resolved_by === owner.id &&
      rejectPersisted.data?.note === "Rejected for isolated staging E2E testing.",
  );

  const expireApproval = await createEscalatedApproval(apiKey, "expire");

  const expired = await admin
    .from("approvals")
    .update({ expires_at: new Date(Date.now() - 60000).toISOString() })
    .eq("id", expireApproval.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  ensureNoError(expired.error, "Expire temporary approval");
  if (!expired.data) throw new Error("Could not prepare expired approval fixture");

  const expiredResult = await patchApproval(
    owner.aal2Token, expireApproval.id, "approved",
  );

  check(
    "An expired approval cannot be resolved",
    expiredResult.status === 409,
    { actual_status: expiredResult.status },
  );

} catch (error) {
  result.status = "FAIL";
  result.error = error instanceof Error ? error.message : "Unexpected E2E failure";
  console.error("[FATAL]", result.error);

} finally {
  if (child) {
    try { child.kill(); } catch {}
  }
  if (logStream) {
    try { logStream.end(); } catch {}
  }

  if (workspaceId) {
    try {
      const removed = await admin.from("workspaces").delete().eq("id", workspaceId);
      const remaining = await admin
        .from("workspaces")
        .select("id")
        .eq("id", workspaceId)
        .maybeSingle();

      result.cleanup.workspace_absent =
        !removed.error && !remaining.error && !remaining.data;
    } catch {
      result.cleanup.workspace_absent = false;
    }
  } else {
    result.cleanup.workspace_absent = true;
  }

  for (const [label, id] of [["owner", ownerId], ["viewer", viewerId]]) {
    if (!id) {
      result.cleanup[`${label}_user_absent`] = true;
      continue;
    }

    try {
      const removed = await admin.auth.admin.deleteUser(id);
      const remaining = await admin.auth.admin.getUserById(id);

      result.cleanup[`${label}_user_absent`] =
        !removed.error && Boolean(remaining.error);
    } catch {
      result.cleanup[`${label}_user_absent`] = false;
    }
  }

  result.cleanup.verified =
    result.cleanup.workspace_absent === true &&
    result.cleanup.owner_user_absent === true &&
    result.cleanup.viewer_user_absent === true;

  if (!result.cleanup.verified) result.status = "FAIL";

  const passed = result.checks.filter(item => item.pass).length;
  const failed = result.checks.filter(item => !item.pass).length;
  result.summary = { passed, failed, cleanup_verified: result.cleanup.verified };

  if (!result.error && failed === 0 && passed > 0 && result.cleanup.verified) result.status = "PASS";

  const outDir = path.join(root, ".enterprise");
  const outputPath = path.join(outDir, "phase-approvals-api-e2e.json");

  const { mkdirSync, writeFileSync } = await import("node:fs");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");

  console.log("\n========== APPROVALS E2E RESULT ==========");
  console.log(JSON.stringify(result, null, 2));
  console.log(`Evidence file: ${outputPath}`);

  if (result.status !== "PASS" || !result.cleanup.verified) process.exitCode = 1;
}