$ErrorActionPreference = "Stop"
$root    = "C:\AI\AEGISORA\website4"
$base    = "http://localhost:3000"
$envFile = Join-Path $root ".env.local"
$script:pass = 0
$script:fail = 0

function Info($m) { Write-Host "`n$m" -ForegroundColor Cyan }
function Check($name, $ok) {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green; $script:pass++ }
  else     { Write-Host "FAIL  $name" -ForegroundColor Red;   $script:fail++ }
}
function Get-EnvVal($name) {
  if (-not (Test-Path -LiteralPath $envFile)) { return $null }
  foreach ($l in [IO.File]::ReadAllLines($envFile)) {
    if ($l -match "^\s*$name\s*=\s*(.*)$") { return $Matches[1].Trim().Trim('"').Trim("'") }
  }
  return $null
}
function Set-EnvVal($name, $value) {
  $lines = @()
  if (Test-Path -LiteralPath $envFile) { $lines = @([IO.File]::ReadAllLines($envFile) | Where-Object { $_ -notmatch "^\s*$name\s*=" }) }
  $lines += "$name=$value"
  [IO.File]::WriteAllLines($envFile, $lines, (New-Object Text.UTF8Encoding $false))
}
function Sha($s) {
  ([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($s)) | ForEach-Object { $_.ToString("x2") }) -join ""
}

$script:sbUrl = $null
$script:sbKey = $null
function Sb([string]$method, [string]$path, $body = $null, [string]$prefer = "return=representation") {
  $hdr = @{ apikey = $script:sbKey; Prefer = $prefer }
  if ($script:sbKey.StartsWith("eyJ")) { $hdr["Authorization"] = "Bearer $($script:sbKey)" }
  $p = @{ Method = $method; Uri = "$($script:sbUrl)/rest/v1/$path"; Headers = $hdr; ContentType = "application/json" }
  if ($null -ne $body) { $p.Body = ConvertTo-Json -InputObject $body -Depth 8 -Compress }
  Invoke-RestMethod @p
}
function Sb-Status([scriptblock]$b) {
  try { & $b | Out-Null; return 200 }
  catch { try { return [int]$_.Exception.Response.StatusCode } catch { return -1 } }
}
function Ev($agent, $action, $res) {
  Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -Headers $script:eh -ContentType "application/json" `
    -Body (@{ agent = $agent; action = $action; resource = $res; risk = 40 } | ConvertTo-Json)
}
function Dec($id) { Invoke-RestMethod "$base/api/v1/decisions/$id" -Headers $script:eh }

# ---------------------------------------------------------------- 1) env
Info "1/6  .env.local ve service_role anahtari"
$url = Get-EnvVal "NEXT_PUBLIC_SUPABASE_URL"
if (-not $url) { $url = Get-EnvVal "SUPABASE_URL" }
if (-not $url) { throw ".env.local icinde NEXT_PUBLIC_SUPABASE_URL yok." }
$script:sbUrl = $url.TrimEnd("/")

$k = Get-EnvVal "SUPABASE_SERVICE_ROLE_KEY"
$entered = $false
if (-not $k) {
  $sec  = Read-Host "Supabase service_role (secret) key yapistir (ekranda gorunmez)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  $k    = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim()
  $entered = $true
}
if (-not $k -or $k.Length -lt 30) { throw "Anahtar bos ya da cok kisa." }
if ($k.StartsWith("sb_publishable_")) { throw "Bu publishable anahtar. service_role (secret) lazim." }
if ($k.StartsWith("eyJ")) {
  $seg = $k.Split(".")[1].Replace("-", "+").Replace("_", "/")
  while ($seg.Length % 4) { $seg += "=" }
  $role = ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($seg)) | ConvertFrom-Json).role
  if ($role -ne "service_role") { throw "Bu anahtarin rolu '$role'. service_role lazim." }
}
if ($entered) { Set-EnvVal "SUPABASE_SERVICE_ROLE_KEY" $k; Write-Host "Anahtar .env.local'a yazildi." -ForegroundColor Green }
else { Write-Host "Anahtar zaten .env.local'da." }
$script:sbKey = $k

$gi = Join-Path $root ".gitignore"
if (-not (Test-Path -LiteralPath $gi) -or -not (Select-String -LiteralPath $gi -Pattern '^\.env' -Quiet)) {
  Add-Content -LiteralPath $gi "`n.env*.local"
  Write-Host ".gitignore'a .env*.local eklendi." -ForegroundColor Yellow
}

