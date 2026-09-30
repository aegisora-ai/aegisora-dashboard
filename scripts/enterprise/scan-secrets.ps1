$ErrorActionPreference = "Continue"

Set-Location -LiteralPath "C:\AI\AEGISORA\website4"

$patterns = @(
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "GROQ_API_KEY",
    "BEGIN PRIVATE KEY",
    "AKIA[0-9A-Z]{16}"
)

$files = Get-ChildItem `
    -Path "." `
    -Recurse `
    -File `
    -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "\\node_modules\\" -and
        $_.FullName -notmatch "\\.next\\" -and
        $_.FullName -notmatch "\\.git\\" -and
        $_.FullName -notmatch "\\.enterprise-backup-"
    }

$hits = @()

foreach ($file in $files) {
    foreach ($pattern in $patterns) {
        $matches = Select-String `
            -LiteralPath $file.FullName `
            -Pattern $pattern `
            -ErrorAction SilentlyContinue

        if ($matches) {
            foreach ($m in $matches) {
                $hits += [PSCustomObject]@{
                    file = $file.FullName
                    line = $m.LineNumber
                    pattern = $pattern
                }
            }
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AEGISORA SECRET EXPOSURE SCAN" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($hits.Count -eq 0) {
    Write-Host "No secret-pattern matches found." -ForegroundColor Green
} else {
    Write-Host "Potential secret-pattern matches: $($hits.Count)" -ForegroundColor Red
    $hits | Format-Table -AutoSize
}
