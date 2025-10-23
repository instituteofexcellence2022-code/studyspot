@echo off
REM ===============================================
REM STUDYSPOT - Backup New Architecture
REM ===============================================
REM Double-click this file to backup all new
REM architecture files to Desktop/update om
REM ===============================================

echo.
echo ================================================
echo   STUDYSPOT - ARCHITECTURE BACKUP
echo ================================================
echo.
echo This will create a backup of the new architecture:
echo   - web-owner/ (Library Owner Portal)
echo   - web-admin/ (Platform Admin Portal)
echo   - All documentation (9 guides)
echo   - Automation scripts
echo.
echo Backup destination: Desktop\MMM
echo.
echo Press any key to start backup...
pause > nul

echo.
echo Running backup script...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0BACKUP_NEW_ARCHITECTURE.ps1"

echo.
echo ================================================
echo   BACKUP COMPLETE!
echo ================================================
echo.
echo Your backup is at: Desktop\MMM
echo.
echo You can now safely proceed with:
echo   1. RUN_FILE_COPY.bat (copy files to portals)
echo   2. npm run install:all (install dependencies)
echo   3. Test both portals
echo.
echo Your backup is safe and ready to restore anytime!
echo.
echo Press any key to exit...
pause > nul

