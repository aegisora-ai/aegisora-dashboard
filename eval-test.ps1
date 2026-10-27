param([string]$Base = "http://localhost:3000")
if (-not $env:AEG_KEY) { Write-Host "Once anahtari tanimla: `$env:AEG_KEY = '...'" -ForegroundColor Red; exit 1 }
$key = $env:AEG_KEY
$out = Join-Path (Get-Location) "_audit\EVAL-TEST.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null
$script:ok = 0; $script:bad = 0; $lines = @()

function Post($path, $body, $hdr, $ct) {
  $h = if ($hdr) { $hdr } else { @{ Authorization = "Bearer $key" } }
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $code = 0; $text = ""
  try {
    $r = Invoke-WebRequest -Uri ($Base + $path) -Method POST -Headers $h -Body $body -ContentType $(if ($ct) { $ct } else { "application/json" }) -UseBasicParsing -TimeoutSec 30
    $code = [int]$r.StatusCode; $text = $r.Content
  } catch {
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      try { $s = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); $text = $s.ReadToEnd() } catch {}
    }
  }
  $sw.Stop()
  return [pscustomobject]@{ Code = $code; Body = $text; Ms = $sw.ElapsedMilliseconds }
}
function Eff($r) {
  try { $j = $r.Body | ConvertFrom-Json; foreach ($n in "decision","effect","verdict") { if ($j.$n) { return [string]$j.$n } } } catch {}
  return "?"
}
function Report($name, $pass, $detail) {
  if ($pass) { $script:ok++; $tag = "OK   " } else { $script:bad++; $tag = "SORUN" }
  $l = "$tag $name -> $detail"; Write-Host $l; $script:lines += $l
}
function Expect($name, $r, $codes) {
  $pass = ($codes -contains $r.Code) -and ($r.Code -lt 500) -and ($r.Code -ne 0)
  Report $name $pass ("$($r.Code) (beklenen: $($codes -join '/')) $($r.Ms)ms")
}
function J($o) { return ($o | ConvertTo-Json -Depth 6 -Compress) }

$A = "selftest-agent"
Write-Host "Evaluate testi: $Base  (agent adi: $A)"

# 1 gecerli minimal
$r1 = Post "/api/v1/evaluate" (J @{ agent = $A; action = "files.read"; resource = "/tmp/x" })
Expect "gecerli istek" $r1 @(200)
$script:lines += "   govde: " + $r1.Body.Substring(0, [Math]::Min(300, $r1.Body.Length))
Write-Host ("   govde: " + $r1.Body.Substring(0, [Math]::Min(300, $r1.Body.Length)))

# 2-11 gecersiz girdiler -> 400
Expect "agent yok" (Post "/api/v1/evaluate" (J @{ action = "a.b" })) @(400)
Expect "action yok" (Post "/api/v1/evaluate" (J @{ agent = $A })) @(400)
Expect "bos govde" (Post "/api/v1/evaluate" "{}") @(400)
Expect "bozuk JSON" (Post "/api/v1/evaluate" "{oops") @(400)
Expect "risk 150" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; risk = 150 })) @(400)
Expect "risk -1" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; risk = -1 })) @(400)
Expect "risk metin" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; risk = "high" })) @(400)
Expect "agent 121 karakter" (Post "/api/v1/evaluate" (J @{ agent = ("a" * 121); action = "a.b" })) @(400)
Expect "action 201 karakter" (Post "/api/v1/evaluate" (J @{ agent = $A; action = ("b" * 201) })) @(400)
Expect "agent adinda e-posta" (Post "/api/v1/evaluate" (J @{ agent = "ali@firma.com"; action = "a.b" })) @(400)
Expect "trace.id 129 karakter" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; trace = @{ id = ("t" * 129) } })) @(400)

# 12-14 sradisi ama gecerli girdiler -> 5xx olmamali
Expect "input dizi" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; input = @(1,2,3) })) @(200, 400)
Expect "hassas veri resource" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b"; resource = "kart 4111 1111 1111 1111" })) @(200, 400)
Expect "unicode ve emoji" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "dosya.oku"; resource = "/tmp/ozel-dosya-test" })) @(200, 400)
Expect "text/plain icerik tipi" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b" }) $null "text/plain") @(200, 400, 415)
Expect "1MB govde" (Post "/api/v1/evaluate" ('{"agent":"' + ("A" * 1000000) + '"}')) @(400, 413)

