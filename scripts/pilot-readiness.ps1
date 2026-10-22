<#
.SYNOPSIS
  Aegisora pilot hazirlik denetimi (readiness audit).

.DESCRIPTION
  Varsayilan olarak SADECE OKUR, hicbir dosyayi degistirmez.
  -Fix        : guvenli duzeltmeleri uygular (.gitignore, schema.sql default, bozuk karakterler)
  -RunBuild   : tsc, lint, npm audit ve production build calistirir (birkac dakika surer)
  -TagRelease : tum kontroller FAIL'siz ise git tag + git bundle yedegi olusturur

  Gizli degerleri (anahtar, parola) ASLA ekrana veya rapora yazmaz, sadece anahtar adlarini kontrol eder.

.EXAMPLE
  .\scripts\pilot-readiness.ps1 -ProdUrl "https://ornek.com" -Domain "ornek.com"
  .\scripts\pilot-readiness.ps1 -ProdUrl "https://ornek.com" -Domain "ornek.com" -Fix -RunBuild
#>
#Requires -Version 5.1
[CmdletBinding()]
param(
  [string]$RepoPath    = 'C:\AI\AEGISORA\website4',
  [string]$ProdUrl     = '',
  [string]$Domain      = '',
  [string]$SupabaseUrl = 'https://bvdsfwmlylnmahridalj.supabase.co',
  [string]$LogoUrl     = 'https://bvdsfwmlylnmahridalj.supabase.co/storage/v1/object/public/public-assets/email-logo.png',
  [string[]]$Locales   = @('en'),
  [string[]]$DkimSelectors = @('resend', 'google', 'selector1', 'selector2'),
  [switch]$Fix,
  [switch]$RunBuild,
  [switch]$TagRelease
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$script:Results = New-Object System.Collections.Generic.List[object]
$script:Stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'

# ----------------------------------------------------------------------------
# Yardimci fonksiyonlar
# ----------------------------------------------------------------------------
function Add-Result {
  param(
    [string]$Area,
    [string]$Check,
    [ValidateSet('PASS', 'WARN', 'FAIL', 'INFO', 'SKIP')][string]$Status,
    [string]$Detail = ''
  )
  $script:Results.Add([pscustomobject]@{ Area = $Area; Check = $Check; Status = $Status; Detail = $Detail })
  $color = switch ($Status) { 'PASS' { 'Green' } 'WARN' { 'Yellow' } 'FAIL' { 'Red' } 'INFO' { 'Cyan' } default { 'DarkGray' } }
  Write-Host ('[{0}] {1} / {2}' -f $Status, $Area, $Check) -ForegroundColor $color
  if ($Detail) { Write-Host ('       {0}' -f $Detail) -ForegroundColor DarkGray }
}

function Write-Section([string]$Title) {
  Write-Host ''
  Write-Host ('=== {0} ===' -f $Title) -ForegroundColor White
}

function Get-EnvKeys([string]$File) {
  if (-not (Test-Path $File)) { return @() }
  $keys = @()
  foreach ($l in Get-Content $File) {
    if ($l -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') { $keys += $Matches[1] }
  }
  return $keys
}

function Get-EnvValue([string]$File, [string]$Key) {
  if (-not (Test-Path $File)) { return $null }
  foreach ($l in Get-Content $File) {
    if ($l -match ('^\s*' + [regex]::Escape($Key) + '\s*=\s*(.*)$')) {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Get-HeaderValue($Headers, [string]$Name) {
  if ($null -eq $Headers) { return $null }
  try {
    $v = $Headers[$Name]
    if ($null -eq $v) { return $null }
    if ($v -is [array] -or $v -is [System.Collections.IEnumerable] -and $v -isnot [string]) { return (@($v) -join ',') }
    return [string]$v
  } catch { return $null }
}

function Invoke-Probe {
  param([string]$Url, [int]$TimeoutSec = 20)
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    $sw.Stop()
    return [pscustomobject]@{ Ok = $true; Status = [int]$r.StatusCode; Headers = $r.Headers; Ms = $sw.ElapsedMilliseconds; Length = $r.RawContentLength; Error = '' }
  } catch {
    $sw.Stop()
    $code = 0; $hdr = $null
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      $hdr = $_.Exception.Response.Headers
    }
    return [pscustomobject]@{ Ok = $false; Status = $code; Headers = $hdr; Ms = $sw.ElapsedMilliseconds; Length = 0; Error = $_.Exception.Message }
  }
}

function Invoke-Rest {
  param([string]$Method = 'GET', [string]$Url, [hashtable]$Headers = @{}, [string]$Body = $null)
  try {
    $p = @{ Uri = $Url; Method = $Method; Headers = $Headers; UseBasicParsing = $true; TimeoutSec = 20; ErrorAction = 'Stop' }
    if ($Body) { $p.Body = $Body; $p.ContentType = 'application/json' }
    $r = Invoke-WebRequest @p
    return [pscustomobject]@{ Status = [int]$r.StatusCode; Body = [string]$r.Content }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return [pscustomobject]@{ Status = $code; Body = '' }
  }
}

function Get-CertExpiry([string]$HostName) {
  try {
    $c = New-Object Net.Sockets.TcpClient($HostName, 443)
    $ssl = New-Object Net.Security.SslStream($c.GetStream(), $false, ({ $true }))
    $ssl.AuthenticateAsClient($HostName)
    $cert = New-Object Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate)
    $ssl.Dispose(); $c.Close()
    return $cert.NotAfter
  } catch { return $null }
}

function Get-SourceFiles {
  $roots = @((Join-Path $RepoPath 'src'), (Join-Path $RepoPath 'supabase')) | Where-Object { Test-Path $_ }
  if (-not $roots) { return @() }
  return Get-ChildItem -Path $roots -Recurse -File -Include *.ts, *.tsx, *.js, *.jsx, *.mjs, *.sql, *.json, *.md, *.css -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\(node_modules|\.next)\\' }
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# ----------------------------------------------------------------------------
# 1. Ortam
# ----------------------------------------------------------------------------
function Test-Environment {
  Write-Section '1. Ortam'
  foreach ($t in 'git', 'node', 'npm') {
    $cmd = Get-Command $t -ErrorAction SilentlyContinue
    if ($cmd) {
      $ver = (& $t --version 2>$null) -join ' '
      Add-Result 'Ortam' $t 'PASS' $ver
    } else {
      Add-Result 'Ortam' $t 'FAIL' 'Kurulu degil veya PATH icinde yok'
    }
  }
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $major = [int](((& node --version) -replace '^v', '').Split('.')[0])
    if ($major -ge 20) { Add-Result 'Ortam' 'Node surumu' 'PASS' "Node $major" }
    else { Add-Result 'Ortam' 'Node surumu' 'WARN' "Node $major. Next.js icin 20+ onerilir" }
  }
}

# ----------------------------------------------------------------------------
# 2. Git durumu
# ----------------------------------------------------------------------------
function Test-GitState {
  Write-Section '2. Git durumu'
  if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
    Add-Result 'Git' 'Depo' 'FAIL' "$RepoPath bir git deposu degil"
    return
  }
  $branch = (& git rev-parse --abbrev-ref HEAD 2>$null)
  $last = (& git log -1 --format='%h %s' 2>$null)
  Add-Result 'Git' 'Dal ve son commit' 'INFO' "$branch | $last"

  if ($branch -ne 'main') {
    Add-Result 'Git' 'Dal' 'WARN' "Su an '$branch' dalindasin. Canli site genelde main'den yayinlanir. Pilot oncesi merge et."
  } else {
    Add-Result 'Git' 'Dal' 'PASS' 'main'
  }

  $dirty = @(& git status --porcelain 2>$null)
  if ($dirty.Count -gt 0) { Add-Result 'Git' 'Calisma agaci' 'WARN' "$($dirty.Count) commit edilmemis degisiklik var" }
  else { Add-Result 'Git' 'Calisma agaci' 'PASS' 'Temiz' }

  & git fetch --quiet 2>$null
  $counts = (& git rev-list --left-right --count '@{u}...HEAD' 2>$null)
  if ($LASTEXITCODE -eq 0 -and $counts) {
    $p = ($counts -split '\s+')
    Add-Result 'Git' 'Uzak dalla fark' 'INFO' "Geride: $($p[0]) | Onde (push edilmemis): $($p[1])"
    if ([int]$p[1] -gt 0) { Add-Result 'Git' 'Push' 'WARN' 'Push edilmemis commit var' }
  } else {
    Add-Result 'Git' 'Uzak dal' 'WARN' 'Upstream tanimli degil'
  }

  $tracked = @(& git ls-files)
  $envTracked = @($tracked | Where-Object { $_ -match '(^|/)\.env($|\.)' -and $_ -notmatch '\.env\.example$' })
  if ($envTracked.Count -gt 0) { Add-Result 'Git' 'Takipli .env' 'FAIL' ($envTracked -join ', ') }
  else { Add-Result 'Git' 'Takipli .env' 'PASS' '.env.example disinda takipli env dosyasi yok' }

  $keyFiles = @($tracked | Where-Object { $_ -match '\.(pem|key|p12|pfx)$|service[-_]?account.*\.json$|(^|/)dump\.txt$' })
  if ($keyFiles.Count -gt 0) { Add-Result 'Git' 'Takipli hassas dosya' 'FAIL' ($keyFiles -join ', ') }
  else { Add-Result 'Git' 'Takipli hassas dosya' 'PASS' 'Yok' }
}

# ----------------------------------------------------------------------------
# 3. Gizli anahtar taramasi (calisma agaci + tum gecmis)
# ----------------------------------------------------------------------------
function Test-Secrets {
  Write-Section '3. Gizli anahtar taramasi'
  $pat = [ordered]@{
    'JWT'          = 'eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.'
    'sb_secret'    = 'sb_secret_[A-Za-z0-9_\-]{10,}'
    'Resend'       = '\bre_[A-Za-z0-9_]{20,}'
    'Groq'         = '\bgsk_[A-Za-z0-9]{20,}'
    'sk- anahtar'  = '\bsk-[A-Za-z0-9_\-]{20,}'
    'GitHub token' = '\bgh[pousr]_[A-Za-z0-9]{30,}'
    'AWS key'      = '\bAKIA[0-9A-Z]{16}\b'
    'Slack token'  = '\bxox[baprs]-[A-Za-z0-9-]{10,}'
    'Stripe live'  = '\b[sr]k_live_[A-Za-z0-9]{16,}'
    'private key'  = '-----BEGIN [A-Z ]*PRIVATE KEY'
  }
  foreach ($k in $pat.Keys) {
    $files = @(& git grep -lIE -e $pat[$k] 2>$null)
    $hist = @(& git log --all --format='%h' -G $pat[$k] -E 2>$null)
    if ($files.Count -gt 0) { Add-Result 'Gizli' "$k (calisma agaci)" 'FAIL' ("Dosyalar: " + ($files -join ', ')) }
    else { Add-Result 'Gizli' "$k (calisma agaci)" 'PASS' 'Bulunmadi' }
    if ($hist.Count -gt 0) {
      Add-Result 'Gizli' "$k (gecmis)" 'FAIL' ("$($hist.Count) commit, ilk 3: " + ((@($hist) | Select-Object -First 3) -join ', ') + ' | Anahtari yenile, sonra gecmisi temizle')
    } else { Add-Result 'Gizli' "$k (gecmis)" 'PASS' 'Bulunmadi' }
  }
}

# ----------------------------------------------------------------------------
# 4. Ortam degiskeni hijyeni
# ----------------------------------------------------------------------------
function Test-EnvHygiene {
  Write-Section '4. Ortam degiskenleri'
  $example = Join-Path $RepoPath '.env.example'
  $local = Join-Path $RepoPath '.env.local'
  $exKeys = Get-EnvKeys $example
  $locKeys = Get-EnvKeys $local

  if ($exKeys.Count -eq 0) { Add-Result 'Env' '.env.example' 'WARN' 'Bos veya yok. Gerekli degisken adlarini burada belgele.' }
  else { Add-Result 'Env' '.env.example' 'PASS' "$($exKeys.Count) anahtar adi" }

  if ($locKeys.Count -gt 0 -and $exKeys.Count -gt 0) {
    $missing = @($exKeys | Where-Object { $_ -notin $locKeys })
    if ($missing.Count -gt 0) { Add-Result 'Env' '.env.local eksikleri' 'WARN' ($missing -join ', ') }
    else { Add-Result 'Env' '.env.local eksikleri' 'PASS' 'Yok' }
  }

  $bad = @(($exKeys + $locKeys) | Where-Object { $_ -match '^NEXT_PUBLIC_.*(SERVICE|SECRET|PRIVATE)' } | Select-Object -Unique)
  if ($bad.Count -gt 0) { Add-Result 'Env' 'NEXT_PUBLIC_ ile gizli anahtar' 'FAIL' ($bad -join ', ') }
  else { Add-Result 'Env' 'NEXT_PUBLIC_ ile gizli anahtar' 'PASS' 'Yok' }

  # service role tarayici koduna sizmis mi
  $leak = @()
  foreach ($f in (Get-SourceFiles | Where-Object { $_.Extension -in '.ts', '.tsx' })) {
    $text = [IO.File]::ReadAllText($f.FullName, $Utf8NoBom)
    if ($text -match 'SUPABASE_SERVICE_ROLE|service_role') {
      $head = ($text -split "`n" | Select-Object -First 5) -join "`n"
      if ($head -match "['""]use client['""]") { $leak += $f.FullName.Replace($RepoPath, '.') }
    }
  }
  if ($leak.Count -gt 0) { Add-Result 'Env' 'Client bilesenlerinde service_role' 'FAIL' ($leak -join ', ') }
  else { Add-Result 'Env' 'Client bilesenlerinde service_role' 'PASS' 'Yok' }

  $gi = Join-Path $RepoPath '.gitignore'
  $giText = if (Test-Path $gi) { Get-Content $gi -Raw } else { '' }
  if ($giText -notmatch '(?m)^\.env') { Add-Result 'Env' '.gitignore .env' 'FAIL' '.env* satiri yok' }
  else { Add-Result 'Env' '.gitignore .env' 'PASS' 'Var' }
}

# ----------------------------------------------------------------------------
# 5. Ornek (demo) veri
# ----------------------------------------------------------------------------
function Test-DemoData {
  Write-Section '5. Ornek veri bagimliligi'
  $src = Join-Path $RepoPath 'src'
  if (-not (Test-Path $src)) { Add-Result 'Demo' 'src' 'SKIP' 'src klasoru yok'; return }
  $files = Get-ChildItem -Path $src -Recurse -File -Include *.ts, *.tsx -ErrorAction SilentlyContinue
  $imp = @($files | Select-String -Pattern "from\s+['""]@/lib/demo-" -List | ForEach-Object { $_.Path.Replace($RepoPath, '.') })
  if ($imp.Count -gt 0) {
    Add-Result 'Demo' 'demo-* import eden dosya' 'WARN' "$($imp.Count) dosya. Pilotun kullanacagi ekranlari gercek veriye bagla veya pilotu 'onizleme' olarak sun."
    $imp | ForEach-Object { Write-Host "       - $_" -ForegroundColor DarkGray }
  } else { Add-Result 'Demo' 'demo-* import' 'PASS' 'Yok' }

  $banner = @($files | Select-String -Pattern 'Sample data|SAMPLE DATA' -List | ForEach-Object { $_.Path.Replace($RepoPath, '.') })
  if ($banner.Count -gt 0) { Add-Result 'Demo' '"Sample data" uyari bandi' 'WARN' ("Pilot musterisi gorecek: " + ($banner -join ', ')) }
  else { Add-Result 'Demo' '"Sample data" uyari bandi' 'PASS' 'Yok' }
}

# ----------------------------------------------------------------------------
# 6. Rotalar ve temel dosyalar
# ----------------------------------------------------------------------------
function Test-Routes {
  Write-Section '6. Rotalar'
  $app = Join-Path $RepoPath 'src\app'
  if (-not (Test-Path $app)) { Add-Result 'Rota' 'src\app' 'SKIP' 'Yok'; return }
  $pages = @(Get-ChildItem -Path $app -Recurse -File -Include page.tsx, page.ts -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName })

  $required = [ordered]@{
    'login'          = '\\login\\page\.'
    'signup'         = '\\(signup|register)\\page\.'
    'reset-password' = '\\reset-password\\page\.'
    'accept-invite'  = '\\accept-invite\\page\.'
    'onboarding'     = '\\onboarding\\page\.'
    'dashboard'      = '\\dashboard\\page\.'
  }
  foreach ($k in $required.Keys) {
    if (@($pages | Where-Object { $_ -match $required[$k] }).Count -gt 0) { Add-Result 'Rota' $k 'PASS' 'Sayfa var' }
    else { Add-Result 'Rota' $k 'FAIL' 'page.tsx bulunamadi' }
  }
  $legal = [ordered]@{ 'privacy' = '\\(privacy|privacy-policy|legal\\privacy)\\page\.'; 'terms' = '\\(terms|terms-of-service|legal\\terms)\\page\.' }
  foreach ($k in $legal.Keys) {
    if (@($pages | Where-Object { $_ -match $legal[$k] }).Count -gt 0) { Add-Result 'Hukuki' $k 'PASS' 'Sayfa var' }
    else { Add-Result 'Hukuki' $k 'FAIL' 'Sayfa yok. Enterprise musteri ilk bunu ister. Metni avukatla hazirla.' }
  }

  $mw = @('middleware.ts', 'src\middleware.ts', 'proxy.ts', 'src\proxy.ts') | Where-Object { Test-Path (Join-Path $RepoPath $_) }
  if ($mw) { Add-Result 'Rota' 'Oturum middleware/proxy' 'PASS' ($mw -join ', ') }
  else { Add-Result 'Rota' 'Oturum middleware/proxy' 'WARN' 'Bulunamadi. /dashboard korumasi baska yerde mi?' }

  foreach ($f in 'error.tsx', 'not-found.tsx', 'global-error.tsx') {
    $hit = @(Get-ChildItem -Path $app -Recurse -File -Filter $f -ErrorAction SilentlyContinue)
    if ($hit.Count -gt 0) { Add-Result 'Rota' $f 'PASS' 'Var' } else { Add-Result 'Rota' $f 'WARN' 'Yok' }
  }
}

