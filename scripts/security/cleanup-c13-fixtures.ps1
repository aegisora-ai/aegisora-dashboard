param(
    [Parameter(Mandatory = $true)][string]$WorkspaceId,
    [Parameter(Mandatory = $true)][string[]]$UserIds
)

$ErrorActionPreference = "Stop"
$UserIds = @($UserIds | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$envValues = @{}
Get-Content .env.production.local | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $envValues[$matches[1].Trim()] = $matches[2].Trim().Trim('"') }
}
$url = $envValues["NEXT_PUBLIC_SUPABASE_URL"].TrimEnd('/')
$key = $envValues["SUPABASE_SERVICE_ROLE_KEY"]
$headers = @{ apikey = $key; Authorization = "Bearer $key"; "Content-Type" = "application/json" }
$cleanup = @{ workspace_deleted = $false; user_ids_deleted = @(); errors = @() }
try {
    Invoke-WebRequest -Uri "$url/rest/v1/workspaces?id=eq.$WorkspaceId" -Method DELETE -Headers $headers -UseBasicParsing -TimeoutSec 20 | Out-Null
    $workspaceProbe = Invoke-RestMethod -Uri "$url/rest/v1/workspaces?id=eq.$WorkspaceId&select=id" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 20
    $cleanup.workspace_deleted = (@($workspaceProbe).Count -eq 0)
} catch { $cleanup.errors += "workspace" }
foreach ($userId in $UserIds) {
    try { Invoke-WebRequest -Uri "$url/auth/v1/admin/users/$userId" -Method DELETE -Headers $headers -UseBasicParsing -TimeoutSec 20 | Out-Null } catch { }
    try {
        Invoke-RestMethod -Uri "$url/auth/v1/admin/users/$userId" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 20 | Out-Null
        $cleanup.errors += "auth_user_still_exists"
    } catch {
        $response = $_.Exception.Response
        if ($response -and [int]$response.StatusCode -eq 404) { $cleanup.user_ids_deleted += $userId }
        else { $cleanup.errors += "auth_user_verification" }
    }
}
$envValues.Clear()
$key = $null
$headers.Clear()
$cleanup | ConvertTo-Json -Depth 5
if (-not $cleanup.workspace_deleted -or $cleanup.user_ids_deleted.Count -ne $UserIds.Count -or $cleanup.errors.Count -gt 0) { exit 1 }
