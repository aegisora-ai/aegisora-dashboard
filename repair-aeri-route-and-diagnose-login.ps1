$ErrorActionPreference = 'Stop'
$Root = (Get-Location).Path.TrimEnd('\')
if (-not (Test-Path -LiteralPath (Join-Path $Root 'package.json'))) {
    $fallback = 'C:\AI\AEGISORA\website4'
    if (Test-Path -LiteralPath (Join-Path $fallback 'package.json')) { $Root = $fallback }
    else { Write-Host 'ERROR: Run from C:\AI\AEGISORA\website4.' -ForegroundColor Red; return }
}

$AppRoot = Join-Path $Root 'src\app'
$ComponentPath = Join-Path $Root 'components\aeri\aeri-local-demo.tsx'
if (-not (Test-Path -LiteralPath $ComponentPath)) {
    Write-Host 'ERROR: components\aeri\aeri-local-demo.tsx not found. Run the Aeri local-demo installer first.' -ForegroundColor Red
    return
}
$LocaleRoot = Join-Path $AppRoot '[locale]'
if (-not (Test-Path -LiteralPath $LocaleRoot -PathType Container)) {
    Write-Host 'ERROR: src\app\[locale] folder not found. No route changes were made.' -ForegroundColor Red
    return
}

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupRoot = Join-Path $Root ("backups\aeri-route-fix-" + $Stamp)
$RouteDir = Join-Path $LocaleRoot 'aeri'
[System.IO.Directory]::CreateDirectory($RouteDir) | Out-Null
$RouteFile = Join-Path $RouteDir 'page.tsx'
if (Test-Path -LiteralPath $RouteFile) {
    $BackupFile = Join-Path $BackupRoot 'src\app\[locale]\aeri\page.tsx'
    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $BackupFile)) | Out-Null
    Copy-Item -LiteralPath $RouteFile -Destination $BackupFile -Force
    Write-Host "Backup: $BackupFile" -ForegroundColor DarkYellow
}

$RouteContent = @'
import AeriLocalDemo from "@/components/aeri/aeri-local-demo";

export const metadata = {
  title: "Aeri | Aegisora",
  description: "Aeri, Aegisora's animated local assistant demo.",
};

export default function AeriPage() {
  return <AeriLocalDemo />;
}
'@
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($RouteFile, $RouteContent, $Utf8NoBom)
Write-Host 'Wrote localized Aeri route: src\app\[locale]\aeri\page.tsx' -ForegroundColor Green
Write-Host 'Expected localized URL: /de/aeri (also /en/aeri, subject to the existing locale proxy).' -ForegroundColor Cyan

# Diagnose the unrelated login metadata error without modifying authentication files.
$LoginFile = Join-Path $LocaleRoot '(auth)\login\page.tsx'
$ProbeFiles = New-Object System.Collections.Generic.List[string]
$ProbeFiles.Add($LoginFile)
foreach ($candidate in @(
    (Join-Path $AppRoot 'layout.tsx'),
    (Join-Path $AppRoot 'layout.jsx'),
    (Join-Path $LocaleRoot 'layout.tsx'),
    (Join-Path $LocaleRoot 'layout.jsx'),
    (Join-Path $LocaleRoot '(auth)\layout.tsx'),
    (Join-Path $LocaleRoot '(auth)\layout.jsx')
)) { $ProbeFiles.Add($candidate) }

Write-Host ''
Write-Host '=== LOGIN / LAYOUT DIAGNOSTIC (read-only) ===' -ForegroundColor Cyan
foreach ($file in $ProbeFiles) {
    if (Test-Path -LiteralPath $file -PathType Leaf) {
        Write-Host "`n--- $($file.Substring($Root.Length).TrimStart('\')) ---" -ForegroundColor Yellow
        $lines = Get-Content -LiteralPath $file -TotalCount 28
        for ($i = 0; $i -lt $lines.Count; $i++) { '{0,3}: {1}' -f ($i + 1), $lines[$i] | Write-Host }
        $directives = Select-String -LiteralPath $file -Pattern '^\s*["'']use client["'']\s*;?\s*$' -ErrorAction SilentlyContinue
        if ($directives) { Write-Host 'FOUND use client directive in this file.' -ForegroundColor Red }
    }
}

Write-Host ''
Write-Host 'Aeri route repair complete. Login files were not modified.' -ForegroundColor Green
Write-Host "Backup folder (only if localized Aeri page already existed): $BackupRoot" -ForegroundColor DarkCyan
Write-Host 'NEXT: run pnpm exec tsc --noEmit. Then refresh /de/aeri. Copy the login/layout diagnostic output if the metadata error persists.' -ForegroundColor Yellow
