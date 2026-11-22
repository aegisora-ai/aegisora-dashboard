<#
  Aegisora - Fix-Security.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Fix-Security.ps1            (commit + push)
    powershell -ExecutionPolicy Bypass -File .\Fix-Security.ps1 -NoPush    (sadece commit)

  - shadcn paketini devDependencies'e tasir (canli kodda calismiyor, 3 yuksek aciga neden oluyor)
  - uretim bagimliliklarinda audit, tsc ve build calistirir
  - her sey basariliysa SADECE package.json ve package-lock.json'i commit'ler
#>
[CmdletBinding()]
param([switch]$NoPush)

$ErrorActionPreference = 'Continue'
$root = (Get-Location).Path
if (-not [System.IO.File]::Exists((Join-Path $root 'package.json'))) { throw 'package.json yok. Scripti website4 klasorunde calistir.' }

function Stop-Here([string]$msg) {
  Write-Host ''
  Write-Host $msg -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'AEGISORA GUVENLIK DUZELTMESI' -ForegroundColor Cyan
$branch = (git branch --show-current).Trim()
Write-Host "Dal: $branch"
Write-Host 'Surumler:'
npm ls next zod --depth=0 2>$null

# 1) shadcn -> devDependencies
$ver = ((npm pkg get dependencies.shadcn) | Out-String).Trim().Trim('"')
if ($ver -and $ver -ne '{}' -and $ver -ne 'undefined') {
  Write-Host ''
  Write-Host "shadcn ($ver) dependencies'ten devDependencies'e tasiniyor..."
  npm pkg delete dependencies.shadcn | Out-Null
  npm pkg set "devDependencies.shadcn=$ver" | Out-Null
  npm install
  if ($LASTEXITCODE -ne 0) { Stop-Here 'npm install basarisiz. Ciktiyi bana yapistir.' }
} else {
  Write-Host 'shadcn zaten dependencies icinde degil, atlaniyor.'
}

# 2) audit (sadece uretim)
Write-Host ''
Write-Host 'npm audit --omit=dev'
npm audit --omit=dev
$auditOk = ($LASTEXITCODE -eq 0)

# 3) tsc + build
Write-Host ''
Write-Host 'npx tsc --noEmit'
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Stop-Here 'tsc hata verdi. Commit yapilmadi. Ciktiyi bana yapistir.' }

Write-Host ''
Write-Host 'npm run build (birkac dakika surebilir)'
npm run build
if ($LASTEXITCODE -ne 0) { Stop-Here 'build basarisiz. Commit yapilmadi. Son 30 satiri bana yapistir.' }

# 4) commit (sadece paket dosyalari)
git add package.json package-lock.json
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host 'Commit edilecek paket degisikligi yok.'
} else {
  git commit -m "security: upgrade next to 16.4.3 and zod to 4.6.7, move shadcn to devDependencies"
  if ($LASTEXITCODE -ne 0) { Stop-Here 'commit basarisiz.' }
  if (-not $NoPush) {
    git push 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
      Write-Host 'Upstream yok, ayarlanip tekrar deneniyor...'
      git push -u origin $branch 2>&1 | Out-Host
      if ($LASTEXITCODE -ne 0) { Stop-Here 'push basarisiz. Ciktiyi bana yapistir.' }
    }
  }
}

Write-Host ''
Write-Host '--------------------------------------------------'
if ($auditOk) { Write-Host 'Uretim audit: TEMIZ' -ForegroundColor Green } else { Write-Host 'Uretim audit: acik kaldi, yukaridaki listeyi bana at' -ForegroundColor Yellow }
Write-Host "Dal: $branch"
Write-Host 'Canliya cikmasi icin bu dalin Vercel Production dali olmasi (veya Production dalina birlestirilmesi) gerekir.'
Write-Host '--------------------------------------------------'
