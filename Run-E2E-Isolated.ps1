param([string[]]$Only = @())
$root = 'C:\AI\AEGISORA\website4'
Set-Location $root
$names = '.env','.env.local','.env.production','.env.production.local','.env.development','.env.development.local'

# onceki koşudan kalan varsa once geri yukle
foreach ($n in $names) {
  $aside = Join-Path $root ($n + '.e2e-aside'); $orig = Join-Path $root $n
  if ((Test-Path -LiteralPath $aside) -and -not (Test-Path -LiteralPath $orig)) { Move-Item -LiteralPath $aside -Destination $orig }
}

$moved = New-Object System.Collections.Generic.List[string]
try {
  foreach ($n in $names) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath $p) { Move-Item -LiteralPath $p -Destination ($p + '.e2e-aside') -Force; $moved.Add($n) }
  }
  Write-Host ('Kenara alindi: ' + ($moved -join ', '))
  $argsList = @('-ExecutionPolicy','Bypass','-File',(Join-Path $root 'Run-E2E.ps1'))
  $flat = @($Only | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
  if ($flat.Count) { $argsList += @('-Only', ($flat -join ',')) }
  & powershell @argsList
  $exit = $LASTEXITCODE
} finally {
  foreach ($n in $moved) {
    $p = Join-Path $root $n
    if (Test-Path -LiteralPath ($p + '.e2e-aside')) { Move-Item -LiteralPath ($p + '.e2e-aside') -Destination $p -Force }
  }
  Write-Host ('Geri yuklendi: ' + ($moved -join ', '))
}
exit $exit