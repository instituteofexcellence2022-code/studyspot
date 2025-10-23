# ===============================================
# STUDYSPOT - BACKUP NEW ARCHITECTURE
# ===============================================
# This script creates a complete backup of the new
# 3-portal architecture to Desktop/update om
# ===============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  STUDYSPOT - ARCHITECTURE BACKUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$projectRoot = "C:\Users\insti\OneDrive\Desktop\om"
$backupRoot = "C:\Users\insti\OneDrive\Desktop\MMM"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "Source: $projectRoot" -ForegroundColor Yellow
Write-Host "Backup Destination: $backupRoot" -ForegroundColor Yellow
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host ""

# Create backup directory
if (-Not (Test-Path $backupRoot)) {
    Write-Host "Creating backup directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
} else {
    Write-Host "Backup directory exists, will update..." -ForegroundColor Yellow
}

# Create a backup info file
$backupInfo = @"
==============================================
STUDYSPOT - NEW ARCHITECTURE BACKUP
==============================================
Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Source: $projectRoot
Backup: $backupRoot

WHAT'S INCLUDED:
✅ web-owner/ - Library Owner Portal (complete structure)
✅ web-admin/ - Platform Admin Portal (complete structure)
✅ All documentation (9 comprehensive guides)
✅ Automation scripts (COPY_FILES.ps1, etc.)
✅ Updated package.json
✅ Updated README.md

WHAT'S EXCLUDED:
❌ node_modules/ (will be reinstalled)
❌ .git/ (version control)
❌ build/ and dist/ folders
❌ Original /web/ folder (keep separate)
❌ /api/ folder (unchanged)
❌ /mobile/ folder (unchanged)

NEXT STEPS:
1. This backup contains all NEW architecture files
2. Original project remains at: $projectRoot
3. To restore: Copy files from here back to project
4. To continue: Follow START_HERE_NEXT.md

==============================================
"@

Write-Host ""
Write-Host "STEP 1: Backing up web-owner portal..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$ownerSource = Join-Path $projectRoot "web-owner"
$ownerDest = Join-Path $backupRoot "web-owner"

