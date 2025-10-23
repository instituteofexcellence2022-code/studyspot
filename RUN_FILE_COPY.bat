@echo off
REM ===============================================
REM STUDYSPOT - File Copy Automation
REM ===============================================
REM Double-click this file to copy source files
REM from /web to /web-owner and /web-admin
REM ===============================================

echo.
echo ================================================
echo   STUDYSPOT - AUTOMATED FILE COPY
echo ================================================
echo.
echo This will copy source files to the new portals:
echo   - /web/src  --^>  /web-owner/src
echo   - /web/src  --^>  /web-admin/src
echo.
echo Press any key to continue...
pause > nul

echo.
echo Running PowerShell script...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0COPY_FILES.ps1"

echo.
echo ================================================
echo   COPY COMPLETE!
echo ================================================
echo.
echo Next steps:
echo   1. npm run install:all
echo   2. cd web-owner ^&^& npm start
echo   3. cd web-admin ^&^& npm start
echo.
echo Press any key to exit...
pause > nul







