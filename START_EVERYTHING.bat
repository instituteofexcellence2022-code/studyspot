@echo off
REM ========================================
REM STUDYSPOT - Start All Servers
REM ========================================

echo.
echo ========================================
echo   STARTING STUDYSPOT PLATFORM
echo ========================================
echo.

REM Check .env files exist
if not exist "api\.env" (
    echo ❌ api/.env not found!
    echo.
    echo Creating .env files now...
    call CREATE_ENV_FILES_NOW.bat
    echo.
)

echo Starting API Server...
start "STUDYSPOT API" cmd /k "cd api && node src/index-unified.js"

echo Waiting 5 seconds for API to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Owner Portal...
start "STUDYSPOT Owner Portal" cmd /k "cd web-owner && npm start"

echo.
echo Starting Admin Portal...
start "STUDYSPOT Admin Portal" cmd /k "cd web-admin && npm start"

echo.
echo ========================================
echo   ✅ ALL SERVERS STARTING
echo ========================================
echo.
echo Three new windows should open:
echo   1. API Server (port 3001)
echo   2. Owner Portal (port 3000)
echo   3. Admin Portal (port 3002)
echo.
echo Wait 30-60 seconds for compilation...
echo.
echo Then open your browser:
echo   Owner Portal: http://localhost:3000
echo   Admin Portal: http://localhost:3002
echo.
echo To test:
echo   1. Register an account
echo   2. Login with your credentials
echo   3. Access the dashboard
echo.
echo Read COMPLETE_FIX_GUIDE.md for detailed instructions!
echo.
pause

