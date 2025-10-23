# ===============================================
# STUDYSPOT - SECURE CREDENTIALS BACKUP
# ===============================================
# This script backs up all important credentials
# and configuration files securely
# ===============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  STUDYSPOT - CREDENTIALS BACKUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  SECURITY WARNING:" -ForegroundColor Yellow
Write-Host "This will backup sensitive credential files." -ForegroundColor Yellow
Write-Host "Keep the backup folder PRIVATE and SECURE!" -ForegroundColor Yellow
Write-Host ""

# Define paths
$projectRoot = "C:\Users\insti\OneDrive\Desktop\om"
$credentialsBackup = "C:\Users\insti\OneDrive\Desktop\MMM\CREDENTIALS_BACKUP"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "Source: $projectRoot" -ForegroundColor Yellow
Write-Host "Backup Destination: $credentialsBackup" -ForegroundColor Yellow
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host ""

# Create secure backup directory
if (-Not (Test-Path $credentialsBackup)) {
    Write-Host "Creating secure credentials backup directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $credentialsBackup -Force | Out-Null
} else {
    Write-Host "Credentials backup directory exists, will update..." -ForegroundColor Yellow
}

# Create subdirectories for organization
$apiCreds = Join-Path $credentialsBackup "api"
$webCreds = Join-Path $credentialsBackup "web"
$mobileCreds = Join-Path $credentialsBackup "mobile"
$rootCreds = Join-Path $credentialsBackup "root"
$docsCreds = Join-Path $credentialsBackup "documentation"

New-Item -ItemType Directory -Path $apiCreds -Force | Out-Null
New-Item -ItemType Directory -Path $webCreds -Force | Out-Null
New-Item -ItemType Directory -Path $mobileCreds -Force | Out-Null
New-Item -ItemType Directory -Path $rootCreds -Force | Out-Null
New-Item -ItemType Directory -Path $docsCreds -Force | Out-Null

Write-Host "✓ Secure directory structure created" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 1: API CREDENTIALS
# ===============================================

Write-Host "STEP 1: Backing up API credentials..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$apiCredFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    ".env.example",
    "config/database.js",
    "config/redis.js",
    "config/stripe.js",
    "config/razorpay.js",
    "config/aws.js",
    "config/email.js",
    "config/jwt.js",
    "src/config/database.config.js",
    "src/config/jwt.config.js",
    "src/config/payment.config.js"
)

$apiSource = Join-Path $projectRoot "api"
$apiCredCount = 0

foreach ($file in $apiCredFiles) {
    $source = Join-Path $apiSource $file
    
    if (Test-Path $source) {
        $dest = Join-Path $apiCreds (Split-Path $file -Leaf)
        Write-Host "  ✓ Backing up api/$file" -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        $apiCredCount++
    }
}

Write-Host "  Backed up $apiCredCount API credential files" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 2: WEB CREDENTIALS
# ===============================================

Write-Host "STEP 2: Backing up Web credentials..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$webCredFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    ".env.example"
)

# Backup original /web credentials
$webSource = Join-Path $projectRoot "web"
$webCredCount = 0

if (Test-Path $webSource) {
    foreach ($file in $webCredFiles) {
        $source = Join-Path $webSource $file
        
        if (Test-Path $source) {
            $dest = Join-Path $webCreds "original-web-$file"
            Write-Host "  ✓ Backing up web/$file" -ForegroundColor Cyan
            Copy-Item -Path $source -Destination $dest -Force
            $webCredCount++
        }
    }
}

# Backup web-owner credentials
$ownerSource = Join-Path $projectRoot "web-owner"

if (Test-Path $ownerSource) {
    foreach ($file in $webCredFiles) {
        $source = Join-Path $ownerSource $file
        
        if (Test-Path $source) {
            $dest = Join-Path $webCreds "web-owner-$file"
            Write-Host "  ✓ Backing up web-owner/$file" -ForegroundColor Cyan
            Copy-Item -Path $source -Destination $dest -Force
            $webCredCount++
        }
    }
}

# Backup web-admin credentials
$adminSource = Join-Path $projectRoot "web-admin"

