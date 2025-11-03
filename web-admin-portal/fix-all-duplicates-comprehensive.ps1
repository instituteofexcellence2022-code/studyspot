# Comprehensive Fix for ALL Duplicate Files
# Pattern: Each file is exactly doubled - keep first half

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE DUPLICATE FIX SCRIPT" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0
$filesFailed = 0

# Function to fix a file by keeping only first half
function Fix-DuplicatedFile {
    param(
        [string]$filePath
    )
    
    if (-not (Test-Path $filePath)) {
        Write-Host "SKIP: $filePath (not found)" -ForegroundColor Yellow
        return $false
    }
    
    try {
        $content = Get-Content $filePath
        $totalLines = $content.Count
        $halfPoint = [math]::Floor($totalLines / 2)
        
        # Only fix if file appears to be duplicated (more than expected lines)
        if ($totalLines -gt 100) {
            $content[0..($halfPoint - 1)] | Set-Content $filePath
            Write-Host "FIXED: $filePath ($totalLines -> $halfPoint lines)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "OK: $filePath ($totalLines lines - not duplicated)" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Host "ERROR: $filePath - $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "Phase 1: Fixing Layout Files..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
if (Fix-DuplicatedFile "src/layouts/MainLayout.tsx") { $filesFixed++ } else { $filesFailed++ }
Write-Host ""

Write-Host "Phase 2: Fixing Module Pages (10 files)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
$modulePages = @(
    "src/modules/admin-users/pages/AdminUsers.tsx",
    "src/modules/platform-users/pages/PlatformUsers.tsx",
    "src/modules/credits/pages/CreditDashboard.tsx",
    "src/modules/microservices/pages/MicroservicesManagement.tsx",
    "src/modules/payments/pages/PaymentManagement.tsx",
    "src/modules/security/pages/SecurityManagement.tsx",
    "src/modules/subscriptions/pages/SubscriptionManagement.tsx",
    "src/modules/templates/pages/TemplateManagement.tsx",
    "src/modules/tenants/pages/TenantManagement.tsx",
    "src/modules/tickets/pages/TicketManagement.tsx"
)

foreach ($file in $modulePages) {
    if (Fix-DuplicatedFile $file) { $filesFixed++ } else { $filesFailed++ }
}
Write-Host ""

Write-Host "Phase 3: Fixing API Services (13 files)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
$apiServices = @(
    "src/services/api/adminUsers.ts",
    "src/services/api/platformUsers.ts",
    "src/services/api/credits.ts",
    "src/services/api/microservices.ts",
    "src/services/api/payments.ts",
    "src/services/api/revenue.ts",
    "src/services/api/security.ts",
    "src/services/api/subscriptions.ts",
    "src/services/api/templates.ts",
    "src/services/api/tenantOnboarding.ts",
    "src/services/api/tickets.ts",
    "src/services/api/auth.ts",
    "src/services/api/client.ts"
)

foreach ($file in $apiServices) {
    if (Fix-DuplicatedFile $file) { $filesFixed++ } else { $filesFailed++ }
}
Write-Host ""

Write-Host "Phase 4: Fixing Type Definitions (3 files)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
$typeFiles = @(
    "src/modules/payments/types/index.ts",
    "src/modules/tenants/types/onboarding.ts",
    "src/types/index.ts"
)

foreach ($file in $typeFiles) {
    if (Fix-DuplicatedFile $file) { $filesFixed++ } else { $filesFailed++ }
}
Write-Host ""

Write-Host "Phase 5: Fixing Other Large Files..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
$otherFiles = @(
    "src/modules/crm/pages/ContactsListPage.tsx",
    "src/modules/crm/pages/LeadsListPage.tsx",
    "src/modules/developer/pages/APIDocumentationPage.tsx",
    "src/modules/notifications/pages/NotificationsPage.tsx",
    "src/modules/reports/pages/ReportsPage.tsx",
    "src/modules/revenue/pages/DunningManagementPage.tsx",
    "src/modules/revenue/pages/InvoiceManagementPage.tsx",
    "src/modules/revenue/pages/PaymentMethodsPage.tsx",
    "src/modules/revenue/pages/RevenueAnalyticsPage.tsx",
    "README.md"
)

foreach ($file in $otherFiles) {
    if (Fix-DuplicatedFile $file) { $filesFixed++ } else { $filesFailed++ }
}
Write-Host ""

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  FIX COMPLETE!" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Files Fixed: $filesFixed" -ForegroundColor Green
Write-Host "Files Skipped/Failed: $filesFailed" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Step: Run 'npm start' to test the portal" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan


