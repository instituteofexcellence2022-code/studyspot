# Documentation Organization Script - Phase 2
Write-Host "Starting Phase 2 Documentation Organization..." -ForegroundColor Green

# Feature Guides - Payment
$paymentFiles = @(
    "PAYMENT_SYSTEM_COMPLETE.md",
    "PAYMENT_ANALYTICS_COMPLETE.md", 
    "PAYMENT_FEATURES_SUMMARY.md",
    "INVOICE_PAYMENT_INTEGRATION.md",
    "INVOICE_RECEIPT_COMPLETE.md",
    "OLD_VS_NEW_PAYMENTS.md",
    "FIND_PAYMENTS_FEATURE.md",
    "PUSH_INVOICE_PAYMENT.md"
)

foreach ($file in $paymentFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\features\payment\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

# Feature Guides - Students
$studentFiles = @(
    "STUDENTS_MANAGEMENT_COMPLETE.md",
    "PHASE_3A_STUDENTS_COMPLETE.md",
    "STUDENTS_MIGRATION_INSTRUCTIONS.md",
    "STUDENTS_API_INTEGRATION_GUIDE.md",
    "IMPLEMENTING_STUDENTS_NOW.md"
)

foreach ($file in $studentFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\features\students\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

# Feature Guides - AI
$aiFiles = @(
    "AI_RECOMMENDATIONS_GUIDE.md",
    "AI_VISIBILITY_FIXED.md"
)

foreach ($file in $aiFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\features\ai\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

# Migration Guides
$migrationFiles = @(
    "MIGRATION_SUCCESS.md",
    "MIGRATION_STEP_BY_STEP.md",
    "MIGRATION_INSTRUCTIONS.md",
    "RUN_MIGRATION.md",
    "STUDENTS_MIGRATION_INSTRUCTIONS.md"
)

foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\deployment\migration\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

# Architecture Reports
$architectureFiles = @(
    "PROJECT_STRUCTURE.md",
    "UNIFIED_API_STRUCTURE.md",
    "PORTAL_HEALTH_INFRASTRUCTURE_REPORT.md"
)

foreach ($file in $architectureFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\reports\architecture\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

# Remaining important files to guides/customization
$customizationFiles = @(
    "CUSTOMIZATION_GUIDE.md",
    "ADD_THEME_TOGGLE.md",
    "THEME_RESPONSIVE_COMPLETE.md"
)

foreach ($file in $customizationFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\customization\" -Force
        Write-Host "Moved: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nPhase 2 Documentation Organization Complete!" -ForegroundColor Green
Write-Host "Check docs\ directory for organized files." -ForegroundColor Cyan