# ----------------------------------------------------------------------------
# 7. Sentry
# ----------------------------------------------------------------------------
function Test-Sentry {
  Write-Section '7. Hata izleme (Sentry)'
  $pkgPath = Join-Path $RepoPath 'package.json'
  if (-not (Test-Path $pkgPath)) { Add-Result 'Sentry' 'package.json' 'SKIP' 'Yok'; return }
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  $deps = @()
  foreach ($sec in 'dependencies', 'devDependencies') {
    $p = $pkg.PSObject.Properties[$sec]
    if ($p) { $deps += $p.Value.PSObject.Properties.Name }
  }
  if ($deps -contains '@sentry/nextjs') { Add-Result 'Sentry' '@sentry/nextjs' 'PASS' 'Yuklu' }
  else { Add-Result 'Sentry' '@sentry/nextjs' 'FAIL' 'Yuklu degil' }

  $cfg = @('instrumentation.ts', 'instrumentation-client.ts', 'sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts', 'src\instrumentation.ts', 'src\instrumentation-client.ts') |
    Where-Object { Test-Path (Join-Path $RepoPath $_) }
  if ($cfg) { Add-Result 'Sentry' 'Yapilandirma dosyalari' 'PASS' ($cfg -join ', ') }
  else { Add-Result 'Sentry' 'Yapilandirma dosyalari' 'WARN' 'Bulunamadi' }

  $keys = (Get-EnvKeys (Join-Path $RepoPath '.env.local')) + (Get-EnvKeys (Join-Path $RepoPath '.env.example'))
  if ($keys -contains 'NEXT_PUBLIC_SENTRY_DSN' -or $keys -contains 'SENTRY_DSN') { Add-Result 'Sentry' 'DSN degiskeni' 'PASS' 'Tanimli' }
  else { Add-Result 'Sentry' 'DSN degiskeni' 'WARN' 'SENTRY_DSN adi env dosyalarinda yok' }

  Add-Result 'Sentry' 'Alert kurali' 'INFO' 'MANUEL: Sentry > Alerts > Create Alert: "yeni issue" ve "hata orani artisi" icin e-posta ayarla.'
}

