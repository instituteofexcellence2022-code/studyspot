# ===============================================
# STUDYSPOT - AUTOMATED FILE COPY SCRIPT
# ===============================================
# This script copies files from /web to /web-owner and /web-admin
# Created by: Senior Full-Stack Developer
# Date: October 22, 2025
# ===============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  STUDYSPOT - AUTOMATED FILE COPY SCRIPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$projectRoot = "C:\Users\insti\OneDrive\Desktop\om"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# ===============================================
# PART 1: Copy files to web-owner
# ===============================================

Write-Host "STEP 1: Copying files to web-owner..." -ForegroundColor Green
Write-Host "---------------------------------------" -ForegroundColor Green

$webSrc = Join-Path $projectRoot "web\src"
$ownerSrc = Join-Path $projectRoot "web-owner\src"

if (-Not (Test-Path $webSrc)) {
    Write-Host "ERROR: Source directory not found: $webSrc" -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path $ownerSrc)) {
    Write-Host "Creating web-owner\src directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ownerSrc -Force | Out-Null
}

# Copy folders for web-owner
$ownerFolders = @(
    "components",
    "pages",
    "layouts",
    "services",
    "store",
    "hooks",
    "utils",
    "constants"
)

# Copy optional folders if they exist
$optionalFolders = @("types", "assets", "config")

foreach ($folder in $ownerFolders) {
    $source = Join-Path $webSrc $folder
    $dest = Join-Path $ownerSrc $folder
    
    if (Test-Path $source) {
        Write-Host "  Copying $folder..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $folder (not found)" -ForegroundColor Yellow
    }
}

# Copy optional folders
foreach ($folder in $optionalFolders) {
    $source = Join-Path $webSrc $folder
    $dest = Join-Path $ownerSrc $folder
    
    if (Test-Path $source) {
        Write-Host "  Copying $folder (optional)..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    }
}

# Copy individual files for web-owner
$ownerFiles = @(
    "App.css",
    "reportWebVitals.ts",
    "setupTests.ts",
    "react-app-env.d.ts"
)

foreach ($file in $ownerFiles) {
    $source = Join-Path $webSrc $file
    $dest = Join-Path $ownerSrc $file
    
    if (Test-Path $source) {
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $file (not found)" -ForegroundColor Yellow
    }
}

# Remove admin pages from web-owner
Write-Host ""
Write-Host "  Cleaning up admin pages from web-owner..." -ForegroundColor Magenta
$adminPages = @(
    (Join-Path $ownerSrc "pages\admin"),
    (Join-Path $ownerSrc "pages\tenant"),
    (Join-Path $ownerSrc "components\admin")
)

foreach ($path in $adminPages) {
    if (Test-Path $path) {
        Write-Host "    Removing $path" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "    ✓ Removed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✓ web-owner setup complete!" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 2: Copy files to web-admin
# ===============================================

Write-Host "STEP 2: Copying files to web-admin..." -ForegroundColor Green
Write-Host "---------------------------------------" -ForegroundColor Green

$adminSrc = Join-Path $projectRoot "web-admin\src"

if (-Not (Test-Path $adminSrc)) {
    Write-Host "Creating web-admin\src directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $adminSrc -Force | Out-Null
}

# Create component directories
$adminComponentsPath = Join-Path $adminSrc "components"
$adminPagesPath = Join-Path $adminSrc "pages"

New-Item -ItemType Directory -Path $adminComponentsPath -Force | Out-Null
New-Item -ItemType Directory -Path $adminPagesPath -Force | Out-Null

# Copy selective components for web-admin
$adminComponents = @(
    @{Name="common"; Source="components\common"},
    @{Name="admin"; Source="components\admin"}
)

foreach ($comp in $adminComponents) {
    $source = Join-Path $webSrc $comp.Source
    $dest = Join-Path $adminSrc $comp.Source
    
    if (Test-Path $source) {
        Write-Host "  Copying $($comp.Source)..." -ForegroundColor Cyan
        
        # Create parent directory if needed
        $parentDir = Split-Path $dest -Parent
        if (-Not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $($comp.Source) (not found)" -ForegroundColor Yellow
    }
}

# Copy selective pages for web-admin
$adminPages = @(
    "auth",
    "admin",
    "tenant",
    "common",
    "dashboard",
    "profile",
    "subscription",
    "credits"
)

foreach ($page in $adminPages) {
    $source = Join-Path $webSrc "pages\$page"
    $dest = Join-Path $adminSrc "pages\$page"
    
    if (Test-Path $source) {
        Write-Host "  Copying pages\$page..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping pages\$page (not found)" -ForegroundColor Yellow
    }
}

# Copy common folders for web-admin
$adminCommonFolders = @(
    "layouts",
    "services",
    "store",
    "hooks",
    "utils",
    "constants"
)

foreach ($folder in $adminCommonFolders) {
    $source = Join-Path $webSrc $folder
    $dest = Join-Path $adminSrc $folder
    
    if (Test-Path $source) {
        Write-Host "  Copying $folder..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $folder (not found)" -ForegroundColor Yellow
    }
}

# Copy optional folders
foreach ($folder in $optionalFolders) {
    $source = Join-Path $webSrc $folder
    $dest = Join-Path $adminSrc $folder
    
    if (Test-Path $source) {
        Write-Host "  Copying $folder (optional)..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    }
}

# Copy individual files for web-admin
foreach ($file in $ownerFiles) {
    $source = Join-Path $webSrc $file
    $dest = Join-Path $adminSrc $file
    
    if (Test-Path $source) {
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "    ✓ Done" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipping $file (not found)" -ForegroundColor Yellow
    }
}

# Remove library pages from web-admin
Write-Host ""
Write-Host "  Cleaning up library pages from web-admin..." -ForegroundColor Magenta
$libraryPages = @(
    (Join-Path $adminSrc "pages\library"),
    (Join-Path $adminSrc "pages\booking"),
    (Join-Path $adminSrc "pages\user"),
    (Join-Path $adminSrc "pages\ai")
)

foreach ($path in $libraryPages) {
    if (Test-Path $path) {
        Write-Host "    Removing $path" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "    ✓ Removed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✓ web-admin setup complete!" -ForegroundColor Green
Write-Host ""

# ===============================================
# SUMMARY
# ===============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  FILE COPY COMPLETE!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. cd web-owner && npm install" -ForegroundColor White
Write-Host "2. cd web-admin && npm install" -ForegroundColor White
Write-Host "3. Test: cd web-owner && npm start (Port 3000)" -ForegroundColor White
Write-Host "4. Test: cd web-admin && npm start (Port 3002)" -ForegroundColor White
Write-Host ""
Write-Host "📖 For details, see FINAL_SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""






