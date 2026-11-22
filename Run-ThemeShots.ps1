$ErrorActionPreference = 'Stop'
$root = 'C:\AI\AEGISORA\website4'
Set-Location $root
$utf8 = New-Object System.Text.UTF8Encoding($false)
$stagingRef = 'daigywopatmznzgaouqo'
$prodRefs = @('bvdsfwmlylnmahridalj','hypbttzeqeupwdzbgwbd')
$names = '.env','.env.local','.env.production','.env.production.local','.env.development','.env.development.local'
$nextDir = Join-Path $root '.next'
$nextAside = Join-Path $root '.next.prod-aside'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$shotsDir = Join-Path $root '.enterprise\theme-shots'
New-Item -ItemType Directory -Force $shotsDir | Out-Null

if (Test-Path -LiteralPath $nextAside) {
  if (Test-Path -LiteralPath $nextDir) { Remove-Item -LiteralPath $nextDir -Recurse -Force }
  Move-Item -LiteralPath $nextAside -Destination $nextDir
}
foreach ($n in $names) {
  $aside = Join-Path $root ($n + '.e2e-aside'); $orig = Join-Path $root $n
  if ((Test-Path -LiteralPath $aside) -and -not (Test-Path -LiteralPath $orig)) { Move-Item -LiteralPath $aside -Destination $orig }
}

$listen = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000,3001,3199 }
if ($listen) { Write-Host '[DURDU] Port 3000/3001/3199 dinleniyor. npm run dev acik olabilir, Ctrl+C ile kapat.'; exit 2 }

$specPath = Join-Path $root 'tests\e2e\theme-shots.spec.ts'
if (-not (Test-Path -LiteralPath $specPath)) { Write-Host '[DURDU] tests\e2e\theme-shots.spec.ts yok.'; exit 2 }

$e2eEnv = Join-Path $root '.env.e2e'
if (-not (Test-Path -LiteralPath $e2eEnv)) { Write-Host '[DURDU] .env.e2e yok'; exit 2 }
$map = @{}
foreach ($l in (Get-Content -LiteralPath $e2eEnv | Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' })) {
  $k = ($l -split '=',2)[0].Trim(); $v = ($l -split '=',2)[1].Trim().Trim('"').Trim("'"); $map[$k] = $v
}
$url = ([string]$map['AEGISORA_E2E_SUPABASE_URL']).TrimEnd('/')
$anon = $map['AEGISORA_E2E_SUPABASE_ANON_KEY']
$svc = $map['AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY']
if (-not $url -or -not $anon -or -not $svc) { Write-Host '[DURDU] .env.e2e eksik deger'; exit 2 }
$ref = ([Uri]$url).Host.Split('.')[0]
if ($prodRefs -contains $ref) { Write-Host '[DURDU] .env.e2e production projesini gosteriyor.'; exit 2 }
if ($ref -ne $stagingRef) { Write-Host "[DURDU] beklenen staging degil (ref=$ref)"; exit 2 }
try { $h = Invoke-WebRequest -Uri "$url/auth/v1/health" -Headers @{ apikey = $anon } -UseBasicParsing -TimeoutSec 20; Write-Host "Staging erisilebilir (HTTP $($h.StatusCode))." }
catch { Write-Host ('[DURDU] staging erisilemedi: ' + $_.Exception.Message); exit 2 }

foreach ($e in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
  foreach ($pr in $prodRefs) { if ([string]$e.Value -like "*$pr*") { [Environment]::SetEnvironmentVariable($e.Key, 'neutralized', 'Process') } }
}
[Environment]::SetEnvironmentVariable('STRIPE_SECRET_KEY', 'disabled', 'Process')
[Environment]::SetEnvironmentVariable('STRIPE_WEBHOOK_SECRET', 'disabled', 'Process')

$moved = New-Object System.Collections.Generic.List[string]
$tmpEnv = Join-Path $root '.env.production.local'
$nextMoved = $false
$srv = $null; $userId = $null; $exit = 1
$hdr = @{ apikey = $svc; Authorization = "Bearer $svc"; 'Content-Type' = 'application/json' }
$mail = "aegisora-theme-$stamp@example.com"
try {
  foreach ($n in $names) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath $p) { Move-Item -LiteralPath $p -Destination ($p + '.e2e-aside') -Force; $moved.Add($n) }
  }
  if (Test-Path -LiteralPath $nextDir) { Move-Item -LiteralPath $nextDir -Destination $nextAside; $nextMoved = $true }
  Set-Content -LiteralPath $tmpEnv -Encoding ascii -Value @("NEXT_PUBLIC_SUPABASE_URL=$url","SUPABASE_URL=$url","NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon","SUPABASE_SERVICE_ROLE_KEY=$svc")
  Write-Host 'Staging build aliniyor (birkac dakika surebilir)...'
  & cmd.exe /c "npm run build 2>&1"
  if ($LASTEXITCODE -ne 0) { throw 'staging build basarisiz' }
  $srv = Start-Process -FilePath node -ArgumentList 'node_modules/next/dist/bin/next','start','-p','3199' -WorkingDirectory $root -WindowStyle Hidden -PassThru
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) { try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:3199/login' -UseBasicParsing -TimeoutSec 2; $ready = $true; break } catch { Start-Sleep -Seconds 1 } }
  if (-not $ready) { throw '3199 sunucusu hazir olmadi' }
  Write-Host '3199 sunucusu hazir.'

  $pw = 'Aeg!' + ([guid]::NewGuid().ToString('N')) + 'aZ9'
  $body = @{ email = $mail; password = $pw; email_confirm = $true; user_metadata = @{ full_name = 'Aegisora temporary theme shots' } } | ConvertTo-Json -Depth 4
  $u = Invoke-RestMethod -Method Post -Uri "$url/auth/v1/admin/users" -Headers $hdr -Body $body -TimeoutSec 30
  $userId = $u.id
  Write-Host "Gecici kullanici olusturuldu: $mail"

  [Environment]::SetEnvironmentVariable('E2E_EMAIL', $mail, 'Process')
  [Environment]::SetEnvironmentVariable('E2E_PASSWORD', $pw, 'Process')
  [Environment]::SetEnvironmentVariable('PLAYWRIGHT_BASE_URL', 'http://127.0.0.1:3199', 'Process')
  [Environment]::SetEnvironmentVariable('THEME_SHOTS', '1', 'Process')
  $pwLog = Join-Path $shotsDir 'playwright.log'
  & cmd.exe /c "npx playwright test tests/e2e/theme-shots.spec.ts --reporter=list 2>&1" | Tee-Object -FilePath $pwLog
  $exit = $LASTEXITCODE
  if (Select-String -LiteralPath $pwLog -Pattern "Executable doesn't exist" -Quiet) { Write-Host '[IPUCU] Tarayici yok: npx playwright install chromium' }
} catch {
  Write-Host ('[HATA] ' + $_)
} finally {
  try { Invoke-RestMethod -Method Delete -Uri "$url/rest/v1/workspaces?name=eq.Temporary%20theme%20shots" -Headers $hdr -TimeoutSec 30 | Out-Null; Write-Host 'Gecici workspace silindi.' } catch { Write-Host ('[UYARI] workspace silinemedi, elle sil: ' + $_.Exception.Message) }
  if ($userId) {
    try { Invoke-RestMethod -Method Delete -Uri "$url/auth/v1/admin/users/$userId" -Headers $hdr -TimeoutSec 30 | Out-Null; Write-Host 'Gecici kullanici silindi.' }
    catch { Write-Host ('[UYARI] Kullanici silinemedi, elle sil: ' + $mail + ' | ' + $_.Exception.Message) }
  }
  if ($srv -and -not $srv.HasExited) { Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue }
  Get-NetTCPConnection -LocalPort 3199 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 2
  if (Test-Path -LiteralPath $tmpEnv) { Remove-Item -LiteralPath $tmpEnv -Force }
  if ($nextMoved) {
    if (Test-Path -LiteralPath $nextDir) { Remove-Item -LiteralPath $nextDir -Recurse -Force }
    if (Test-Path -LiteralPath $nextAside) { Move-Item -LiteralPath $nextAside -Destination $nextDir }
  }
  foreach ($n in $moved) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath ($p + '.e2e-aside')) { Move-Item -LiteralPath ($p + '.e2e-aside') -Destination $p -Force }
  }
  Write-Host ('Geri yuklendi: ' + ($moved -join ', '))
}