# ----------------------------------------------------------------------------
# 8. Karakter kodlama (bozuk Turkce/tipografik karakterler)
# ----------------------------------------------------------------------------
function Test-Encoding {
  Write-Section '8. Karakter kodlama'
  $a = [string][char]0x00E2; $euro = [string][char]0x20AC
  $mojiEm = $a + $euro + [char]0x201D   # em dash
  $mojiEn = $a + $euro + [char]0x201C   # en dash
  $mojiAp = $a + $euro + [char]0x2122   # apostrophe
  $detect = '[' + [char]0x00C2 + [char]0x00C3 + [char]0x00C4 + [char]0x00C5 + '][\u0080-\u00BF\u0152-\u017E\u2018-\u203A\u20AC]|' + $a + $euro

  $bad = @()
  foreach ($f in Get-SourceFiles) {
    $text = [IO.File]::ReadAllText($f.FullName, $Utf8NoBom)
    if ($text -match $detect) {
      $bad += $f
      if ($Fix) {
        $new = $text.Replace($mojiEm, [string][char]0x2014).Replace($mojiEn, [string][char]0x2013).Replace($mojiAp, [string][char]0x2019)
        if ($new -ne $text) { [IO.File]::WriteAllText($f.FullName, $new, $Utf8NoBom) }
      }
    }
  }
  if ($bad.Count -eq 0) { Add-Result 'Kodlama' 'Bozuk karakter' 'PASS' 'Yok'; return }
  $names = ($bad | ForEach-Object { $_.FullName.Replace($RepoPath, '.') }) -join ', '
  if ($Fix) { Add-Result 'Kodlama' 'Bozuk karakter' 'WARN' "Tire/kesme isaretleri duzeltildi. Kalanlari elle kontrol et: $names" }
  else { Add-Result 'Kodlama' 'Bozuk karakter' 'WARN' "Sitede gorunebilir (ornek: docs menusu). -Fix ile duzelt. Dosyalar: $names" }
}

