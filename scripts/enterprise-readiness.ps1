$ErrorActionPreference = "Stop"

Set-Location -LiteralPath "C:\AI\AEGISORA\website4"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AEGISORA ENTERPRISE READINESS CONTROL PLANE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Get-Location

$dirs = @(
    ".enterprise",
    "docs\enterprise",
    "tests\e2e",
    "scripts",
    ".github\workflows"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "[1/4] Project check" -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
    Write-Host "package.json missing." -ForegroundColor Red
} else {
    Write-Host "package.json: OK" -ForegroundColor Green
}

Write-Host "[2/4] Enterprise directories" -ForegroundColor Cyan

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "  $dir : OK" -ForegroundColor Green
    } else {
        Write-Host "  $dir : FAILED" -ForegroundColor Red
    }
}

Write-Host "[3/4] Enterprise documents" -ForegroundColor Cyan

$docs = @(
    "docs\enterprise\privacy-policy.md",
    "docs\enterprise\subprocessors.md",
    "docs\enterprise\terms-of-service.md",
    "docs\enterprise\dpa-template.md",
    "docs\enterprise\data-residency.md",
    "docs\enterprise\soc2-roadmap.md",
    "docs\enterprise\dsar-process.md",
    "docs\enterprise\security-questionnaire.md",
    "docs\enterprise\shared-responsibility.md",
    "docs\enterprise\rollback-runbook.md",
    "docs\enterprise\enterprise-onboarding-runbook.md",
    "docs\enterprise\pilot-case-study-template.md",
    "docs\enterprise\pilot-icp.md",
    "docs\enterprise\one-page-pitch.md",
    "docs\enterprise\data-room-index.md"
)

foreach ($doc in $docs) {

    if (Test-Path $doc) {
        Write-Host "  $doc : FOUND" -ForegroundColor Green
    } else {
        Write-Host "  $doc : MISSING" -ForegroundColor Yellow
    }
}

Write-Host "[4/4] Readiness evidence" -ForegroundColor Cyan

if (Test-Path ".enterprise\enterprise-readiness.json") {
    Write-Host "  enterprise-readiness.json : FOUND" -ForegroundColor Green
} else {
    Write-Host "  enterprise-readiness.json : MISSING" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " ENTERPRISE BOOTSTRAP CHECK COMPLETE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
