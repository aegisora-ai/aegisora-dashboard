param(
    [string]$BaseUrl = "http://127.0.0.1:3199",
    [string]$EvidenceDirectory = ".enterprise/phase-c13-real-jwt"
)

$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDirectory "../..")).Path
Push-Location $repoRoot
try {
    $envValues = @{}
    foreach ($envFile in @(".env.production.local", ".env.local")) {
        if (Test-Path $envFile) {
            Get-Content $envFile | ForEach-Object {
                if ($_ -match '^\s*([^#=]+)=(.*)$') {
                    $envValues[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
                }
            }
            if ($envValues.ContainsKey("SUPABASE_SERVICE_ROLE_KEY")) { break }
        }
    }

    $supabaseUrl = $envValues["NEXT_PUBLIC_SUPABASE_URL"]
    $anonKey = $envValues["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    if (-not $anonKey) { $anonKey = $envValues["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] }
    $serviceKey = $envValues["SUPABASE_SERVICE_ROLE_KEY"]
    if (-not $supabaseUrl -or -not $anonKey -or -not $serviceKey) {
        throw "Supabase test credentials are not fully configured."
    }

    $nonce = [guid]::NewGuid().ToString("N")
    $passwordBytes = [byte[]]::new(36)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($passwordBytes)
    $rng.Dispose()
    $password = [Convert]::ToBase64String($passwordBytes) + "Aa1!"
    [Array]::Clear($passwordBytes, 0, $passwordBytes.Length)
    $workspaceId = $null
    $userIds = [System.Collections.Generic.List[string]]::new()
    $tokens = @{}
    $authPreflight = [System.Collections.Generic.List[object]]::new()
    $results = [System.Collections.Generic.List[object]]::new()
    $cleanupErrors = [System.Collections.Generic.List[string]]::new()
    $workspaceDeleted = $false
    $usersDeleted = 0
    $stage = "initialization"
    $adminHeaders = @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey"; "Content-Type" = "application/json" }
    $restRoot = "$($supabaseUrl.TrimEnd('/'))/rest/v1"

    function Add-Result([string]$Name, [int]$Expected, [object]$Actual) {
        $status = [int]$Actual.status
        $item = @{ name = $Name; expected_status = $Expected; actual_status = $status; pass = ($Expected -eq $status) }
        if ($Actual.error_code) { $item.error_code = $Actual.error_code }
        if ($Actual.error_message) { $item.error_message = $Actual.error_message }
        $results.Add($item)
    }
    function Invoke-Api([string]$Role, [string]$Method, [string]$Path, [object]$Body = $null) {
        $headers = @{ Authorization = "Bearer $($tokens[$Role])"; "X-Workspace-Id" = $workspaceId }
        try {
            if ($null -ne $Body) {
                $headers["Content-Type"] = "application/json"
                $jsonBody = ConvertTo-Json -InputObject $Body -Depth 6 -Compress
                $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method -Headers $headers -Body $jsonBody -UseBasicParsing -TimeoutSec 20
                return @{ status = [int]$response.StatusCode }
            }
            $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method -Headers $headers -UseBasicParsing -TimeoutSec 20
            return @{ status = [int]$response.StatusCode }
        } catch {
            $response = $_.Exception.Response
            if ($response) {
                $code = $null
                try {
                    $stream = $response.GetResponseStream()
                    $reader = [System.IO.StreamReader]::new($stream)
                    $body = $reader.ReadToEnd()
                    $reader.Dispose()
                    $parsed = $body | ConvertFrom-Json
                    $code = $parsed.error.code
                } catch { }
                return @{ status = [int]$response.StatusCode; error_code = $code; error_message = $parsed.error.message }
            }
            throw
        }
    }

    try {
        $roles = @("OWNER", "ADMIN", "OPERATOR", "VIEWER", "TARGET")
        foreach ($role in $roles) {
            $stage = "create_user_$role"
            $email = "c13-$($role.ToLower())-$nonce@example.invalid"
            $newUser = Invoke-RestMethod -Uri "$($supabaseUrl.TrimEnd('/'))/auth/v1/admin/users" -Method POST -Headers $adminHeaders -Body (@{ email = $email; password = $password; email_confirm = $true; user_metadata = @{ full_name = "C13 Temporary $role" } } | ConvertTo-Json -Depth 5 -Compress) -TimeoutSec 20
            $userIds.Add([string]$newUser.id)
            $tokens[$role] = (Invoke-RestMethod -Uri "$($supabaseUrl.TrimEnd('/'))/auth/v1/token?grant_type=password" -Method POST -Headers @{ apikey = $anonKey; "Content-Type" = "application/json" } -Body (@{ email = $email; password = $password } | ConvertTo-Json -Compress) -TimeoutSec 20).access_token
        }
        foreach ($role in $roles) {
            $stage = "auth_preflight_$role"
            $authUser = Invoke-RestMethod -Uri "$($supabaseUrl.TrimEnd('/'))/auth/v1/user" -Method GET -Headers @{ apikey = $anonKey; Authorization = "Bearer $($tokens[$role])" } -TimeoutSec 20
            $roleIndex = [array]::IndexOf($roles, $role)
            $authPreflight.Add(@{ role = $role; status = 200; identity_matches = ([string]$authUser.id -eq $userIds[$roleIndex]) })
        }

        $stage = "create_workspace"
        $workspace = Invoke-RestMethod -Uri "$restRoot/workspaces?select=id" -Method POST -Headers ($adminHeaders + @{ Prefer = "return=representation" }) -Body (@{ name = "C13 temporary authorization test"; slug = "c13-$nonce"; created_by = $userIds[0] } | ConvertTo-Json -Compress) -TimeoutSec 20
        $workspaceId = [string]$workspace[0].id

        $stage = "create_memberships"
        $memberships = @(
            @{ workspace_id = $workspaceId; user_id = $userIds[0]; role = "OWNER"; status = "active" },
            @{ workspace_id = $workspaceId; user_id = $userIds[1]; role = "ADMIN"; status = "active" },
            @{ workspace_id = $workspaceId; user_id = $userIds[2]; role = "OPERATOR"; status = "active" },
            @{ workspace_id = $workspaceId; user_id = $userIds[3]; role = "VIEWER"; status = "active" },
            @{ workspace_id = $workspaceId; user_id = $userIds[4]; role = "VIEWER"; status = "active" }
        )
        Invoke-RestMethod -Uri "$restRoot/workspace_members" -Method POST -Headers ($adminHeaders + @{ Prefer = "return=minimal" }) -Body (ConvertTo-Json -InputObject $memberships -Depth 4 -Compress) -TimeoutSec 20 | Out-Null

        $membersPath = "/api/v1/workspace/members"
        $stage = "viewer_read"
        $response = Invoke-Api "VIEWER" "GET" $membersPath
        Add-Result "VIEWER team read" 200 $response
        $stage = "operator_read"
        $response = Invoke-Api "OPERATOR" "GET" $membersPath
        Add-Result "OPERATOR team read" 200 $response
        $stage = "owner_admin_mutation"
        $response = Invoke-Api "OWNER" "PATCH" $membersPath @{ user_id = $userIds[4]; role = "ADMIN" }
        Add-Result "OWNER promotes member to ADMIN" 200 $response
        $stage = "admin_normal_mutation"
        $response = Invoke-Api "ADMIN" "PATCH" $membersPath @{ user_id = $userIds[4]; role = "VIEWER" }
        Add-Result "ADMIN changes non-owner role" 200 $response
        $stage = "admin_cannot_promote_owner"
        $response = Invoke-Api "ADMIN" "PATCH" $membersPath @{ user_id = $userIds[2]; role = "OWNER" }
        Add-Result "ADMIN cannot promote OWNER" 403 $response
        $stage = "operator_cannot_manage"
        $response = Invoke-Api "OPERATOR" "PATCH" $membersPath @{ user_id = $userIds[4]; role = "VIEWER" }
        Add-Result "OPERATOR cannot manage team" 403 $response
        $stage = "viewer_cannot_manage"
        $response = Invoke-Api "VIEWER" "PATCH" $membersPath @{ user_id = $userIds[4]; role = "VIEWER" }
        Add-Result "VIEWER cannot manage team" 403 $response
    }
    catch {
        $results.Add(@{ name = "test_execution"; stage = $stage; expected_status = 200; actual_status = 0; pass = $false; error_type = $_.Exception.GetType().Name })
    }
    finally {
        if ($workspaceId) {
            try {
                Invoke-WebRequest -Uri "$restRoot/workspaces?id=eq.$workspaceId" -Method DELETE -Headers ($adminHeaders + @{ Prefer = "return=minimal" }) -UseBasicParsing -TimeoutSec 20 | Out-Null
                $probe = Invoke-RestMethod -Uri "$restRoot/workspaces?id=eq.$workspaceId&select=id" -Method GET -Headers $adminHeaders -UseBasicParsing -TimeoutSec 20
                $workspaceDeleted = (@($probe).Count -eq 0)
            } catch { $cleanupErrors.Add("workspace") }
        }
        foreach ($userId in $userIds) {
            try {
                Invoke-WebRequest -Uri "$($supabaseUrl.TrimEnd('/'))/auth/v1/admin/users/$userId" -Method DELETE -Headers $adminHeaders -UseBasicParsing -TimeoutSec 20 | Out-Null
                Invoke-RestMethod -Uri "$($supabaseUrl.TrimEnd('/'))/auth/v1/admin/users/$userId" -Method GET -Headers $adminHeaders -UseBasicParsing -TimeoutSec 20 | Out-Null
                $cleanupErrors.Add("auth_user_still_exists")
            } catch {
                $response = $_.Exception.Response
                if ($response -and [int]$response.StatusCode -eq 404) { $usersDeleted++ }
                else { $cleanupErrors.Add("auth_user_verification") }
            }
        }
        $password = $null
        $tokens.Clear()
        $serviceKey = $null
        $anonKey = $null
        $adminHeaders.Clear()
        $envValues.Clear()
    }

    $cleanupVerified = ($workspaceId -ne $null -and $workspaceDeleted -and $cleanupErrors.Count -eq 0 -and $userIds.Count -eq 5 -and $usersDeleted -eq 5)
    $result = @{
        control = "C13"
        timestamp_utc = [DateTime]::UtcNow.ToString("o")
        auth_preflight = @($authPreflight)
        workspace_id = $workspaceId
        temporary_user_ids = @($userIds)
        checks = @($results)
        cleanup = @{ verified = $cleanupVerified; errors = @($cleanupErrors); temporary_users_deleted = ($usersDeleted -eq 5); workspace_deleted = $workspaceDeleted }
        status = if (@($results | Where-Object { -not $_.pass }).Count -eq 0 -and $results.Count -eq 7 -and $cleanupVerified) { "PASS" } else { "FAIL" }
    }
    New-Item -ItemType Directory -Path $EvidenceDirectory -Force | Out-Null
    $result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $EvidenceDirectory "result.json") -Encoding utf8
    $result | ConvertTo-Json -Depth 6
    if ($result.status -ne "PASS") { exit 1 }
}
finally {
    Pop-Location
}