# ----------------------------------------------------------------------------
# 9. schema.sql
# ----------------------------------------------------------------------------
function Test-Schema {
  Write-Section '9. schema.sql'
  $p = Join-Path $RepoPath 'supabase\schema.sql'
  if (-not (Test-Path $p)) { Add-Result 'Sema' 'schema.sql' 'SKIP' 'Yok'; return }
  $text = [IO.File]::ReadAllText($p, $Utf8NoBom)
  if ($text -match "default\s+'member'") {
    if ($Fix) {
      $new = $text -replace "default\s+'member'::public\.workspace_role", "default 'viewer'::public.workspace_role"
      [IO.File]::WriteAllText($p, $new, $Utf8NoBom)
      Add-Result 'Sema' "role default 'member'" 'PASS' "'viewer' olarak duzeltildi (enum'da 'member' yok)"
    } else {
      Add-Result 'Sema' "role default 'member'" 'WARN' "Enum'da 'member' yok. -Fix ile 'viewer' yapilir."
    }
  } else { Add-Result 'Sema' "role default" 'PASS' 'Gecerli' }

  if ($text -match 'security\s+definer' -and $text -notmatch 'revoke\s+execute') {
    Add-Result 'Sema' 'SECURITY DEFINER yetkileri' 'WARN' 'create_workspace icin "revoke execute ... from public, anon; grant execute ... to authenticated;" ekle.'
  }
}