if (Test-Path $adminSource) {
    foreach ($file in $webCredFiles) {
        $source = Join-Path $adminSource $file
        
        if (Test-Path $source) {
            $dest = Join-Path $webCreds "web-admin-$file"
            Write-Host "  ✓ Backing up web-admin/$file" -ForegroundColor Cyan
            Copy-Item -Path $source -Destination $dest -Force
            $webCredCount++
        }
    }
}

Write-Host "  Backed up $webCredCount Web credential files" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 3: MOBILE CREDENTIALS
# ===============================================

Write-Host "STEP 3: Backing up Mobile credentials..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$mobileCredFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    ".env.example",
    "app.json",
    "eas.json",
    "google-services.json",
    "GoogleService-Info.plist"
)

$mobileSource = Join-Path $projectRoot "mobile"
$mobileCredCount = 0

if (Test-Path $mobileSource) {
    foreach ($file in $mobileCredFiles) {
        $source = Join-Path $mobileSource $file
        
        if (Test-Path $source) {
            $dest = Join-Path $mobileCreds $file
            Write-Host "  ✓ Backing up mobile/$file" -ForegroundColor Cyan
            Copy-Item -Path $source -Destination $dest -Force
            $mobileCredCount++
        }
    }
}

Write-Host "  Backed up $mobileCredCount Mobile credential files" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 4: ROOT CONFIGURATION FILES
# ===============================================

Write-Host "STEP 4: Backing up Root configuration..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$rootConfigFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    "docker-compose.yml",
    "docker-compose.production.yml",
    "docker-compose.staging.yml",
    ".github/workflows/deploy.yml",
    ".github/workflows/ci.yml",
    "terraform/main.tf",
    "terraform/variables.tf",
    "k8s/secrets.yaml",
    "k8s/configmap.yaml"
)

$rootCredCount = 0

foreach ($file in $rootConfigFiles) {
    $source = Join-Path $projectRoot $file
    
    if (Test-Path $source) {
        $fileName = $file -replace '/', '-'
        $dest = Join-Path $rootCreds $fileName
        Write-Host "  ✓ Backing up $file" -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        $rootCredCount++
    }
}

Write-Host "  Backed up $rootCredCount Root configuration files" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 5: IMPORTANT DOCUMENTATION
# ===============================================

Write-Host "STEP 5: Backing up Important documentation..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$importantDocs = @(
    "ARCHITECTURE.md",
    "FEATURE_MAPPING_MATRIX.md",
    "PROJECT_SUMMARY.md",
    "README.md",
    "package.json",
    "docs/deployment/README.md",
    "docs/security/README.md",
    "docs/api/README.md"
)

$docsCredCount = 0

foreach ($file in $importantDocs) {
    $source = Join-Path $projectRoot $file
    
    if (Test-Path $source) {
        $fileName = $file -replace '/', '-'
        $dest = Join-Path $docsCreds $fileName
        Write-Host "  ✓ Backing up $file" -ForegroundColor Cyan
        Copy-Item -Path $source -Destination $dest -Force
        $docsCredCount++
    }
}

Write-Host "  Backed up $docsCredCount Documentation files" -ForegroundColor Green
Write-Host ""

# ===============================================
# PART 6: CREATE CREDENTIALS INVENTORY
# ===============================================

Write-Host "STEP 6: Creating credentials inventory..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$inventory = @"
==============================================
STUDYSPOT - CREDENTIALS BACKUP INVENTORY
==============================================
Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Backup Location: $credentialsBackup

⚠️  SECURITY WARNING:
This folder contains SENSITIVE credentials and configuration files.
Keep this folder PRIVATE and SECURE!
DO NOT commit to version control!
DO NOT share publicly!

==============================================
BACKUP SUMMARY
==============================================

API Credentials:         $apiCredCount files
Web Credentials:         $webCredCount files
Mobile Credentials:      $mobileCredCount files
Root Configuration:      $rootCredCount files
Documentation:           $docsCredCount files

Total Files Backed Up:   $($apiCredCount + $webCredCount + $mobileCredCount + $rootCredCount + $docsCredCount)

==============================================
FOLDER STRUCTURE
==============================================

CREDENTIALS_BACKUP/
├── api/                 (API .env files, database configs)
├── web/                 (Web portal .env files)
├── mobile/              (Mobile app configs, Firebase)
├── root/                (Docker, K8s, Terraform configs)
├── documentation/       (Important docs with credentials)
├── CREDENTIALS_INVENTORY.txt (This file)
├── SECURITY_CHECKLIST.txt
└── RESTORE_GUIDE.txt

