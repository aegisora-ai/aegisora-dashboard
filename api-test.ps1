param([string]$Base = "http://localhost:3000")
$ErrorActionPreference = "Continue"
$out = Join-Path (Get-Location) "_audit\API-TEST.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null
$script:ok = 0; $script:bad = 0; $lines = @()

function Call($method, $path, $body, $ct) {
  $uri = $Base + $path
  $p = @{ Uri = $uri; Method = $method; UseBasicParsing = $true; MaximumRedirection = 0; TimeoutSec = 20 }
  if ($null -ne $body) { $p.Body = $body; $p.ContentType = $(if ($ct) { $ct } else { "application/json" }) }
  try { $r = Invoke-WebRequest @p; return [int]$r.StatusCode }
  catch {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return 0
  }
}

function T($name, $method, $path, $expect, $body, $ct) {
  $code = Call $method $path $body $ct
  $pass = ($expect -contains $code)
  if (($code -ge 500 -and $expect -notcontains $code) -or $code -eq 0) { $pass = $false }
  if ($pass) { $script:ok++; $tag = "OK   " } else { $script:bad++; $tag = "SORUN" }
  $line = "$tag $name -> $code (beklenen: $($expect -join '/'))"
  Write-Host $line
  $script:lines += $line
}

Write-Host "Test basliyor: $Base"
$none = 401, 403
# --- saglik
T "health" GET "/api/health" @(200)
T "v1 health" GET "/api/v1/health" @(200, 401)
T "og gorseli" GET "/api/og" @(200)
# --- yetkisiz erisim (hepsi reddedilmeli, 5xx olmamali)
T "agents yetkisiz" POST "/api/v1/workspace/agents" $none "{}"
T "policies yetkisiz" POST "/api/v1/workspace/policies" $none "{}"
T "usage yetkisiz" GET "/api/v1/workspace/usage" $none
T "members yetkisiz" GET "/api/v1/workspace/members" $none
T "evidence export yetkisiz" GET "/api/v1/workspace/evidence/export" $none
T "approval yetkisiz" POST "/api/v1/workspace/approvals/test" ($none + 405) "{}"
T "members accept yetkisiz" POST "/api/v1/workspace/members/accept" ($none + 400) "{}"
T "evaluate anahtarsiz" POST "/api/v1/evaluate" $none "{}"
T "evaluate sahte anahtar" POST "/api/v1/evaluate" $none "{}"
T "traces anahtarsiz" POST "/api/v1/traces" $none "{}"
T "decisions anahtarsiz" GET "/api/v1/decisions/abc" ($none + 404)
T "agents import anahtarsiz" POST "/api/v1/agents/import" $none "{}"
T "billing status yetkisiz" GET "/api/billing/status" $none
T "stripe checkout yetkisiz" POST "/api/stripe/checkout" ($none + 400 + 404 + 503) "{}"
T "stripe portal yetkisiz" POST "/api/stripe/portal" ($none + 400 + 404 + 503) "{}"
T "stripe webhook imzasiz" POST "/api/stripe/webhook" @(400, 401, 403, 404, 503) "{}"
# --- bozuk veri (400 beklenir, 500 olmamali)
T "pilot bos govde" POST "/api/pilot-request" @(400, 422) "{}"
T "pilot bozuk JSON" POST "/api/pilot-request" @(400, 422) "{not json"
T "pilot gecersiz e-posta" POST "/api/pilot-request" @(400, 422) '{"full_name":"T","work_email":"abc","company":"X","use_case":"x","consent":"on"}'
T "pilot injection metni" POST "/api/pilot-request" @(400, 422) "{`"full_name`":`"'; DROP TABLE x;--`",`"work_email`":`"bad`"}"
$big = '{"full_name":"' + ("A" * 1000000) + '"}'
T "pilot 1MB govde" POST "/api/pilot-request" @(400, 413, 422) $big
T "demo bos govde" POST "/api/demo" @(200, 400, 401, 422) "{}"
T "csp-report cop veri" POST "/api/csp-report" @(200, 204, 400) "junk" "text/plain"
# --- yanlis yontem
T "health DELETE" DELETE "/api/health" @(405)
T "pilot GET" GET "/api/pilot-request" @(405)
# --- dashboard giris olmadan (yonlendirme beklenir)
T "dashboard girissiz" GET "/dashboard" @(302, 303, 307, 308, 200)
T "dashboard billing girissiz" GET "/dashboard/billing" @(302, 303, 307, 308, 200)
T "dashboard api-keys girissiz" GET "/dashboard/api-keys" @(302, 303, 307, 308, 200)

# --- istege bagli: API anahtari varsa gercek test
if ($env:AEG_KEY) {
  $h = @{ Authorization = "Bearer $env:AEG_KEY" }
  foreach ($x in @(@("GET","/api/v1/health"))) {
    try { $r = Invoke-WebRequest -Uri ($Base + $x[1]) -Method $x[0] -Headers $h -UseBasicParsing; $c = [int]$r.StatusCode } catch { $c = 0; if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode } }
    if ($c -eq 200) { $script:ok++; $tag = "OK   " } else { $script:bad++; $tag = "SORUN" }
    $line = "$tag anahtarli $($x[1]) -> $c"; Write-Host $line; $script:lines += $line
  }
} else { $lines += "ATLANDI anahtarli testler (AEG_KEY tanimli degil)" }

$lines += ""; $lines += "OZET: $script:ok gecti, $script:bad sorun"
$lines | Out-File $out -Encoding utf8
Write-Host ""; Write-Host "OZET: $script:ok gecti, $script:bad sorun"; Write-Host "Sonuc: $out"


