# 🔐 CREDENTIALS BACKUP GUIDE

**Purpose**: Secure backup of all credentials and sensitive configuration files  
**Security Level**: ⚠️ **HIGH - CONTAINS SENSITIVE DATA**  
**Time Required**: 1-2 minutes

---

## 🚨 **SECURITY WARNING**

This backup contains **HIGHLY SENSITIVE** information:
- ❗ API keys and secrets
- ❗ Database passwords
- ❗ Payment gateway credentials
- ❗ Firebase configurations
- ❗ JWT secrets
- ❗ AWS/Cloud credentials
- ❗ Email service keys

**KEEP THIS BACKUP PRIVATE AND SECURE!**

---

## 🚀 **QUICK START**

### **Option 1: Double-Click (Easiest)**

```
Just double-click: RUN_CREDENTIALS_BACKUP.bat
```

### **Option 2: PowerShell**

```powershell
.\BACKUP_CREDENTIALS.ps1
```

---

## 📦 **WHAT GETS BACKED UP**

### **Backup Location:**
```
Desktop/MMM/CREDENTIALS_BACKUP/
├── api/                          📁 API Credentials
│   ├── .env
│   ├── .env.production
│   ├── config files
│   └── JWT secrets
├── web/                          📁 Web Portal Credentials
│   ├── original-web-.env
│   ├── web-owner-.env
│   └── web-admin-.env
├── mobile/                       📁 Mobile App Credentials
│   ├── .env
│   ├── google-services.json
│   ├── GoogleService-Info.plist
│   └── app.json
├── root/                         📁 Infrastructure Credentials
│   ├── docker-compose.yml
│   ├── .github-workflows-deploy.yml
│   ├── terraform configs
│   └── K8s secrets
├── documentation/                📁 Important Docs
│   ├── ARCHITECTURE.md
│   ├── FEATURE_MAPPING_MATRIX.md
│   └── README.md
├── CREDENTIALS_INVENTORY.txt     📄 Complete list
├── SECURITY_CHECKLIST.txt        📄 Security guide
└── RESTORE_GUIDE.txt             📄 How to restore
```

---

## 🔍 **DETAILED FILE LIST**

### **API Credentials (api/):**
- ✅ `.env` (all environments)
- ✅ Database connection strings
- ✅ Redis configuration
- ✅ Stripe API keys
- ✅ Razorpay credentials
- ✅ AWS S3 access keys
- ✅ SendGrid/Email service keys
- ✅ JWT secret keys
- ✅ Session secrets

### **Web Credentials (web/):**
- ✅ Original `/web/.env` files
- ✅ `/web-owner/.env` files
- ✅ `/web-admin/.env` files
- ✅ API endpoint URLs
- ✅ Analytics keys (Google Analytics, Mixpanel)
- ✅ Error tracking keys (Sentry)

### **Mobile Credentials (mobile/):**
- ✅ `.env` files (all environments)
- ✅ `google-services.json` (Android Firebase)
- ✅ `GoogleService-Info.plist` (iOS Firebase)
- ✅ `app.json` (Expo configuration)
- ✅ `eas.json` (Expo build config)
- ✅ Push notification certificates

### **Root Configuration (root/):**
- ✅ `docker-compose.yml` (with secrets)
- ✅ GitHub Actions secrets
- ✅ Terraform variable files
- ✅ Kubernetes secrets YAML
- ✅ Infrastructure configs

---

## 🛡️ **SECURITY BEST PRACTICES**

### **1. ENCRYPTION** (Highly Recommended)

**Option A: Windows BitLocker** (Windows Pro)
```
1. Right-click backup folder
2. Turn on BitLocker
3. Choose password (STRONG!)
4. Save recovery key separately
```

**Option B: 7-Zip with Password**
```
1. Right-click backup folder
2. 7-Zip → Add to archive
3. Set strong password
4. Choose AES-256 encryption
5. Store password in password manager
```

**Option C: VeraCrypt** (Advanced)
```
1. Create encrypted container
2. Mount as drive
3. Copy backup inside
4. Unmount when done
```

### **2. ACCESS CONTROL**

```
1. Right-click folder → Properties
2. Security tab → Advanced
3. Remove "Everyone" group
4. Add only your user account
5. Apply to all subfolders
```

### **3. REDUNDANCY**

Create **at least 2 copies** in different locations:

**Copy 1**: Local (Desktop/MMM/CREDENTIALS_BACKUP)
**Copy 2**: Cloud (OneDrive/Google Drive - **encrypted**)
**Copy 3**: External USB drive (**encrypted**)

### **4. PASSWORD MANAGEMENT**

**NEVER** store passwords in:
- ❌ Same folder as backup
- ❌ Plain text file
- ❌ Email or chat
- ❌ Shared documents

**DO** store passwords in:
- ✅ Password manager (1Password, LastPass, Bitwarden)
- ✅ Physical note in safe/lockbox
- ✅ Encrypted note app

### **5. ROTATION SCHEDULE**

| Credential Type | Rotation Frequency |
|-----------------|-------------------|
| Database passwords | Every 90 days |
| API keys | Every 90 days |
| JWT secrets | Every 180 days |
| Payment keys | Annually or when compromised |
| Infrastructure | Every 90 days |

---

## 🔄 **HOW TO RESTORE**

### **Quick Restore (PowerShell):**

```powershell
# Set paths
$backup = "C:\Users\insti\OneDrive\Desktop\MMM\CREDENTIALS_BACKUP"
$project = "C:\Users\insti\OneDrive\Desktop\om"

# Restore API credentials
Copy-Item "$backup\api\*" "$project\api\" -Force

# Restore Web credentials
Copy-Item "$backup\web\web-owner-.env" "$project\web-owner\.env" -Force
Copy-Item "$backup\web\web-admin-.env" "$project\web-admin\.env" -Force

# Restore Mobile credentials
Copy-Item "$backup\mobile\*" "$project\mobile\" -Force

# Restore Root configuration
Copy-Item "$backup\root\*" "$project\" -Force

Write-Host "✓ Credentials restored!" -ForegroundColor Green
```

