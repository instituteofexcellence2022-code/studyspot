@echo off
chcp 65001 >nul 2>&1
cls
echo.
echo ========================================
echo 🔍 LOGIN ISSUE DIAGNOSTICS
echo ========================================
echo.

echo 📍 Step 1: Checking if servers are running...
echo.
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ API Server is RUNNING on port 3001
) else (
    echo ❌ API Server is NOT RUNNING on port 3001
    echo    ^> Solution: cd api ^&^& npm start
)

netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend is RUNNING on port 3000
) else (
    echo ❌ Frontend is NOT RUNNING on port 3000
    echo    ^> Solution: cd web-owner ^&^& npm start
)
echo.

echo 📍 Step 2: Testing API health...
echo.
powershell -Command "try { $r = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing -TimeoutSec 5; Write-Host '✅ API is responding correctly' -ForegroundColor Green; Write-Host '   Status:' $r.StatusCode } catch { Write-Host '❌ API is NOT responding' -ForegroundColor Red; Write-Host '   Error:' $_.Exception.Message }"
echo.

echo 📍 Step 3: Checking .env files...
echo.
if exist web-owner\.env (
    echo ✅ web-owner\.env EXISTS
    echo.
    echo Content:
    echo ────────────────────────────────────────
    type web-owner\.env
    echo ────────────────────────────────────────
) else (
    echo ❌ web-owner\.env NOT FOUND!
    echo.
    echo    ^> Solution: Run CREATE_ENV_FILES.bat
)
echo.

if exist api\.env (
    echo ✅ api\.env EXISTS
    echo.
    echo Checking critical variables:
    findstr /C:"DATABASE_URL" api\.env >nul 2>&1
    if %errorlevel%==0 (
        echo    ✅ DATABASE_URL found
    ) else (
        echo    ❌ DATABASE_URL missing!
    )
    
    findstr /C:"CORS_ORIGIN" api\.env >nul 2>&1
    if %errorlevel%==0 (
        echo    ✅ CORS_ORIGIN found
        findstr /C:"CORS_ORIGIN" api\.env
    ) else (
        echo    ❌ CORS_ORIGIN missing!
    )
) else (
    echo ❌ api\.env NOT FOUND!
    echo.
    echo    ^> Solution: Create api/.env with database credentials
)
echo.

echo ========================================
echo 📋 DIAGNOSTIC SUMMARY
echo ========================================
echo.
echo Please check the above results and:
echo.
echo 1. If API is not running: cd api ^&^& npm start
echo 2. If Frontend is not running: cd web-owner ^&^& npm start
echo 3. If .env files are missing: Run CREATE_ENV_FILES.bat
echo 4. If API is not responding: Check api terminal for errors
echo.
echo ========================================
echo 🧪 MANUAL TEST
echo ========================================
echo.
echo Now open your browser to: http://localhost:3000
echo.
echo Then press F12 and check Console tab for:
echo   - API URL should be: http://localhost:3001
echo   - No red errors
echo.
echo Try clicking "Try Demo Account" button
echo   - Watch console for detailed logs
echo   - Any error will be shown in a red snackbar popup
echo.
echo ========================================
echo.
pause


