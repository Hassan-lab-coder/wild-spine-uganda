param(
  [string]$Environment = "production",
  [ValidateSet("sandbox", "live")]
  [string]$TazapayMode = "sandbox",
  [switch]$Redeploy
)

$ErrorActionPreference = "Stop"

function Require-Env($Name) {
  $value = [Environment]::GetEnvironmentVariable($Name)

  if ([string]::IsNullOrWhiteSpace($value) -and (Test-Path ".env.local")) {
    $line = Get-Content ".env.local" |
      Where-Object { $_ -match "^$([regex]::Escape($Name))=" } |
      Select-Object -First 1

    if ($line) {
      $value = ($line -split "=", 2)[1].Trim().Trim('"').Trim("'")
    }
  }

  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing $Name. Set it in this PowerShell session or in .env.local before running this script."
  }

  return $value
}

function Set-VercelEnv($Name, $Value, $Environment) {
  Write-Host "Setting $Name in Vercel $Environment..." -ForegroundColor Cyan
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = $Value | & npx.cmd vercel env add $Name $Environment --force --yes 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference

  $output | ForEach-Object { Write-Host $_ }

  if ($exitCode -ne 0) {
    throw "Failed to set $Name in Vercel $Environment."
  }
}

if (-not (Test-Path "package.json")) {
  throw "Run this script from the project root."
}

$env:NODE_OPTIONS = "--use-system-ca"

$apiKey = Require-Env "TAZAPAY_API_KEY"
$apiSecret = Require-Env "TAZAPAY_API_SECRET"
$webhookSecret = Require-Env "TAZAPAY_WEBHOOK_SECRET"
$supabaseUrl = Require-Env "NEXT_PUBLIC_SUPABASE_URL"
$supabaseAnonKey = Require-Env "NEXT_PUBLIC_SUPABASE_ANON_KEY"
$supabaseServiceRoleKey = Require-Env "SUPABASE_SERVICE_ROLE_KEY"
$siteUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SITE_URL")
$defaultCountry = [Environment]::GetEnvironmentVariable("TAZAPAY_DEFAULT_CUSTOMER_COUNTRY")
$tolerance = [Environment]::GetEnvironmentVariable("TAZAPAY_WEBHOOK_TOLERANCE_SECONDS")

if ([string]::IsNullOrWhiteSpace($siteUrl)) {
  $siteUrl = "https://www.wildspineuganda.com"
}

if ([string]::IsNullOrWhiteSpace($defaultCountry)) {
  $defaultCountry = "US"
}

if ([string]::IsNullOrWhiteSpace($tolerance)) {
  $tolerance = "600"
}

if ($TazapayMode -eq "sandbox" -and ($apiKey -notmatch "_test_" -or $apiSecret -notmatch "_test_")) {
  throw "Sandbox mode requires Tazapay test credentials."
}

if ($TazapayMode -eq "live" -and ($apiKey -match "_test_" -or $apiSecret -match "_test_")) {
  throw "Live mode cannot use Tazapay test credentials."
}

Set-VercelEnv "TAZAPAY_API_KEY" $apiKey $Environment
Set-VercelEnv "TAZAPAY_API_SECRET" $apiSecret $Environment
Set-VercelEnv "TAZAPAY_WEBHOOK_SECRET" $webhookSecret $Environment
Set-VercelEnv "TAZAPAY_ENVIRONMENT" $TazapayMode $Environment
Set-VercelEnv "TAZAPAY_DEFAULT_CUSTOMER_COUNTRY" $defaultCountry $Environment
Set-VercelEnv "TAZAPAY_WEBHOOK_TOLERANCE_SECONDS" $tolerance $Environment
Set-VercelEnv "TAZAPAY_ALLOW_SANDBOX_IN_PRODUCTION" "false" $Environment
Set-VercelEnv "NEXT_PUBLIC_SUPABASE_URL" $supabaseUrl $Environment
Set-VercelEnv "NEXT_PUBLIC_SUPABASE_ANON_KEY" $supabaseAnonKey $Environment
Set-VercelEnv "SUPABASE_SERVICE_ROLE_KEY" $supabaseServiceRoleKey $Environment
Set-VercelEnv "NEXT_PUBLIC_SITE_URL" $siteUrl $Environment

Write-Host ""
Write-Host "Vercel Tazapay $TazapayMode and Supabase payment environment variables are configured." -ForegroundColor Green
Write-Host "Next, run this SQL once in Supabase:" -ForegroundColor Yellow
Write-Host "  supabase/migrations/202607050004_tazapay_activation.sql"
Write-Host ""
Write-Host "Then add this webhook URL in Tazapay:" -ForegroundColor Yellow
Write-Host "  https://www.wildspineuganda.com/api/tazapay/webhook"
Write-Host ""
Write-Host "Subscribe to: checkout.paid, checkout.expired, payment_attempt.failed, payin.succeeded, payin.cancelled"

if ($Redeploy) {
  Write-Host ""
  Write-Host "Redeploying production..." -ForegroundColor Cyan
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $deployOutput = & npx.cmd vercel --prod --yes 2>&1
  $deployExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  $deployOutput | ForEach-Object { Write-Host $_ }

  if ($deployExitCode -ne 0) {
    throw "Vercel production deployment failed."
  }
}