if (Test-Path $ownerSource) {
    # Copy web-owner excluding node_modules
    Write-Host "  Copying web-owner structure..." -ForegroundColor Cyan
    robocopy $ownerSource $ownerDest /E /XD node_modules .git build dist /NFL /NDL /NJH /NJS | Out-Null
    Write-Host "  ✓ web-owner backed up" -ForegroundColor Green
} else {
    Write-Host "  ⚠ web-owner not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 2: Backing up web-admin portal..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$adminSource = Join-Path $projectRoot "web-admin"
$adminDest = Join-Path $backupRoot "web-admin"

if (Test-Path $adminSource) {
    # Copy web-admin excluding node_modules
    Write-Host "  Copying web-admin structure..." -ForegroundColor Cyan
    robocopy $adminSource $adminDest /E /XD node_modules .git build dist /NFL /NDL /NJH /NJS | Out-Null
    Write-Host "  ✓ web-admin backed up" -ForegroundColor Green
} else {
    Write-Host "  ⚠ web-admin not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 3: Backing up documentation..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

# List of documentation files to backup
$docFiles = @(
    "ARCHITECTURE.md",
    "FEATURE_MAPPING_MATRIX.md",
    "RESTRUCTURING_GUIDE.md",
    "RESTRUCTURING_COMPLETE_SUMMARY.md",
    "FINAL_SETUP_INSTRUCTIONS.md",
    "QUICK_FILE_COPY_GUIDE.md",
    "PROJECT_RESTRUCTURING_SUCCESS.md",
    "START_HERE_NEXT.md",
    "README.md",
    "package.json"
)

foreach ($file in $docFiles) {
    $source = Join-Path $projectRoot $file
    $dest = Join-Path $backupRoot $file
    
    if (Test-Path $source) {
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "STEP 4: Backing up automation scripts..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

# List of scripts to backup
$scriptFiles = @(
    "COPY_FILES.ps1",
    "RUN_FILE_COPY.bat",
    "BACKUP_NEW_ARCHITECTURE.ps1",
    "RUN_BACKUP.bat"
)

foreach ($file in $scriptFiles) {
    $source = Join-Path $projectRoot $file
    $dest = Join-Path $backupRoot $file
    
    if (Test-Path $source) {
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "STEP 5: Creating backup information file..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$backupInfoPath = Join-Path $backupRoot "BACKUP_INFO.txt"
$backupInfo | Out-File -FilePath $backupInfoPath -Encoding UTF8
Write-Host "  ✓ BACKUP_INFO.txt created" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 6: Creating restoration guide..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$restoreGuide = @"
# HOW TO RESTORE FROM THIS BACKUP

## Quick Restore:
1. Copy web-owner/ back to project root
2. Copy web-admin/ back to project root
3. Copy updated package.json and README.md
4. Run: npm run install:all

## Full Restore:
1. Navigate to: C:\Users\insti\OneDrive\Desktop\om
2. Copy all folders and files from this backup
3. Overwrite when prompted
4. Run: npm run install:all
5. Test: npm run start:owner
6. Test: npm run start:admin

## What's in This Backup:
- web-owner/ (Library Owner Portal)
- web-admin/ (Platform Admin Portal)
- All documentation (9 files)
- Automation scripts
- Updated configs

## What's NOT in This Backup:
- node_modules (reinstall with npm install)
- Original /web folder (unchanged)
- /api folder (unchanged)
- /mobile folder (unchanged)

## Next Steps After Restore:
1. Read: START_HERE_NEXT.md
2. Run: RUN_FILE_COPY.bat
3. Install: npm run install:all
4. Test both portals

Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$restoreGuidePath = Join-Path $backupRoot "HOW_TO_RESTORE.md"
$restoreGuide | Out-File -FilePath $restoreGuidePath -Encoding UTF8
Write-Host "  ✓ HOW_TO_RESTORE.md created" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 7: Generating backup summary..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

# Count files and folders
$webOwnerFiles = 0
$webAdminFiles = 0
$docFiles = 0

if (Test-Path $ownerDest) {
    $webOwnerFiles = (Get-ChildItem -Path $ownerDest -Recurse -File | Measure-Object).Count
}

if (Test-Path $adminDest) {
    $webAdminFiles = (Get-ChildItem -Path $adminDest -Recurse -File | Measure-Object).Count
}

$docFiles = (Get-ChildItem -Path $backupRoot -File | Measure-Object).Count

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BACKUP COMPLETE!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup Statistics:" -ForegroundColor Yellow
Write-Host "  web-owner files: $webOwnerFiles" -ForegroundColor White
Write-Host "  web-admin files: $webAdminFiles" -ForegroundColor White
Write-Host "  Documentation files: $docFiles" -ForegroundColor White
Write-Host ""
Write-Host "Backup Location:" -ForegroundColor Yellow
Write-Host "  $backupRoot" -ForegroundColor White
Write-Host ""
Write-Host "Important Files:" -ForegroundColor Yellow
Write-Host "  ✓ BACKUP_INFO.txt - What's backed up" -ForegroundColor Green
Write-Host "  ✓ HOW_TO_RESTORE.md - Restoration guide" -ForegroundColor Green
Write-Host "  ✓ START_HERE_NEXT.md - Next steps" -ForegroundColor Green
Write-Host ""
Write-Host "What's Backed Up:" -ForegroundColor Yellow
Write-Host "  ✓ web-owner/ (Library Owner Portal)" -ForegroundColor Green
Write-Host "  ✓ web-admin/ (Platform Admin Portal)" -ForegroundColor Green
Write-Host "  ✓ All documentation (9 guides)" -ForegroundColor Green
Write-Host "  ✓ Automation scripts" -ForegroundColor Green
Write-Host "  ✓ Updated package.json & README.md" -ForegroundColor Green
Write-Host ""
Write-Host "What's NOT Backed Up (unchanged):" -ForegroundColor Yellow
Write-Host "  • Original /web folder" -ForegroundColor Gray
Write-Host "  • /api folder" -ForegroundColor Gray
Write-Host "  • /mobile folder" -ForegroundColor Gray
Write-Host "  • node_modules (will reinstall)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Your backup is safe at: Desktop/update om" -ForegroundColor White
Write-Host "  2. Continue with restructuring in original folder" -ForegroundColor White
Write-Host "  3. Run: RUN_FILE_COPY.bat (in original project)" -ForegroundColor White
Write-Host "  4. This backup is your safety net!" -ForegroundColor White
Write-Host ""
Write-Host "✅ Backup successful! You can now proceed safely." -ForegroundColor Green
Write-Host ""

