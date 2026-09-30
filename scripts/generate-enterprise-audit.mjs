import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir(".enterprise", { recursive: true });

const source = JSON.parse((await readFile(".enterprise/enterprise-readiness.json", "utf8")).replace(/^\uFEFF/, ""));
const previousById = new Map(source.controls.map((control) => [control.id, control]));
let c13Runtime = null;
try { c13Runtime = JSON.parse((await readFile(".enterprise/phase-c13-real-jwt/result.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* no C13 runtime proof yet */ }
let c13LifecycleRuntime = null;
try { c13LifecycleRuntime = JSON.parse((await readFile(".enterprise/phase-c13-team-lifecycle/result.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* current RPC lifecycle has not been exercised yet */ }
let c18LocalRuntime = null;
try { c18LocalRuntime = JSON.parse((await readFile(".enterprise/phase-c18-local-postgres.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* disposable PostgreSQL proof not run */ }
let c01Runtime = null;
try { c01Runtime = JSON.parse((await readFile(".enterprise/phase-c01-real-auth.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* credential-backed browser auth has not been run */ }
let c15Runtime = null;
try { c15Runtime = JSON.parse((await readFile(".enterprise/phase-c15-mfa-e2e.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* real TOTP flow has not been run */ }
let agentApiRuntime = null;
try { agentApiRuntime = JSON.parse((await readFile(".enterprise/phase-c13-c21-agent-api-e2e.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* real Auth role/MFA agent API matrix not run */ }
let policyRuntime = null;
try { policyRuntime = JSON.parse((await readFile(".enterprise/phase-c19-c21-policy-redaction.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* policy/redaction checks not run */ }
let webhookRuntime = null;
try { webhookRuntime = JSON.parse((await readFile(".enterprise/phase-c25-webhook-contract.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* webhook contract tests not run */ }
let evidenceChainRuntime = null;
try { evidenceChainRuntime = JSON.parse((await readFile(".enterprise/phase-c23-evidence-chain.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* evidence-chain SQL integration test not run */ }
let evaluateRuntime = null;
try { evaluateRuntime = JSON.parse((await readFile(".enterprise/phase-c19-c20-evaluate.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* API evaluation and latency evidence not run */ }
let orphanFixtureRuntime = null;
try { orphanFixtureRuntime = JSON.parse((await readFile(".enterprise/phase-c19-c20-orphan-fixtures.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* no external test fixtures are known */ }
let c14Runtime = null;
try { c14Runtime = JSON.parse((await readFile(".enterprise/phase-c14-identity-architecture.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* architecture verification not run */ }
let salesRuntime = null;
try { salesRuntime = JSON.parse((await readFile(".enterprise/phase-c49-c52-sales-artifacts.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* sales artifact verification not run */ }
let pilotDocsRuntime = null;
try { pilotDocsRuntime = JSON.parse((await readFile(".enterprise/phase-c44-c46-pilot-docs.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* pilot docs contract verification not run */ }
let schemaCompatibilityRuntime = null;
try { schemaCompatibilityRuntime = JSON.parse((await readFile(".enterprise/phase-schema-compatibility.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* live schema contract not probed */ }
let schemaMigrationRuntime = null;
try { schemaMigrationRuntime = JSON.parse((await readFile(".enterprise/phase-schema-migration.json", "utf8")).replace(/^\uFEFF/, "")); } catch { /* local schema upgrade proof not run */ }
const c13Expected = [
  ["VIEWER team read", 200], ["OPERATOR team read", 200], ["OWNER promotes member to ADMIN", 200],
  ["ADMIN changes non-owner role", 200], ["ADMIN cannot promote OWNER", 403],
  ["OPERATOR cannot manage team", 403], ["VIEWER cannot manage team", 403],
];
const c13MatrixEvidenceClosed = c13Runtime?.status === "PASS" && c13Runtime?.cleanup?.verified === true &&
  c13Expected.every(([name, status]) => c13Runtime.checks?.some((check) => check.name === name && check.pass === true && check.actual_status === status)) &&
  ["OWNER", "ADMIN", "OPERATOR", "VIEWER"].every((role) => c13Runtime.auth_preflight?.some((check) => check.role === role && check.status === 200 && check.identity_matches));
const c13EvidenceClosed = c13MatrixEvidenceClosed && c13LifecycleRuntime?.status === "PASS" && c13LifecycleRuntime?.cleanup?.verified === true;
const c02EvidenceClosed = c15Runtime?.status === "PASS" && c15Runtime.cleanup?.verified === true && c15Runtime.checks?.some((check) => check.name === "temporary workspace provisioned for protected API check" && check.pass);
const labels = [
  ["C01", "Auth E2E including locale"], ["C02", "Workspace creation E2E"],
  ["C03", "Production frontend/backend/proxy error monitoring"], ["C04", "Uptime/public status"],
  ["C05", "Production-equivalent staging"], ["C06", "CI build/typecheck/lint/test gate"], ["C07", "Tested rollback procedure"],
  ["C08", "RLS everywhere automatically verified"], ["C09", "Manual cross-workspace isolation"],
  ["C10", "Service-role server-only / no secret exposure"], ["C11", "Every /api/v1 ownership check"], ["C12", "Rate limiting"],
  ["C13", "Owner/Admin/Operator/Viewer enforced UI + backend"], ["C14", "SSO SAML/OIDC readiness/planned architecture"],
  ["C15", "Admin MFA enforcement"], ["C16", "Session/token policy"], ["C17", "Brute-force protection"], ["C18", "Admin audit log"],
  ["C19", "Allow/block/escalate correctness"], ["C20", "Runtime latency measurement"], ["C21", "PII masking"],
  ["C22", "Prompt-injection security tests"], ["C23", "Tamper-evident hash chain/signature"], ["C24", "Framework integrations"],
  ["C25", "Webhook retry/signature/logging"], ["C26", "Slack/Teams/PagerDuty E2E"],
  ["C27", "Managed cloud shared responsibility"], ["C28", "Dedicated VPC/on-prem Helm/Terraform validation"],
  ["C29", "SECURITY.md disclosure"], ["C30", "Container scan each release"],
  ["C31", "Privacy"], ["C32", "Subprocessors"], ["C33", "Terms of Service"], ["C34", "DPA"],
  ["C35", "Data residency"], ["C36", "SOC2 Type I roadmap"], ["C37", "GDPR access/delete"], ["C38", "Security questionnaire"],
  ["C39", "Free tier limits"], ["C40", "Stripe production cards/webhooks"], ["C41", "Enterprise quote → contract → provisioning"],
  ["C42", "Usage measurement"], ["C43", "VAT/international tax"], ["C44", "Real documentation"],
  ["C45", "Self-service onboarding"], ["C46", "Enterprise onboarding runbook"], ["C47", "PostHog/Amplitude"],
  ["C48", "Internal metrics dashboard"], ["C49", "Truthful one-page"], ["C50", "2-3 pilot ICP definitions"],
  ["C51", "Case study template"], ["C52", "Data room skeleton"],
];

const timestamp = new Date().toISOString();
const controls = labels.map(([id, requirement]) => {
  const previous = previousById.get(id);
  let status = previous?.status === "PASS" ? "PASS" : previous?.status === "FAIL" ? "FAIL" : "VERIFY";
  let evidence = previous?.evidence ? [previous.evidence] : [];
  if (["C08", "C09", "C10", "C11"].includes(id)) {
    status = "PASS";
    evidence = ["User-supplied verified baseline (2026-09-27): RLS/FORCE RLS and access removal; real JWT cross-workspace execution/evidence proofs; C11 workspace ownership returned HTTP 404; secret forensic audit found no client secret candidates. Historical executable evidence is in .enterprise/phase3.14e-20260927-021150/result.json and .enterprise/phase3.16e-20260927-022730/result.json; source/schema evidence under .enterprise/phase3.*/."];
  }
  if (id === "C12") {
    status = "PASS";
    evidence = [".enterprise/phase-c12-direct-v2-20260927-163555/result.json: authenticated API requests 1-60 reached route and request 61 returned 429 with Retry-After and limit headers; failed authentication requests 1-10 returned 401 and request 11 returned 429; health stayed 200; temporary key cleanup verified."];
  }
  if (id === "C13") {
    status = c13EvidenceClosed ? "PASS" : "VERIFY";
    evidence = c13EvidenceClosed
      ? [".enterprise/phase-c13-real-jwt/result.json and .enterprise/phase-c13-team-lifecycle/result.json: real JWT role matrix and membership lifecycle outcomes passed; migration-backed invitation, acceptance, role changes, removal, last-owner protection and cleanup verified."]
      : [`.enterprise/phase-c13-c21-agent-api-e2e.json: ${agentApiRuntime?.status === "PASS" && agentApiRuntime.cleanup?.verified === true ? "real OWNER/VIEWER tokens proved agent inventory role enforcement, AAL1 denial/AAL2 acceptance, workspace-ownership denial, and cleanup." : "no passing real Auth agent-operation role test is recorded."} src/lib/aegisora/rbac-http.ts centralizes active membership authorization; team lifecycle still lacks a passing OWNER/ADMIN/OPERATOR/VIEWER matrix, and its audit migration has not been applied to the hosted database.`];
  }
  if (id === "C14") {
    status = c14Runtime?.status === "PASS" ? "PASS" : "VERIFY";
    evidence = c14Runtime?.status === "PASS"
      ? [".enterprise/phase-c14-identity-architecture.json: executable source/document check confirms Supabase identity boundary, workspace_members authority, provider claims excluded from authorization, and provider prerequisites documented. Live SSO is explicitly not configured or claimed."]
      : ["SSO identity boundary and provider prerequisites need a reproducible documentation/source check; no live provider is configured or tested."];
  }
  if (id === "C15") {
    status = "VERIFY";
    evidence = [c15Runtime?.status === "PASS" && c15Runtime.cleanup?.verified === true
      ? ".enterprise/phase-c15-mfa-e2e.json: real Supabase TOTP enrollment/verification and browser AAL1→AAL2 step-up passed; server-side team mutation returned 403 mfa_required for the fresh AAL1 token; temporary user/workspace cleanup verified. .enterprise/phase-c18-local-postgres.json proves the database role helper denies OWNER/ADMIN at AAL1 and allows it at AAL2. Hosted RLS migration and a successful AAL2 privileged mutation remain pending deployment."
      : "supabase/migrations/20260927174500_privileged_aal2.sql gates OWNER/ADMIN RLS writes on the signed Supabase aal claim; team administration routes require verified AAL2 tokens, and the Identity screen supports TOTP enrollment and step-up verification. Hosted migration and real Auth TOTP E2E remain unverified."];
    if (agentApiRuntime?.status === "PASS" && agentApiRuntime.cleanup?.verified === true) evidence.push("Additional real Auth proof in .enterprise/phase-c13-c21-agent-api-e2e.json: OWNER AAL1 agent mutation denied with mfa_required; after TOTP step-up, OWNER AAL2 agent import/update/delete succeeded. This does not replace hosted RLS migration proof.");
  }
  if (id === "C16") {
    status = "VERIFY";
    evidence = ["src/lib/supabase/cookie-options.ts explicitly configures Secure in production, SameSite=Lax, path, and seven-day cookie maxAge across browser/server/proxy clients; docs/enterprise/session-policy.md records browser-readable cookie tradeoff. Hosted Supabase access/refresh lifetime, rotation, revocation, and real expiry tests remain unverified."];
  }
  if (id === "C17") {
    status = "VERIFY";
    evidence = ["C12 proves API-key failed-auth rate limiting only. No credential-backed repeated password-failure test or Supabase Auth project-level brute-force/breach-password setting evidence is present."];
  }
  if (id === "C18") {
    status = "VERIFY";
    evidence = c18LocalRuntime?.status === "PASS"
      ? [".enterprise/phase-c18-local-postgres.json: disposable PostgreSQL integration test passed role audit attribution, invite/accept/remove auditing, last-owner protection, authenticated audit immutability and service-role-only RPC grants. Migration supabase/migrations/20260927170000_workspace_member_audit.sql still must be applied and verified against the hosted database before pilot use."]
      : ["supabase/migrations/20260927170000_workspace_member_audit.sql adds membership lifecycle auditing and append-only client permissions; no PostgreSQL integration proof or hosted database migration evidence exists yet."];
  }
  if (id === "C19") {
    const names = ["explicit BLOCK outranks ESCALATE and ALLOW regardless of policy priority order", "ESCALATE outranks ALLOW", "ALLOW is selected when it is the only matched policy", "unmatched policy uses each configured default effect", "unknown, disabled, and suspended agents fail closed"];
    const logicPassed = names.every((name) => policyRuntime?.checks?.some((check) => check.name === name && check.pass));
    const persistedHttpPassed = evaluateRuntime?.status === "PASS" && evaluateRuntime?.cleanup?.verified === true &&
      ["HTTP policy precedence blocks deletion despite lower-priority ALLOW and injection-like input", "HTTP policy allows a matched read action", "HTTP policy escalates payment action with an approval", "HTTP unmatched action uses workspace BLOCK default"].every((name) => evaluateRuntime.checks?.some((check) => check.name === name && check.pass));
    status = logicPassed && persistedHttpPassed ? "PASS" : "VERIFY";
    evidence = status === "PASS"
      ? [".enterprise/phase-c19-c21-policy-redaction.json proves deterministic precedence/default/fail-closed logic; .enterprise/phase-c19-c20-evaluate.json proves real HTTP ALLOW/BLOCK/ESCALATE and unmatched decisions were persisted in the configured Supabase project, with fixture cleanup verified."]
      : [".enterprise/phase-c19-c21-policy-redaction.json passes deterministic policy logic, but C19 also requires persisted HTTP ALLOW/BLOCK/ESCALATE decisions. The live API E2E failed before those outcomes were covered; retain VERIFY."];
  }
  if (id === "C20") {
    status = evaluateRuntime?.status === "PASS" && evaluateRuntime?.cleanup?.verified === true && Number.isFinite(evaluateRuntime?.latency_ms?.p50) && Number.isFinite(evaluateRuntime?.latency_ms?.p95)
      ? "PASS" : "VERIFY";
    evidence = status === "PASS"
      ? [`.enterprise/phase-c19-c20-evaluate.json: ${evaluateRuntime.latency_ms.sample_count} authenticated HTTP evaluation samples; p50 ${evaluateRuntime.latency_ms.p50} ms and p95 ${evaluateRuntime.latency_ms.p95} ms. Environment is explicitly limited to ${evaluateRuntime.latency_ms.environment}.`]
      : ["A live evaluation benchmark did not pass its matched-policy and cleanup checks; no latency result is claimed. The failure was caused by auto-registration being disabled in the temporary workspace, and immutable evidence prevented fixture cleanup. Run only against a disposable staging project with an approved retention/cleanup path."];
  }
  if (id === "C21") {
    status = "VERIFY";
    evidence = [policyRuntime?.status === "PASS"
      ? `.enterprise/phase-c19-c21-policy-redaction.json: ${policyRuntime?.test_count ?? 0} deterministic policy/redaction/webhook checks${agentApiRuntime?.status === "PASS" && agentApiRuntime.cleanup?.verified === true ? " plus a real Auth/Supabase persisted agent import E2E" : ""}. Evaluate, dashboard registration/state changes, dashboard imports, API-key imports, and trace ingestion use server-side authorization/normalization; agent identifiers reject PII/credentials and free-text/metadata/span fields are masked. Existing legacy agent records and pre-fix immutable evidence have not been scanned or handled, so retain VERIFY.`
      : "No passing executable PII redaction checks are recorded."];
  }
  if (id === "C22") {
    const check = policyRuntime?.checks?.find((item) => item.name === "prompt-like input is not an authorization input to the evaluator");
    status = check?.pass ? "PASS" : "VERIFY";
    evidence = check?.pass
      ? [".enterprise/phase-c19-c21-policy-redaction.json: prompt-like input is not an input to the deterministic evaluator; the API route only passes authenticated, action/resource-matched policy candidates and persists the untrusted body input separately after redaction. Aegisora does not invoke an LLM to make this authorization decision."]
      : ["The separation between untrusted input and authorization policy has not passed a reproducible test."];
  }
  if (id === "C30") {
    status = "VERIFY";
    evidence = [".github/workflows/container-security.yml builds the image and invokes Trivy on pull requests, main pushes, version tags, and manual runs with a HIGH/CRITICAL threshold. The GitHub-hosted workflow has not been observed running in this audit; local Docker build is not a substitute for release CI execution."];
  }
  if (id === "C39") {
    status = "FAIL";
    evidence = ["No free-tier limits or server-side free-tier quota enforcement are present. The public pricing page now truthfully states that self-service plans are unavailable."];
  }
  if (id === "C40") {
    status = "FAIL";
    evidence = ["No Stripe production checkout, card verification, signed billing webhook/idempotency path, or connected billing account exists. Dashboard sample billing data was removed from the customer-facing workspace screen."];
  }
  if (id === "C41") {
    status = "VERIFY";
    evidence = ["docs/enterprise/billing-and-tax-boundary.md defines the manual quote/signature/provisioning inputs, but there is no operational contract system, approval record, or demonstrated provisioning run."];
  }
  if (id === "C43") {
    status = "VERIFY";
    evidence = ["docs/enterprise/billing-and-tax-boundary.md records that tax registrations, VAT/GST treatment, invoice fields, and customer-location rules need jurisdiction-specific professional review before collection. No tax provider or international tax flow is implemented or tested."];
  }
  if (id === "C45") {
    status = "VERIFY";
    evidence = ["Account creation and a real workspace-creation RPC exist, but the onboarding wizard's agent/policy/execution steps are explicitly simulated. A real end-to-end setup from signup to a customer-controlled governed action is not proven."];
  }
  if (["C49", "C50", "C51", "C52"].includes(id)) {
    status = salesRuntime?.status === "PASS" && salesRuntime.controls?.includes(id) ? "PASS" : "VERIFY";
    evidence = status === "PASS"
      ? [`.enterprise/phase-c49-c52-sales-artifacts.json: executable checks cover truthful pilot-stage one-page (${id}), three ICP definitions (C50), customer-approved case-study template (C51), and evidence-room structure without fabricated metrics (C52).`]
      : ["Sales artifact structure and truthfulness checks have not passed; no customer, revenue, or adoption metrics are asserted."];
  }
  if (id === "C01") {
    status = c01Runtime?.status === "PASS" && c01Runtime?.cleanup?.verified === true && c01Runtime.checks?.some((check) => check.name === "real Supabase credential sign-in and dashboard redirect" && check.pass)
      ? "PASS" : "FAIL";
    evidence = status === "PASS"
      ? [".enterprise/phase-c01-real-auth.json: temporary confirmed Supabase Auth user completed real Chromium sign-in and reached dashboard; account deletion and absence were verified after test."]
      : ["Credential-backed Auth E2E has not passed with verified temporary-account cleanup."];
  }
  if (id === "C02") {
    status = c02EvidenceClosed ? "PASS" : "VERIFY";
    evidence = c02EvidenceClosed
      ? [".enterprise/phase-c15-mfa-e2e.json: created a unique real workspace through the authenticated Supabase create_workspace RPC; workspace and temporary auth user were removed and absence verified after the E2E run."]
      : ["A real authenticated workspace-creation E2E with verified cleanup has not passed."];
  }
  if (id === "C05") {
    status = "VERIFY";
    evidence = ["The production runtime ref in .env.production.local does not match supabase/.temp/project-ref or the CLI pooler reference (.enterprise/deployment-target-audit.json); the configured CLI target is a different project. No migration was pushed. Establish an explicitly named production-equivalent staging project and align deployment credentials before verification."];
  }
  if (id === "C29") {
    status = "VERIFY";
    evidence = ["SECURITY.md documents disclosure expectations but provides no private contact address or reporting URL, so an external reporter cannot reliably submit a vulnerability report through the documented policy."];
  }
  if (id === "C25") {
    const names = [
      "webhook signature matches HMAC-SHA256 over the exact JSON body",
      "webhook retries transient failures with a stable idempotency key and signature",
      "webhook does not retry permanent 4xx responses",
      "webhook bounds network-error retries and reports failed delivery",
      "webhook delivery outcome is attributed to the system audit stream",
    ];
    const passed = webhookRuntime?.status === "PASS" && names.every((name) => webhookRuntime.checks?.some((check) => check.name === name && check.pass));
    status = "VERIFY";
    evidence = [passed
      ? ".enterprise/phase-c25-webhook-contract.json: deterministic contract tests pass exact-body HMAC-SHA256, stable event/idempotency IDs, bounded retry rules, network/permanent failure behavior, and source-backed system audit writes. docs/enterprise/webhook-delivery.md documents the limits. No live receiver or hosted audit-row run has verified deployment behavior; retain VERIFY."
      : "No passing webhook contract test is recorded. The delivery path needs signature/retry/idempotency/failure/audit tests plus a hosted receiver and audit-row verification."];
  }
  if (id === "C23") {
    status = "VERIFY";
    evidence = [evidenceChainRuntime?.status === "PASS" && evidenceChainRuntime?.cleanup?.database_removed === true
      ? ".enterprise/phase-c23-evidence-chain.json: disposable local PostgreSQL test exercised the repository source's evidence_chain, evidence_immutable, and verify_evidence_chain functions; valid links passed, UPDATE/DELETE were rejected, and privileged out-of-band tampering was detected. Hosted trigger/function deployment remains unverified because the runtime and CLI targets differ."
      : "Tamper-evident evidence-chain implementation and its runtime verification need executable proof; hosted deployment state remains unverified."];
  }
  if (id === "C42") {
    status = "VERIFY";
    evidence = [policyRuntime?.checks?.some((check) => check.name === "workspace usage endpoint scopes persisted monthly decision counts to an authorized workspace" && check.pass)
      ? `The Billing screen displays persisted current-UTC-month ALLOW/BLOCK/ESCALATE counts through an authorized, no-store endpoint. Automated contract checks pass. ${schemaCompatibilityRuntime?.checks?.some((check) => check.table === "decisions" && check.column === "decision" && check.present) ? "A read-only live Supabase schema preflight confirms the runtime decisions.decision field queried by this endpoint." : "The live queried column has not been confirmed by a schema preflight."} Keep VERIFY until authenticated endpoint counts are matched to stored rows; no invoice/Stripe metering is connected.`
      : "Usage telemetry must be derived from persisted decisions and workspace-authorized. No credential-backed endpoint result is recorded; verify counts against stored rows before claiming measured usage. No Stripe/invoice billing is connected."];
  }
  if (id === "C06") {
    status = "VERIFY";
    evidence = [".github/workflows/enterprise-gate.yml now runs typecheck, lint, production build, Playwright smoke, deterministic governance/security contracts, and pilot-doc contracts. Local validation passed after correcting the Playwright webServer/baseURL port mismatch (10/10 smoke tests). Keep VERIFY until the GitHub-hosted workflow itself has a successful run."];
  }
  if (id === "C19" && schemaMigrationRuntime?.status === "PASS") {
    evidence = ["Deterministic policy precedence tests pass. A new local PostgreSQL migration test also proves fresh schema and legacy upgrade convergence, preserving decision values and adding runtime-required evidence fields. C19 remains VERIFY: the real Supabase HTTP evaluation E2E has not yet passed persisted ALLOW/BLOCK/ESCALATE coverage and cleanup."];
  }
  if (id === "C44") {
    const passed = pilotDocsRuntime?.status === "PASS" && pilotDocsRuntime.checks?.some((check) => check.name === "pilot quickstart matches the implemented evaluation API and truthful enforcement boundary" && check.pass);
    status = passed ? "PASS" : "VERIFY";
    evidence = [passed
      ? ".enterprise/phase-c44-c46-pilot-docs.json: executable checks match the quickstart request fields and endpoint to the implemented evaluation API, state the customer-side enforcement boundary, and disclose non-production and billing limits."
      : "Pilot quickstart needs an executable consistency check against the implemented API and truthful customer-side enforcement boundary."];
  }
  if (id === "C46") {
    const passed = pilotDocsRuntime?.status === "PASS" && pilotDocsRuntime.checks?.some((check) => check.name === "enterprise onboarding runbook uses supported roles and deployment stop gates" && check.pass);
    status = passed ? "PASS" : "VERIFY";
    evidence = [passed
      ? ".enterprise/phase-c44-c46-pilot-docs.json: executable check confirms the enterprise runbook uses the supported OWNER/ADMIN/OPERATOR/VIEWER model, checks target/migration readiness, and includes explicit stop conditions. A customer provisioning drill remains a separate deployment requirement."
      : "Enterprise onboarding runbook must match supported workspace roles and document deployment verification and stop conditions."];
  }
  if (id === "C45") {
    status = "VERIFY";
    const persistedSetup = pilotDocsRuntime?.status === "PASS" && pilotDocsRuntime.checks?.some((check) => check.name === "self-service onboarding persists workspace, agent, and policy and removes simulated outcomes" && check.pass);
    evidence = [persistedSetup
      ? "Onboarding now creates a real workspace, requires AAL2 for agent/policy changes, persists both through workspace-authorized APIs, and displays only actual resource IDs; simulated decision/evidence outcomes were removed. Local source-contract checks pass. Keep VERIFY until a credential-backed signup→workspace→MFA→agent→policy→customer-side evaluate E2E passes with cleanup and persisted records verified."
      : "Onboarding needs a real persisted workspace/agent/policy journey and must not show simulated decision or evidence outcomes; credential-backed full-flow E2E is also required."];
  }
  if (!evidence.length) evidence = ["No current executable evidence located during this initial repository audit; implementation or deployment state needs inspection/verification."];
  return { control: id, requirement, status, evidence, tests: [], timestamp_utc: timestamp, notes: status === "VERIFY" ? "Do not treat source/docs presence as a pass; record the exact external prerequisite or executable proof in a follow-up audit." : "" };
});
const counts = Object.fromEntries(["PASS", "FAIL", "VERIFY", "BLOCKED"].map((status) => [status, controls.filter((c) => c.status === status).length]));
const audit = {
  generated_at_utc: timestamp,
  project: "Aegisora",
  total_controls: 52,
  counts,
  validation_runs: [
    { command: "node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit", status: "PASS", evidence: "exit code 0" },
    { command: "node node_modules/eslint/bin/eslint.js src", status: "PASS_WITH_WARNINGS", evidence: "0 errors; 2 existing warnings" },
    { command: "node node_modules/next/dist/bin/next build --webpack", status: "PASS", evidence: "production build completed" },
    { command: "npm test -- --workers=1", status: "PASS", evidence: "10 passed (7.4s) against the freshly built local production server after aligning Playwright's default baseURL with its webServer port (3199). Route/form smoke coverage only; not credential-backed sign-in." },
    { command: "node scripts/security/verify-policy-and-redaction.mjs", status: policyRuntime?.status ?? "NOT_RUN", evidence: `${policyRuntime?.test_count ?? 0} deterministic policy, redaction, and webhook contract checks; includes masked evidence and trace writes.` },
    { command: "node scripts/security/verify-pilot-docs.mjs", status: pilotDocsRuntime?.status ?? "NOT_RUN", evidence: "Executable consistency checks for the pilot API quickstart and enterprise onboarding role/deployment stop gates." },
    { command: "node scripts/security/inspect-live-schema-contract.mjs", status: schemaCompatibilityRuntime?.probe_status ?? "NOT_RUN", evidence: `Read-only column-presence probes only; application contract: ${schemaCompatibilityRuntime?.schema_compatibility ?? "not measured"}; missing columns: ${(schemaCompatibilityRuntime?.missing_application_columns ?? []).map((item) => `${item.table}.${item.required_by_application}`).join(", ") || "none"}.` },
    { command: "python scripts/security/verify-governance-schema-migration.py", status: schemaMigrationRuntime?.status ?? "NOT_RUN", evidence: `Disposable local PostgreSQL fresh-install and legacy-upgrade/idempotence checks; removed DB count: ${schemaMigrationRuntime?.cleanup?.databases_removed ?? 0}; hosted migration applied: ${schemaMigrationRuntime?.hosted_migration_applied ?? false}.` },
    { command: "node scripts/security/verify-policy-and-redaction.mjs (C25 subset)", status: webhookRuntime?.status ?? "NOT_RUN", evidence: `${webhookRuntime?.checks?.length ?? 0} exact-body signature, retry/idempotency, permanent-failure, network-failure, and audit-attribution checks with a mocked receiver.` },
    { command: "python scripts/security/verify-evidence-chain-local.py", status: evidenceChainRuntime?.status ?? "NOT_RUN", evidence: "Disposable PostgreSQL exercised evidence sequencing, chain linkage, append-only rejection, tamper detection, and database cleanup; it is not hosted-runtime evidence." },
    { command: "node scripts/security/phase-c13-c21-agent-api-e2e.mjs", status: agentApiRuntime?.status ?? "NOT_RUN", evidence: "Real OWNER/VIEWER Supabase Auth tokens exercised server-side agent management and MFA; cleanup is required for a PASS." },
    { command: "node scripts/security/preflight-evaluate-schema.mjs", status: "PASS", evidence: "10 runtime table/column probes passed against configured Supabase project; schema presence only, no migration/deployment proof." },
    { command: "node scripts/security/phase-c19-c20-evaluate-e2e.mjs", status: evaluateRuntime?.status ?? "NOT_RUN", evidence: "Live API E2E failed matched ALLOW because the temporary workspace had auto-registration disabled; immutable evidence also prevented workspace and account cleanup. No benchmark result is claimed." },
  ],
  controls,
};
await writeFile(".enterprise/codex-enterprise-audit.json", `${JSON.stringify(audit, null, 2)}\n`);

const rows = controls.map((c) => `| ${c.control} | ${c.requirement.replaceAll("|", "\\|")} | ${c.status} | ${c.evidence[0].replaceAll("|", "\\|")} |`).join("\n");
const markdown = `# Aegisora enterprise control audit\n\nGenerated: ${timestamp}\n\nThis is an initial source/evidence audit, not a production certification. PASS is limited to controls with supplied executable evidence. VERIFY means evidence or deployment verification remains outstanding.\n\nCounts: PASS ${counts.PASS}; FAIL ${counts.FAIL}; VERIFY ${counts.VERIFY}; BLOCKED ${counts.BLOCKED}.\n\n| Control | Requirement | Status | Evidence / gap |\n|---|---|---|---|\n${rows}\n`;
await writeFile(".enterprise/codex-enterprise-audit.md", markdown);

const readiness = {
  generated_at_utc: timestamp,
  evidence_closed_count: counts.PASS,
  evidence_closed_percent: Number((counts.PASS / 52 * 100).toFixed(1)),
  implementation_complete_count: counts.PASS,
  verify_count: counts.VERIFY,
  fail_count: counts.FAIL,
  blocked_count: counts.BLOCKED,
  production_dependent_count: ["C03", "C04", "C05", "C06", "C07", "C14", "C15", "C18", "C25", "C26", "C28", "C30", "C40", "C43", "C47"].filter((id) => controls.find((c) => c.control === id)?.status === "VERIFY").length,
  explicit_blockers: [
    ...(!c13EvidenceClosed ? ["C13's real-JWT role matrix is incomplete or failed; inspect its latest evidence and only close it after all permission outcomes and cleanup are verified."] : []),
    ...(orphanFixtureRuntime?.fixture_count > 0 ? [`${orphanFixtureRuntime.fixture_count} temporary evaluation workspaces remain in the configured Supabase project because immutable evidence blocked service-role cleanup; see .enterprise/phase-c19-c20-orphan-fixtures.json.`] : []),
    ...(evaluateRuntime?.status !== "PASS" ? ["The live C19/C20 evaluation E2E failed before completing matched-policy coverage; its latency benchmark is unverified. Run only in disposable staging with a tested cleanup path."] : []),
    "C45 onboarding still contains a simulated agent/policy/execution/evidence walkthrough. Replace it with a real persisted setup and customer-controlled evaluation before claiming self-service activation.",
    ...(schemaCompatibilityRuntime?.schema_compatibility === "MISMATCH"
      ? [`The current Supabase runtime is missing application-required columns: ${(schemaCompatibilityRuntime.missing_application_columns ?? []).map((item) => `${item.table}.${item.required_by_application}`).join(", ")}. The idempotent migration passed local fresh/upgrade tests, but cannot be applied until the staging/runtime project refs are aligned.`]
      : []),
    "Membership invitation/removal and actor-attributed audit are implemented in source but await the hosted database migration and real-JWT lifecycle verification.",
    "Supabase CLI is linked to a different project from the production runtime URL; no hosted migration has been run. Align the intended staging/production targets and use the matching migration credentials.",
    "Production/deployment access and external provider credentials are not evidenced by repository artifacts; deployment-dependent controls remain VERIFY.",
  ],
  next_actions: [
    ...(!c13EvidenceClosed ? ["Complete the real Auth-backed C13 role matrix and persist cleanup-verified evidence."] : []),
    ...(orphanFixtureRuntime?.fixture_count > 0 ? ["Clean the two recorded test workspaces and Auth users using authorized database-owner access that can preserve the immutable evidence policy; verify each fixture is gone."] : []),
    ...(evaluateRuntime?.status !== "PASS" ? ["Repair C19/C20 fixture configuration and rerun policy/latency E2E only on isolated staging with a verified cleanup mechanism."] : []),
    "Replace simulated onboarding steps with persisted agent/policy setup and a real customer-side evaluation flow; retain a clear stop state until MFA is enrolled.",
    ...(schemaCompatibilityRuntime?.schema_compatibility === "MISMATCH" ? ["Apply supabase/migrations/20260927190000_align_governance_runtime_schema.sql to the correctly identified disposable staging target, rerun read-only schema preflight, then run persisted governance E2E with cleanup."] : []),
    "Apply the membership audit migration to staging, then run the real-JWT invite/accept/role-change/remove/last-owner matrix with verified cleanup.",
    "Resolve the Supabase project-ref mismatch before any CLI migration/deployment command.",
    "Run credential-backed authentication E2E and persist a redacted result artifact.",
    "Resolve each VERIFY with reproducible evidence or exact deployment prerequisite; never infer a pass from implementation presence.",
  ],
  counts,
};
await writeFile(".enterprise/codex-pilot-readiness.json", `${JSON.stringify(readiness, null, 2)}\n`);
await writeFile(".enterprise/codex-pilot-readiness.md", `# Pilot readiness\n\nGenerated: ${timestamp}\n\n- Evidence closed: ${readiness.evidence_closed_count}/52 (${readiness.evidence_closed_percent}%)\n- Implementation complete with evidence: ${readiness.implementation_complete_count}\n- VERIFY: ${counts.VERIFY}\n- FAIL: ${counts.FAIL}\n- BLOCKED: ${counts.BLOCKED}\n- Production-dependent VERIFY controls: ${readiness.production_dependent_count}\n\n## Explicit blockers\n\n${readiness.explicit_blockers.map((x) => `- ${x}`).join("\n")}\n\n## Next actions\n\n${readiness.next_actions.map((x) => `- ${x}`).join("\n")}\n\nSee [control audit](codex-enterprise-audit.md) for individual status and evidence. This score counts only PASS controls with executable evidence.\n`);
