@echo off
cls
echo.
echo ========================================
echo 🔍 PROFESSIONAL DIAGNOSTIC REPORT
echo ========================================
echo.

echo 📍 Step 1: Checking API Server...
netstat -ano | findstr :3001 | findstr LISTENING
if %ERRORLEVEL% EQU 0 (
    echo ✅ API Server is running on port 3001
) else (
    echo ❌ API Server is NOT running
    echo.
    echo Starting API Server...
    start "API Server" cmd /k "cd api && npm start"
    timeout /t 10
)
echo.

echo 📍 Step 2: Checking Owner Portal...
netstat -ano | findstr :3000 | findstr LISTENING
if %ERRORLEVEL% EQU 0 (
    echo ✅ Owner Portal is running on port 3000
) else (
    echo ❌ Owner Portal is NOT running  
    echo.
    echo Starting Owner Portal...
    start "Owner Portal" cmd /k "cd web-owner && npm start"
    timeout /t 15
)
echo.

echo 📍 Step 3: Verifying .env file...
if exist web-owner\.env (
    echo ✅ .env file exists
    echo.
    echo Content:
    type web-owner\.env
) else (
    echo ❌ .env file missing!
    echo.
    echo Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:3001
        echo REACT_APP_PORTAL_TYPE=owner
        echo REACT_APP_PORTAL_NAME=Library Owner Portal
        echo REACT_APP_VERSION=1.0.0
        echo NODE_ENV=development
    ) > web-owner\.env
    echo ✅ .env file created!
    echo.
    echo ⚠️  RESTART Owner Portal to load .env!
)
echo.

echo 📍 Step 4: Testing API Health...
curl -s http://localhost:3001/health
echo.
echo.

echo ========================================
echo 📋 NEXT STEPS:
echo ========================================
echo.
echo 1. If .env was just created, RESTART Owner Portal:
echo    - Stop the current server (Ctrl+C in its window)
echo    - Run: cd web-owner
echo    - Run: npm start
echo.
echo 2. Open browser: http://localhost:3000/login
echo.
echo 3. Look at the BLUE BOX at bottom of page
echo    It should show: API URL: http://localhost:3001
echo.
echo 4. If it shows a different URL, the .env wasn't loaded
echo.
echo 5. Press Ctrl+Shift+R in browser to hard refresh
echo.
echo 6. Click "Try Demo Account" button
echo.
echo 7. Copy and paste the BLUE BOX content here
echo.
pause
