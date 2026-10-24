$ErrorActionPreference = "Continue"
$root = (Get-Location).Path
$src = Join-Path $root "src"
$outFile = Join-Path $root "docs\site-audit.txt"
New-Item -ItemType Directory -Force -Path (Join-Path $root "docs") | Out-Null
$r = New-Object System.Collections.Generic.List[string]
function Sec($t) { $r.Add(""); $r.Add("=== $t ===") }
function Rel($p) { $p.Substring($root.Length + 1) }

$files = Get-ChildItem -LiteralPath $src -Recurse -File -Include *.ts,*.tsx,*.css

function Scan($title, $pattern, $max = 60) {
  Sec $title
  $hits = @($files | Select-String -Pattern $pattern)
  $r.Add("Count: $($hits.Count)")
  foreach ($h in ($hits | Select-Object -First $max)) {
    $line = $h.Line.Trim()
    if ($line.Length -gt 140) { $line = $line.Substring(0, 140) }
    $r.Add("$(Rel $h.Path):$($h.LineNumber): $line")
  }
}

# 1. Pages
Sec "PAGES (src\app)"
$pages = @(Get-ChildItem -LiteralPath (Join-Path $src "app") -Recurse -File -Filter "page.tsx")
$r.Add("Total pages: $($pages.Count)")
foreach ($p in $pages) {
  $n = (Get-Content -LiteralPath $p.FullName).Count
  $r.Add(("{0,5} lines  {1}" -f $n, (Rel $p.FullName)))
}

# 2. Pages without metadata
Sec "SERVER PAGES WITHOUT METADATA (SEO/title; layout may cover some)"
foreach ($p in $pages) {
  $t = Get-Content -Raw -LiteralPath $p.FullName
  if ($t -and $t -notmatch "use client" -and $t -notmatch "metadata|generateMetadata") { $r.Add((Rel $p.FullName)) }
}

# 3. Pattern scans
Scan "PLACEHOLDER / UNFINISHED CONTENT" "TODO|FIXME|lorem|ipsum|coming soon|placeholder text|your text here|example\.com|foo@|test@|Acme"
Scan "DEBUG LEFTOVERS" "console\.(log|debug)|debugger|@ts-ignore|@ts-nocheck"
Scan "DEAD LINKS (href with only #)" "href=.#."
Scan "IMG TAGS WITHOUT ALT (accessibility)" "<img\b(?![^>]*\balt=)"
Scan "FIXED WIDTHS THAT MAY BREAK ON MOBILE" "(?<![a-zA-Z])(min)?width\s*:\s*.?[0-9]{3,4}(px|\s*[,}])|w-\[[0-9]{3,4}px\]"

# 4. Hex colors
Sec "FILES WITH MOST HARDCODED HEX COLORS (design consistency)"
$files | ForEach-Object {
  $t = Get-Content -Raw -LiteralPath $_.FullName
  if (-not $t) { return }
  [pscustomobject]@{ F = (Rel $_.FullName); C = ([regex]::Matches($t, "#[0-9a-fA-F]{6}\b")).Count }
} | Sort-Object C -Descending | Select-Object -First 15 | ForEach-Object { $r.Add(("{0,4}  {1}" -f $_.C, $_.F)) }

# 5. Translations
Sec "TRANSLATION KEY COMPARISON"
function Flat($o, $prefix) {
  foreach ($p in $o.PSObject.Properties) {
    $k = if ($prefix) { "$prefix.$($p.Name)" } else { $p.Name }
    if ($p.Value -is [System.Management.Automation.PSCustomObject]) { Flat $p.Value $k } else { $k }
  }
}
$jsons = @(Get-ChildItem -LiteralPath $root -Recurse -File -Filter *.json | Where-Object {
  $_.FullName -notmatch "node_modules|\\\.next\\|\\docs\\" -and $_.DirectoryName -match "messages|locales|i18n|dictionaries"
})
if ($jsons.Count -lt 2) {
  $r.Add("No translation JSON files found (translations may live in .ts files).")
} else {
  foreach ($g in ($jsons | Group-Object DirectoryName)) {
    $sets = @{}
    foreach ($f in $g.Group) {
      try { $sets[$f.Name] = @(Flat (Get-Content -Raw -LiteralPath $f.FullName | ConvertFrom-Json) "") } catch { $r.Add("Could not parse $($f.Name)") }
    }
    if ($sets.Count -lt 2) { continue }
    $base = ($sets.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending | Select-Object -First 1).Key
    $r.Add("Folder: $(Rel $g.Name)  | reference: $base ($($sets[$base].Count) keys)")
    foreach ($name in $sets.Keys) {
      if ($name -eq $base) { continue }
      $missing = @($sets[$base] | Where-Object { $sets[$name] -notcontains $_ })
      $r.Add("  $name : $($sets[$name].Count) keys, missing $($missing.Count)")
      $missing | Select-Object -First 25 | ForEach-Object { $r.Add("      - $_") }
    }
  }
}

# 6. Large public files
Sec "LARGE PUBLIC FILES (over 400 KB, slows mobile)"
$pub = Join-Path $root "public"
if (Test-Path -LiteralPath $pub) {
  Get-ChildItem -LiteralPath $pub -Recurse -File | Where-Object { $_.Length -gt 400KB } | ForEach-Object { $r.Add(("{0,7} KB  {1}" -f [int]($_.Length / 1KB), (Rel $_.FullName))) }
}

# 7. Leftovers
Sec "LEFTOVER BACKUP FILES"
Get-ChildItem -LiteralPath $src -Recurse -File -Filter "*.bak" | ForEach-Object { $r.Add((Rel $_.FullName)) }

# 8. TypeScript
Sec "TYPESCRIPT CHECK (npx tsc --noEmit)"
$ts = @(npx tsc --noEmit 2>&1 | ForEach-Object { "$_" })
if ($LASTEXITCODE -eq 0) { $r.Add("No type errors.") } else { $r.Add("Lines: $($ts.Count)"); $ts | Select-Object -First 60 | ForEach-Object { $r.Add($_) } }

# 9. Lint
Sec "LINT (npm run lint)"
$pkg = Get-Content -Raw (Join-Path $root "package.json") | ConvertFrom-Json
if ($pkg.scripts.lint) {
  $lint = @(npm run lint 2>&1 | ForEach-Object { "$_" })
  $r.Add("Lines: $($lint.Count)")
  $lint | Select-Object -First 80 | ForEach-Object { $r.Add($_) }
} else { $r.Add("No lint script in package.json.") }

$r | Set-Content -LiteralPath $outFile -Encoding UTF8
Write-Host "Done. Report: $outFile" -ForegroundColor Green