### **Verify After Restoration:**

```bash
# Test API
cd api
node -e "require('dotenv').config(); console.log('DB:', process.env.DB_HOST)"

# Test Web-Owner
cd web-owner
cat .env | grep REACT_APP_API_URL

# Test Web-Admin
cd web-admin
cat .env | grep REACT_APP_API_URL

# Test Mobile
cd mobile
test -f google-services.json && echo "✓ Firebase config found"
```

---

## 🚨 **IF CREDENTIALS ARE COMPROMISED**

### **Immediate Actions:**

1. **Stop all services immediately**
   ```bash
   # Stop API
   pkill -f "node.*api"
   
   # Stop web portals
   pkill -f "react-scripts"
   ```

2. **Rotate ALL credentials:**
   - [ ] Change database passwords
   - [ ] Regenerate API keys (Stripe, Razorpay)
   - [ ] Create new AWS access keys
   - [ ] Generate new JWT secrets
   - [ ] Update email service keys
   - [ ] Reset Firebase credentials

3. **Update all .env files with new credentials**

4. **Run backup again:**
   ```bash
   .\RUN_CREDENTIALS_BACKUP.bat
   ```

5. **Notify team** (if applicable)

6. **Review access logs** for unauthorized activity

7. **Enable 2FA** on all services

---

## 📋 **MAINTENANCE CHECKLIST**

### **Monthly:**
- [ ] Update backup with any credential changes
- [ ] Verify backup files are readable
- [ ] Test restoration process
- [ ] Check encryption is still active

### **Quarterly:**
- [ ] Rotate database passwords
- [ ] Rotate API keys
- [ ] Update backup
- [ ] Review access logs
- [ ] Verify second backup copy exists

### **Annually:**
- [ ] Rotate all credentials
- [ ] Review and update security practices
- [ ] Test full disaster recovery
- [ ] Update documentation

---

## ⚠️ **NEVER DO**

| ❌ NEVER | ✅ INSTEAD |
|---------|-----------|
| Email credentials | Use encrypted file sharing |
| Commit .env to Git | Use .env.example templates |
| Hardcode in source | Use environment variables |
| Share via chat | Use secret management tools |
| Store password with backup | Use password manager |
| Leave unencrypted | Always encrypt backups |
| Single backup only | Maintain 2-3 copies |
| Share credentials openly | Use least-privilege access |

---

## 🎯 **BACKUP WORKFLOW**

```
1. RUN_CREDENTIALS_BACKUP.bat      (1 min)
   └─→ Backup at: Desktop/update om/CREDENTIALS_BACKUP/

2. Review SECURITY_CHECKLIST.txt   (2 min)
   └─→ Verify all security steps

3. Encrypt the backup folder       (3 min)
   └─→ Use BitLocker/7-Zip/VeraCrypt

4. Create second backup copy       (5 min)
   └─→ USB drive or encrypted cloud

5. Store password separately       (1 min)
   └─→ Password manager

6. Test restoration (optional)     (5 min)
   └─→ Verify you can restore

TOTAL TIME: 12-17 minutes
```

---

## 📊 **SECURITY CHECKLIST**

### **Immediate (After Backup):**
- [ ] Verify backup completed successfully
- [ ] Check all .env files are backed up
- [ ] Review CREDENTIALS_INVENTORY.txt
- [ ] Read SECURITY_CHECKLIST.txt

### **Within 24 Hours:**
- [ ] Encrypt the backup folder
- [ ] Create second backup copy
- [ ] Store password in password manager
- [ ] Set folder permissions (your user only)
- [ ] Test that you can access backup

### **Within 1 Week:**
- [ ] Create third backup (offline USB)
- [ ] Document backup locations
- [ ] Set calendar reminder (monthly update)
- [ ] Test restoration process once

---

## 📞 **SUPPORT RESOURCES**

### **Files in Backup:**
1. **CREDENTIALS_INVENTORY.txt** - What's backed up
2. **SECURITY_CHECKLIST.txt** - Security tasks
3. **RESTORE_GUIDE.txt** - Restoration steps

### **Encryption Tools:**
- **Windows BitLocker**: Built into Windows Pro
- **7-Zip**: https://www.7-zip.org/ (Free)
- **VeraCrypt**: https://www.veracrypt.fr/ (Free, advanced)

### **Password Managers:**
- **Bitwarden**: https://bitwarden.com/ (Free, open-source)
- **1Password**: https://1password.com/ (Paid, popular)
- **LastPass**: https://www.lastpass.com/ (Free tier available)

---

## 🎉 **SUCCESS CRITERIA**

You've successfully secured your credentials when:

- ✅ Backup completed without errors
- ✅ All important .env files are backed up
- ✅ Backup folder is encrypted
- ✅ Second copy exists in different location
- ✅ Password stored in password manager
- ✅ Folder permissions restricted to you only
- ✅ Calendar reminder set for monthly updates
- ✅ You've tested restoration once

---

## 🏆 **FINAL REMINDERS**

```
🔐 SECURITY IS NOT OPTIONAL

Your credentials are the keys to your entire platform:
- Database with all user data
- Payment processing (real money!)
- Infrastructure access
- Customer information

A compromised credential = potential disaster

INVEST THE 15 MINUTES TO SECURE THEM PROPERLY!
```

---

**Your credentials are your responsibility. Keep them safe!** 🔒

**- Your 40+ Year Experienced Full-Stack Developer** 🎓