# ---------------------------------------------------------------- 2) tables
Info "2/6  Veritabani tablolari"
$st = Sb-Status { Sb GET "workspaces?select=id&limit=1" }
if ($st -eq 401 -or $st -eq 403) { throw "Supabase anahtari reddetti (HTTP $st). Dogru service_role anahtarini yapistirdigindan emin ol." }
$need = @("workspaces","workspace_members","agents","api_keys","policies","decisions","approvals","incidents","evidence","audit_events","traces","webhooks","workspace_settings")
$ref = ([Uri]$script:sbUrl).Host.Split(".")[0]
while ($true) {
  $missing = @()
  foreach ($t in $need) { if ((Sb-Status { Sb GET "${t}?select=*&limit=1" }) -ne 200) { $missing += $t } }
  if ($missing.Count -eq 0) { break }
  Write-Host "Eksik tablolar: $($missing -join ', ')" -ForegroundColor Yellow
  $file = if ($missing -contains "workspaces" -or $missing -contains "workspace_members") { "002_onboarding.sql" } else { "003_core.sql" }
  $path = Join-Path $root "supabase\$file"
  if (-not (Test-Path -LiteralPath $path)) { throw "$path bulunamadi." }
  Get-Content -LiteralPath $path -Raw | Set-Clipboard
  Start-Process "https://supabase.com/dashboard/project/$ref/sql/new"
  Write-Host "$file panoya kopyalandi. SQL Editor'a yapistir, Run et. Hata cikarsa bana yapistir. Bitince buraya donup Enter'a bas." -ForegroundColor Yellow
  [void](Read-Host "Enter (iptal: Ctrl+C)")
  Start-Sleep 3
}
Write-Host "Tum tablolar hazir." -ForegroundColor Green

