# Phase 3: Archive Old Documentation
Write-Host "Starting Phase 3: Archiving Old Documentation..." -ForegroundColor Green

# Create archive subdirectories
New-Item -ItemType Directory -Path "docs\archive\old-completion", "docs\archive\old-progress", "docs\archive\old-features", "docs\archive\old-reports" -Force | Out-Null

Write-Host "`nCreated archive directories" -ForegroundColor Cyan

# Archive old completion reports
$completionFiles = @(
    "SUBSCRIBTION_CREDITS_COMPLETE.md",
    "STAFF_CONFIRMATION_COMPLETE.md",
    "INVOICE_RECEIPT_COMPLETE.md",
    "CARD_REDESIGN_SUMMARY.md",
    "FEE_PLAN_MANAGEMENT_COMPLETE.md",
    "ENHANCED_FEATURES_COMPLETE.md",
    "SINGLE_VIEW_COMPLETE.md",
    "TODAYS_ACHIEVEMENT_SUMMARY.md"
)

Write-Host "`nArchiving completion reports..." -ForegroundColor Yellow
foreach ($file in $completionFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\archive\old-completion\" -Force
        Write-Host "  Archived: $file" -ForegroundColor Gray
    }
}

# Archive old progress reports
$progressFiles = @(
    "PHASE_2_COMPLETION.md",
    "PHASE_2_PROGRESS_REPORT.md",
    "PHASE_2_STATUS.md",
    "PHASE_2_ENHANCEMENTS_SUMMARY.md",
    "SPRINT_1_COMPLETE.md",
    "SPRINT_1_PROGRESS.md",
    "PHASE_1-5_COMPLETE.md"
)

Write-Host "`nArchiving progress reports..." -ForegroundColor Yellow
foreach ($file in $progressFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\archive\old-progress\" -Force
        Write-Host "  Archived: $file" -ForegroundColor Gray
    }
}

# Archive old feature reports
$featureFiles = @(
    "SINGLE_VIEW_DESIGN.md",
    "OPTIMIZATION_REPORT.md",
    "FEE_PLAN_MANAGEMENT_COMPLETE.md",
    "STAFF_CONFIRMATION_FEATURE.md",
    "FEATURE_IMPLEMENTATION_PLAN.md",
    "HYBRID_APPROACH_SPRINT_PLAN.md"
)

Write-Host "`nArchiving feature reports..." -ForegroundColor Yellow
foreach ($file in $featureFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\archive\old-features\" -Force
        Write-Host "  Archived: $file" -ForegroundColor Gray
    }
}

# Archive old quality/audit reports
$oldReports = @(
    "QUALITY_AUDIT_REPORT.md",
    "QUALITY_AUDIT_SUMMARY.md",
    "CRITICAL_FIXES_ACTION_PLAN.md",
    "COMPLETE_IMPROVEMENTS_SUMMARY.md",
    "CODE_IMPROVEMENTS_COMPLETE.md",
    "CODE_IMPROVEMENT_PLAN.md",
    "CODE_REVIEW_RESULTS.md",
    "AUDIT_COMPLETE_README.md",
    "START_HERE_QUALITY_AUDIT.md"
)

Write-Host "`nArchiving old reports..." -ForegroundColor Yellow
foreach ($file in $oldReports) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\archive\old-reports\" -Force
        Write-Host "  Archived: $file" -ForegroundColor Gray
    }
}

# Count remaining files
$remaining = (Get-ChildItem -Path . -Filter "*.md" -File).Count
Write-Host "`nPhase 3 Complete!" -ForegroundColor Green
Write-Host "Remaining markdown files in root: $remaining" -ForegroundColor Cyan
Write-Host "Check docs\archive\ for archived files." -ForegroundColor Cyan
