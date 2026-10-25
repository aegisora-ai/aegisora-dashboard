param(
  [string[]]$Only = @(),
  [int]$TimeoutMin = 12
)
$ErrorActionPreference = 'Stop'
Set-Location 'C:\AI\AEGISORA\website4'
$root = (Get-Location).Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$stagingRef = 'daigywopatmznzgaouqo'
$prodRef    = 'bvdsfwmlylnmahridalj'
$prodRef2   = 'hypbttzeqeupwdzbgwbd'
$stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
$runDir = Join-Path $root ".enterprise\e2e-run-$stamp"
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Redact([string]$s) {
  $s = $s -replace 'eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}', '[JWT]'
  $s = $s -replace 'aeg_live_[0-9a-fA-F]{8,}', 'aeg_live_[gizli]'
  $s = $s -replace '(sk|rk)_(live|test)_[A-Za-z0-9]{8,}', '$1_$2_[gizli]'
  $s = $s -replace 'whsec_[A-Za-z0-9]{8,}', 'whsec_[gizli]'
  $s = $s -replace 'sb_(secret|publishable)_[A-Za-z0-9_-]{8,}', 'sb_$1_[gizli]'
  return $s
}
function SetEnv([string]$n, [string]$v) { [Environment]::SetEnvironmentVariable($n, $v, 'Process') }

# 1) .env.e2e oku (degerler asla yazdirilmaz)
$envFile = Join-Path $root '.env.e2e'
if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.e2e bulunamadi.' }
$kv = @{}
foreach ($line in [System.IO.File]::ReadAllLines($envFile, $utf8)) {
  if ($line -match '^\s*(?:export\s+)?([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $v = $Matches[2].Trim()
    if ($v.Length -ge 2 -and (($v[0] -eq '"' -and $v[-1] -eq '"') -or ($v[0] -eq "'" -and $v[-1] -eq "'"))) { $v = $v.Substring(1, $v.Length - 2) }
    $kv[$Matches[1]] = $v
  }
}
foreach ($n in 'AEGISORA_E2E_SUPABASE_URL','AEGISORA_E2E_SUPABASE_ANON_KEY','AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY') {
  if (-not $kv[$n]) { throw "$n .env.e2e icinde bos veya yok." }
}
$url  = $kv['AEGISORA_E2E_SUPABASE_URL'].TrimEnd('/')
$anon = $kv['AEGISORA_E2E_SUPABASE_ANON_KEY']
$svc  = $kv['AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY']

# 2) hedef dogrulama
$ref = ([Uri]$url).Host.Split('.')[0]
if ($ref -eq $prodRef -or $ref -eq $prodRef2) { throw 'DUR: E2E URL production projesini gosteriyor.' }
if ($ref -ne $stagingRef) { throw "DUR: E2E URL beklenen test projesi degil (ref=$ref)." }
try {
  $h = Invoke-WebRequest -Uri "$url/auth/v1/health" -Headers @{ apikey = $anon } -UseBasicParsing -TimeoutSec 20
  Write-Host "Hedef erisilebilir (auth health HTTP $($h.StatusCode))."
} catch { throw "DUR: hedef erisilemedi: $($_.Exception.Message)" }
try {
  Invoke-RestMethod -Method Post -Uri "$url/rest/v1/rpc/evidence_export" -Headers @{ apikey = $svc; Authorization = "Bearer $svc"; 'Content-Type' = 'application/json' } -Body '{"ws":"00000000-0000-0000-0000-000000000000"}' -TimeoutSec 30 | Out-Null
  Write-Host 'evidence_export mevcut.'
} catch {
  $sc = 0; try { $sc = [int]$_.Exception.Response.StatusCode } catch {}
  if ($sc -eq 404) { throw 'DUR: evidence_export test projesinde yok. Once SQL Editor''de (daigywopatmznzgaouqo) uygula.' }
}

