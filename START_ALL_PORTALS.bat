@echo off
title STUDYSPOT - Start All Portals

echo.
echo ================================================================
echo   STUDYSPOT PLATFORM - Multi-Portal Startup
echo ================================================================
echo.
echo Starting all portals in sequence...
echo.
echo   1. API Server (Port 3001)
echo   2. Owner Portal (Port 3000)
echo   3. Admin Portal (Port 3002)
echo.
echo ================================================================
echo.

:: Start API
echo [1/3] Starting API Server...
start "StudySpot API" cmd /k "cd api && npm start"
timeout /t 10 /nobreak >nul

:: Start Owner Portal
echo [2/3] Starting Owner Portal...
start "Owner Portal" cmd /k "cd web-owner && npm start"
timeout /t 10 /nobreak >nul

:: Start Admin Portal
echo [3/3] Starting Admin Portal...
start "Admin Portal" cmd /k "cd web-admin && set PORT=3002 && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ================================================================
echo   ALL PORTALS STARTING!
echo ================================================================
echo.
echo   API Server:    http://localhost:3001
echo   Owner Portal:  http://localhost:3000
echo   Admin Portal:  http://localhost:3002
echo.
echo ================================================================
echo.
echo Please wait 30-60 seconds for all portals to compile...
echo.
pause
