$ErrorActionPreference = "Continue"

Set-Location -LiteralPath "C:\AI\AEGISORA\website4"

$root = Get-Location
$results = New-Object System.Collections.Generic.List[object]

function Add-Control {
    param(
        [string]$Id,
        [string]$Area,
        [string]$Requirement,
        [string]$Status,
        [string]$Evidence
    )

    $results.Add([PSCustomObject]@{
        id = $Id
        area = $Area
        requirement = $Requirement
        status = $Status
        evidence = $Evidence
        checked_at = (Get-Date).ToString("o")
    })
}

function Exists {
    param([string]$Path)
    return Test-Path -LiteralPath $Path
}

function ContainsAny {
    param([string[]]$Patterns)

    $files = Get-ChildItem `
        -Path "." `
        -Recurse `
        -File `
        -Include *.ts,*.tsx,*.js,*.jsx,*.mjs,*.cjs,*.sql,*.md,*.json,*.yaml,*.yml `
        -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch "\\node_modules\\" -and
            $_.FullName -notmatch "\\.next\\" -and
            $_.FullName -notmatch "\\.git\\" -and
            $_.FullName -notmatch "\\.enterprise-backup-"
        }

    foreach ($p in $Patterns) {
        $hit = $files | Select-String -SimpleMatch $p -Quiet -ErrorAction SilentlyContinue
        if ($hit) {
            return $true
        }
    }

    return $false
}

$Package = $null

if (Test-Path "package.json") {
    try {
        $Package = Get-Content "package.json" -Raw | ConvertFrom-Json
    } catch {
    }
}

$HasPlaywright = $false

if ($Package) {
    $dev = @()
    $dep = @()

    if ($Package.devDependencies) {
        $dev = @($Package.devDependencies.psobject.Properties.Name)
    }

    if ($Package.dependencies) {
        $dep = @($Package.dependencies.psobject.Properties.Name)
    }

    $HasPlaywright = ($dev -contains "@playwright/test") -or ($dep -contains "@playwright/test")
}

$HasSentry = ContainsAny @(
    "@sentry/nextjs",
    "Sentry.init",
    "withSentryConfig"
)

$HasRls = ContainsAny @(
    "ENABLE ROW LEVEL SECURITY",
    "enable row level security",
    "CREATE POLICY",
    "create policy"
)

$HasRateLimit = ContainsAny @(
    "rateLimit",
    "rateLimiter",
    "rate-limit",
    "Upstash",
    "Redis"
)

$HasRBAC = ContainsAny @(
    "Owner",
    "Admin",
    "Member",
    "owner",
    "admin",
    "member"
)

$HasSSO = ContainsAny @(
    "SAML",
    "OIDC",
    "sso"
)

$HasMFA = ContainsAny @(
    "MFA",
    "TOTP",
    "WebAuthn",
    "multi-factor"
)

$HasAudit = ContainsAny @(
    "audit",
    "audit_log",
    "auditLog"
)

$HasPolicy = ContainsAny @(
    "ALLOW",
    "BLOCK",
    "ESCALATE"
)

$HasHash = ContainsAny @(
    "previous_hash",
    "prev_hash",
    "hash_chain",
    "sha256",
    "tamper"
)

$HasWebhook = ContainsAny @(
    "webhook",
    "HMAC",
    "signature",
    "retry"
)

$HasStripe = ContainsAny @(
    "stripe",
    "Stripe"
)

$HasAnalytics = ContainsAny @(
    "posthog",
    "PostHog",
    "amplitude",
    "Amplitude"
)

$HasFrameworks = ContainsAny @(
    "LangChain",
    "CrewAI",
    "OpenAI",
    "Anthropic",
    "LiteLLM"
)

$HasDocker = @(Get-ChildItem `
    -Path "." `
    -Recurse `
    -File `
    -Filter Dockerfile `
    -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "\\node_modules\\"
    }).Count -gt 0