# 3) ortami test projesine sabitle
$neutralized = New-Object System.Collections.Generic.List[string]
$envFiles = '.env','.env.local','.env.development','.env.development.local' | ForEach-Object { Join-Path $root $_ } | Where-Object { Test-Path -LiteralPath $_ }
foreach ($f in $envFiles) {
  foreach ($line in [System.IO.File]::ReadAllLines($f, $utf8)) {
    if ($line -match '^\s*(?:export\s+)?([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$' -and ($Matches[2].Contains($prodRef) -or $Matches[2].Contains($prodRef2))) {
      $neutralized.Add((Split-Path $f -Leaf) + ': ' + $Matches[1])
      SetEnv $Matches[1] 'neutralized-by-e2e-orchestrator'
    }
  }
}
foreach ($e in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
  if (([string]$e.Value -like "*$prodRef*" -or [string]$e.Value -like "*$prodRef2*")) { $neutralized.Add('process: ' + $e.Key); SetEnv $e.Key 'neutralized-by-e2e-orchestrator' }
}
SetEnv 'NEXT_PUBLIC_SUPABASE_URL' $url
SetEnv 'SUPABASE_URL' $url
SetEnv 'NEXT_PUBLIC_SUPABASE_ANON_KEY' $anon
SetEnv 'SUPABASE_SERVICE_ROLE_KEY' $svc
SetEnv 'SUPABASE_SECRET_KEY' $svc
SetEnv 'AEGISORA_E2E_SUPABASE_URL' $url
SetEnv 'AEGISORA_E2E_SUPABASE_ANON_KEY' $anon
SetEnv 'AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY' $svc
SetEnv 'AEGISORA_E2E_DISPOSABLE_PROJECT_REF' $stagingRef
SetEnv 'STRIPE_SECRET_KEY' 'sk_test_e2e_disabled'
SetEnv 'STRIPE_WEBHOOK_SECRET' 'whsec_e2e_disabled'
if ($neutralized.Count) { Write-Host ('Etkisizlestirilen prod referansli degiskenler: ' + ($neutralized -join ', ')) }

# 4) adimlar
$node = (Get-Command node).Source
$steps = @(
  @{ Name = 'policy-redaction'; File = 'scripts\security\verify-policy-and-redaction.mjs' },
  @{ Name = 'pilot-docs';       File = 'scripts\security\verify-pilot-docs.mjs' },
  @{ Name = 'mfa';              File = 'scripts\security\phase-c15-mfa-e2e.mjs' },
  @{ Name = 'team-lifecycle';   File = 'scripts\security\phase-c13-team-lifecycle.mjs' },
  @{ Name = 'agent-api';        File = 'scripts\security\phase-c13-c21-agent-api-e2e.mjs' },
  @{ Name = 'approvals';        File = 'scripts\security\phase-approvals-api-e2e.mjs' },
  @{ Name = 'evaluate';         File = 'scripts\security\phase-c19-c20-evaluate-e2e.mjs' }
)
$Only = @($Only | ForEach-Object { $_ -split ',' } | Where-Object { $_ }); if ($Only.Count) { $steps = $steps | Where-Object { $Only -contains $_.Name } }

