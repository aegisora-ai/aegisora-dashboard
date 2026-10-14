import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir(".enterprise", { recursive: true });

const quickstart = await readFile("docs/enterprise/pilot-quickstart.md", "utf8");
const runbook = await readFile("docs/enterprise/enterprise-onboarding-runbook.md", "utf8");
const evaluateRoute = await readFile("src/app/api/v1/evaluate/route.ts", "utf8");
const onboarding = await readFile("src/components/aegisora/onboarding-flow.tsx", "utf8");
const policyRoute = await readFile("src/app/api/v1/workspace/policies/route.ts", "utf8");
const checks = [];
function check(name, fn) {
  try { fn(); checks.push({ name, pass: true }); }
  catch (error) { checks.push({ name, pass: false, error: error instanceof Error ? error.message : String(error) }); }
}

check("pilot quickstart matches the implemented evaluation API and truthful enforcement boundary", () => {
  assert.match(quickstart, /\/api\/v1\/evaluate/);
  assert.match(quickstart, /"agent":"finance-operator"/);
  assert.match(quickstart, /"action":"invoice\.read"/);
  assert.match(evaluateRoute, /str\(body\.agent, "agent"/);
  assert.match(evaluateRoute, /str\(body\.action, "action"/);
  assert.match(evaluateRoute, /let effect = decision\.effect/);
  assert.match(quickstart, /Aegisora records decisions and evidence\. It does not execute your external tool action/);
  assert.match(quickstart, /synthetic data/);
  assert.match(quickstart, /Stripe checkout or invoicing/);
});

check("enterprise onboarding runbook uses supported roles and deployment stop gates", () => {
  for (const role of ["OWNER", "ADMIN", "OPERATOR", "VIEWER"]) assert.ok(runbook.includes(`\`${role}\``));
  assert.match(runbook, /There is no `MEMBER` role/);
  assert.match(runbook, /Assign only supported roles: `OWNER`, `ADMIN`, `OPERATOR`, and `VIEWER`/);
  assert.match(runbook, /project ref/);
  assert.match(runbook, /hosted MFA and workspace-membership migrations/);
  assert.match(runbook, /Stop conditions/);
  assert.match(runbook, /do not bypass the control/);
});

check("self-service onboarding persists workspace, agent, and policy and removes simulated outcomes", () => {
  assert.match(onboarding, /rpc\("create_workspace"/);
  assert.match(onboarding, /\/api\/v1\/workspace\/agents/);
  assert.match(onboarding, /\/api\/v1\/workspace\/policies/);
  assert.match(onboarding, /getAuthenticatorAssuranceLevel/);
  assert.match(policyRoute, /requireWorkspacePermission\(user\.id, workspaceId, "governance:manage"\)/);
  assert.match(policyRoute, /requireAal2\(aal\)/);
  assert.match(policyRoute, /eq\("workspace_id", workspaceId\)/);
  assert.match(policyRoute, /supabase\.from\("policies"\)\.insert/);
  assert.match(onboarding, /does not simulate a decision or execution/);
  assert.doesNotMatch(onboarding, /sample identifiers|dec_01|trc_9a|exe_3d|evd_c7/i);
});

const report = { status: checks.every((item) => item.pass) ? "PASS" : "FAIL", generated_at_utc: new Date().toISOString(), checks };
await writeFile(".enterprise/phase-c44-c46-pilot-docs.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exitCode = 1;
