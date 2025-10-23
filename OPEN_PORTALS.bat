@echo off
title STUDYSPOT - Open Portals in Browser

echo.
echo ================================================================
echo   OPENING STUDYSPOT PORTALS IN YOUR BROWSER
echo ================================================================
echo.

:: Open Owner Portal
echo Opening Owner Portal (Blue Theme)...
start http://localhost:3000
timeout /t 2 /nobreak >nul

:: Open Admin Portal
echo Opening Admin Portal (Red Theme)...
start http://localhost:3002
timeout /t 2 /nobreak >nul

echo.
echo ================================================================
echo   PORTALS OPENED!
echo ================================================================
echo.
echo   Owner Portal:  http://localhost:3000
echo   Admin Portal:  http://localhost:3002
echo.
echo ================================================================
echo   TEST CREDENTIALS
echo ================================================================
echo.
echo   OWNER PORTAL:
echo   Email: owner@libraryname.com
echo   Password: owner123
echo.
echo   ADMIN PORTAL:
echo   Email: admin@studyspot.com
echo   Password: admin123
echo.
echo ================================================================
echo.
pause