$results = New-Object System.Collections.Generic.List[object]
foreach ($s in $steps) {
  Write-Host ''
  Write-Host ">>> $($s.Name)" -ForegroundColor Cyan
  $log = Join-Path $runDir ($s.Name + '.out.log')
  $err = Join-Path $runDir ($s.Name + '.err.log')
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $p = Start-Process -FilePath $node -ArgumentList @($s.File) -WorkingDirectory $root -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError $err
  $null = $p.Handle
  if ($p.WaitForExit($TimeoutMin * 60 * 1000)) { $p.WaitForExit(); $code = $p.ExitCode }
  else { & taskkill /PID $p.Id /T /F | Out-Null; $code = 124 }
  $sw.Stop()
  $text = ''
  if (Test-Path $log) { $text += [System.IO.File]::ReadAllText($log, $utf8) }
  if (Test-Path $err) { $text += "`n" + [System.IO.File]::ReadAllText($err, $utf8) }
  $failCount = ([regex]::Matches($text, '\[FAIL\]|"pass":\s*false')).Count
  $status = if ($code -eq 0 -and $failCount -eq 0) { 'GECTI' } elseif ($code -eq 124) { 'ZAMAN ASIMI' } else { 'KALDI' }
  $excerpt = ''
  if ($status -ne 'GECTI') {
    $lines = $text -split "`r?`n"
    $idx = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match '\[FAIL\]|"pass":\s*false|check failed|failed:|REFUSING|STOP|Error') { $idx += $i }
    }
    $pick = New-Object System.Collections.Generic.List[string]
    foreach ($i in ($idx | Select-Object -First 8)) {
      $from = [Math]::Max(0, $i - 1); $to = [Math]::Min($lines.Count - 1, $i + 2)
      $pick.Add(($lines[$from..$to] -join "`n")); $pick.Add('  ---')
    }
    $excerpt = Redact ($pick -join "`n")
  }
  $color = if ($status -eq 'GECTI') { 'Green' } else { 'Red' }
  Write-Host ("    {0}  (kod={1}, {2}s, basarisiz kontrol={3})" -f $status, $code, [int]$sw.Elapsed.TotalSeconds, $failCount) -ForegroundColor $color
  $results.Add([pscustomobject]@{ Name = $s.Name; Status = $status; Code = $code; Sec = [int]$sw.Elapsed.TotalSeconds; Fails = $failCount; Excerpt = $excerpt; Log = $log })
}

# 5) artik kontrolu (yalniz okur)
$leftover = New-Object System.Collections.Generic.List[string]
$hdr = @{ apikey = $svc; Authorization = "Bearer $svc" }
try {
  $users = (Invoke-RestMethod -Uri "$url/auth/v1/admin/users?page=1&per_page=1000" -Headers $hdr -TimeoutSec 30).users
  $u = @($users | Where-Object { $_.email -match '^aegisora-.*@example\.com$' })
  $leftover.Add("artik test kullanicisi: $($u.Count)")
} catch { $leftover.Add('kullanici kontrolu yapilamadi: ' + $_.Exception.Message) }
try {
  $w = @(Invoke-RestMethod -Uri "$url/rest/v1/workspaces?select=id,name&name=like.Temporary*" -Headers $hdr -TimeoutSec 30)
  $leftover.Add("artik 'Temporary*' workspace: $(@($w | Where-Object { $_.id }).Count)")
} catch { $leftover.Add('workspace kontrolu yapilamadi: ' + $_.Exception.Message) }

# 6) rapor
$r = New-Object System.Collections.Generic.List[string]
$r.Add("AEGISORA E2E RAPORU  $stamp  hedef=$stagingRef")
$r.Add('')
$r.Add(('{0,-18} {1,-12} {2,5} {3,6} {4,8}' -f 'ADIM', 'SONUC', 'KOD', 'SN', 'BASARISIZ'))
foreach ($x in $results) { $r.Add(('{0,-18} {1,-12} {2,5} {3,6} {4,8}' -f $x.Name, $x.Status, $x.Code, $x.Sec, $x.Fails)) }
$r.Add('')
$r.Add('ARTIK KONTROLU:'); foreach ($l in $leftover) { $r.Add('  ' + $l) }
if ($neutralized.Count) { $r.Add(''); $r.Add('Etkisizlestirilenler: ' + ($neutralized -join ', ')) }
foreach ($x in ($results | Where-Object { $_.Status -ne 'GECTI' })) {
  $r.Add(''); $r.Add("===== $($x.Name): $($x.Status) ====="); $r.Add($x.Excerpt); $r.Add("log: $($x.Log)")
}
$reportPath = Join-Path $runDir 'report.txt'
[System.IO.File]::WriteAllText($reportPath, ($r -join "`r`n"), $utf8)
Write-Host ''
$r | ForEach-Object { Write-Host $_ }
Write-Host ''
Write-Host "Rapor: $reportPath"
if (($results | Where-Object { $_.Status -ne 'GECTI' }).Count) { exit 1 }