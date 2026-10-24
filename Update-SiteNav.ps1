<#
  Aegisora - Update-SiteNav.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Update-SiteNav.ps1
  Header, footer ve menu yapisini sadelestirir. Eski dosyalarin yedegini docs\backups altina alir.
#>
[CmdletBinding()]
param([switch]$SkipTsc)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
if (-not [System.IO.File]::Exists((Join-Path $root 'package.json'))) { throw 'package.json yok. Scripti website4 klasorunde calistir.' }

$src = Join-Path $root 'src'
$headerPath = Join-Path $src 'components\aegisora\site-header.tsx'
$footerPath = Join-Path $src 'components\aegisora\site-footer.tsx'
$navPath = Join-Path $src 'lib\main-nav.ts'
foreach ($f in @($headerPath, $footerPath)) {
  if (-not [System.IO.File]::Exists($f)) { throw "Bulunamadi: $f" }
}
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $root "docs\backups\nav-$stamp"
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
  {
    label: "Platform",
    href: "/product",
    items: [
      { label: "Overview", href: "/product", desc: "The full execution-control model." },
      { label: "Runtime", href: "/product/runtime", desc: "Request to evidence, stage by stage." },
      { label: "Policies", href: "/product/policies", desc: "Executable governance controls." },
      { label: "Decisions", href: "/product/decisions", desc: "The decision inspector." },
      { label: "Approvals", href: "/product/approvals", desc: "Human authorization at the boundary." },
      { label: "Evidence", href: "/product/evidence", desc: "Connected, auditable records." },
    ],
  },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Documentation",
    href: "/docs",
    items: [
      { label: "Documentation", href: "/docs", desc: "Guides and reference." },
      { label: "Technical reference", href: "/docs/technical", desc: "Pipeline, identities, Continuity Seal." },
      { label: "Developers", href: "/developers", desc: "Integrate agents with Aegisora." },
      { label: "Quickstart", href: "/developers/quickstart", desc: "First governed action." },
      { label: "Changelog", href: "/changelog", desc: "What each release includes." },
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
      { label: "Runtime", href: "/product/runtime" },
      { label: "Policies", href: "/product/policies" },
      { label: "Decisions", href: "/product/decisions" },
      { label: "Approvals", href: "/product/approvals" },
      { label: "Evidence", href: "/product/evidence" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pilot Program", href: "/pilot" },
      { label: "Solutions", href: "/solutions" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "/security" },
      { label: "Trust center", href: "/trust" },
      { label: "Proof", href: "/proof" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
      { label: "Data processing", href: "/legal/dpa" },
    ],
  },
  {
    title: "Company and Legal",
    links: [
      { label: "About", href: "/about" },
      { label: "Developers", href: "/developers" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Terms", href: "/terms" },
      { label: "Impressum", href: "/impressum" },
    ],
  },
];
'@

$headerTsx = @'
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { SOCIALS } from "@/lib/socials";
import { announcement, headerCtas, mainNav } from "@/lib/main-nav";

// Bos birakirsan GitHub dugmesi gorunmez. Repo adresini SOCIALS icine yazinca otomatik cikar.
const GITHUB_URL = SOCIALS.find((s) => s.label === "GitHub")?.href ?? "";

const navLink = "text-sm font-medium text-white/70 transition-colors hover:text-white";
const btnPrimary =
  "inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-[#0a2a7a] transition hover:bg-white/90";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route change intentionally closes the mobile menu.
  useEffect(() => {
    const t = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="dark border-b border-white/10 bg-[#031249] text-white">
        <div className="mx-auto flex min-h-10 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/80 sm:inline">
            {announcement.badge}
          </span>
          <span className="text-white/70">{announcement.text}</span>
          <Link
            href={announcement.href}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-sky-300 underline-offset-4 hover:underline"
          >
            {announcement.label} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <header className="dark sticky top-0 z-[100] w-full border-b border-white/10 bg-[#020b2e]/85 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {mainNav.map((entry) =>
                entry.items ? (
                  <div key={entry.label} className="group relative">
                    <Link
                      href={entry.href}
                      aria-haspopup="true"
                      aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                      className={
                        "flex items-center gap-1 rounded-md px-3 py-1.5 " +
                        navLink +
                        (isActive(pathname, entry.href) ? " text-white" : "")
                      }
                    >
                      {entry.label}
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
                      />
                    </Link>
                    <div className="invisible absolute left-0 top-full z-50 w-80 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="rounded-xl border border-white/10 bg-[#031249] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {entry.items.map((item) => (
                          <li key={item.href + item.label}>
                            <Link href={item.href} className="block rounded-lg p-2.5 transition hover:bg-white/5">
                              <span className="block text-[15px] font-medium text-white">{item.label}</span>
                              {item.desc ? (
                                <span className="mt-0.5 block text-sm leading-snug text-white/60">{item.desc}</span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={entry.label}
                    href={entry.href}
                    aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                    className={
                      "rounded-md px-3 py-1.5 " + navLink + (isActive(pathname, entry.href) ? " text-white" : "")
                    }
                  >
                    {entry.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 lg:flex">
              {GITHUB_URL ? (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-md border border-white/25 px-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  GitHub
                </a>
              ) : null}
              <Link href={headerCtas.login.href} className={navLink}>
                {headerCtas.login.label}
              </Link>
              <Link href={headerCtas.primary.href} className={btnPrimary}>
                {headerCtas.primary.label}
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/25 p-2 text-white transition-colors hover:bg-white/10 focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="dark fixed inset-0 z-[90] overflow-y-auto bg-[#020b2e] px-6 pb-10 pt-28 text-white lg:hidden">
          <nav className="flex flex-col">
            {mainNav.map((entry) => (
              <div key={entry.label} className="border-b border-white/10 py-3">
                <Link href={entry.href} className="block py-1 text-lg font-medium text-white">
                  {entry.label}
                </Link>
                {entry.items ? (
                  <ul className="mt-1 space-y-0.5">
                    {entry.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} className="block rounded-md px-2 py-1.5 text-base text-white/70 hover:bg-white/5">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <Link href={headerCtas.login.href} className="py-3 text-lg font-medium text-white">
              {headerCtas.login.label}
            </Link>
            <Link
              href={headerCtas.primary.href}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-white text-base font-medium text-[#0a2a7a]"
            >
              {headerCtas.primary.label}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
'@

$footerTsx = @'
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";
import { SocialIcon } from "@/components/aegisora/social-icon";
import { SOCIALS } from "@/lib/socials";
import { footerGroups } from "@/lib/main-nav";

export function SiteFooter() {
  return (
    <footer className="dark border-t border-white/10 bg-[#020b2e] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Runtime security and execution control for autonomous AI agents.
          </p>
          <Link
            href="/pilot"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90"
          >
            Apply for Enterprise Pilot
          </Link>
          <p className="mt-3 text-xs text-white/50">
            <Link href="/signup" className="underline-offset-4 hover:text-sky-300 hover:underline">
              Or create a test workspace
            </Link>
          </p>
        </div>
        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-sm font-medium text-white">{g.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-white/60 transition hover:text-sky-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:px-6">
          <span>Aegisora 4.0. Examples on this site use illustrative sample data.</span>
          <span className="flex gap-5">
            <Link href="/trust/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
          </span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-4 py-6 sm:px-6">
          {SOCIALS.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-sky-300 hover:bg-white/5 hover:text-sky-300"
              >
                <SocialIcon name={s.label} className="size-[18px]" />
              </a>
            ) : (
              <span
                key={s.label}
                aria-label={s.label + " (link not set)"}
                className="inline-flex size-10 cursor-not-allowed items-center justify-center rounded-full border border-white/10 text-white/30"
              >
                <SocialIcon name={s.label} className="size-[18px]" />
              </span>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
'@

Write-Host ''
Write-Host 'AEGISORA MENU / HEADER / FOOTER' -ForegroundColor Cyan
Write-Text $navPath $navTs
Write-Text $headerPath $headerTsx
Write-Text $footerPath $footerTsx
Write-Host "  [OK] src\lib\main-nav.ts  (menu + footer + duyuru metni tek yerde)"
Write-Host "  [OK] site-header.tsx      (yedek: $backupDir)"
Write-Host "  [OK] site-footer.tsx"

# /platform sayfasi /product ile cakisiyor: bizim ekledigimiz ise kaldir
$platformDir = Join-Path $src 'app\[locale]\(public)\platform'
$platformPage = Join-Path $platformDir 'page.tsx'
if ([System.IO.File]::Exists($platformPage)) {
  $txt = [System.IO.File]::ReadAllText($platformPage)
  if ($txt.Contains('PAGES.platform')) {
    Backup-File $platformPage
    Remove-Item -LiteralPath $platformDir -Recurse -Force
    Write-Host '  [OK] /platform kaldirildi (menude Platform = /product)'
  }
}

# Dashboard kenar cubugu ve ana sayfa dosyalari
Write-Host ''
Write-Host 'Dashboard kenar cubugu adaylari (sadelestirmek icin bana at):'
$cands = @(Get-ChildItem -LiteralPath $src -Recurse -File -Include '*.tsx', '*.ts' |
  Where-Object { $_.Name -match '(?i)(sidebar|side-nav|app-nav|dashboard-nav|dash-nav)' })
if ($cands.Count -eq 0) { Write-Host '  bulunamadi' -ForegroundColor Yellow }
$cands | Select-Object -First 10 | ForEach-Object { Write-Host ('  ' + $_.FullName.Substring($root.Length + 1)) }
$dashLayout = Join-Path $src 'app\[locale]\(app)\dashboard\layout.tsx'
if ([System.IO.File]::Exists($dashLayout)) { Write-Host '  src\app\[locale]\(app)\dashboard\layout.tsx' }
$homePage = Join-Path $src 'app\[locale]\(public)\page.tsx'
Write-Host ''
if ([System.IO.File]::Exists($homePage)) { Write-Host 'Ana sayfa: src\app\[locale]\(public)\page.tsx  (hero butonu icin bana at)' }

if (-not $SkipTsc) {
  Write-Host ''
  Write-Host 'npx tsc --noEmit calisiyor...'
  & npx tsc --noEmit
  if ($LASTEXITCODE -eq 0) { Write-Host 'tsc temiz.' -ForegroundColor Green }
  else { Write-Host 'tsc hata verdi. Ciktiyi bana yapistir.' -ForegroundColor Red }
}

Write-Host ''
Write-Host '--------------------------------------------------'
Write-Host 'Menu: Platform | Solutions | Documentation | Security | Enterprise  ->  Log in, Request a Pilot'
Write-Host 'Footer: Product | Enterprise | Trust | Company and Legal'
Write-Host 'Menu metinlerini degistirmek icin sadece src\lib\main-nav.ts dosyasini duzenle.'
Write-Host 'Kontrol: npm run dev, sonra masaustu ve mobilde ekran goruntusu at.'
Write-Host '--------------------------------------------------'