# ----------------------------------------------------------------------------
# 10. .gitignore sertlestirme (sadece -Fix)
# ----------------------------------------------------------------------------
function Update-GitIgnore {
  if (-not $Fix) { return }
  Write-Section '10. .gitignore sertlestirme'
  $gi = Join-Path $RepoPath '.gitignore'
  $existing = if (Test-Path $gi) { @(Get-Content $gi) } else { @() }
  $want = @('.env', '.env.*', '!.env.example', 'dump.txt', '*.pem', '*.key', '*.p12', '*.pfx', '*.log', '.vercel', 'pilot-reports/')
  $added = @()
  foreach ($w in $want) { if ($existing -notcontains $w) { $added += $w } }
  if ($added.Count -gt 0) {
    Add-Content -Path $gi -Value ("`n# pilot-readiness`n" + ($added -join "`n"))
    Add-Result 'Gitignore' 'Eklenen satirlar' 'PASS' ($added -join ', ')
  } else { Add-Result 'Gitignore' 'Eklenen satirlar' 'PASS' 'Zaten tam' }
}

# ----------------------------------------------------------------------------
# 11. Canli site (HTTP, basliklar, sertifika, logo)
# ----------------------------------------------------------------------------
function Test-Remote {
  Write-Section '11. Canli site'
  if (-not $ProdUrl) { Add-Result 'Canli' 'ProdUrl' 'SKIP' '-ProdUrl verilmedi'; return }
  $base = $ProdUrl.TrimEnd('/')
  $uri = [uri]$base
  if ($uri.Scheme -ne 'https') { Add-Result 'Canli' 'HTTPS' 'FAIL' 'Adres https degil' }

  $exp = Get-CertExpiry $uri.Host
  if ($exp) {
    $days = [int]($exp - (Get-Date)).TotalDays
    if ($days -lt 14) { Add-Result 'Canli' 'TLS sertifika' 'FAIL' "$days gun kaldi" }
    elseif ($days -lt 30) { Add-Result 'Canli' 'TLS sertifika' 'WARN' "$days gun kaldi" }
    else { Add-Result 'Canli' 'TLS sertifika' 'PASS' "$days gun kaldi" }
  } else { Add-Result 'Canli' 'TLS sertifika' 'WARN' 'Okunamadi' }

  $paths = @(@{ P = '/'; Req = $true })
  foreach ($loc in $Locales) {
    $paths += @{ P = "/$loc"; Req = $true }
    foreach ($s in 'login', 'signup', 'reset-password', 'trust/privacy', 'terms', 'impressum', 'docs') {
      $req = $s -in 'login', 'signup'
      $paths += @{ P = "/$loc/$s"; Req = $req }
    }
  }
  $paths += @{ P = '/robots.txt'; Req = $false }
  $paths += @{ P = '/sitemap.xml'; Req = $false }

  $homeProbe = $null
  foreach ($e in $paths) {
    $r = Invoke-Probe ($base + $e.P)
    if ($e.P -eq "/$($Locales[0])") { $homeProbe = $r }
    if ($r.Ok) {
      if ($r.Ms -gt 3000) { Add-Result 'Canli' $e.P 'WARN' "HTTP $($r.Status), yavas: $($r.Ms) ms" }
      else { Add-Result 'Canli' $e.P 'PASS' "HTTP $($r.Status), $($r.Ms) ms" }
    } else {
      $st = if ($e.Req) { 'FAIL' } else { 'WARN' }
      Add-Result 'Canli' $e.P $st "HTTP $($r.Status) $($r.Error)"
    }
  }

  if ($homeProbe -and $homeProbe.Ok) {
    $want = [ordered]@{
      'Strict-Transport-Security' = 'HSTS'
      'X-Content-Type-Options'    = 'nosniff'
      'Referrer-Policy'           = 'Referrer-Policy'
      'Content-Security-Policy'   = 'CSP'
      'X-Frame-Options'           = 'Clickjacking (veya CSP frame-ancestors)'
    }
    foreach ($h in $want.Keys) {
      $v = Get-HeaderValue $homeProbe.Headers $h
      if ($v) { Add-Result 'Basliklar' $h 'PASS' 'Var' }
      else {
        $st = if ($h -in 'Strict-Transport-Security', 'X-Content-Type-Options') { 'FAIL' } else { 'WARN' }
        Add-Result 'Basliklar' $h $st "Yok ($($want[$h])). next.config headers() ile ekle."
      }
    }
  }

  $logo = Invoke-Probe $LogoUrl
  $ct = Get-HeaderValue $logo.Headers 'Content-Type'
  if ($logo.Ok -and $ct -match '^image/') { Add-Result 'Canli' 'Mail logosu' 'PASS' "HTTP $($logo.Status), $ct" }
  else { Add-Result 'Canli' 'Mail logosu' 'FAIL' "HTTP $($logo.Status) $ct" }
}

