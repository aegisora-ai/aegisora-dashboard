$ErrorActionPreference = 'Stop'
$root = 'C:\AI\AEGISORA\website4'
Set-Location $root
$utf8 = New-Object System.Text.UTF8Encoding($false)
$stagingRef = 'daigywopatmznzgaouqo'
$prodRefs = @('bvdsfwmlylnmahridalj','hypbttzeqeupwdzbgwbd')
$names = '.env','.env.local','.env.production','.env.production.local','.env.development','.env.development.local'
$nextDir = Join-Path $root '.next'
$nextAside = Join-Path $root '.next.prod-aside'
if (Test-Path -LiteralPath $nextAside) {
  if (Test-Path -LiteralPath $nextDir) { Remove-Item -LiteralPath $nextDir -Recurse -Force }
  Move-Item -LiteralPath $nextAside -Destination $nextDir
}
foreach ($n in $names) {
  $aside = Join-Path $root ($n + '.e2e-aside'); $orig = Join-Path $root $n
  if ((Test-Path -LiteralPath $aside) -and -not (Test-Path -LiteralPath $orig)) { Move-Item -LiteralPath $aside -Destination $orig }
}
$listen = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000,3001,3199 }
if ($listen) { Write-Host '[DURDU] Port 3000/3001/3199 dinleniyor.'; exit 2 }
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
if ($prodRefs -contains $ref) { Write-Host '[DURDU] .env.e2e production gosteriyor.'; exit 2 }
if ($ref -ne $stagingRef) { Write-Host "[DURDU] staging degil (ref=$ref)"; exit 2 }
foreach ($e in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
  foreach ($pr in $prodRefs) { if ([string]$e.Value -like "*$pr*") { [Environment]::SetEnvironmentVariable($e.Key, 'neutralized', 'Process') } }
}
$whsec = 'whsec_localtest_' + ([guid]::NewGuid().ToString('N'))
[Environment]::SetEnvironmentVariable('STRIPE_SECRET_KEY', 'sk_test_localdummy', 'Process')
[Environment]::SetEnvironmentVariable('STRIPE_WEBHOOK_SECRET', $whsec, 'Process')
[Environment]::SetEnvironmentVariable('AEGISORA_E2E_SUPABASE_URL', $url, 'Process')
[Environment]::SetEnvironmentVariable('AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY', $svc, 'Process')
[Environment]::SetEnvironmentVariable('PLAYWRIGHT_BASE_URL', 'http://127.0.0.1:3199', 'Process')
$moved = New-Object System.Collections.Generic.List[string]
$tmpEnv = Join-Path $root '.env.production.local'
$nextMoved = $false; $srv = $null; $exit = 1
try {
  foreach ($n in $names) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath $p) { Move-Item -LiteralPath $p -Destination ($p + '.e2e-aside') -Force; $moved.Add($n) }
  }
  if (Test-Path -LiteralPath $nextDir) { Move-Item -LiteralPath $nextDir -Destination $nextAside; $nextMoved = $true }
  Set-Content -LiteralPath $tmpEnv -Encoding ascii -Value @("NEXT_PUBLIC_SUPABASE_URL=$url","SUPABASE_URL=$url","NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon","SUPABASE_SERVICE_ROLE_KEY=$svc")
  Write-Host 'Staging build aliniyor...'
  & cmd.exe /c "npm run build 2>&1" | Select-Object -Last 3
  if ($LASTEXITCODE -ne 0) { throw 'staging build basarisiz' }
  $srv = Start-Process -FilePath node -ArgumentList 'node_modules/next/dist/bin/next','start','-p','3199' -WorkingDirectory $root -WindowStyle Hidden -PassThru
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) { try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:3199/login' -UseBasicParsing -TimeoutSec 2; $ready = $true; break } catch { Start-Sleep -Seconds 1 } }
  if (-not $ready) { throw '3199 sunucusu hazir olmadi' }
  Write-Host '3199 hazir. Webhook testi:'
  & node scripts\security\pilot-webhook-local-test.mjs
  $exit = $LASTEXITCODE
} catch {
  Write-Host ('[HATA] ' + $_)
} finally {
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
exit $exit