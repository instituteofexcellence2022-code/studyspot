@echo off
title StudySpot Platform - Quick Start
color 0A

echo ========================================
echo   STUDYSPOT PLATFORM - QUICK START
echo ========================================
echo.
echo Starting API in demo mode...
echo.

start cmd /k "cd /d %~dp0api && npm run start:demo"

timeout /t 5 /nobreak >nul

echo Starting web interface...
echo.

start cmd /k "cd /d %~dp0web && npm start"

echo.
echo ========================================
echo   PLATFORM STARTING!
echo ========================================
echo.
echo API will start on: http://localhost:3001
echo Web will start on: http://localhost:3000
echo.
echo Login with:
echo   Email: admin@studyspot.com
echo   Password: admin123
echo.
echo Press any key to exit this window...
echo (The servers will keep running in their own windows)
pause >nul


