param([string]$Base = "http://localhost:3000")
$ErrorActionPreference = "Continue"
$root = Get-Location
New-Item -ItemType Directory -Force -Path (Join-Path $root "_audit") | Out-Null
$report = Join-Path $root "_audit\ALL-TESTS.txt"
$sum = @()

if (-not $env:AEG_KEY) {
  $s = Read-Host "API anahtari (yazarken gorunmez)" -AsSecureString
  $env:AEG_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}

function RunScript($label, $file) {
  Write-Host ""; Write-Host "===== $label =====" -ForegroundColor Cyan
  $o = & powershell -ExecutionPolicy Bypass -File (Join-Path $root $file) -Base $Base | Tee-Object -Variable captured
  $m = [regex]::Match(($captured -join "`n"), "OZET: (\d+) gecti, (\d+) sorun")
  if ($m.Success) { $script:sum += "$label : $($m.Groups[1].Value) gecti, $($m.Groups[2].Value) sorun" } else { $script:sum += "$label : sonuc okunamadi" }
}

# 1) karar motoru, 2) API guvenligi (anahtar sinirlayicisini tetiklememek icin bu sirayla)
RunScript "Karar motoru" "eval-test.ps1"
RunScript "API guvenligi" "api-test.ps1"

# 3) sayfa taramasi
Write-Host ""; Write-Host "===== Sayfalar =====" -ForegroundColor Cyan
$paths = @("", "/about", "/blog", "/changelog", "/contact", "/demo", "/developers", "/developers/quickstart", "/docs", "/docs/quickstart", "/docs/technical", "/enterprise", "/evidence", "/impressum", "/legal/dpa", "/pilot", "/pricing", "/product", "/product/approvals", "/product/decisions", "/product/evidence", "/product/policies", "/product/runtime", "/proof", "/resources", "/security", "/solutions", "/support", "/support/help/contact-support", "/support/getting-started", "/terms", "/trust", "/trust/privacy", "/trust/subprocessors", "/login", "/signup", "/forgot-password")
$pages = @(); foreach ($p in $paths) { $pages += $p; $pages += ("/de" + $p) }
$ok = 0; $bad = 0; $plines = @(); $links = @{}
$badPat = @("MISSING_MESSAGE", "[object Object]", "Lorem ipsum", "href=`"http://localhost", "/de/de/", "/en/en/")
$moji = @([string][char]0x00C3 + [char]0x00A4, [string][char]0x00E2 + [char]0x20AC)

foreach ($p in $pages) {
  $url = $Base + $p; if ($p -eq "") { $url = $Base + "/" }
  $issues = @()
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
    $html = [string]$r.Content
    if ($r.StatusCode -ne 200) { $issues += "HTTP $($r.StatusCode)" }
    if ($html.Length -lt 2000) { $issues += "cok kisa sayfa" }
    $vis = [regex]::Replace($html, "(?s)<script.*?</script>", "")
    foreach ($b in $badPat) { if ($vis.Contains($b)) { $issues += "bulundu: $b" } }
    foreach ($m in $moji) { if ($vis.Contains($m)) { $issues += "bozuk karakter" ; break } }
    if ($vis -match "\bundefined\b|\bNaN\b") { $issues += "undefined/NaN yazisi" }
    foreach ($mm in [regex]::Matches($html, 'href="(/[^"#?]*)"')) { $links[$mm.Groups[1].Value] = $p }
  } catch { $issues += "istek basarisiz" }
  if ($issues.Count -eq 0) { $ok++; $l = "OK    $p" } else { $bad++; $l = "SORUN $p : " + ($issues -join "; ") }
  Write-Host $l; $plines += $l
}

# 404 sayfasi saglam mi
try { $r = Invoke-WebRequest -Uri ($Base + "/boyle-bir-sayfa-yok-xyz") -UseBasicParsing; $c = [int]$r.StatusCode } catch { $c = 0; if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode } }
if ($c -eq 404) { $ok++; $l = "OK    404 sayfasi -> 404" } else { $bad++; $l = "SORUN 404 sayfasi -> $c (404 beklenir)" }
Write-Host $l; $plines += $l

# ic baglantilar
$lc = 0; $lb = 0
foreach ($k in $links.Keys) {
  if ($k -match "^/(_next|api)/" -or $k -match "\.(png|jpg|jpeg|webp|svg|ico|css|js|txt|xml|webmanifest|woff2?)$") { continue }
  $lc++
  try { $r = Invoke-WebRequest -Uri ($Base + $k) -UseBasicParsing -TimeoutSec 60; $c = [int]$r.StatusCode } catch { $c = 0; if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode } }
  if ($c -ge 400 -or $c -eq 0) { $lb++; $l = "KIRIK $k -> $c (bulundugu sayfa: $($links[$k]))"; Write-Host $l; $plines += $l }
}
$sum += "Sayfalar : $ok gecti, $bad sorun"
$sum += "Ic baglantilar : $lc kontrol, $lb kirik"

$out = @("=== KOMPLE TEST $(Get-Date -Format 'yyyy-MM-dd HH:mm') ===") + $sum + "" + $plines
$out | Out-File $report -Encoding utf8
Write-Host ""; Write-Host "===== GENEL OZET =====" -ForegroundColor Green
$sum | ForEach-Object { Write-Host $_ }
Write-Host "Rapor: $report"
Remove-Item Env:\AEG_KEY -ErrorAction SilentlyContinue
