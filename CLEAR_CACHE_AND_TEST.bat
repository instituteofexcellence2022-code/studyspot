@echo off
echo.
echo ========================================
echo   CLEAR CACHE AND TEST
echo ========================================
echo.
echo Step 1: Browser is opening...
echo.
start http://localhost:3000
timeout /t 2 >nul

echo.
echo ========================================
echo   FOLLOW THESE STEPS:
echo ========================================
echo.
echo 1. Press F12 to open DevTools
echo.
echo 2. Right-click the REFRESH button
echo.
echo 3. Select "Empty Cache and Hard Reload"
echo.
echo    OR
echo.
echo    Press Ctrl+Shift+R (Hard Refresh)
echo.
echo ========================================
echo   THEN TEST:
echo ========================================
echo.
echo 1. Click "Skip Login" button
echo 2. You should see Dashboard
echo 3. Click "Add Student" button
echo 4. It should navigate to Students page
echo.
echo If buttons still don't work:
echo - Try Incognito mode: Ctrl+Shift+N
echo - Or close all browser windows and reopen
echo.
echo ========================================
pause

