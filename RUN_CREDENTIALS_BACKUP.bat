@echo off
REM ===============================================
REM STUDYSPOT - Secure Credentials Backup
REM ===============================================
REM Double-click this file to backup all
REM credentials and sensitive configuration files
REM ===============================================

echo.
echo ================================================
echo   STUDYSPOT - CREDENTIALS BACKUP
echo ================================================
echo.
echo WARNING: This will backup SENSITIVE information:
echo   - .env files (API keys, passwords)
echo   - Database credentials
echo   - Payment gateway keys (Stripe, Razorpay)
echo   - Firebase configurations
echo   - Docker/K8s secrets
echo   - All sensitive configs
echo.
echo Backup destination: Desktop\MMM\CREDENTIALS_BACKUP
echo.
echo SECURITY REMINDER:
echo   - Keep backup folder PRIVATE
echo   - Consider encrypting the backup
echo   - Create second copy in secure location
echo   - NEVER share or commit to Git
echo.
echo Press any key to start secure backup...
pause > nul

echo.
echo Running secure backup script...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0BACKUP_CREDENTIALS.ps1"

echo.
echo ================================================
echo   CREDENTIALS BACKUP COMPLETE!
echo ================================================
echo.
echo ⚠️  IMPORTANT SECURITY STEPS:
echo.
echo 1. Review: Desktop\update om\CREDENTIALS_BACKUP\SECURITY_CHECKLIST.txt
echo 2. Consider: Encrypting the backup folder
echo 3. Create: Second backup copy (USB/Cloud with encryption)
echo 4. Store: Password separately from backup
echo.
echo Your credentials are backed up at:
echo Desktop\MMM\CREDENTIALS_BACKUP
echo.
echo Press any key to exit...
pause > nul