# ---------------------------------------------------------------- 3) dev server
Info "3/6  Dev server yeniden baslatiliyor (yeni env icin)"
foreach ($c in @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
  if ($c -and $c.OwningProcess) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; npm run dev"
$up = $null
for ($i = 0; $i -lt 60; $i++) {
  try { $up = Invoke-RestMethod "$base/api/v1/health" -TimeoutSec 60; break } catch { Start-Sleep 3 }
}
if (-not $up) { throw "Dev server 3 dakikada ayaga kalkmadi. Acilan pencerenin ciktisina bak." }
if ($up -isnot [pscustomobject] -or $up.ok -ne $true) {
  throw "Health JSON donmedi. src\proxy.ts /api yollarini yakaliyor olabilir. Dosyayi bana yapistir."
}
Write-Host "API ayakta." -ForegroundColor Green

# ---------------------------------------------------------------- 4) workspace, key, policies
Info "4/6  Workspace, API key, starter policy"
while ($true) {
  $wsList = @(Sb GET "workspaces?select=id,name,slug")
  if ($wsList.Count -gt 0) { break }
  Start-Process "$base/de/dashboard"
  Write-Host "Workspace yok. Tarayicida giris yap, 'Create your workspace' formunu doldur, sonra Enter'a bas." -ForegroundColor Yellow
  [void](Read-Host "Enter")
}
$ws = $wsList[0]
if ($wsList.Count -gt 1) {
  for ($i = 0; $i -lt $wsList.Count; $i++) { Write-Host "  [$i] $($wsList[$i].name)" }
  $ws = $wsList[[int](Read-Host "Hangi workspace (numara)")]
}
$wsId = $ws.id
Write-Host "Workspace: $($ws.name)" -ForegroundColor Green

$raw = Get-EnvVal "AEGISORA_TEST_KEY"
$reuse = $false
if ($raw -match '^aeg_live_[a-f0-9]{48}$') {
  $reuse = @(Sb GET "api_keys?select=id&workspace_id=eq.$wsId&revoked_at=is.null&key_hash=eq.$(Sha $raw)").Count -gt 0
}
if (-not $reuse) {
  $bytes = New-Object byte[] 24
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $raw = "aeg_live_" + (($bytes | ForEach-Object { $_.ToString("x2") }) -join "")
  [void](Sb POST "api_keys" @{ workspace_id = $wsId; name = "cli-test"; prefix = $raw.Substring(0, 13); key_hash = (Sha $raw) })
  Set-EnvVal "AEGISORA_TEST_KEY" $raw
  Write-Host "Yeni test API key olusturuldu (.env.local, AEGISORA_TEST_KEY)." -ForegroundColor Green
} else { Write-Host "Mevcut test API key kullaniliyor." }
$script:eh = @{ Authorization = "Bearer $raw" }

$have = @(Sb GET "policies?select=name&workspace_id=eq.$wsId") | ForEach-Object { $_.name }
$starters = @(
  @{ name = "Block destructive actions";       action_pattern = "*delete*"; effect = "BLOCK";    priority = 10 },
  @{ name = "Require approval for payments";   action_pattern = "payment.*"; effect = "ESCALATE"; priority = 20 },
  @{ name = "Allow read-only actions";         action_pattern = "read.*";    effect = "ALLOW";    priority = 100 }
)
foreach ($s in $starters) {
  if ($have -notcontains $s.name) { $s.workspace_id = $wsId; [void](Sb POST "policies" $s) }
}
[void](Sb PATCH "agents?workspace_id=eq.$wsId&name=eq.support-bot" @{ status = "active" })

$sRow = @(Sb GET "workspace_settings?select=*&workspace_id=eq.$wsId")
$origDefault = if ($sRow.Count) { $sRow[0].default_effect } else { "BLOCK" }
$autoReg     = if ($sRow.Count) { [bool]$sRow[0].auto_register_agents } else { $true }
$alertBlock  = if ($sRow.Count) { [bool]$sRow[0].alert_on_block } else { $true }
Start-Sleep 4   # .env.local degisti, Next.js yeniden yuklenebilir

# ---------------------------------------------------------------- 5) tests
Info "5/6  Testler"
$r = Invoke-RestMethod "$base/api/v1/health"
Check "health: supabase_url ve service_role tanimli" ($r.configured.service_role -eq $true -and $r.configured.supabase_url -eq $true)

$a = Ev "support-bot" "read.orders" "orders/42"
Check "read.orders -> ALLOW" ($a.effect -eq "ALLOW")
$b = Ev "support-bot" "payment.refund" "order_42"
Check "payment.refund -> ESCALATE + approval_id" ($b.effect -eq "ESCALATE" -and [bool]$b.approval_id)
$c = Ev "support-bot" "files.delete" "/prod/db"
Check "files.delete -> BLOCK" ($c.effect -eq "BLOCK")
$d = Ev "support-bot" "payment.delete" "order_42"
Check "oncelik: BLOCK, ESCALATE'i yener" ($d.effect -eq "BLOCK")
$e = Ev "support-bot" "unknown.thing" "x"
Check "eslesme yok -> workspace varsayilani ($origDefault)" ($e.effect -eq $origDefault)

Check "bekleyen onay: may_execute = False" ((Dec $b.decision_id).may_execute -eq $false)
Check "ALLOW karari: may_execute = True"   ((Dec $a.decision_id).may_execute -eq $true)
Check "BLOCK karari: may_execute = False"  ((Dec $c.decision_id).may_execute -eq $false)

[void](Sb PATCH "approvals?id=eq.$($b.approval_id)" @{ status = "approved" })
$g = Dec $b.decision_id
Check "onay sonrasi: may_execute = True" ($g.may_execute -eq $true -and $g.approval.status -eq "approved")

$b2 = Ev "support-bot" "payment.refund" "order_43"
[void](Sb PATCH "approvals?id=eq.$($b2.approval_id)" @{ status = "rejected" })
$g2 = Dec $b2.decision_id
Check "red sonrasi: may_execute = False" ($g2.may_execute -eq $false -and $g2.approval.status -eq "rejected")

if ($alertBlock) { Check "BLOCK icin incident acildi" (@(Sb GET "incidents?select=id&decision_id=eq.$($c.decision_id)").Count -eq 1) }
$evRow = @(Sb GET "evidence?select=hash&decision_id=eq.$($c.decision_id)")
Check "evidence yazildi ve hash API ile ayni" ($evRow.Count -eq 1 -and $evRow[0].hash -eq $c.evidence_hash)
Check "trace yazildi"       (@(Sb GET "traces?select=id&workspace_id=eq.$wsId&trace_id=eq.$($c.trace_id)").Count -ge 1)
Check "audit kaydi yazildi" (@(Sb GET "audit_events?select=id&workspace_id=eq.$wsId&target_id=eq.$($c.decision_id)").Count -ge 1)

$ev = @(Sb GET "evidence?select=id,seq,hash,prev_hash&workspace_id=eq.$wsId&order=seq.asc&limit=1000")
$chainOk = $ev.Count -gt 0; $prev = "GENESIS"; $n = 0
foreach ($x in $ev) { $n++; if ($x.seq -ne $n -or $x.prev_hash -ne $prev) { $chainOk = $false }; $prev = $x.hash }
Check "evidence zinciri: seq ardisik, prev_hash baglantisi tam ($($ev.Count) kayit)" $chainOk
Check "evidence UPDATE reddedilir" ((Sb-Status { Sb PATCH "evidence?id=eq.$($ev[0].id)" @{ payload = @{ hacked = $true } } }) -ne 200)
Check "evidence DELETE reddedilir" ((Sb-Status { Sb DELETE "evidence?id=eq.$($ev[0].id)" }) -ne 200)

try {
  [void](Sb PATCH "agents?workspace_id=eq.$wsId&name=eq.support-bot" @{ status = "suspended" })
  $s1 = Ev "support-bot" "read.orders" "orders/1"
  Check "askiya alinan agent -> BLOCK" ($s1.effect -eq "BLOCK" -and $s1.reason -like "*suspended*")
} finally { [void](Sb PATCH "agents?workspace_id=eq.$wsId&name=eq.support-bot" @{ status = "active" }) }

try {
  [void](Sb POST "workspace_settings?on_conflict=workspace_id" @{ workspace_id = $wsId; default_effect = "ALLOW" } "resolution=merge-duplicates,return=representation")
  $s2 = Ev "support-bot" "unknown.thing" "x"
  Check "Settings varsayilan=ALLOW yapilinca API'ye yansiyor" ($s2.effect -eq "ALLOW")
} finally {
  [void](Sb POST "workspace_settings?on_conflict=workspace_id" @{ workspace_id = $wsId; default_effect = $origDefault } "resolution=merge-duplicates,return=representation")
}

if ($autoReg) {
  $auto = Ev ("auto-" + (Get-Random)) "read.x" "y"
  Check "auto-discovery: yeni agent kaydedildi" ($auto.agent_registered -eq $true)
}
$imp = Invoke-RestMethod -Method Post -Uri "$base/api/v1/agents/import" -Headers $script:eh -ContentType "application/json" `
  -Body (@{ agents = @(@{ name = "billing-agent"; framework = "langchain" }, @{ name = "triage-agent"; framework = "crewai" }) } | ConvertTo-Json -Depth 5)
Check "toplu import: 2 agent" ($imp.imported -eq 2)
Check "import edilen agentlar veritabaninda" (@(Sb GET "agents?select=id&workspace_id=eq.$wsId&name=in.(billing-agent,triage-agent)").Count -eq 2)
$tr = Invoke-RestMethod -Method Post -Uri "$base/api/v1/traces" -Headers $script:eh -ContentType "application/json" `
  -Body (@{ agent = "billing-agent"; name = "imported-run"; spans = @(@{ name = "llm.call"; duration_ms = 120 }) } | ConvertTo-Json -Depth 5)
Check "trace import" ($tr.spans -eq 1)

$bad = @{ Authorization = "Bearer aeg_live_" + ("0" * 48) }
Check "gecersiz anahtar -> 401" ((Sb-Status { Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -Headers $bad -ContentType "application/json" -Body '{"agent":"x","action":"y"}' }) -eq 401)
Check "anahtarsiz -> 401"       ((Sb-Status { Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -ContentType "application/json" -Body '{"agent":"x","action":"y"}' }) -eq 401)
Check "eksik alan -> 400"       ((Sb-Status { Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -Headers $script:eh -ContentType "application/json" -Body '{"action":"y"}' }) -eq 400)
Check "bozuk JSON -> 400"       ((Sb-Status { Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -Headers $script:eh -ContentType "application/json" -Body 'not json' }) -eq 400)
$big = '{"agent":"x","action":"y","input":"' + ("a" * 70000) + '"}'
Check "cok buyuk govde -> 413"  ((Sb-Status { Invoke-RestMethod -Method Post -Uri "$base/api/v1/evaluate" -Headers $script:eh -ContentType "application/json" -Body $big }) -eq 413)
Check "baska workspace'in karar id'si -> 404" ((Sb-Status { Dec ([guid]::NewGuid().ToString()) }) -eq 404)

# ---------------------------------------------------------------- 6) summary
Info "6/6  Sonuc"
$col = if ($script:fail) { "Red" } else { "Green" }
Write-Host "PASS: $($script:pass)   FAIL: $($script:fail)" -ForegroundColor $col
Write-Host "Test API key: .env.local icinde AEGISORA_TEST_KEY (isi bitince panelden Revoke et)."
Start-Process "$base/de/dashboard/activity"
Write-Host "Tarayicida Live Activity acildi. Evidence sayfasinda 'Verify chain'e bas, 'Chain intact' cikmali."