# ----------------------------------------------------------------------------
# 12. Mail DNS (SPF, DKIM, DMARC)
# ----------------------------------------------------------------------------
function Test-Dns {
  Write-Section '12. Mail DNS'
  $d = $Domain
  if (-not $d -and $ProdUrl) { $d = ([uri]$ProdUrl).Host -replace '^www\.', '' }
  if (-not $d) { Add-Result 'DNS' 'Alan adi' 'SKIP' '-Domain veya -ProdUrl ver'; return }
  if (-not (Get-Command Resolve-DnsName -ErrorAction SilentlyContinue)) { Add-Result 'DNS' 'Resolve-DnsName' 'SKIP' 'Komut yok'; return }

  function Get-Txt([string]$Name) {
    $r = Resolve-DnsName -Name $Name -Type TXT -ErrorAction SilentlyContinue
    if (-not $r) { return @() }
    return @($r | Where-Object { $_.PSObject.Properties['Strings'] } | ForEach-Object { ($_.Strings -join '') })
  }

  $spf = @(Get-Txt $d | Where-Object { $_ -match '^v=spf1' })
  if ($spf.Count -eq 0) { Add-Result 'DNS' 'SPF' 'WARN' "$d icin SPF yok. Resend gonderim alt alan adi kullaniyorsa onu kontrol et." }
  elseif ($spf.Count -gt 1) { Add-Result 'DNS' 'SPF' 'FAIL' 'Birden fazla SPF kaydi var. Tek kayitta birlestir.' }
  elseif ($spf[0] -notmatch '[~-]all') { Add-Result 'DNS' 'SPF' 'WARN' 'Sonunda ~all veya -all yok' }
  else { Add-Result 'DNS' 'SPF' 'PASS' 'Tek kayit, all mekanizmasi var' }

  $dm = @(Get-Txt "_dmarc.$d" | Where-Object { $_ -match '^v=DMARC1' })
  if ($dm.Count -eq 0) { Add-Result 'DNS' 'DMARC' 'FAIL' "_dmarc.$d yok. Ornek: v=DMARC1; p=none; rua=mailto:dmarc@$d" }
  elseif ($dm[0] -match 'p=none') { Add-Result 'DNS' 'DMARC' 'WARN' 'p=none. Pilot icin kabul edilir, rapor izledikten sonra quarantine yap.' }
  else { Add-Result 'DNS' 'DMARC' 'PASS' 'Politika aktif' }

  $found = @()
  foreach ($s in $DkimSelectors) {
    $r = Resolve-DnsName -Name "$s._domainkey.$d" -ErrorAction SilentlyContinue
    if ($r) { $found += $s }
  }
  if ($found.Count -gt 0) { Add-Result 'DNS' 'DKIM' 'PASS' ('Selector: ' + ($found -join ', ')) }
  else { Add-Result 'DNS' 'DKIM' 'FAIL' ('Bulunamadi (' + ($DkimSelectors -join ', ') + '). Resend panelinde alan adini dogrula.') }

  Add-Result 'DNS' 'Gmail testi' 'INFO' 'MANUEL: Test mailini Gmail ile ac > uc nokta > "Show original" > SPF, DKIM, DMARC: PASS olmali.'
}