==============================================
WHAT'S INCLUDED
==============================================

API Credentials:
✓ .env files (all environments)
✓ Database connection strings
✓ Redis configuration
✓ Stripe API keys
✓ Razorpay credentials
✓ AWS S3 credentials
✓ Email service credentials (SendGrid, etc.)
✓ JWT secret keys

Web Credentials:
✓ Original web/ .env files
✓ web-owner/ .env files
✓ web-admin/ .env files
✓ API URLs and endpoints

Mobile Credentials:
✓ .env files (all environments)
✓ app.json (Expo config)
✓ google-services.json (Android)
✓ GoogleService-Info.plist (iOS)
✓ Firebase credentials

Root Configuration:
✓ Docker Compose files
✓ GitHub Actions secrets
✓ Terraform variables
✓ Kubernetes secrets
✓ Infrastructure configs

==============================================
SECURITY BEST PRACTICES
==============================================

1. ENCRYPTION:
   - Consider encrypting this backup folder
   - Use Windows BitLocker or 7-Zip with password
   - Never store password in same location

2. ACCESS CONTROL:
   - Restrict folder permissions to your user only
   - Don't share with anyone unnecessary
   - Use cloud backup with encryption (OneDrive, Google Drive with encryption)

3. VERSION CONTROL:
   - NEVER commit credentials to Git
   - This folder should be in .gitignore
   - Use secret management tools for teams

4. ROTATION:
   - Rotate credentials regularly (every 90 days)
   - Update backup after rotation
   - Keep track of rotation dates

5. BACKUP LOCATIONS:
   - Keep at least 2 copies in different locations
   - One local, one cloud (encrypted)
   - Consider offline backup (USB drive)

==============================================
HOW TO RESTORE
==============================================

1. API Credentials:
   Copy from api/ folder to:
   C:\Users\insti\OneDrive\Desktop\om\api\

2. Web Credentials:
   Copy from web/ folder to:
   - Original: C:\Users\insti\OneDrive\Desktop\om\web\
   - Owner: C:\Users\insti\OneDrive\Desktop\om\web-owner\
   - Admin: C:\Users\insti\OneDrive\Desktop\om\web-admin\

3. Mobile Credentials:
   Copy from mobile/ folder to:
   C:\Users\insti\OneDrive\Desktop\om\mobile\

4. Root Configuration:
   Copy from root/ folder to:
   C:\Users\insti\OneDrive\Desktop\om\

After restoration:
- Verify all .env files are in place
- Check all API keys are correct
- Test connections to databases, Redis, etc.
- Verify payment gateways work
- Test Firebase/mobile configurations

==============================================
IMPORTANT NOTES
==============================================

✓ This is a POINT-IN-TIME backup
✓ If you change credentials, re-run this script
✓ Keep this backup SECURE and PRIVATE
✓ Consider encrypting the entire folder
✓ Don't email or share credentials in plain text
✓ Use environment variables, not hardcoded values
✓ Rotate credentials if this backup is compromised

==============================================
NEXT STEPS
==============================================

1. ✓ Verify backup completed successfully
2. ✓ Review SECURITY_CHECKLIST.txt
3. ✓ Consider encrypting this folder
4. ✓ Create a second backup copy (cloud/USB)
5. ✓ Document where you store this backup
6. ✓ Set reminder to rotate credentials (90 days)

==============================================
"@

$inventoryPath = Join-Path $credentialsBackup "CREDENTIALS_INVENTORY.txt"
$inventory | Out-File -FilePath $inventoryPath -Encoding UTF8
Write-Host "  ✓ CREDENTIALS_INVENTORY.txt created" -ForegroundColor Green

# ===============================================
# PART 7: CREATE SECURITY CHECKLIST
# ===============================================

$securityChecklist = @"
# SECURITY CHECKLIST - CREDENTIALS BACKUP

## ✅ IMMEDIATE ACTIONS

[ ] Verify backup completed successfully
[ ] Check all important .env files are backed up
[ ] Confirm API credentials are present
[ ] Review mobile app credentials (Firebase, etc.)
[ ] Ensure Docker/K8s configs are backed up

