param([string[]]$Only = @())
$root = 'C:\AI\AEGISORA\website4'
Set-Location $root
$stagingRef = 'daigywopatmznzgaouqo'
$e2eEnv = Join-Path $root '.env.e2e'
$names = '.env','.env.local','.env.production','.env.production.local','.env.development','.env.development.local'
$nextDir = Join-Path $root '.next'
$nextAside = Join-Path $root '.next.prod-aside'

# onceki yarim kalan koşudan toparla
if (Test-Path -LiteralPath $nextAside) {
  if (Test-Path -LiteralPath $nextDir) { Remove-Item -LiteralPath $nextDir -Recurse -Force }
  Move-Item -LiteralPath $nextAside -Destination $nextDir
}
foreach ($n in $names) {
  $aside = Join-Path $root ($n + '.e2e-aside'); $orig = Join-Path $root $n
  if ((Test-Path -LiteralPath $aside) -and -not (Test-Path -LiteralPath $orig)) { Move-Item -LiteralPath $aside -Destination $orig }
}

$listen = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000,3001 }
if ($listen) { Write-Host '[DURDU] Port 3000/3001 dinleniyor: npm run dev acik. Once Ctrl+C ile kapat.'; exit 2 }
# on kontrol: dokunmadan once dogrula
if (-not (Test-Path -LiteralPath $e2eEnv)) { Write-Host '[DURDU] .env.e2e bulunamadi'; exit 2 }
$lines = Get-Content -LiteralPath $e2eEnv | Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' }
$map = @{}
foreach ($l in $lines) { $k = ($l -split '=',2)[0].Trim(); $v = ($l -split '=',2)[1].Trim().Trim('"').Trim("'"); $map[$k] = $v }
Write-Host ('.env.e2e icindeki isimler: ' + (($map.Keys | Sort-Object) -join ', '))
$url = $map['AEGISORA_E2E_SUPABASE_URL']
$hasKey = $map.ContainsKey('AEGISORA_E2E_SUPABASE_ANON_KEY') -and $map.ContainsKey('AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY')
if (-not $url -or $url -notmatch $stagingRef) { Write-Host '[DURDU] .env.e2e icinde NEXT_PUBLIC_SUPABASE_URL yok ya da staging degil'; exit 2 }
if (-not $hasKey) { Write-Host '[DURDU] .env.e2e icinde NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY yok'; exit 2 }

$moved = New-Object System.Collections.Generic.List[string]
$tmpEnv = Join-Path $root '.env.production.local'
$nextMoved = $false
$exit = 1
try {
  foreach ($n in $names) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath $p) { Move-Item -LiteralPath $p -Destination ($p + '.e2e-aside') -Force; $moved.Add($n) }
  }
  if (Test-Path -LiteralPath $nextDir) { Move-Item -LiteralPath $nextDir -Destination $nextAside; $nextMoved = $true }
  Set-Content -LiteralPath $tmpEnv -Encoding ascii -Value @("NEXT_PUBLIC_SUPABASE_URL=$url","SUPABASE_URL=$url","NEXT_PUBLIC_SUPABASE_ANON_KEY=$($map['AEGISORA_E2E_SUPABASE_ANON_KEY'])","SUPABASE_SERVICE_ROLE_KEY=$($map['AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY'])")
  Write-Host 'Staging build aliniyor (birkaç dakika surebilir)...'
  & cmd.exe /c "npm run build 2>&1"
  if ($LASTEXITCODE -ne 0) { throw 'staging build basarisiz' }
  $argsList = @('-ExecutionPolicy','Bypass','-File',(Join-Path $root 'Run-E2E.ps1'))
  $flat = @($Only | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
  if ($flat.Count) { $argsList += @('-Only', ($flat -join ',')) }
  $srv = Start-Process -FilePath node -ArgumentList 'node_modules/next/dist/bin/next','start','-p','3199' -WorkingDirectory $root -WindowStyle Hidden -PassThru
  for ($i = 0; $i -lt 60; $i++) { try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:3199/login' -UseBasicParsing -TimeoutSec 2; break } catch { Start-Sleep -Seconds 1 } }
  Write-Host ('3199 sunucusu hazir (deneme: ' + $i + ')')
  & powershell @argsList
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
  Write-Host ('Geri yuklendi: ' + ($moved -join ', ') + ' ve production .next')
}
exit $exit