# ----------------------------------------------------------------------------
# 13. Supabase (RLS, auth ayarlari) - anon anahtar ile, veri yazmaz
# ----------------------------------------------------------------------------
function Test-Supabase {
  Write-Section '13. Supabase'
  $anon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (-not $anon) { $anon = Get-EnvValue (Join-Path $RepoPath '.env.local') 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }
  if (-not $anon) { Add-Result 'Supabase' 'Anon anahtar' 'SKIP' 'NEXT_PUBLIC_SUPABASE_ANON_KEY bulunamadi'; return }
  $h = @{ apikey = $anon; Authorization = "Bearer $anon" }

  foreach ($t in 'profiles', 'workspaces', 'workspace_members') {
    $r = Invoke-Rest -Url ("$SupabaseUrl/rest/v1/${t}?select=*&limit=1") -Headers $h
    if ($r.Status -eq 200 -and $r.Body.Trim() -eq '[]') { Add-Result 'RLS' "$t (anon okuma)" 'PASS' 'Anonim kullanici satir goremiyor' }
    elseif ($r.Status -eq 200) { Add-Result 'RLS' "$t (anon okuma)" 'FAIL' 'ANONIM KULLANICI SATIR OKUYABILIYOR. RLS politikasini duzelt.' }
    elseif ($r.Status -in 401, 403) { Add-Result 'RLS' "$t (anon okuma)" 'PASS' "Reddedildi (HTTP $($r.Status))" }
    else { Add-Result 'RLS' "$t (anon okuma)" 'WARN' "HTTP $($r.Status). Tablo var mi?" }
  }

  $rpc = Invoke-Rest -Method 'POST' -Url "$SupabaseUrl/rest/v1/rpc/create_workspace" -Headers $h -Body '{"p_name":"readiness-probe"}'
  if ($rpc.Status -ge 400 -or $rpc.Status -eq 0) { Add-Result 'RLS' 'create_workspace (anon)' 'PASS' "Anonim cagri basarisiz (HTTP $($rpc.Status))" }
  else { Add-Result 'RLS' 'create_workspace (anon)' 'FAIL' "Anonim cagri BASARILI (HTTP $($rpc.Status)). Fonksiyondan anon yetkisini kaldir ve olusan kaydi sil." }

  $s = Invoke-Rest -Url "$SupabaseUrl/auth/v1/settings" -Headers @{ apikey = $anon }
  if ($s.Status -eq 200) {
    $j = $s.Body | ConvertFrom-Json
    $ac = $j.PSObject.Properties['mailer_autoconfirm']
    if ($ac -and $ac.Value -eq $true) { Add-Result 'Auth' 'E-posta onayi' 'FAIL' 'mailer_autoconfirm acik: e-posta dogrulanmadan hesap aciliyor' }
    elseif ($ac) { Add-Result 'Auth' 'E-posta onayi' 'PASS' 'Onay zorunlu' }
    $ds = $j.PSObject.Properties['disable_signup']
    if ($ds) { Add-Result 'Auth' 'Acik kayit' 'INFO' ("disable_signup = " + $ds.Value + ' (pilotta sadece davetle girilecekse true yap)') }
  } else { Add-Result 'Auth' 'Ayarlar' 'WARN' "HTTP $($s.Status)" }

  Add-Result 'Supabase' 'Plan' 'INFO' 'MANUEL: aegisora-prod FREE gorunuyor. Pilot icin Pro: Settings > Billing. Otomatik yedek ve duraklatmama icin gerekli.'
  Add-Result 'Supabase' 'Ozel SMTP' 'INFO' 'MANUEL: Authentication > Emails > SMTP Settings: Resend (smtp.resend.com, port 465, kullanici "resend"). Dahili SMTP saatlik cok dusuk limitli.'
  Add-Result 'Supabase' 'URL ayari' 'INFO' 'MANUEL: Authentication > URL Configuration: Site URL = canli adres, Redirect URLs = canli adres/** (localhost sadece gelistirmede).'
}

# ----------------------------------------------------------------------------
# 14. Build, tip kontrolu, lint, bagimlilik denetimi (-RunBuild)
# ----------------------------------------------------------------------------
function Invoke-Step([string]$Exe, [string[]]$StepArgs, [string]$Log) {
  Write-Host ("  > {0} {1}" -f $Exe, ($StepArgs -join ' ')) -ForegroundColor DarkGray
  & $Exe @StepArgs *> $Log
  return $LASTEXITCODE
}

function Test-Build {
  Write-Section '14. Build ve kalite'
  if (-not $RunBuild) { Add-Result 'Build' 'Tum adimlar' 'SKIP' '-RunBuild verilmedi'; return }
  $logDir = Join-Path $RepoPath 'pilot-reports'
  if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

  if (-not (Test-Path (Join-Path $RepoPath 'node_modules'))) {
    $c = Invoke-Step 'npm' @('ci') (Join-Path $logDir "npm-ci-$script:Stamp.log")
    if ($c -ne 0) { Add-Result 'Build' 'npm ci' 'FAIL' 'Bagimliliklar kurulamadi'; return }
  }

  $steps = @(
    @{ N = 'TypeScript'; E = 'npx'; A = @('tsc', '--noEmit'); Sev = 'FAIL' },
    @{ N = 'Lint'; E = 'npm'; A = @('run', 'lint', '--if-present'); Sev = 'WARN' },
    @{ N = 'npm audit (high+)'; E = 'npm'; A = @('audit', '--omit=dev', '--audit-level=high'); Sev = 'WARN' },
    @{ N = 'Production build'; E = 'npm'; A = @('run', 'build'); Sev = 'FAIL' }
  )
  foreach ($s in $steps) {
    $log = Join-Path $logDir (("{0}-{1}.log" -f ($s.N -replace '[^A-Za-z0-9]', ''), $script:Stamp))
    $code = Invoke-Step $s.E $s.A $log
    if ($code -eq 0) { Add-Result 'Build' $s.N 'PASS' "Log: $log" }
    else { Add-Result 'Build' $s.N $s.Sev "Cikis kodu $code. Log: $log" }
  }
}