## 🔐 ENCRYPTION (Highly Recommended)

[ ] Encrypt this folder using:
    - Windows BitLocker (built-in)
    - 7-Zip with strong password
    - VeraCrypt (advanced)

[ ] Store encryption password SEPARATELY
    - Password manager (1Password, LastPass)
    - Physical note in safe location
    - NOT in this folder!

## 🛡️ ACCESS CONTROL

[ ] Set folder permissions to your user only:
    Right-click folder → Properties → Security → Advanced

[ ] Remove "Everyone" group access
[ ] Add only your Windows user account

## 💾 REDUNDANCY

[ ] Create SECOND backup copy in different location:
    [ ] Cloud storage (OneDrive/Google Drive - encrypted)
    [ ] External USB drive
    [ ] Network attached storage (NAS)

[ ] Keep backups in at least 2 physical locations

## 🔄 MAINTENANCE

[ ] Set calendar reminder to update backup (monthly)
[ ] Document backup locations in secure note
[ ] Test restoration process once
[ ] Update backup when credentials change

## 🚨 IF CREDENTIALS ARE COMPROMISED

[ ] Immediately rotate ALL credentials
[ ] Update database passwords
[ ] Regenerate API keys (Stripe, Razorpay, AWS)
[ ] Create new JWT secrets
[ ] Update all .env files
[ ] Re-run backup script with new credentials
[ ] Notify team if applicable

## 📝 DOCUMENTATION

[ ] Document where you store this backup
[ ] Note encryption method used
[ ] Record last backup date
[ ] Keep list of what's backed up

## ⚠️ NEVER DO

❌ Email credentials in plain text
❌ Store passwords in code
❌ Commit .env files to Git
❌ Share credentials via chat/messaging
❌ Store backup password in same folder
❌ Upload credentials to public cloud without encryption

## ✅ BEST PRACTICES

✓ Use environment variables
✓ Rotate credentials every 90 days
✓ Use different credentials for dev/staging/prod
✓ Enable 2FA on all services
✓ Use strong, unique passwords
✓ Monitor for unauthorized access
✓ Use secret management tools (AWS Secrets Manager, etc.)

Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$checklistPath = Join-Path $credentialsBackup "SECURITY_CHECKLIST.txt"
$securityChecklist | Out-File -FilePath $checklistPath -Encoding UTF8
Write-Host "  ✓ SECURITY_CHECKLIST.txt created" -ForegroundColor Green

# ===============================================
# PART 8: CREATE RESTORATION GUIDE
# ===============================================

$restoreGuide = @"
# HOW TO RESTORE CREDENTIALS - QUICK GUIDE

## 🔄 FULL RESTORATION

### Step 1: Navigate to Backup
cd "$credentialsBackup"

### Step 2: Restore API Credentials
Copy-Item api\* C:\Users\insti\OneDrive\Desktop\om\api\ -Force

### Step 3: Restore Web Credentials
# Original web
Copy-Item web\original-web-.env C:\Users\insti\OneDrive\Desktop\om\web\.env -Force

# web-owner
Copy-Item web\web-owner-.env C:\Users\insti\OneDrive\Desktop\om\web-owner\.env -Force

# web-admin
Copy-Item web\web-admin-.env C:\Users\insti\OneDrive\Desktop\om\web-admin\.env -Force

### Step 4: Restore Mobile Credentials
Copy-Item mobile\* C:\Users\insti\OneDrive\Desktop\om\mobile\ -Force

### Step 5: Restore Root Configuration
Copy-Item root\* C:\Users\insti\OneDrive\Desktop\om\ -Force

### Step 6: Verify Restoration
- Check all .env files exist
- Verify API keys are present
- Test database connection
- Test Redis connection
- Verify payment gateway credentials
- Test mobile app configurations

## 📋 QUICK RESTORE COMMANDS

### PowerShell (Run as Administrator):
```powershell
# Restore all at once
`$backup = "$credentialsBackup"
`$project = "C:\Users\insti\OneDrive\Desktop\om"

Copy-Item "`$backup\api\*" "`$project\api\" -Force
Copy-Item "`$backup\web\*" "`$project\web\" -Force
Copy-Item "`$backup\mobile\*" "`$project\mobile\" -Force
Copy-Item "`$backup\root\*" "`$project\" -Force

Write-Host "✓ All credentials restored!" -ForegroundColor Green
```

