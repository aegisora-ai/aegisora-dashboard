# Aegisora pilot closeout: read-only production checks + local quality gates.
# Does NOT modify source, apply migrations, deploy to production, or charge payments.
$ErrorActionPreference = 'Continue'
$Root = 'C:\AI\AEGISORA\website4'
$StagingRef = 'bvdsfwmlylnmahridalj'
$ProductionRef = 'hypbttzeqeupwdzbgwbd'
$PublicUrl = 'https://www.aegisora.org'
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$Utf8 = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path -LiteralPath $Root)) {
    Write-Host "BLOCKED: project folder not found: $Root" -ForegroundColor Red
    Write-Host 'Change $Root at the top of this script to the actual website4 folder, then run again.'
} else {
    Set-Location -LiteralPath $Root
    $ReportDir = Join-Path $Root '.enterprise'
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
    $ReportPath = Join-Path $ReportDir "pilot-closeout-$Stamp.json"
    $TempEnv = Join-Path $env:TEMP "aegisora-prod-env-$Stamp.env"

    $Checks = [System.Collections.Generic.List[object]]::new()
    $SecretValues = [System.Collections.Generic.List[string]]::new()
    $LivePages = [System.Collections.Generic.List[object]]::new()

    function Add-Check {
        param([string]$Name, [string]$Status, [string]$Detail = '')
        $Checks.Add([PSCustomObject]@{ name = $Name; status = $Status; detail = $Detail }) | Out-Null
        $Colour = if ($Status -eq 'PASS') { 'Green' } elseif ($Status -match 'BLOCKED|FAIL|REVIEW') { 'Red' } else { 'Yellow' }
        Write-Host ("{0,-34} {1} {2}" -f $Name, $Status, $Detail) -ForegroundColor $Colour
    }

    function Protect-Text {
        param([string]$Text)
        $Safe = [string]$Text
        foreach ($Value in $SecretValues) {
            if (-not [string]::IsNullOrWhiteSpace($Value)) { $Safe = $Safe.Replace($Value, '[REDACTED]') }
        }
        return ($Safe `
            -replace 'sk_(test|live)_[A-Za-z0-9]+', '[REDACTED_STRIPE_KEY]' `
            -replace 'pk_(test|live)_[A-Za-z0-9]+', '[REDACTED_STRIPE_PUBLIC_KEY]' `
            -replace 'whsec_[A-Za-z0-9]+', '[REDACTED_WEBHOOK_SECRET]' `
            -replace 'sb_secret_[A-Za-z0-9_-]+', '[REDACTED_SUPABASE_SECRET]' `
            -replace 'sb_publishable_[A-Za-z0-9_-]+', '[REDACTED_SUPABASE_PUBLIC]' `
            -replace 'eyJ[A-Za-z0-9_.-]{20,}', '[REDACTED_JWT]')
    }

    function Read-EnvValue {
        param([string]$Path, [string]$Name)
        if (-not (Test-Path -LiteralPath $Path)) { return '' }
        $Pattern = '^\s*(?:export\s+)?' + [regex]::Escape($Name) + '\s*=\s*(.*?)\s*$'
        foreach ($Line in (Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue)) {
            if ($Line -match $Pattern) {
                $Value = $Matches[1].Trim()
                if ($Value.Length -ge 2 -and (($Value.StartsWith('"') -and $Value.EndsWith('"')) -or ($Value.StartsWith("'") -and $Value.EndsWith("'")))) {
                    $Value = $Value.Substring(1, $Value.Length - 2)
                }
                return $Value
            }
        }
        return ''
    }

    function Get-HttpStatus {
        param([string]$Method, [string]$Uri, [hashtable]$Headers = @{})
        try {
            if ($Method -eq 'POST') {
                $Response = Invoke-WebRequest -Uri $Uri -Method Post -Headers $Headers -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
            } else {
                $Response = Invoke-WebRequest -Uri $Uri -Method Get -Headers $Headers -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
            }
            return [int]$Response.StatusCode
        } catch {
            try { if ($null -ne $_.Exception.Response) { return [int]$_.Exception.Response.StatusCode } } catch {}
            return 0
        }
    }

    function Invoke-QualityGate {
        param([string]$Name, [string[]]$Arguments)
        Write-Host "`n--- $Name ---" -ForegroundColor Cyan
        $Output = @()
        $Code = 9009
        try {
            $Output = @(& npm.cmd @Arguments 2>&1)
            $Code = [int]$LASTEXITCODE
        } catch { $Output = @('Command could not start; check Node.js/npm installation.') }
        if ($Code -eq 0) {
            Add-Check $Name 'PASS' 'exit code 0'
        } else {
            Add-Check $Name 'FAIL' ("exit code {0}" -f $Code)
            $Tail = @($Output | Select-Object -Last 12)
            foreach ($Line in $Tail) { Write-Host (Protect-Text ([string]$Line)) }
        }
        return $Code
    }

    try {
    Write-Host "`nAEGISORA PILOT CLOSEOUT — READ ONLY" -ForegroundColor Cyan
    Write-Host "Root: $Root"
    Write-Host 'No code changes, production deploy, migrations, or payments will be performed.'

    # Capture likely process secrets for redaction; values are never written to the report.
    foreach ($Entry in (Get-ChildItem Env: -ErrorAction SilentlyContinue)) {
        if ($Entry.Name -match '(?i)(KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL|CONNECTION_STRING)' -and $Entry.Value.Length -gt 12) {
            $SecretValues.Add([string]$Entry.Value) | Out-Null
        }
    }

    # Read local environment file values into memory only for redaction and cleanup safety.
    foreach ($EnvFile in @('.env', '.env.local', '.env.production', '.env.production.local')) {
        $Path = Join-Path $Root $EnvFile
        if (Test-Path -LiteralPath $Path) {
            foreach ($Line in (Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue)) {
                if ($Line -match '^\s*(?:export\s+)?([A-Za-z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
                    $V = $Matches[2].Trim().Trim('"').Trim("'")
                    if ($V.Length -gt 12) { $SecretValues.Add($V) | Out-Null }
                }
            }
        }
    }

    $PackagePath = Join-Path $Root 'package.json'
    $Package = $null
    if (Test-Path -LiteralPath $PackagePath) {
        try { $Package = Get-Content -LiteralPath $PackagePath -Raw | ConvertFrom-Json } catch {}
    }
    if ($null -ne $Package) { Add-Check 'package_json' 'PASS' 'parsed' } else { Add-Check 'package_json' 'BLOCKED' 'package.json missing or invalid JSON' }

    $Branch = ''
    try { $Branch = [string](& git branch --show-current 2>$null | Select-Object -First 1) } catch {}
    $GitChanges = @()
    try { $GitChanges = @(& git status --short 2>$null) } catch {}
    Add-Check 'git_branch' $(if ($Branch) { 'PASS' } else { 'REVIEW' }) $(if ($Branch) { $Branch } else { 'git unavailable' })
    Add-Check 'working_tree' $(if ($GitChanges.Count -eq 0) { 'PASS' } else { 'REVIEW' }) ("{0} changed/untracked entries; preserved" -f $GitChanges.Count)

    # Local code quality gates; each is run at most once.
    if ($null -ne $Package -and $null -ne $Package.scripts) {
        foreach ($Name in @('typecheck', 'lint', 'build')) {
            if ($Package.scripts.PSObject.Properties.Name -contains $Name) {
                [void](Invoke-QualityGate $Name @('run', $Name))
            } else {
                Add-Check $Name 'BLOCKED' 'script absent from package.json'
            }
        }
        foreach ($ScriptName in @('verify-revenue-v1', 'revenue-api-smoke', 'verify-policy-and-redaction')) {
            $ScriptPath = switch ($ScriptName) {
                'verify-revenue-v1' { Join-Path $Root 'scripts\security\verify-revenue-v1.mjs' }
                'revenue-api-smoke' { Join-Path $Root 'scripts\security\revenue-api-smoke.mjs' }
                'verify-policy-and-redaction' { Join-Path $Root 'scripts\security\verify-policy-and-redaction.mjs' }
            }
            if (Test-Path -LiteralPath $ScriptPath) {
                Write-Host "`n--- $ScriptName ---" -ForegroundColor Cyan
                $Out = @(& node.exe $ScriptPath 2>&1); $Code = [int]$LASTEXITCODE
                if ($Code -eq 0) { Add-Check $ScriptName 'PASS' 'exit code 0' }
                else {
                    Add-Check $ScriptName 'FAIL' ("exit code {0}" -f $Code)
                    foreach ($Line in @($Out | Select-Object -Last 10)) { Write-Host (Protect-Text ([string]$Line)) }
                }
            } else { Add-Check $ScriptName 'NOT_PRESENT' 'optional script not found' }
        }
    }

    # Check whether the server helper recognizes modern Supabase secret keys, without modifying source.
    $ServerHelper = Join-Path $Root 'src\lib\aegisora\server.ts'
    if (Test-Path -LiteralPath $ServerHelper) {
        $ServerHelperText = Get-Content -LiteralPath $ServerHelper -Raw -ErrorAction SilentlyContinue
        if ($ServerHelperText -match 'SUPABASE_SECRET_KEY') {
            Add-Check 'server_helper_key_compatibility' 'PASS' 'modern SUPABASE_SECRET_KEY reference exists'
        } else {
            Add-Check 'server_helper_key_compatibility' 'REVIEW' 'server helper does not visibly reference SUPABASE_SECRET_KEY; verify legacy/new key support'
        }
    } else {
        Add-Check 'server_helper_key_compatibility' 'REVIEW' 'expected helper path not found; inspect current server client implementation'
    }

    # Existing explicit staging env only; never guess whether a local .env points to staging.
    $E2EUrl = [string]$env:AEGISORA_E2E_SUPABASE_URL
    $E2ESecret = [string]$env:AEGISORA_E2E_SUPABASE_SECRET_KEY
    if (-not $E2ESecret) { $E2ESecret = [string]$env:AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY }
    $E2EPub = [string]$env:AEGISORA_E2E_SUPABASE_PUBLISHABLE_KEY
    if (-not $E2EPub) { $E2EPub = [string]$env:AEGISORA_E2E_SUPABASE_ANON_KEY }
    if ($E2EUrl -eq "https://$StagingRef.supabase.co" -and $E2ESecret -and $E2EPub) {
        Add-Check 'staging_e2e_credentials' 'PASS' 'explicit staging-only environment variables present'
        foreach ($Name in @('test:enterprise:auth-fixture','test:enterprise:mfa-fixture','test:enterprise:team-lifecycle','test:enterprise:agent-api')) {
            if ($null -ne $Package -and $null -ne $Package.scripts -and $Package.scripts.PSObject.Properties.Name -contains $Name) { [void](Invoke-QualityGate $Name @('run', $Name)) }
            else { Add-Check $Name 'NOT_PRESENT' 'script absent from package.json or package.json unavailable' }
        }
        $EvalPath = Join-Path $Root 'scripts\security\phase-c19-c20-evaluate-e2e.mjs'
        if (Test-Path -LiteralPath $EvalPath) {
            Write-Host "`n--- evaluation_e2e ---" -ForegroundColor Cyan
            $EvalOut = @(& node.exe $EvalPath 2>&1); $EvalCode = [int]$LASTEXITCODE
            if ($EvalCode -eq 0) { Add-Check 'evaluation_e2e' 'PASS' 'staging evaluation/evidence E2E exit code 0' }
            else {
                Add-Check 'evaluation_e2e' 'FAIL' ("exit code {0}" -f $EvalCode)
                foreach ($Line in @($EvalOut | Select-Object -Last 10)) { Write-Host (Protect-Text ([string]$Line)) }
            }
        } else { Add-Check 'evaluation_e2e' 'NOT_PRESENT' 'staging E2E script not found' }
    } else {
        Add-Check 'staging_e2e_credentials' 'NOT_RUN' 'no explicit staging-only credentials in this PowerShell session; no project keys were fetched'
        Add-Check 'staging_security_e2e' 'NOT_VERIFIED' 'do not mark enterprise pilot-ready until staging auth/RBAC/agent tests pass'
    }

    # Vercel project identity + production env: read-only. Env file is temporary and deleted below.
    $LocalVercelPath = Join-Path $Root '.vercel\project.json'
    $LocalProjectId = ''
    if (Test-Path -LiteralPath $LocalVercelPath) {
        try { $LocalProjectId = [string]((Get-Content -LiteralPath $LocalVercelPath -Raw | ConvertFrom-Json).projectId) } catch {}
    }
    if ($LocalProjectId) { Add-Check 'vercel_local_project_link' 'PASS' 'project link exists' } else { Add-Check 'vercel_local_project_link' 'BLOCKED' '.vercel/project.json or projectId missing' }

    $DomainProjectId = ''
    try {
        $InspectOut = @(& npx.cmd vercel inspect $PublicUrl --json 2>&1)
        $InspectCode = [int]$LASTEXITCODE
        $InspectText = [string]::Join("`n", [string[]]@($InspectOut | ForEach-Object { [string]$_ }))
        $FirstBrace = $InspectText.IndexOf('{'); $LastBrace = $InspectText.LastIndexOf('}')
        if ($InspectCode -eq 0 -and $FirstBrace -ge 0 -and $LastBrace -gt $FirstBrace) {
            $InspectJson = $InspectText.Substring($FirstBrace, $LastBrace - $FirstBrace + 1) | ConvertFrom-Json
            $DomainProjectId = [string]$InspectJson.projectId
        }
    } catch {}
    if ($LocalProjectId -and $DomainProjectId -and $LocalProjectId -eq $DomainProjectId) { Add-Check 'vercel_domain_project_alignment' 'PASS' 'live domain and local linked project IDs match' }
    elseif ($LocalProjectId -and $DomainProjectId) { Add-Check 'vercel_domain_project_alignment' 'BLOCKED' 'live domain and local project IDs differ; do not deploy from this folder' }
    else { Add-Check 'vercel_domain_project_alignment' 'NOT_VERIFIED' 'Vercel CLI auth/inspect did not provide both project IDs' }

    $EnvPulled = $false
    try {
        $PullOut = @(& npx.cmd vercel env pull $TempEnv '--environment=production' '--yes' 2>&1)
        $PullCode = [int]$LASTEXITCODE
        $EnvPulled = ($PullCode -eq 0 -and (Test-Path -LiteralPath $TempEnv))
    } catch { $EnvPulled = $false }

    $ProdSupabaseUrl = ''; $ProdServerKey = ''; $ProdStripeKey = ''; $ProdWebhookSecret = ''; $PilotPrice = ''
    if ($EnvPulled) {
        $ProdSupabaseUrl = Read-EnvValue $TempEnv 'NEXT_PUBLIC_SUPABASE_URL'
        if (-not $ProdSupabaseUrl) { $ProdSupabaseUrl = Read-EnvValue $TempEnv 'SUPABASE_URL' }
        $ProdServerKey = Read-EnvValue $TempEnv 'SUPABASE_SECRET_KEY'
        if (-not $ProdServerKey) { $ProdServerKey = Read-EnvValue $TempEnv 'SUPABASE_SERVICE_ROLE_KEY' }
        $ProdStripeKey = Read-EnvValue $TempEnv 'STRIPE_SECRET_KEY'
        $ProdWebhookSecret = Read-EnvValue $TempEnv 'STRIPE_WEBHOOK_SECRET'
        $PilotPrice = Read-EnvValue $TempEnv 'STRIPE_PRICE_FOUNDER_PILOT'
        if (-not $PilotPrice) { $PilotPrice = Read-EnvValue $TempEnv 'STRIPE_PRICE_PILOT' }
        foreach ($V in @($ProdServerKey,$ProdStripeKey,$ProdWebhookSecret)) { if ($V) { $SecretValues.Add($V) | Out-Null } }

        if ($ProdSupabaseUrl -eq "https://$ProductionRef.supabase.co" -and ($ProdServerKey.StartsWith('sb_secret_') -or $ProdServerKey.StartsWith('eyJ'))) {
            Add-Check 'production_supabase_environment' 'PASS' 'expected project URL + supported server-key format'
        } elseif ($ProdSupabaseUrl -ne "https://$ProductionRef.supabase.co") {
            Add-Check 'production_supabase_environment' 'BLOCKED' 'production URL does not match the expected project ref'
        } else { Add-Check 'production_supabase_environment' 'BLOCKED' 'server key missing or unsupported; values were not printed' }

        if ($ProdSupabaseUrl -eq "https://$ProductionRef.supabase.co" -and ($ProdServerKey.StartsWith('sb_secret_') -or $ProdServerKey.StartsWith('eyJ'))) {
            $DbHeaders = @{ 'apikey' = $ProdServerKey }
            if ($ProdServerKey.StartsWith('eyJ')) { $DbHeaders['Authorization'] = "Bearer $ProdServerKey" }
            $EntStatus = Get-HttpStatus 'GET' "$ProdSupabaseUrl/rest/v1/workspace_entitlements?select=workspace_id&limit=0" $DbHeaders
            if ($EntStatus -eq 200) { Add-Check 'production_entitlements_table' 'PASS' 'table endpoint returned HTTP 200; zero rows requested' }
            else { Add-Check 'production_entitlements_table' 'BLOCKED' ("HTTP {0}; no customer rows were requested" -f $EntStatus) }
        } else { Add-Check 'production_entitlements_table' 'NOT_RUN' 'blocked by production environment validation' }
    } else {
        Add-Check 'vercel_production_env_pull' 'BLOCKED' 'Vercel CLI unauthenticated or env pull failed'
        Add-Check 'production_supabase_environment' 'NOT_VERIFIED' 'production environment not inspected'
        Add-Check 'production_entitlements_table' 'NOT_VERIFIED' 'production environment not inspected'
    }

    # Stripe checks are optional for a managed/design-partner pilot. Never create a payment.
    if ($ProdStripeKey.StartsWith('sk_live_') -and $PilotPrice.StartsWith('price_')) {
        try {
            $Account = Invoke-RestMethod -Uri 'https://api.stripe.com/v1/account' -Headers @{ Authorization = "Bearer $ProdStripeKey" } -TimeoutSec 20 -ErrorAction Stop
            $Price = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices/$PilotPrice" -Headers @{ Authorization = "Bearer $ProdStripeKey" } -TimeoutSec 20 -ErrorAction Stop
            if ($Account.id -and $Price.id -eq $PilotPrice -and $Price.active -eq $true -and $Price.livemode -eq $true) {
                Add-Check 'stripe_live_pilot_price' 'PASS' 'live account and one active live pilot price verified (read-only)'
            } else { Add-Check 'stripe_live_pilot_price' 'BLOCKED' 'account/price not active in live mode' }
        } catch { Add-Check 'stripe_live_pilot_price' 'BLOCKED' 'Stripe read-only API verification failed; details suppressed' }
    } else {
        Add-Check 'stripe_live_pilot_price' 'OPTIONAL_FOR_MANAGED_PILOT' 'self-service checkout not required to start a manually onboarded pilot; do not claim payment automation verified'
    }
    if ($ProdWebhookSecret.StartsWith('whsec_')) { Add-Check 'stripe_webhook_secret_presence' 'PASS' 'secret exists; endpoint signing and real checkout are not proven' }
    else { Add-Check 'stripe_webhook_secret_presence' 'OPTIONAL_FOR_MANAGED_PILOT' 'no live webhook secret detected in production env' }

    # Live site probes + public marketing claim audit.
    foreach ($Page in @(@{name='homepage';url=$PublicUrl},@{name='security_page';url="$PublicUrl/security"},@{name='business_page';url="$PublicUrl/business"})) {
        $Status = 0; $Html = ''
        try {
            $Resp = Invoke-WebRequest -Uri $Page.url -Method Get -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
            $Status = [int]$Resp.StatusCode; $Html = [string]$Resp.Content
        } catch {
            try { if ($null -ne $_.Exception.Response) { $Status = [int]$_.Exception.Response.StatusCode } } catch {}
        }
        $LivePages.Add([PSCustomObject]@{ name=$Page.name; url=$Page.url; http_status=$Status }) | Out-Null
        Add-Check ("live_" + $Page.name) $(if ($Status -eq 200) {'PASS'} else {'REVIEW'}) ("HTTP {0}" -f $Status)
        if ($Html) {
            $HasDemoLabel = $Html -match '(?i)illustrative|sample data|demo data|example only'
            if ($Html -match '(?i)SOC\s*2|HIPAA|99\.9%|uptime SLA|certified|compliant') {
                Add-Check ("marketing_claims_" + $Page.name) 'REVIEW' $(if ($HasDemoLabel) {'contains security/compliance terms; confirm only evidence-backed claims remain'} else {'security/compliance/SLA terms found; remove or substantiate claims before enterprise outreach'})
            } else { Add-Check ("marketing_claims_" + $Page.name) 'PASS' 'no obvious SOC2/HIPAA/SLA claim pattern detected in fetched HTML' }
            if ($Page.name -eq 'homepage' -and $Html -match '(?i)Aegisora\s*3\.0') { Add-Check 'stale_homepage_version' 'REVIEW' 'homepage references Aegisora 3.0 while the launch narrative says 4.0' }
            if ($Page.name -eq 'business_page' -and $Html -match '(?i)Live Telemetry Active|0 Critical Incidents|98 Secure' -and -not $HasDemoLabel) { Add-Check 'business_demo_metrics' 'REVIEW' 'dashboard-like sample metrics found without an obvious page-level demo label' }
        }
    }

    # Source-level scan catches claims even if a page did not render or was localized.
    $SourceRoots = @('src','app','components','messages','public')
    $SourceFlags = [System.Collections.Generic.List[object]]::new()
    foreach ($RelativeRoot in $SourceRoots) {
        $FullRoot = Join-Path $Root $RelativeRoot
        if (-not (Test-Path -LiteralPath $FullRoot)) { continue }
        $Files = @(Get-ChildItem -LiteralPath $FullRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in @('.ts','.tsx','.js','.jsx','.json','.md','.html') -and $_.FullName -notmatch '[\\/](node_modules|\.next|\.git|\.enterprise)[\\/]' })
        foreach ($File in $Files) {
            $Content = Get-Content -LiteralPath $File.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $Content) { continue }
            foreach ($Pattern in @('SOC\s*2','HIPAA','99\.9%','Aegisora\s*3\.0','Live Telemetry Active','0 Critical Incidents','under\s*5\s*ms','millions of test scenarios')) {
                if ($Content -match $Pattern) {
                    $SourceFlags.Add([PSCustomObject]@{ file=$File.FullName.Substring($Root.Length).TrimStart('\'); pattern=$Pattern }) | Out-Null
                }
            }
        }
    }
    if ($SourceFlags.Count -gt 0) {
        Add-Check 'source_marketing_claim_scan' 'REVIEW' ("{0} file/pattern matches; inspect matching entries in the JSON report" -f $SourceFlags.Count)
    } else { Add-Check 'source_marketing_claim_scan' 'PASS' 'no common high-risk claim/stale-version patterns found in scanned roots' }

    # Closeout computation deliberately cannot certify paid end-to-end readiness.
    $Passes = @($Checks | Where-Object { $_.status -eq 'PASS' }).Count
    $HardFailures = @($Checks | Where-Object { $_.status -match '^(BLOCKED|FAIL)$' }).Count
    $Unverified = @($Checks | Where-Object { $_.status -match 'NOT_VERIFIED|NOT_RUN|REVIEW$' }).Count
    $PilotStatus = if ($HardFailures -gt 0) { 'NOT_READY_FIX_BLOCKERS' } elseif ($Unverified -gt 0) { 'NOT_CERTIFIED_UNVERIFIED_GATES' } else { 'CONFIGURATION_CHECKS_PASS_MANUAL_PILOT_STILL_REQUIRED' }

    $Report = [ordered]@{
        created_at_utc = [DateTime]::UtcNow.ToString('o')
        project_root = $Root
        staging_project_ref = $StagingRef
        production_project_ref_expected = $ProductionRef
        git_branch = $Branch
        working_tree_change_count = $GitChanges.Count
        checks = @($Checks)
        public_pages = @($LivePages)
        marketing_source_matches = @($SourceFlags)
        checks_passed_count = $Passes
        hard_failure_count = $HardFailures
        unverified_or_review_count = $Unverified
        pilot_readiness = $PilotStatus
        paid_checkout_end_to_end = 'NOT_TESTED_NO_REAL_PAYMENT_CREATED'
        production_deployment = 'NOT_PERFORMED'
        production_migrations = 'NOT_PERFORMED'
        secrets_printed = $false
    }
    [System.IO.File]::WriteAllText($ReportPath, ($Report | ConvertTo-Json -Depth 8), $Utf8)

    if (Test-Path -LiteralPath $TempEnv) { Remove-Item -LiteralPath $TempEnv -Force -ErrorAction SilentlyContinue }
    Write-Host "`n================ FINAL SUMMARY ================" -ForegroundColor Cyan
    Write-Host ("PASS checks: {0}" -f $Passes)
    Write-Host ("Hard failures: {0}" -f $HardFailures)
    Write-Host ("Unverified/review items: {0}" -f $Unverified)
    Write-Host ("PILOT READINESS: {0}" -f $PilotStatus) -ForegroundColor $(if ($PilotStatus -like 'NOT_READY*') {'Red'} else {'Yellow'})
    Write-Host "Report: $ReportPath"
    Write-Host 'No secrets printed. No code changed. No migration or production deployment performed. No payment created.'
    } finally {
        if (Test-Path -LiteralPath $TempEnv) { Remove-Item -LiteralPath $TempEnv -Force -ErrorAction SilentlyContinue }
    }
}