# ----------------------------------------------------------------------------
# 15. Surum etiketi ve yedek (-TagRelease)
# ----------------------------------------------------------------------------
function Invoke-Release {
  Write-Section '15. Surum etiketi ve yedek'
  if (-not $TagRelease) { Add-Result 'Surum' 'Etiket' 'SKIP' '-TagRelease verilmedi'; return }
  if (@($script:Results | Where-Object { $_.Status -eq 'FAIL' }).Count -gt 0) {
    Add-Result 'Surum' 'Etiket' 'FAIL' 'FAIL varken etiket olusturulmaz. Once duzelt.'
    return
  }
  $tag = 'pilot-' + (Get-Date -Format 'yyyyMMdd-HHmm')
  & git tag -a $tag -m "Pilot release $tag"
  if ($LASTEXITCODE -ne 0) { Add-Result 'Surum' 'git tag' 'FAIL' 'Etiket olusturulamadi'; return }
  $bundleDir = Join-Path $RepoPath 'pilot-reports'
  if (-not (Test-Path $bundleDir)) { New-Item -ItemType Directory -Path $bundleDir | Out-Null }
  $bundle = Join-Path $bundleDir "aegisora-$tag.bundle"
  & git bundle create $bundle --all 2>$null
  Add-Result 'Surum' 'Etiket ve yedek' 'PASS' "Etiket: $tag | Yedek: $bundle"
  Add-Result 'Surum' 'Geri donus' 'INFO' "Push: git push origin $tag | Geri alma: git checkout $tag veya Vercel > Deployments > onceki surum > Promote to Production"
}

# ----------------------------------------------------------------------------
# 16. Rapor
# ----------------------------------------------------------------------------
function Write-Report {
  Write-Section 'Ozet'
  $groups = $script:Results | Group-Object Status
  foreach ($st in 'FAIL', 'WARN', 'PASS', 'INFO', 'SKIP') {
    $n = @($script:Results | Where-Object { $_.Status -eq $st }).Count
    $col = switch ($st) { 'PASS' { 'Green' } 'WARN' { 'Yellow' } 'FAIL' { 'Red' } 'INFO' { 'Cyan' } default { 'DarkGray' } }
    Write-Host ('{0,-5} {1}' -f $st, $n) -ForegroundColor $col
  }

  $dir = Join-Path $RepoPath 'pilot-reports'
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $file = Join-Path $dir "pilot-readiness-$script:Stamp.md"
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.AppendLine("# Aegisora pilot hazirlik raporu")
  [void]$sb.AppendLine("Tarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm')  ")
  [void]$sb.AppendLine("Depo: $RepoPath  ")
  [void]$sb.AppendLine("")
  foreach ($st in 'FAIL', 'WARN', 'INFO', 'PASS', 'SKIP') {
    $items = @($script:Results | Where-Object { $_.Status -eq $st })
    if ($items.Count -eq 0) { continue }
    [void]$sb.AppendLine("## $st ($($items.Count))")
    foreach ($i in $items) {
      $detail = ($i.Detail -replace '\|', '/')
      [void]$sb.AppendLine("- **$($i.Area) / $($i.Check)**: $detail")
    }
    [void]$sb.AppendLine("")
  }
  [IO.File]::WriteAllText($file, $sb.ToString(), $Utf8NoBom)
  Write-Host ''
  Write-Host "Rapor: $file" -ForegroundColor White

  $fails = @($script:Results | Where-Object { $_.Status -eq 'FAIL' }).Count
  if ($fails -gt 0) { Write-Host "SONUC: $fails kritik sorun var. Pilota cikma." -ForegroundColor Red }
  else { Write-Host 'SONUC: Kritik sorun yok. WARN ve MANUEL maddeleri gozden gecir.' -ForegroundColor Green }
  return $fails
}

# ----------------------------------------------------------------------------
# Calistir
# ----------------------------------------------------------------------------
if ($ProdUrl -and $ProdUrl -notmatch '^https://[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(/.*)?$') { Write-Host "ProdUrl gecersiz (yer tutucu mu?): $ProdUrl" -ForegroundColor Red; exit 2 }
if ($Domain -and $Domain -notmatch '^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$') { Write-Host "Domain gecersiz: $Domain" -ForegroundColor Red; exit 2 }
if (-not (Test-Path $RepoPath)) { Write-Host "Depo yolu yok: $RepoPath" -ForegroundColor Red; exit 2 }
Push-Location $RepoPath
try {
  Test-Environment
  Test-GitState
  Test-Secrets
  Test-EnvHygiene
  Test-DemoData
  Test-Routes
  Test-Sentry
  Test-Encoding
  Test-Schema
  Update-GitIgnore
  Test-Remote
  Test-Dns
  Test-Supabase
  Test-Build
  Invoke-Release
  $failCount = Write-Report
} finally {
  Pop-Location
}
if ($Fix) { Write-Host "`n-Fix degisiklik yapti. Incele: git diff --stat, sonra commit et." -ForegroundColor Yellow }
if ($failCount -gt 0) { exit 1 } else { exit 0 }




