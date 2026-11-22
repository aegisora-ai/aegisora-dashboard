<#
  Aegisora - Finish-Pages.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Finish-Pages.ps1

  Reduce-Pages'in eski surumunu onarir ve isi bitirir. Tekrar calistirilabilir (idempotent):
  - /proof ve /trust yonlendirmesini geri alir (Security sayfasindaki butonlar bunlara gidiyor)
  - /product/* ve /evidence yonlendirmelerini /docs/technical'a cevirir
  - Product ve Security sayfalarindaki butonlari duzeltir
  - menu/footer ve sitemap'i yeni yapiya gore gunceller
  - pilot API'sinde bos ortam degiskenine karsi korumayi ekler
  Yedekler docs\backups\finish-<tarih> altina alinir.
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
$backupDir = Join-Path $root "docs\backups\finish-$stamp"
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

function Find-OriginalBackup([string]$path) {
  $name = ($path.Substring($root.Length).Trim('\') -replace '[\\\[\]\(\)]', '_')
  $base = Join-Path $root 'docs\backups'
  if (-not [System.IO.Directory]::Exists($base)) { return $null }
  $dirs = @(Get-ChildItem -LiteralPath $base -Directory | Where-Object { $_.Name -match '^(retired|finish)-' } | Sort-Object Name)
  foreach ($d in $dirs) {
    $c = Join-Path $d.FullName $name
    if ([System.IO.File]::Exists($c)) {
      if (-not [System.IO.File]::ReadAllText($c).Contains('permanentRedirect')) { return $c }
    }
  }
  return $null
}

# Hedef yapi: Home, Platform(/product), Solutions, Security, Documentation(/docs), Pricing, Enterprise, About + Pilot + hukuki sayfalar
$map = @(
  @{ From = 'product/runtime';       To = '/docs/technical' },
  @{ From = 'product/policies';      To = '/docs/technical' },
  @{ From = 'product/decisions';     To = '/docs/technical' },
  @{ From = 'product/approvals';     To = '/docs/technical' },
  @{ From = 'product/evidence';      To = '/docs/technical' },
  @{ From = 'evidence';              To = '/docs/technical' },
  @{ From = 'resources';             To = '/docs' },
  @{ From = 'developers';            To = '/docs' },
  @{ From = 'developers/quickstart'; To = '/docs' },
  @{ From = 'changelog';             To = '/docs/technical' },
  @{ From = 'contact';               To = '/pilot' }
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
      { label: "Live proof", href: "/proof" },
      { label: "Trust center", href: "/trust" },
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

$sitemapTs = @'
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://aegisora.org";

const PATHS = [
  "",
  "/about",
  "/blog",
  "/docs",
  "/docs/technical",
  "/enterprise",
  "/impressum",
  "/pilot",
  "/pricing",
  "/product",
  "/proof",
  "/security",
  "/solutions",
  "/terms",
  "/trust",
  "/trust/privacy",
  "/trust/subprocessors",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: BASE + p,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
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

# /proof ve /trust Security sayfasindan linkli: yonlendirmeyi geri al
foreach ($slug in @('proof', 'trust')) {
  if (-not $existing.ContainsKey($slug)) { continue }
  $rf = $existing[$slug]
  $rt = [System.IO.File]::ReadAllText($rf)
  if (-not $rt.Contains('permanentRedirect')) { Write-Host "  [TAMAM]  /$slug orijinal sayfa duruyor"; continue }
  $orig = Find-OriginalBackup $rf
  if (-not $orig) { Write-Host "  [UYARI]  /$slug icin orijinal yedek bulunamadi" -ForegroundColor Red; continue }
  if ($DryRun) { Write-Host "  [YAPILIR] /$slug geri alinacak"; continue }
  Backup-File $rf
  [System.IO.File]::Copy($orig, $rf, $true)
  Write-Host "  [GERI ALINDI] /$slug"
}

# Product ve Security sayfalarindaki butonlarin kendine donmemesi icin linkleri duzelt
$patches = @(
  @{ Slug = 'product'; Pairs = @(
      @('{ label: "Read the quickstart", href: "/developers/quickstart" }', '{ label: "Read the docs", href: "/docs" }'),
      @('href: "/product/runtime"', 'href: "/docs/technical"'),
      @('href: "/product/policies"', 'href: "/docs/technical"'),
      @('href: "/product/decisions"', 'href: "/docs/technical"'),
      @('href: "/product/approvals"', 'href: "/docs/technical"'),
      @('href: "/product/evidence"', 'href: "/docs/technical"')
  ) },
  @{ Slug = 'security'; Pairs = @(
      @('secondary={{ label: "Contact us", href: "/contact" }}', 'secondary={{ label: "Apply for Enterprise Pilot", href: "/pilot" }}')
  ) }
)
foreach ($pt in $patches) {
  if (-not $existing.ContainsKey($pt.Slug)) { continue }
  $pf = $existing[$pt.Slug]
  $old = [System.IO.File]::ReadAllText($pf)
  $upd = $old
  foreach ($pair in $pt.Pairs) { $upd = $upd.Replace($pair[0], $pair[1]) }
  if ($upd -ne $old) {
    if ($DryRun) { Write-Host "  [YAPILIR] link duzeltmesi: /$($pt.Slug)" }
    else { Write-Text $pf $upd; Write-Host "  [OK]     link duzeltildi: /$($pt.Slug)" }
  }
}

# Ana sayfa hero: Enterprise Pilot butonu + kaldirilan sayfalara giden linkler
$heroPath = Join-Path $src 'components\aegisora\hero-top.tsx'
if ([System.IO.File]::Exists($heroPath)) {
  $heroPairs = @(
    @('secondary: { label: "Quickstart", href: "/developers/quickstart" },', 'secondary: { label: "Apply for Enterprise Pilot", href: "/pilot" },'),
    @('primary: { label: "Talk to Enterprise", href: "/enterprise" },', 'primary: { label: "Apply for Enterprise Pilot", href: "/pilot" },'),
    @('<Link href="/developers/quickstart" className="mt-5 inline-flex', '<Link href="/signup" className="mt-5 inline-flex'),
    @('<Link href="/developers/quickstart" className={textLink}>', '<Link href="/docs" className={textLink}>'),
    @('Read the quickstart <ArrowRight', 'Read the docs <ArrowRight'),
    @('<Link href="/developers" className={textLink}>', '<Link href="/docs/technical" className={textLink}>')
  )
  $h0 = [System.IO.File]::ReadAllText($heroPath)
  $h1 = $h0
  foreach ($hp in $heroPairs) { $h1 = $h1.Replace($hp[0], $hp[1]) }
  if ($h1 -ne $h0) {
    if ($DryRun) { Write-Host '  [YAPILIR] ana sayfa hero: Apply for Enterprise Pilot butonu' }
    else { Write-Text $heroPath $h1; Write-Host '  [OK]     ana sayfa hero: Apply for Enterprise Pilot butonu eklendi' }
  } else { Write-Host '  [ZATEN]  ana sayfa hero' }
} else { Write-Host '  [YOK]    hero-top.tsx bulunamadi' -ForegroundColor Yellow }

$done = 0
foreach ($m in $map) {
  $from = $m.From
  if (-not $existing.ContainsKey($from)) { Write-Host "  [YOK]    /$from" -ForegroundColor DarkGray; continue }
  $file = $existing[$from]
  $text = [System.IO.File]::ReadAllText($file)
  if ($text.Contains('permanentRedirect')) {
    $cur = [regex]::Match($text, 'permanentRedirect\("/" \+ locale \+ "([^"]*)"\)')
    if ($cur.Success -and $cur.Groups[1].Value -eq $m.To) { Write-Host "  [ZATEN]  /$from -> $($m.To)"; continue }
    if ($DryRun) { Write-Host "  [YAPILIR] /$from hedefi -> $($m.To)"; $done++; continue }
    Write-Text $file ($redirectTpl.Replace('__TARGET__', $m.To))
    Write-Host "  [GUNCELLENDI] /$from -> $($m.To)"
    $done++
    continue
  }
  if ($DryRun) { Write-Host "  [YAPILIR] /$from -> $($m.To)"; $done++; continue }
  Write-Text $file ($redirectTpl.Replace('__TARGET__', $m.To))
  Write-Host "  [OK]     /$from -> $($m.To)"
  $done++
}

if (-not $DryRun) {
  Write-Text $navPath $navTs
  Write-Host "  [OK]     menu ve footer sadelestirildi: src\lib\main-nav.ts"

  $sitemapPath = Join-Path $src 'app\sitemap.ts'
  Write-Text $sitemapPath $sitemapTs
  Write-Host "  [OK]     sitemap.ts yeni sayfa yapisina gore yazildi"

  $routePath = Join-Path $src 'app\api\pilot-request\route.ts'
  if ([System.IO.File]::Exists($routePath)) {
    $rt2 = [System.IO.File]::ReadAllText($routePath)
    $u2 = $rt2.Replace('process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL', 'process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL')
    $u2 = $u2.Replace('process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY', 'process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY')
    if ($u2 -ne $rt2) { Write-Text $routePath $u2; Write-Host "  [OK]     api/pilot-request: bos ortam degiskeni artik yedek degiskene dusuyor" }
  }
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
Write-Host '            + Proof, Trust, Blog, Support, Terms, Impressum, Privacy, Subprocessors, Data processing'
if (-not $DryRun) { Write-Host "Yedek: $backupDir" }
Write-Host 'Geri almak icin yedekteki dosyayi eski yerine kopyala.'
Write-Host '--------------------------------------------------'
