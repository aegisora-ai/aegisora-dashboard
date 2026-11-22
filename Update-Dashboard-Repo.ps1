<#
  Aegisora - Update-Dashboard-Repo.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Update-Dashboard-Repo.ps1

  1) Dashboard kenar cubugunu sadelestirir (acilip kapanan 4 grup yerine 3 sabit bolum, ayni 13 sayfa)
  2) Pilot basvuru API'sinin Supabase degisken adini projedeki adla (SUPABASE_SECRET_KEY) eslestirir
  3) Depo hijyeni: _audit, _logs, backups depodan cikarilir, .gitignore guncellenir
#>
[CmdletBinding()]
param([switch]$SkipTsc)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
if (-not [System.IO.File]::Exists((Join-Path $root 'package.json'))) { throw 'package.json yok. Scripti website4 klasorunde calistir.' }
$src = Join-Path $root 'src'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $root "docs\backups\dash-$stamp"
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Backup-File([string]$path) {
  if ([System.IO.File]::Exists($path)) {
    [void][System.IO.Directory]::CreateDirectory($backupDir)
    $name = ($path.Substring($root.Length).Trim('\') -replace '[\\\[\]\(\)]', '_')
    Copy-Item -LiteralPath $path -Destination (Join-Path $backupDir $name) -Force
  }
}
function Write-Text([string]$path, [string]$text) {
  [void][System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($path))
  Backup-File $path
  [System.IO.File]::WriteAllText($path, $text, $utf8)
}

$sidebarTsx = @'
"use client";

import type { ComponentType } from "react";
import {
  Activity, Bot, ClipboardList, FileSearch, KeyRound, LayoutDashboard,
  Route, Scale, ScrollText, Settings, TriangleAlert, UserCheck, Webhook,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: ComponentType<{ className?: string }> };
type Section = { id: string; title?: string; items: Item[] };

const sections: Section[] = [
  {
    id: "overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    id: "runtime",
    title: "Runtime",
    items: [
      { label: "Live Activity", href: "/dashboard/activity", icon: Activity },
      { label: "Decisions", href: "/dashboard/decisions", icon: Scale },
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck },
      { label: "Traces", href: "/dashboard/traces", icon: Route },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    items: [
      { label: "Agents", href: "/dashboard/agents", icon: Bot },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText },
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch },
      { label: "Audit", href: "/dashboard/audit", icon: ClipboardList },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Aegisora Control" className="space-y-5 p-3">
      {sections.map((section) => (
        <div key={section.id}>
          {section.title ? (
            <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-1.5 text-[13px] transition-colors",
                      focusRing,
                      active
                        ? "bg-surface-4 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
'@

Write-Host ''
Write-Host 'AEGISORA DASHBOARD VE DEPO' -ForegroundColor Cyan

# 1) kenar cubugu
$sidebarPath = Join-Path $src 'components\aegisora\app-sidebar.tsx'
if (-not [System.IO.File]::Exists($sidebarPath)) { throw "Bulunamadi: $sidebarPath" }
Write-Text $sidebarPath $sidebarTsx
Write-Host '  [OK] app-sidebar.tsx: Overview / Runtime / Governance / Settings (hepsi acik, ayni 13 sayfa)'

# 2) pilot API degisken adi
$routePath = Join-Path $src 'app\api\pilot-request\route.ts'
if ([System.IO.File]::Exists($routePath)) {
  $t = [System.IO.File]::ReadAllText($routePath)
  $old = 'const key = process.env.SUPABASE_SERVICE_ROLE_KEY;'
  $new = 'const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;'
  if ($t.Contains($old)) {
    Write-Text $routePath ($t.Replace($old, $new))
    Write-Host '  [OK] api/pilot-request: SUPABASE_SECRET_KEY destekleniyor'
  } else { Write-Host '  [ZATEN] api/pilot-request' }
}

# 3) depo hijyeni
Write-Host ''
Write-Host 'Depo hijyeni:'
foreach ($d in @('backups', '_audit', '_logs')) {
  $tracked = @(git ls-files -- $d)
  if ($tracked.Count -gt 0) {
    git rm -r --cached -q -- $d
    Write-Host "  [OK] $d depodan cikarildi ($($tracked.Count) dosya, diskte duruyor)"
  }
}
$giPath = Join-Path $root '.gitignore'
$gi = ''
if ([System.IO.File]::Exists($giPath)) { $gi = [System.IO.File]::ReadAllText($giPath) }
$need = @('/backups/', '/_audit/', '/_logs/', '/docs/backups/')
$add = @()
foreach ($n in $need) { if (-not ($gi -split "`r?`n" | Where-Object { $_.Trim() -eq $n })) { $add += $n } }
if ($add.Count -gt 0) {
  $block = "`r`n# local backups and audit output`r`n" + ($add -join "`r`n") + "`r`n"
  [System.IO.File]::WriteAllText($giPath, $gi.TrimEnd() + $block, $utf8)
  Write-Host "  [OK] .gitignore: $($add -join ', ')"
} else { Write-Host '  .gitignore zaten guncel' }

if (-not $SkipTsc) {
  Write-Host ''
  Write-Host 'npx tsc --noEmit calisiyor...'
  & npx tsc --noEmit
  if ($LASTEXITCODE -eq 0) { Write-Host 'tsc temiz.' -ForegroundColor Green }
  else { Write-Host 'tsc hata verdi. Ciktiyi bana yapistir.' -ForegroundColor Red }
}

Write-Host ''
Write-Host '--------------------------------------------------'
Write-Host 'Siradaki: Reduce-Pages.ps1 (gercek calistirma), sonra commit ve push.'
Write-Host '--------------------------------------------------'
