import { readFile, writeFile } from "node:fs/promises";

const architecturePath = "docs/enterprise/identity-architecture.md";
const rbacPath = "src/lib/aegisora/rbac-http.ts";
const [architecture, rbac] = await Promise.all([
  readFile(architecturePath, "utf8"),
  readFile(rbacPath, "utf8"),
]);
const checks = [
  { id: "provider_state_is_truthful", pass: architecture.includes("SSO is not configured or verified") },
  { id: "supabase_auth_is_identity_boundary", pass: architecture.includes("Supabase Auth authenticates the human") },
  { id: "membership_is_role_source", pass: architecture.includes("`workspace_members` is the source") && rbac.includes("getWorkspaceMembership") },
  { id: "external_claims_are_not_authoritative", pass: architecture.includes("are not authorization inputs") },
  { id: "provider_setup_prerequisites_documented", pass: architecture.includes("Provider configuration required before an SSO pilot") && architecture.includes("callback and logout URLs") },
  { id: "identity_provider_change_preserves_authorization", pass: architecture.includes("without changing the workspace authorization model") },
];
const result = {
  control: "C14",
  timestamp_utc: new Date().toISOString(),
  status: checks.every((check) => check.pass) ? "PASS" : "FAIL",
  checks,
  production_sso_configured: false,
  notes: "This evidence closes the documented authorization boundary/readiness requirement only. No live customer SAML/OIDC provider or production login was tested.",
};
await writeFile(".enterprise/phase-c14-identity-architecture.json", `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (result.status !== "PASS") process.exitCode = 1;