$ApiRoutes = @(Get-ChildItem `
    -Path "src\app\api" `
    -Recurse `
    -File `
    -Include route.ts,route.tsx `
    -ErrorAction SilentlyContinue).Count

# 01
Add-Control "C01" "Core Reliability" "Auth E2E incl. locale routes" `
    ($(if ($HasPlaywright -and (Exists "tests\e2e\smoke.spec.ts") -and (Exists "tests\e2e\auth.spec.ts")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Playwright/login E2E implementation present; real credentials still required"

Add-Control "C02" "Core Reliability" "Workspace creation E2E" `
    "NOT_VERIFIED" `
    "Dedicated workspace test still required"

Add-Control "C03" "Core Reliability" "Production error monitoring" `
    ($(if ($HasSentry) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Sentry implementation detection"

Add-Control "C04" "Core Reliability" "Uptime monitoring/status page" `
    "NOT_VERIFIED" `
    "Requires external uptime/status provider"

Add-Control "C05" "Core Reliability" "Production-equivalent staging" `
    "NOT_VERIFIED" `
    "Runbook/config created; external staging environment still required"

Add-Control "C06" "Core Reliability" "CI build/typecheck/lint/test gate" `
    ($(if (Exists ".github\workflows\enterprise-gate.yml") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Workflow exists; repository scripts must pass"

Add-Control "C07" "Core Reliability" "Rollback documented and tested" `
    "NOT_VERIFIED" `
    "Runbook exists; drill evidence required"

# 02
Add-Control "C08" "Multi Tenant" "RLS everywhere + automated verification" `
    ($(if ($HasRls) {"NOT_VERIFIED"} else {"FAIL"})) `
    "RLS/policy SQL detection"

Add-Control "C09" "Multi Tenant" "Cross-workspace isolation" `
    "NOT_VERIFIED" `
    "Live two-tenant adversarial test required"

Add-Control "C10" "Multi Tenant" "Service-role server only" `
    "NOT_VERIFIED" `
    "Requires complete server/client data-flow inspection"

Add-Control "C11" "Multi Tenant" "API ownership checks" `
    ($(if ($ApiRoutes -gt 0) {"NOT_VERIFIED"} else {"FAIL"})) `
    "$ApiRoutes API route files detected"

Add-Control "C12" "Multi Tenant" "Rate limiting" `
    ($(if ($HasRateLimit) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Rate-limit implementation detection"

# 03
Add-Control "C13" "Identity" "Owner/Admin/Member enforced" `
    ($(if ($HasRBAC) {"NOT_VERIFIED"} else {"FAIL"})) `
    "RBAC terminology detected"

Add-Control "C14" "Identity" "SSO SAML/OIDC" `
    ($(if ($HasSSO) {"NOT_VERIFIED"} else {"FAIL"})) `
    "SSO detection"

Add-Control "C15" "Identity" "Admin MFA" `
    ($(if ($HasMFA) {"NOT_VERIFIED"} else {"FAIL"})) `
    "MFA detection"

Add-Control "C16" "Identity" "Session/token policy" `
    "NOT_VERIFIED" `
    "Requires documented timeout/refresh policy and test"

Add-Control "C17" "Identity" "Brute-force/account lockout" `
    ($(if (ContainsAny @("lockout","failedAttempts","loginAttempts","accountLock","brute-force")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Lockout implementation detection"

Add-Control "C18" "Identity" "Admin audit logging" `
    ($(if ($HasAudit) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Audit implementation detection"

# 04
Add-Control "C19" "Governance" "ALLOW/BLOCK/ESCALATE correctness" `
    ($(if ($HasPolicy) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Decision terminology detected"

Add-Control "C20" "Governance" "Measured latency" `
    ($(if (ContainsAny @("benchmark","latency","p95","p99")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Benchmark terminology detection"

Add-Control "C21" "Governance" "PII masking tests" `
    ($(if (ContainsAny @("PII","redact","mask","credit card")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "PII implementation/test terminology detection"

Add-Control "C22" "Governance" "Prompt injection tests" `
    ($(if (ContainsAny @("prompt injection","prompt-injection","jailbreak")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Prompt injection detection"

Add-Control "C23" "Governance" "Tamper-evident audit chain" `
    ($(if ($HasHash) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Hash/tamper terminology detection"

Add-Control "C24" "Governance" "Framework/provider integration tests" `
    ($(if ($HasFrameworks) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Framework/provider terminology detected"

Add-Control "C25" "Governance" "Webhook retries/signatures/logs" `
    ($(if ($HasWebhook) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Webhook security terminology detected"

Add-Control "C26" "Governance" "Alert E2E" `
    ($(if (ContainsAny @("Slack","Teams","PagerDuty")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Alert-provider detection"

# 05
Add-Control "C27" "Distribution" "Managed-cloud responsibility model" `
    ($(if (Exists "docs\enterprise\shared-responsibility.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Runbook/document exists"

Add-Control "C28" "Distribution" "Helm/Terraform reproducible private deployment" `
    ($(if (ContainsAny @("Chart.yaml","terraform","main.tf")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Helm/Terraform detection"

Add-Control "C29" "Distribution" "SECURITY.md responsible disclosure" `
    ($(if (Exists "SECURITY.md") {"PASS"} else {"FAIL"})) `
    "SECURITY.md exists"

Add-Control "C30" "Distribution" "Container vulnerability scan" `
    ($(if ($HasDocker -and (Exists "Dockerfile") -and (Exists ".github\workflows\container-security.yml")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Dockerfile detection"

# 06
$Legal = @(
    "privacy-policy.md",
    "subprocessors.md",
    "terms-of-service.md",
    "dpa-template.md",
    "data-residency.md",
    "soc2-roadmap.md",
    "dsar-process.md",
    "security-questionnaire.md"
)

for ($i = 0; $i -lt $Legal.Count; $i++) {
    $id = "C$($i + 31)"
    $path = "docs\enterprise\$($Legal[$i])"

    Add-Control $id "Compliance" $Legal[$i] `
        ($(if (Exists $path) {"NOT_VERIFIED"} else {"FAIL"})) `
        "Document exists; legal/operational validation required"
}

# 07
Add-Control "C39" "Billing" "Free tier limits enforced" `
    ($(if (ContainsAny @("quota","limit","free tier","usage limit")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Limit terminology detection"

Add-Control "C40" "Billing" "Stripe live production test" `
    ($(if ($HasStripe) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Stripe integration detection"

Add-Control "C41" "Billing" "Enterprise quote→contract→provisioning" `
    "NOT_VERIFIED" `
    "Commercial workflow required"

Add-Control "C42" "Billing" "Usage metering defined" `
    ($(if (ContainsAny @("usage","metering","seat","agent_count","request_count")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Usage terminology detection"

Add-Control "C43" "Billing" "VAT/international billing" `
    "NOT_VERIFIED" `
    "Requires accounting/tax process"

# 08
Add-Control "C44" "Onboarding" "Getting started docs" `
    ($(if (ContainsAny @("getting started","quickstart","onboarding")) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Documentation detection"

Add-Control "C45" "Onboarding" "Self-service activation journey" `
    "NOT_VERIFIED" `
    "Requires real user journey test"

Add-Control "C46" "Onboarding" "Enterprise onboarding runbook" `
    ($(if (Exists "docs\enterprise\enterprise-onboarding-runbook.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Runbook exists"

# 09
Add-Control "C47" "Observability" "Product analytics" `
    ($(if ($HasAnalytics) {"NOT_VERIFIED"} else {"FAIL"})) `
    "Analytics detection"

Add-Control "C48" "Observability" "Internal usage dashboard" `
    "NOT_VERIFIED" `
    "Requires verified internal metrics surface"

# 10
Add-Control "C49" "Sales" "Truthful one-page pitch" `
    ($(if (Exists "docs\enterprise\one-page-pitch.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Pitch document exists; proof still required"

Add-Control "C50" "Sales" "Pilot ICP" `
    ($(if (Exists "docs\enterprise\pilot-icp.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "ICP document exists"

Add-Control "C51" "Sales" "Pilot case-study template" `
    ($(if (Exists "docs\enterprise\pilot-case-study-template.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Case study template exists"

Add-Control "C52" "Sales" "Data room skeleton" `
    ($(if (Exists "docs\enterprise\data-room-index.md") {"NOT_VERIFIED"} else {"FAIL"})) `
    "Data room index exists"

$summary = [PSCustomObject]@{
    generated_at = (Get-Date).ToString("o")
    project = "Aegisora website4"
    total = $results.Count
    pass = @($results | Where-Object status -eq "PASS").Count
    fail = @($results | Where-Object status -eq "FAIL").Count
    not_verified = @($results | Where-Object status -eq "NOT_VERIFIED").Count
    blocked = @($results | Where-Object status -eq "BLOCKED").Count
}

$report = [PSCustomObject]@{
    summary = $summary
    controls = $results
}

New-Item -ItemType Directory -Force -Path ".enterprise" | Out-Null

$report |
    ConvertTo-Json -Depth 8 |
    Set-Content `
        -LiteralPath ".enterprise\enterprise-readiness.json" `
        -Encoding UTF8

$md = @()
$md += "# Aegisora Enterprise Readiness"
$md += ""
$md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$md += ""
$md += "| ID | Area | Status | Requirement | Evidence |"
$md += "|---|---|---|---|---|"

foreach ($r in $results) {
    $req = $r.requirement -replace "\|","/"
    $ev = $r.evidence -replace "\|","/"
    $md += "| $($r.id) | $($r.area) | $($r.status) | $req | $ev |"
}

$md += ""
$md += "## Summary"
$md += ""
$md += "- PASS: $($summary.pass)"
$md += "- FAIL: $($summary.fail)"
$md += "- NOT_VERIFIED: $($summary.not_verified)"
$md += "- BLOCKED: $($summary.blocked)"

$md -join "`r`n" |
    Set-Content `
        -LiteralPath "docs\enterprise\enterprise-readiness.md" `
        -Encoding UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AEGISORA ENTERPRISE READINESS AUDIT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Controls : $($summary.total)"
Write-Host "PASS     : $($summary.pass)" -ForegroundColor Green
Write-Host "FAIL     : $($summary.fail)" -ForegroundColor Red
Write-Host "VERIFY   : $($summary.not_verified)" -ForegroundColor Yellow
Write-Host "BLOCKED  : $($summary.blocked)" -ForegroundColor Yellow

Write-Host ""
Write-Host "Top failures:" -ForegroundColor Red

$results |
    Where-Object status -eq "FAIL" |
    Select-Object id,area,requirement |
    Format-Table -AutoSize

Write-Host ""
Write-Host "Files:" -ForegroundColor Cyan
Write-Host "  .enterprise\enterprise-readiness.json"
Write-Host "  docs\enterprise\enterprise-readiness.md"
Write-Host "  docs\enterprise\"