try {
  $users = (Invoke-RestMethod -Uri "$url/auth/v1/admin/users?page=1&per_page=1000" -Headers $hdr -TimeoutSec 30).users
  Write-Host ('Artik test kullanicisi: ' + @($users | Where-Object { $_.email -match '^aegisora-.*@example\.com$' }).Count)
  $w = @(Invoke-RestMethod -Uri "$url/rest/v1/workspaces?select=id,name&name=like.Temporary*" -Headers $hdr -TimeoutSec 30)
  Write-Host ("Artik 'Temporary*' workspace: " + @($w | Where-Object { $_.id }).Count)
} catch { Write-Host ('Artik kontrolu yapilamadi: ' + $_.Exception.Message) }

$reportPath = Join-Path $shotsDir 'report.json'
$lines = New-Object System.Collections.Generic.List[string]
if (Test-Path -LiteralPath $reportPath) {
  $rep = Get-Content -LiteralPath $reportPath -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($p in $rep.PSObject.Properties) {
    $v = $p.Value
    if ($v -is [string]) { $lines.Add("$($p.Name): $v"); continue }
    $cnt = if ($v.lowContrast) { @($v.lowContrast).Count } else { 0 }
    $lines.Add(("{0}: url={1} dusukKontrast={2} {3}" -f $p.Name, $v.finalUrl, $cnt, $v.error))
    if ($v.lowContrast) { foreach ($x in (@($v.lowContrast) | Select-Object -First 8)) { $lines.Add(("    {0}  {1}  '{2}'  {3} on {4}" -f $x.ratio, $x.sel, $x.text, $x.color, $x.bg)) } }
  }
} else { $lines.Add('report.json olusmadi, playwright.log dosyasina bak.') }
$sum = Join-Path $shotsDir 'summary.txt'
[System.IO.File]::WriteAllText($sum, ($lines -join "`r`n"), $utf8)
Write-Host ''; $lines | ForEach-Object { Write-Host $_ }
Write-Host ''; Write-Host "Ozet: $sum"
Write-Host "Ekran goruntuleri: $shotsDir"
Start-Process explorer.exe $shotsDir
exit $exit