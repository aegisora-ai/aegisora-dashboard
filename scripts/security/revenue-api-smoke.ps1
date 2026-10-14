$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$Port = 3399
$BaseUrl = "http://127.0.0.1:$Port"

$LogDir = Join-Path $Root ".enterprise"
$OutLog = Join-Path $LogDir "revenue-production-smoke.log"
$ErrLog = Join-Path $LogDir "revenue-production-smoke-error.log"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (Test-Path -LiteralPath $OutLog) {
    Remove-Item -LiteralPath $OutLog -Force -ErrorAction SilentlyContinue
}

if (Test-Path -LiteralPath $ErrLog) {
    Remove-Item -LiteralPath $ErrLog -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AEGISORA LOCAL PRODUCTION REVENUE API SMOKE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ServerProcess = $null
$Failures = 0

function Pass {
    param(
        [string]$Name,
        [string]$Message
    )

    Write-Host ("[PASS] " + $Name + " -> " + $Message) -ForegroundColor Green
}

function Fail {
    param(
        [string]$Name,
        [string]$Message
    )

    $script:Failures++

    Write-Host ("[FAIL] " + $Name + " -> " + $Message) -ForegroundColor Red
}

function Get-HttpStatus {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Body = $null
    )

    try {

        $Params = @{
            Uri = $Uri
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
            MaximumRedirection = 0
            ErrorAction = "Stop"
        }

        if ($null -ne $Body) {
            $Params["ContentType"] = "application/json"
            $Params["Body"] = $Body
        }

        $Response = Invoke-WebRequest @Params

        return [int]$Response.StatusCode
    }
    catch {

        if ($null -ne $_.Exception.Response) {
            try {
                return [int]$_.Exception.Response.StatusCode
            }
            catch {
            }
        }

        return -1
    }
}

try {

    Write-Host "[INFO] Starting Next.js production server on port $Port..." -ForegroundColor Yellow

    $ServerProcess = Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList @(
            "run",
            "start",
            "--",
            "-p",
            $Port
        ) `
        -WorkingDirectory $Root `
        -RedirectStandardOutput $OutLog `
        -RedirectStandardError $ErrLog `
        -PassThru `
        -WindowStyle Hidden

    if ($null -eq $ServerProcess) {
        Fail `
            "Production server" `
            "Start-Process returned no process."

        return
    }

    Write-Host ("[INFO] Production server PID = " + $ServerProcess.Id) -ForegroundColor DarkGray

    $Ready = $false

    for ($Attempt = 1; $Attempt -le 45; $Attempt++) {

        Start-Sleep -Seconds 1

        if ($ServerProcess.HasExited) {
            break
        }

        $RootStatus = Get-HttpStatus `
            -Uri ($BaseUrl + "/")

        if (
            $RootStatus -ge 200 -and
            $RootStatus -lt 500
        ) {
            $Ready = $true
            break
        }
    }

    if (-not $Ready) {

        $ErrorTail = ""

        if (Test-Path -LiteralPath $ErrLog) {
            $ErrorTail = (
                Get-Content `
                    -LiteralPath $ErrLog `
                    -Tail 20 `
                    -ErrorAction SilentlyContinue
            ) -join "`n"
        }

        Fail `
            "Production server" `
            "Server did not become ready."

        if ($ErrorTail) {
            Write-Host ""
            Write-Host "SERVER ERROR LOG:" -ForegroundColor Yellow
            Write-Host $ErrorTail -ForegroundColor DarkYellow
        }

        return
    }

    Pass `
        "Production server" `
        "HTTP server is responding."

    # ========================================================
    # BILLING STATUS
    # ========================================================

    $StatusCode = Get-HttpStatus `
        -Uri ($BaseUrl + "/api/billing/status")

    if ($StatusCode -eq 401) {
        Pass `
            "Billing status authentication" `
            "HTTP 401"
    }
    else {
        Fail `
            "Billing status authentication" `
            ("HTTP " + $StatusCode + ", expected HTTP 401")
    }

    # ========================================================
    # CHECKOUT
    # ========================================================

    $CheckoutBody = '{"plan":"team"}'

    $CheckoutCode = Get-HttpStatus `
        -Uri ($BaseUrl + "/api/stripe/checkout") `
        -Method "POST" `
        -Body $CheckoutBody

    if ($CheckoutCode -eq 401) {
        Pass `
            "Checkout authentication" `
            "HTTP 401"
    }
    else {
        Fail `
            "Checkout authentication" `
            ("HTTP " + $CheckoutCode + ", expected HTTP 401")
    }

    # ========================================================
    # PORTAL
    # ========================================================

    $PortalCode = Get-HttpStatus `
        -Uri ($BaseUrl + "/api/stripe/portal") `
        -Method "POST" `
        -Body "{}"

    if ($PortalCode -eq 401) {
        Pass `
            "Billing portal authentication" `
            "HTTP 401"
    }
    else {
        Fail `
            "Billing portal authentication" `
            ("HTTP " + $PortalCode + ", expected HTTP 401")
    }

    # ========================================================
    # WEBHOOK SIGNATURE
    # ========================================================

    $WebhookCode = Get-HttpStatus `
        -Uri ($BaseUrl + "/api/stripe/webhook") `
        -Method "POST" `
        -Body '{"type":"test.event"}'

    if (
        $WebhookCode -eq 400 -or
        $WebhookCode -eq 503
    ) {
        Pass `
            "Webhook unsigned request rejection" `
            ("HTTP " + $WebhookCode)
    }
    else {
        Fail `
            "Webhook unsigned request rejection" `
            ("HTTP " + $WebhookCode + ", expected HTTP 400 or 503")
    }

}
catch {

    Fail `
        "Revenue API smoke" `
        $_.Exception.Message
}
finally {

    if ($null -ne $ServerProcess) {

        Write-Host ""
        Write-Host "[INFO] Stopping production server..." -ForegroundColor DarkGray

        try {

            & taskkill `
                /PID $ServerProcess.Id `
                /T `
                /F `
                2>$null |
                Out-Null

        }
        catch {
        }
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host " REVENUE API SMOKE RESULT"
Write-Host "============================================================"
Write-Host ""

if ($Failures -eq 0) {

    Write-Host "LOCAL PRODUCTION REVENUE API = GREEN" -ForegroundColor Green
    Write-Host ""
    Write-Host "All unauthenticated revenue boundaries behaved correctly." -ForegroundColor Green

}
else {

    Write-Host `
        ("LOCAL PRODUCTION REVENUE API = RED (" + $Failures + " failure(s))") `
        -ForegroundColor Red
}

Write-Host ""

if ($Failures -eq 0) {
    exit 0
}
else {
    exit 1
}