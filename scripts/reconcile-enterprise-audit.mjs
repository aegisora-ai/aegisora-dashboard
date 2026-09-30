import fs from "node:fs";

const root = process.cwd();

const auditPath = `${root}/.enterprise/codex-enterprise-audit.json`;

const evidencePaths = {
  c13: `${root}/.enterprise/phase-c13-real-jwt/result.json`,
  c15: `${root}/.enterprise/phase-c15-mfa-e2e.json`,
  c21: `${root}/.enterprise/phase-c19-c21-policy-redaction.json`,
  c01: `${root}/.enterprise/phase-c01-real-auth.json`,
  c14: `${root}/.enterprise/phase-c14-identity-architecture.json`,
  c18: `${root}/.enterprise/phase-c13-team-lifecycle/result.json`,
  c23: `${root}/.enterprise/phase-c23-evidence-chain.json`,
  c25: `${root}/.enterprise/phase-c25-webhook-contract.json`,
  c44c46: `${root}/.enterprise/phase-c44-c46-pilot-docs.json`,
  c49c52: `${root}/.enterprise/phase-c49-c52-sales-artifacts.json`,
};

function readJson(path) {
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

function allChecksPass(checks) {
  const items = Array.isArray(checks) ? checks : [];
  return items.length > 0 && items.every((x) => x?.pass === true);
}

function countChecks(checks) {
  const items = Array.isArray(checks) ? checks : [];
  return {
    total: items.length,
    pass: items.filter((x) => x?.pass === true).length,
    fail: items.filter((x) => x?.pass === false).length,
  };
}

const audit = readJson(auditPath);

if (!audit || !Array.isArray(audit.controls)) {
  throw new Error("Enterprise audit JSON is missing or has no controls array.");
}

const c13 = readJson(evidencePaths.c13);
const c15 = readJson(evidencePaths.c15);
const c21 = readJson(evidencePaths.c21);
const c01 = readJson(evidencePaths.c01);
const c14 = readJson(evidencePaths.c14);
const c18 = readJson(evidencePaths.c18);
const c23 = readJson(evidencePaths.c23);
const c25 = readJson(evidencePaths.c25);
const c44c46 = readJson(evidencePaths.c44c46);
const c49c52 = readJson(evidencePaths.c49c52);

const decisions = [];

function reconcileC13() {
  const checkStats = countChecks(c13?.checks);

  const valid =
    c13?.status === "PASS" &&
    c13?.control === "C13" &&
    allChecksPass(c13?.checks) &&
    checkStats.total === 7 &&
    c13?.cleanup?.verified === true &&
    c13?.cleanup?.temporary_users_deleted === true &&
    c13?.cleanup?.workspace_deleted === true;

  decisions.push({
    control: "C13",
    eligible: valid,
    evidence: ".enterprise/phase-c13-real-jwt/result.json",
    reason: valid
      ? "Real JWT role matrix is PASS with 7/7 checks and verified fixture cleanup."
      : "C13 evidence did not satisfy the strict reconciliation predicate.",
  });

  if (!valid) return;

  const control = audit.controls.find((x) => x.control === "C13");
  if (!control) return;

  control.status = "PASS";
  control.notes = "";
  control.evidence = [
    ...(Array.isArray(control.evidence) ? control.evidence : []),
    {
      path: ".enterprise/phase-c13-real-jwt/result.json",
      proof: "status=PASS; 7/7 checks; cleanup.verified=true; temporary_users_deleted=true; workspace_deleted=true"
    }
  ];
}

function reconcileC15() {
  const checkStats = countChecks(c15?.checks);

  const valid =
    c15?.status === "PASS" &&
    allChecksPass(c15?.checks) &&
    checkStats.total === 5 &&
    c15?.cleanup?.verified === true &&
    c15?.cleanup?.workspace_absent === true &&
    c15?.cleanup?.user_absent === true &&
    c15?.cleanup?.user_deleted === true;

  decisions.push({
    control: "C15",
    eligible: valid,
    evidence: ".enterprise/phase-c15-mfa-e2e.json",
    reason: valid
      ? "Real Supabase TOTP/AAL enforcement is PASS with verified cleanup."
      : "C15 evidence did not satisfy the strict reconciliation predicate.",
  });

  if (!valid) return;

  const control = audit.controls.find((x) => x.control === "C15");
  if (!control) return;

  control.status = "PASS";
  control.notes = "";
  control.evidence = [
    ...(Array.isArray(control.evidence) ? control.evidence : []),
    {
      path: ".enterprise/phase-c15-mfa-e2e.json",
      proof: "status=PASS; 5/5 checks; cleanup fully verified"
    }
  ];
}

function reconcileC21() {
  const checks = Array.isArray(c21?.checks) ? c21.checks : [];

  const hasRedactionCoverage = checks.some((x) =>
    /pii|redact|mask|sensitive|secret|token|email|phone|card/i.test(
      String(x?.name ?? "")
    )
  );

  const valid =
    c21?.status === "PASS" &&
    allChecksPass(checks) &&
    hasRedactionCoverage;

  decisions.push({
    control: "C21",
    eligible: valid,
    evidence: ".enterprise/phase-c19-c21-policy-redaction.json",
    reason: valid
      ? "Dedicated policy/redaction suite is PASS and contains explicit sensitive-data coverage."
      : "C21 evidence does not satisfy the strict redaction predicate.",
  });

  if (!valid) return;

  const control = audit.controls.find((x) => x.control === "C21");
  if (!control) return;

  control.status = "PASS";
  control.notes = "";
  control.evidence = [
    ...(Array.isArray(control.evidence) ? control.evidence : []),
    {
      path: ".enterprise/phase-c19-c21-policy-redaction.json",
      proof: "status=PASS; all checks passed; explicit redaction-sensitive coverage found"
    }
  ];
}

reconcileC13();
reconcileC15();
reconcileC21();

/* ============================================================
 * STRICT EVIDENCE PROMOTION — C01/C14/C18/C23/C25/C44-C46/C49-C52
 * These controls are promoted only when their persisted artifact
 * satisfies an explicit evidence predicate.
 * ============================================================ */

if (!Array.isArray(audit.reconciliation)) {
  audit.reconciliation = [];
}

function strictPromote(controlId, eligible, evidencePath, reason, proof) {
  const control = audit.controls.find((item) => item.control === controlId);

  if (!control || !eligible) {
    return false;
  }

  control.status = "PASS";
  control.evidence = {
    path: evidencePath,
    proof,
  };

  const existing = audit.reconciliation.find((item) => item.control === controlId);

  const row = {
    control: controlId,
    eligible: true,
    evidence: evidencePath,
    reason,
  };

  if (existing) {
    Object.assign(existing, row);
  } else {
    audit.reconciliation.push(row);
  }

  return true;
}

const c01Eligible =
  c01?.status === "PASS" &&
  Array.isArray(c01?.checks) &&
  c01.checks.length === 1 &&
  c01.checks.every((check) => check?.pass === true) &&
  c01?.cleanup?.verified === true &&
  c01?.cleanup?.deleted === true &&
  c01?.cleanup?.absent_after_delete === true;

strictPromote(
  "C01",
  c01Eligible,
  ".enterprise/phase-c01-real-auth.json",
  "Real Supabase credential sign-in reached the dashboard and temporary credential cleanup was verified.",
  "status=PASS; 1/1 checks; cleanup.verified=true; deleted=true; absent_after_delete=true"
);

const c14Eligible =
  c14?.status === "PASS" &&
  c14?.control === "C14" &&
  allChecksPass(c14?.checks);

strictPromote(
  "C14",
  c14Eligible,
  ".enterprise/phase-c14-identity-architecture.json",
  "Identity architecture verification passed all documented identity-boundary checks.",
  "status=PASS; control=C14; all identity-architecture checks passed"
);

const c18Eligible =
  c18?.status === "PASS" &&
  Array.isArray(c18?.checks) &&
  c18.checks.length >= 22 &&
  allChecksPass(c18?.checks) &&
  c18?.cleanup?.verified === true &&
  c18?.cleanup?.workspace_absent === true &&
  c18?.cleanup?.users_absent === true;

strictPromote(
  "C18",
  c18Eligible,
  ".enterprise/phase-c13-team-lifecycle/result.json",
  "Real team lifecycle E2E passed across OWNER/ADMIN/OPERATOR/VIEWER with AAL2 enforcement and verified fixture cleanup.",
  "status=PASS; 22/22 checks; cleanup.verified=true; workspace_absent=true; users_absent=true"
);

const c23Eligible =
  c23?.status === "PASS" &&
  Array.isArray(c23?.checks) &&
  c23.checks.length === 6 &&
  allChecksPass(c23?.checks) &&
  c23?.cleanup?.database_removed === true &&
  c23?.hosted_runtime_verified === true;

strictPromote(
  "C23",
  c23Eligible,
  ".enterprise/phase-c23-evidence-chain.json",
  "Evidence-chain integration verification passed append-only, chaining and tamper-detection checks with hosted runtime verification.",
  "status=PASS; 6/6 checks; database_removed=true; hosted_runtime_verified=true"
);

const c25Eligible =
  c25?.status === "PASS" &&
  Array.isArray(c25?.checks) &&
  c25.checks.length === 5 &&
  allChecksPass(c25?.checks);

strictPromote(
  "C25",
  c25Eligible,
  ".enterprise/phase-c25-webhook-contract.json",
  "Webhook contract verification passed signature, retry, permanent-failure and audit-attribution checks.",
  "status=PASS; 5/5 checks; HMAC/retry/permanent-4xx/network/audit checks passed"
);

function hasNamedCheck(checks, name) {
  return Array.isArray(checks) && checks.some((check) => check?.pass === true && check?.name === name);
}

const c44Eligible =
  c44c46?.status === "PASS" &&
  Array.isArray(c44c46?.checks) &&
  c44c46.checks.length === 3 &&
  hasNamedCheck(
    c44c46.checks,
    "pilot quickstart matches the implemented evaluation API and truthful enforcement boundary"
  );

strictPromote(
  "C44",
  c44Eligible,
  ".enterprise/phase-c44-c46-pilot-docs.json",
  "Pilot quickstart documentation matches the implemented evaluation API and truthful enforcement boundary.",
  "status=PASS; dedicated C44 quickstart check passed"
);

const c45Eligible =
  c44c46?.status === "PASS" &&
  Array.isArray(c44c46?.checks) &&
  c44c46.checks.length === 3 &&
  hasNamedCheck(
    c44c46.checks,
    "enterprise onboarding runbook uses supported roles and deployment stop gates"
  );

strictPromote(
  "C45",
  c45Eligible,
  ".enterprise/phase-c44-c46-pilot-docs.json",
  "Enterprise onboarding runbook verification passed supported-role and deployment-stop-gate requirements.",
  "status=PASS; dedicated C45 onboarding-runbook check passed"
);

const c46Eligible =
  c44c46?.status === "PASS" &&
  Array.isArray(c44c46?.checks) &&
  c44c46.checks.length === 3 &&
  hasNamedCheck(
    c44c46.checks,
    "self-service onboarding persists workspace, agent, and policy and removes simulated outcomes"
  );

strictPromote(
  "C46",
  c46Eligible,
  ".enterprise/phase-c44-c46-pilot-docs.json",
  "Self-service onboarding verification confirms persisted workspace/agent/policy setup without simulated outcomes.",
  "status=PASS; dedicated C46 self-service-onboarding check passed"
);

const c49to52Eligible =
  c49c52?.status === "PASS" &&
  Array.isArray(c49c52?.controls) &&
  ["C49", "C50", "C51", "C52"].every((id) => c49c52.controls.includes(id)) &&
  Array.isArray(c49c52?.checks) &&
  c49c52.checks.length === 7 &&
  allChecksPass(c49c52?.checks);

for (const controlId of ["C49", "C50", "C51", "C52"]) {
  strictPromote(
    controlId,
    c49to52Eligible,
    ".enterprise/phase-c49-c52-sales-artifacts.json",
    `Sales/investor artifact verification explicitly includes ${controlId} and all seven shared checks passed.`,
    "status=PASS; controls=[C49,C50,C51,C52]; 7/7 checks passed"
  );
}

/* END STRICT EVIDENCE PROMOTION */
const counts = {
  PASS: 0,
  FAIL: 0,
  VERIFY: 0,
  BLOCKED: 0,
};

for (const control of audit.controls) {
  if (counts[control.status] !== undefined) {
    counts[control.status] += 1;
  }
}

audit.total_controls = audit.controls.length;
audit.counts = counts;
audit.reconciled_at_utc = new Date().toISOString();
audit.reconciliation = {
  mode: "strict-evidence",
  decisions,
};

fs.writeFileSync(
  auditPath,
  `${JSON.stringify(audit, null, 2)}\n`,
  "utf8"
);

const readinessPath = `${root}/.enterprise/codex-pilot-readiness.json`;

if (fs.existsSync(readinessPath)) {
  const readiness = readJson(readinessPath);

  readiness.evidence_closed_count = counts.PASS;
  readiness.evidence_closed_percent = Number(
    ((counts.PASS / audit.total_controls) * 100).toFixed(1)
  );
  readiness.verify_count = counts.VERIFY;
  readiness.fail_count = counts.FAIL;
  readiness.blocked_count = counts.BLOCKED;
  readiness.reconciled_at_utc = audit.reconciled_at_utc;

  fs.writeFileSync(
    readinessPath,
    `${JSON.stringify(readiness, null, 2)}\n`,
    "utf8"
  );
}

console.log(JSON.stringify({
  counts,
  reconciliation: decisions
}, null, 2));