## 🔍 VERIFY AFTER RESTORATION

### API:
cd C:\Users\insti\OneDrive\Desktop\om\api
node -e "require('dotenv').config(); console.log('DB:', process.env.DB_HOST ? '✓' : '✗')"

### Web-Owner:
cd C:\Users\insti\OneDrive\Desktop\om\web-owner
# Check .env file exists
Test-Path .env

### Web-Admin:
cd C:\Users\insti\OneDrive\Desktop\om\web-admin
# Check .env file exists
Test-Path .env

### Mobile:
cd C:\Users\insti\OneDrive\Desktop\om\mobile
# Check google-services.json exists
Test-Path google-services.json

## 🆘 TROUBLESHOOTING

### Issue: .env files not working
- Check file encoding (should be UTF-8)
- Verify no extra spaces in values
- Ensure no quotes around values (unless needed)

### Issue: Database connection fails
- Verify DB_HOST, DB_PORT are correct
- Check DB_USER and DB_PASSWORD
- Ensure database server is running

### Issue: Payment gateway errors
- Verify API keys are not expired
- Check test vs production keys
- Ensure keys match environment

### Issue: Mobile app crashes
- Verify Firebase configuration
- Check google-services.json is valid JSON
- Ensure bundle identifiers match

## 📞 SUPPORT

If restoration fails:
1. Check CREDENTIALS_INVENTORY.txt for backup details
2. Review SECURITY_CHECKLIST.txt
3. Verify backup files are not corrupted
4. Check file permissions
5. Try restoring one component at a time

Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$restorePath = Join-Path $credentialsBackup "RESTORE_GUIDE.txt"
$restoreGuide | Out-File -FilePath $restorePath -Encoding UTF8
Write-Host "  ✓ RESTORE_GUIDE.txt created" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CREDENTIALS BACKUP COMPLETE!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup Statistics:" -ForegroundColor Yellow
Write-Host "  API Credentials: $apiCredCount files" -ForegroundColor White
Write-Host "  Web Credentials: $webCredCount files" -ForegroundColor White
Write-Host "  Mobile Credentials: $mobileCredCount files" -ForegroundColor White
Write-Host "  Root Configuration: $rootCredCount files" -ForegroundColor White
Write-Host "  Documentation: $docsCredCount files" -ForegroundColor White
Write-Host "  ────────────────────────────" -ForegroundColor Gray
Write-Host "  Total: $($apiCredCount + $webCredCount + $mobileCredCount + $rootCredCount + $docsCredCount) files" -ForegroundColor Green
Write-Host ""
Write-Host "Backup Location:" -ForegroundColor Yellow
Write-Host "  $credentialsBackup" -ForegroundColor White
Write-Host ""
Write-Host "Important Files Created:" -ForegroundColor Yellow
Write-Host "  ✓ CREDENTIALS_INVENTORY.txt - Complete list" -ForegroundColor Green
Write-Host "  ✓ SECURITY_CHECKLIST.txt - Security guide" -ForegroundColor Green
Write-Host "  ✓ RESTORE_GUIDE.txt - Restoration steps" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  SECURITY REMINDERS:" -ForegroundColor Red
Write-Host "  1. Keep this folder PRIVATE and SECURE!" -ForegroundColor Yellow
Write-Host "  2. Consider encrypting the backup folder" -ForegroundColor Yellow
Write-Host "  3. Create a second copy in different location" -ForegroundColor Yellow
Write-Host "  4. NEVER commit to version control!" -ForegroundColor Yellow
Write-Host "  5. Review SECURITY_CHECKLIST.txt" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Read: CREDENTIALS_INVENTORY.txt" -ForegroundColor White
Write-Host "  2. Review: SECURITY_CHECKLIST.txt" -ForegroundColor White
Write-Host "  3. Consider encrypting the backup folder" -ForegroundColor White
Write-Host "  4. Create a second backup copy" -ForegroundColor White
Write-Host ""
Write-Host "✅ Your credentials are now safely backed up!" -ForegroundColor Green
Write-Host ""