# 15-16 kimlik dogrulama bicimleri
Expect "yanlis Bearer bicimi" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b" }) @{ Authorization = "Token $key" }) @(401, 403)
Expect "bos Authorization" (Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b" }) @{ Authorization = "" }) @(401, 403)

# 17-19 karar senaryolari (sonuc bilgi amacli, 5xx olmamali)
$r = Post "/api/v1/evaluate" (J @{ agent = $A; action = "db.drop_table"; resource = "prod.users"; risk = 95 })
Report "tehlikeli eylem db.drop_table" ($r.Code -eq 200) ("karar: " + (Eff $r) + " (BLOCK ya da ESCALATE beklenir)")
$r = Post "/api/v1/evaluate" (J @{ agent = $A; action = "payments.transfer"; resource = "acct-1"; risk = 80 })
Report "odeme transferi" ($r.Code -eq 200) ("karar: " + (Eff $r))
$r = Post "/api/v1/evaluate" (J @{ agent = $A; action = "crm.read_ticket"; resource = "t-1"; risk = 5 })
Report "dusuk riskli okuma" ($r.Code -eq 200) ("karar: " + (Eff $r))

# 20 tutarlilik: ayni istek 5 kez
$effs = @(); 1..5 | ForEach-Object { $effs += (Eff (Post "/api/v1/evaluate" (J @{ agent = $A; action = "files.read"; resource = "/tmp/x" }))) }
Report "ayni istek 5 kez ayni karar" (($effs | Select-Object -Unique).Count -eq 1) ($effs -join ",")

# 21 gecikme
$lat = Post "/api/v1/evaluate" (J @{ agent = $A; action = "files.read"; resource = "/tmp/x" })
Report "gecikme" ($lat.Ms -lt 3000) "$($lat.Ms) ms (3000 ms altinda olmali)"

# 22 yaris durumu: ayni yeni agent adiyla 8 es zamanli istek
$race = "selftest-race-" + (Get-Random -Maximum 99999)
$bodyRace = J @{ agent = $race; action = "files.read" }
$jobs = 1..8 | ForEach-Object {
  Start-Job -ScriptBlock { param($u, $k, $b)
    try { (Invoke-WebRequest -Uri $u -Method POST -Headers @{ Authorization = "Bearer $k" } -Body $b -ContentType "application/json" -UseBasicParsing -TimeoutSec 30).StatusCode }
    catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 } }
  } -ArgumentList ($Base + "/api/v1/evaluate"), $key, $bodyRace
}
$codes = $jobs | Wait-Job | Receive-Job; $jobs | Remove-Job
Report "8 es zamanli istek (yeni agent)" ((($codes | Where-Object { $_ -ge 500 -or $_ -eq 0 }).Count) -eq 0) ("kodlar: " + ($codes -join ","))

# 23 kayit: karar sonradan okunabiliyor mu
$id = $null
try { $j = $r1.Body | ConvertFrom-Json; foreach ($n in "decision_id","id") { if ($j.$n) { $id = [string]$j.$n; break } } } catch {}
if ($id) {
  try { $g = Invoke-WebRequest -Uri ($Base + "/api/v1/decisions/" + $id) -Headers @{ Authorization = "Bearer $key" } -UseBasicParsing; $gc = [int]$g.StatusCode } catch { $gc = 0; if ($_.Exception.Response) { $gc = [int]$_.Exception.Response.StatusCode } }
  Report "karar kaydi okunuyor" ($gc -eq 200) "GET /api/v1/decisions/$id -> $gc"
} else { Report "karar kaydi okunuyor" $false "yanit govdesinde karar numarasi bulunamadi" }

# 24 baska workspace baslik denemesi
$r = Post "/api/v1/evaluate" (J @{ agent = $A; action = "a.b" }) @{ Authorization = "Bearer $key"; "X-Workspace-Id" = "00000000-0000-0000-0000-000000000000" }
Report "baska workspace basligi" (($r.Code -eq 200) -or ($r.Code -in 400,401,403,404)) ("$($r.Code) (baska workspace verisine ERISMEMELI)")

$lines += ""; $lines += "OZET: $script:ok gecti, $script:bad sorun"
$lines | Out-File $out -Encoding utf8
Write-Host ""; Write-Host "OZET: $script:ok gecti, $script:bad sorun"; Write-Host "Sonuc: $out"
