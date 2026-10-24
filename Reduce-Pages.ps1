<#
  Aegisora - Reduce-Pages.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Reduce-Pages.ps1            (uygular)
    powershell -ExecutionPolicy Bypass -File .\Reduce-Pages.ps1 -DryRun    (sadece ne yapacagini gosterir)

  Gereksiz public sayfalarin yerine kalici yonlendirme (308) koyar. Eski sayfa icerigi
  docs\backups\retired-<tarih> altina yedeklenir. Hicbir dosya silinmez, linkler kirilmaz.
#>
[CmdletBinding()]
param([switch]$DryRun, [switch]$SkipTsc)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
if (-not [System.IO.File]::Exists((Join-Path $root 'package.json'))) { throw 'package.json yok. Scripti website4 klasorunde calistir.' }
$src = Join-Path $root 'src'
$localeRoot = Join-Path $src 'app\[locale]'
$navPath = Join-Path $src 'lib\main-nav.ts'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $root "docs\backups\retired-$stamp"
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

# Hedef yapi: Home, Platform(/product), Solutions, Security, Documentation(/docs), Pricing, Enterprise, About + Pilot + hukuki sayfalar
$map = @(
  @{ From = 'product/runtime';      To = '/product' },
  @{ From = 'product/policies';     To = '/product' },
  @{ From = 'product/decisions';    To = '/product' },
  @{ From = 'product/approvals';    To = '/product' },
  @{ From = 'product/evidence';     To = '/product' },
  @{ From = 'evidence';             To = '/product' },
  @{ From = 'proof';                To = '/security' },
  @{ From = 'trust';                To = '/security' },
  @{ From = 'resources';            To = '/docs' },
  @{ From = 'developers';           To = '/docs' },
  @{ From = 'developers/quickstart'; To = '/docs' },
  @{ From = 'changelog';            To = '/docs/technical' },
  @{ From = 'contact';              To = '/pilot' }
)

$redirectTpl = @'
import { permanentRedirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect("/" + locale + "__TARGET__");
}
'@

$navTs = @'
export type NavItem = { label: string; href: string; desc?: string };
export type NavEntry = { label: string; href: string; items?: NavItem[] };
export type FooterGroup = { title: string; links: NavItem[] };

export const announcement = {
  badge: "Enterprise Pilot",
  text: "Run Aegisora on your own agents in a scoped, time-boxed pilot.",
  label: "Apply now",
  href: "/pilot",
};

export const headerCtas = {
  login: { label: "Log in", href: "/login" },
  primary: { label: "Request a Pilot", href: "/pilot" },
};

export const mainNav: NavEntry[] = [
  { label: "Platform", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Documentation",
    href: "/docs",
    items: [
      { label: "Documentation", href: "/docs", desc: "Guides and reference." },
      { label: "Technical reference", href: "/docs/technical", desc: "Pipeline, identities, Continuity Seal, release history." },
    ],
  },
  { label: "Security", href: "/security" },
  {
    label: "Enterprise",
    href: "/enterprise",
    items: [
      { label: "Enterprise", href: "/enterprise", desc: "Governance and audit at scale." },
      { label: "Pilot Program", href: "/pilot", desc: "A scoped evaluation on your agents." },
      { label: "Pricing", href: "/pricing", desc: "Plans from free to custom." },
    ],
  },
];

export const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "/product" },
      { label: "Solutions", href: "/solutions" },
      { label: "Documentation", href: "/docs" },
      { label: "Technical reference", href: "/docs/technical" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pilot Program", href: "/pilot" },
      { label: "Pricing", href: "/pricing" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "/security" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
      { label: "Data processing", href: "/legal/dpa" },
    ],
  },
  {
    title: "Company and Legal",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Terms", href: "/terms" },
      { label: "Impressum", href: "/impressum" },
    ],
  },
];
'@

# ---------------------------------------------------------------- mevcut rotalar
$existing = @{}
Get-ChildItem -LiteralPath $localeRoot -Recurse -File -Filter 'page.tsx' | ForEach-Object {
  $rel = $_.DirectoryName.Substring($localeRoot.Length).Trim('\')
  $segs = @($rel -split '\\' | Where-Object { $_ -and $_ -notmatch '^\(.*\)$' })
  $existing[($segs -join '/')] = $_.FullName
}
$publicBefore = @($existing.Keys | Where-Object { $_ -notmatch '^dashboard' -and $_ -ne '' }).Count

Write-Host ''
if ($DryRun) { Write-Host 'AEGISORA SAYFA AZALTMA (DRY RUN - hicbir sey degismez)' -ForegroundColor Yellow }
else { Write-Host 'AEGISORA SAYFA AZALTMA' -ForegroundColor Cyan }

$done = 0
foreach ($m in $map) {
  $from = $m.From
  if (-not $existing.ContainsKey($from)) { Write-Host "  [YOK]    /$from" -ForegroundColor DarkGray; continue }
  $file = $existing[$from]
  $text = [System.IO.File]::ReadAllText($file)
  if ($text.Contains('permanentRedirect')) { Write-Host "  [ZATEN]  /$from -> $($m.To)"; continue }
  if ($DryRun) { Write-Host "  [YAPILIR] /$from -> $($m.To)"; $done++; continue }
  Write-Text $file ($redirectTpl.Replace('__TARGET__', $m.To))
  Write-Host "  [OK]     /$from -> $($m.To)"
  $done++
}

if (-not $DryRun) {
  Write-Text $navPath $navTs
  Write-Host "  [OK]     menu ve footer sadelestirildi: src\lib\main-nav.ts"
}

# ---------------------------------------------------------------- eski rotalara hala link veren dosyalar
Write-Host ''
Write-Host 'Kaldirilan rotalara hala link veren dosyalar (yonlendirme calisir, ama temizlemek iyi olur):'
$pat = '[''"](/product/(runtime|policies|decisions|approvals|evidence)|/evidence|/proof|/trust|/resources|/developers|/developers/quickstart|/changelog|/contact)[''"]'
$hits = @(Get-ChildItem -LiteralPath $src -Recurse -File -Include '*.ts', '*.tsx', '*.mdx', '*.json' |
  Select-String -Pattern $pat | Select-Object -First 40)
if ($hits.Count -eq 0) { Write-Host '  yok' }
$hits | ForEach-Object { Write-Host ('  ' + $_.Path.Substring($root.Length + 1) + ':' + $_.LineNumber) }

if (-not $DryRun -and -not $SkipTsc) {
  Write-Host ''
  Write-Host 'npx tsc --noEmit calisiyor...'
  & npx tsc --noEmit
  if ($LASTEXITCODE -eq 0) { Write-Host 'tsc temiz.' -ForegroundColor Green }
  else { Write-Host 'tsc hata verdi. Ciktiyi bana yapistir.' -ForegroundColor Red }
}

Write-Host ''
Write-Host '--------------------------------------------------'
Write-Host "Public sayfa (dashboard haric) once : $publicBefore"
Write-Host "Yonlendirmeye alinan                : $done"
Write-Host 'Kalan yapi: Home, Platform, Solutions, Security, Documentation, Pricing, Enterprise, About, Pilot'
Write-Host '            + Blog, Support, Terms, Impressum, Privacy, Subprocessors, Data processing'
if (-not $DryRun) { Write-Host "Yedek: $backupDir" }
Write-Host 'Geri almak icin yedekteki dosyayi eski yerine kopyala.'
Write-Host '--------------------------------------------------'
